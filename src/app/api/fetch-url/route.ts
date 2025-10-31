import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// Caché simple en memoria (considera usar Redis en producción)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hora
const FETCH_TIMEOUT = 10000; // 10 segundos
const MAX_CACHE_SIZE = 100; // Máximo número de entries en cache
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB máximo

// Rate limiting simple en memoria
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10;

// SSRF Protection: Validar que la URL no apunte a recursos privados
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  // RFC 1918 private networks
  if (parts[0] === 10) return true; // 10.0.0.0/8
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
  if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16

  // Loopback
  if (parts[0] === 127) return true; // 127.0.0.0/8

  // Link-local
  if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16 (AWS metadata!)

  // Localhost
  if (ip === '0.0.0.0') return true;

  return false;
}

function isDangerousHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  // Localhost variants
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;

  // Check if it's an IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return isPrivateIP(hostname);
  }

  // Metadata endpoints
  if (lower === 'metadata' || lower === 'metadata.google.internal') return true;

  // Internal domains
  if (lower.endsWith('.internal') || lower.endsWith('.local')) return true;

  return false;
}

async function validateURL(urlString: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const url = new URL(urlString);

    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Solo se permiten URLs HTTP/HTTPS' };
    }

    // Check for dangerous hostnames
    if (isDangerousHostname(url.hostname)) {
      return { valid: false, error: 'URL no permitida: apunta a recursos privados o internos' };
    }

    // Additional check for IPv6 localhost
    if (url.hostname === '::1' || url.hostname === '::ffff:127.0.0.1') {
      return { valid: false, error: 'URL no permitida: localhost' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Formato de URL inválido' };
  }
}

// Normalizar URL para cache (evitar cache poisoning)
function normalizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    // Remover hash y query params que no afectan el contenido
    parsed.hash = '';
    // Mantener query params pero ordenarlos
    parsed.searchParams.sort();
    return parsed.toString();
  } catch {
    return url;
  }
}

// Rate limiting check
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Nueva ventana
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// Helper para fetch con timeout y validación de redirects
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: 'manual' // Manejar redirects manualmente para validarlos
    });
    clearTimeout(timeoutId);

    // Si hay redirect, validar la URL de destino
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Resolver URL relativa si es necesario
        const redirectUrl = new URL(location, url).toString();
        const validation = await validateURL(redirectUrl);
        if (!validation.valid) {
          throw new Error(`Redirect bloqueado: ${validation.error}`);
        }
        // Hacer el fetch al redirect (máximo 1 redirect por seguridad)
        return await fetch(redirectUrl, {
          ...options,
          signal: controller.signal,
          redirect: 'error' // No permitir más redirects
        });
      }
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  }
}

// Limpiar caché antiguo y limitar tamaño
setInterval(() => {
  const now = Date.now();

  // Eliminar entries expirados
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }

  // Si todavía excede el límite, eliminar los más antiguos (LRU)
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => cache.delete(key));
  }

  // Limpiar rate limit records antiguos
  const rateLimitEntries = Array.from(requestCounts.entries());
  rateLimitEntries.forEach(([key, value]) => {
    if (now > value.resetTime + RATE_LIMIT_WINDOW) {
      requestCounts.delete(key);
    }
  });
}, 600000); // Cada 10 minutos

export async function POST(request: Request) {
  try {
    // Rate limiting basado en IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: 'Demasiadas solicitudes. Por favor, espera un momento.',
        success: false
      }, {
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60'
        }
      });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        error: 'Por favor ingresa una URL',
        success: false
      }, { status: 400 });
    }

    // Validación de seguridad SSRF
    const validation = await validateURL(url);
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error,
        success: false
      }, { status: 400 });
    }

    // Verificar caché (usando URL normalizada)
    const normalizedUrl = normalizeURL(url);
    const cached = cache.get(normalizedUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.data,
        fromCache: true
      }, {
        headers: {
          'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
        }
      });
    }

    // Headers para parecer un navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Intentar fetch directo primero
    let htmlContent: string;
    try {
      const directResponse = await fetchWithTimeout(url, { headers });
      if (directResponse.ok) {
        // Validar tamaño de respuesta
        const contentLength = directResponse.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
          return NextResponse.json({
            error: 'El contenido es demasiado grande. Máximo 5MB.',
            success: false
          }, { status: 413 });
        }

        htmlContent = await directResponse.text();

        // Validar tamaño después de recibir
        if (htmlContent.length > MAX_RESPONSE_SIZE) {
          return NextResponse.json({
            error: 'El contenido es demasiado grande. Máximo 5MB.',
            success: false
          }, { status: 413 });
        }
      } else {
        // Fallback a proxy si el fetch directo falla
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetchWithTimeout(proxyUrl);
        const proxyData = await proxyResponse.json();
        htmlContent = proxyData.contents;

        // Validar tamaño del contenido del proxy
        if (htmlContent && htmlContent.length > MAX_RESPONSE_SIZE) {
          return NextResponse.json({
            error: 'El contenido es demasiado grande. Máximo 5MB.',
            success: false
          }, { status: 413 });
        }
      }
    } catch (error) {
      // Manejar timeout
      if (error instanceof Error && error.message === 'TIMEOUT') {
        return NextResponse.json(
          {
            error: 'La petición tardó demasiado. El sitio podría estar lento o bloqueando acceso.',
            success: false
          },
          { status: 408 }
        );
      }

      // Usar proxy como último recurso
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetchWithTimeout(proxyUrl);
        const proxyData = await proxyResponse.json();
        htmlContent = proxyData.contents;
      } catch (proxyError) {
        if (proxyError instanceof Error && proxyError.message === 'TIMEOUT') {
          return NextResponse.json(
            {
              error: 'La petición tardó demasiado. Intenta copiar y pegar el texto directamente.',
              success: false
            },
            { status: 408 }
          );
        }
        throw proxyError;
      }
    }

    // Crear DOM y usar Readability
    const dom = new JSDOM(htmlContent, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    let result;
    
    if (article && article.textContent) {
      // Limpiar y procesar el contenido
      // Límite: 500K caracteres (~80K palabras, suficiente para libros completos)
      const cleanContent = article.textContent
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, 500000);
      
      result = {
        title: article.title || 'Artículo sin título',
        content: cleanContent,
        excerpt: article.excerpt || '',
        byline: article.byline || '',
        length: cleanContent.split(/\s+/).length,
        success: true
      };
    } else {
      // Fallback: extracción básica
      // Límite más conservador en fallback: 250K caracteres (~40K palabras)
      const textContent = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 250000);

      if (!textContent || textContent.length < 100) {
        return NextResponse.json({
          error: 'No se pudo extraer contenido legible. Intenta copiar el texto directamente.',
          success: false
        }, { status: 422 });
      }

      // Intentar extraer título
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);

      result = {
        title: titleMatch ? titleMatch[1].trim() : 'Contenido extraído',
        content: textContent,
        excerpt: textContent.slice(0, 200) + '...',
        length: textContent.split(/\s+/).length,
        success: true
      };
    }
    
    // Guardar en caché (usando URL normalizada)
    cache.set(normalizedUrl, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Remaining': rateLimitCheck.remaining.toString()
      }
    });
    
  } catch (error) {
    // Log solo en desarrollo, no en producción
    if (process.env.NODE_ENV === 'development') {
      console.error('Error procesando URL:', error);
    }

    // Determinar el tipo de error sin exponer detalles internos
    let errorMessage = 'Error inesperado al cargar el contenido.';
    let statusCode = 500;

    if (error instanceof TypeError) {
      errorMessage = 'No se pudo conectar al sitio. Verifica la URL o intenta más tarde.';
      statusCode = 502;
    } else if (error instanceof Error) {
      // Mensajes seguros sin detalles internos
      if (error.message.includes('Redirect bloqueado')) {
        errorMessage = 'La URL intentó redirigir a un recurso no permitido.';
        statusCode = 400;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. El sitio podría estar bloqueando el acceso.';
        statusCode = 502;
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta. Intenta copiar el texto directamente.';
        statusCode = 422;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        hint: 'Sugerencia: Copia y pega el texto del artículo en el área de texto'
      },
      { status: statusCode }
    );
  }
}