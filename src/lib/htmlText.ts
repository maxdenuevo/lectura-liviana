/**
 * Utilidades compartidas de extracción de texto desde HTML por regex.
 * Única fuente para epubParser y el fallback de textParser (antes triplicado).
 */

/** Decodifica las entidades HTML más comunes */
export function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Elimina bloques de script/style y atributos peligrosos */
export function stripUnsafeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

/** Convierte HTML/XHTML a texto plano preservando la separación de párrafos */
export function stripHtmlToText(html: string): string {
  let text = stripUnsafeHtml(html);

  // Remove HTML tags but preserve spacing
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ');

  // Clean up whitespace
  return decodeEntities(text)
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
