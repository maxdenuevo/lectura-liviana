import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// Caché simple en memoria (considera usar Redis en producción)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hora

// Limpiar caché antiguo
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 600000); // Cada 10 minutos

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Verificar caché
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.data,
        fromCache: true
      });
    }

    // Headers para parecer un navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Intentar fetch directo primero
    let htmlContent: string;
    try {
      const directResponse = await fetch(url, { headers });
      if (directResponse.ok) {
        htmlContent = await directResponse.text();
      } else {
        // Fallback a proxy si el fetch directo falla
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        const proxyData = await proxyResponse.json();
        htmlContent = proxyData.contents;
      }
    } catch {
      // Usar proxy como último recurso
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl);
      const proxyData = await proxyResponse.json();
      htmlContent = proxyData.contents;
    }

    // Crear DOM y usar Readability
    const dom = new JSDOM(htmlContent, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    let result;
    
    if (article && article.textContent) {
      // Limpiar y procesar el contenido
      const cleanContent = article.textContent
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, 100000);
      
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
      const textContent = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 50000);
      
      // Intentar extraer título
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      
      result = {
        title: titleMatch ? titleMatch[1].trim() : 'Contenido extraído',
        content: textContent || 'No se pudo extraer contenido legible',
        excerpt: textContent.slice(0, 200) + '...',
        length: textContent.split(/\s+/).length,
        success: !!textContent
      };
    }
    
    // Guardar en caché
    cache.set(url, {
      data: result,
      timestamp: Date.now()
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error procesando URL:', error);
    return NextResponse.json(
      { 
        error: 'Error al cargar el contenido. Verifica que la URL sea válida.',
        success: false
      }, 
      { status: 500 }
    );
  }
}