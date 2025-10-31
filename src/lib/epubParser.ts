import JSZip from 'jszip';

/**
 * Parser for EPUB files
 * Extracts text content from EPUB ebooks (ignoring images and styles)
 */

export interface EpubMetadata {
  title: string;
  author?: string;
  publisher?: string;
  date?: string;
  description?: string;
  language?: string;
}

export interface EpubChapter {
  title: string;
  content: string;
  index: number;
}

export interface EpubBook {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  fullText: string;
}

/**
 * Parse container.xml to find the path to content.opf
 */
function parseContainerXML(xml: string): string | null {
  try {
    // Simple regex to extract rootfile path from container.xml
    const match = xml.match(/rootfile[^>]+full-path="([^"]+)"/i);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error parsing container.xml:', error);
    return null;
  }
}

/**
 * Parse metadata from content.opf
 */
function parseMetadata(xml: string): EpubMetadata {
  const extractTag = (tag: string): string | undefined => {
    const regex = new RegExp(`<dc:${tag}[^>]*>([^<]+)<\\/dc:${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : undefined;
  };

  const extractMeta = (property: string): string | undefined => {
    const regex = new RegExp(`<meta[^>]+property="${property}"[^>]*>([^<]+)<\\/meta>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : undefined;
  };

  return {
    title: extractTag('title') || 'Sin título',
    author: extractTag('creator'),
    publisher: extractTag('publisher'),
    date: extractTag('date'),
    description: extractTag('description') || extractMeta('dcterms:abstract'),
    language: extractTag('language'),
  };
}

/**
 * Parse content.opf to get ordered list of chapter files and their info
 */
interface ChapterInfo {
  path: string;
  id: string;
}

function parseContentOPF(xml: string, basePath: string): ChapterInfo[] {
  try {
    const chapters: ChapterInfo[] = [];

    // Extract manifest items (all content files)
    const manifestItems = new Map<string, string>();
    const manifestRegex = /<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"[^>]*media-type="application\/xhtml\+xml"/gi;
    let match;

    while ((match = manifestRegex.exec(xml)) !== null) {
      manifestItems.set(match[1], match[2]);
    }

    // Extract spine (reading order)
    const spineRegex = /<itemref[^>]+idref="([^"]+)"/gi;
    while ((match = spineRegex.exec(xml)) !== null) {
      const itemId = match[1];
      const href = manifestItems.get(itemId);
      if (href) {
        // Combine with basePath to get full path
        const dir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        chapters.push({
          path: dir + href,
          id: itemId
        });
      }
    }

    return chapters;
  } catch (error) {
    console.error('Error parsing content.opf:', error);
    return [];
  }
}

/**
 * Extract chapter title from HTML content
 */
function extractChapterTitle(html: string): string {
  try {
    // Try to find title in various common locations
    const titleMatches = [
      html.match(/<title[^>]*>([^<]+)<\/title>/i),
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i),
      html.match(/<h2[^>]*>([^<]+)<\/h2>/i),
    ];

    for (const match of titleMatches) {
      if (match && match[1].trim()) {
        return match[1]
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
      }
    }

    return 'Capítulo sin título';
  } catch (error) {
    return 'Capítulo sin título';
  }
}

/**
 * Extract text from HTML/XHTML content (removing tags)
 */
function extractTextFromHTML(html: string): string {
  try {
    // Remove script and style tags
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML tags but preserve spacing
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ');

    // Clean up whitespace
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text + '\n\n';
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return '';
  }
}

/**
 * Main function to extract text and metadata from EPUB file
 */
export async function extractEpubText(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<EpubBook> {
  try {
    onProgress?.(0, 'Leyendo archivo EPUB...');

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(10, 'Descomprimiendo EPUB...');

    // Load ZIP
    const zip = await JSZip.loadAsync(arrayBuffer);
    onProgress?.(20, 'Buscando contenido...');

    // Step 1: Find content.opf path from container.xml
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('No se encontró container.xml en el EPUB');
    }

    const containerXML = await containerFile.async('text');
    const opfPath = parseContainerXML(containerXML);

    if (!opfPath) {
      throw new Error('No se pudo encontrar el archivo content.opf');
    }

    onProgress?.(30, 'Extrayendo metadatos...');

    // Step 2: Parse content.opf to get metadata and chapter list
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error(`No se encontró el archivo ${opfPath}`);
    }

    const opfContent = await opfFile.async('text');

    // Extract metadata
    const metadata = parseMetadata(opfContent);

    // Get ordered chapter list
    const chapterInfos = parseContentOPF(opfContent, opfPath);

    if (chapterInfos.length === 0) {
      throw new Error('No se encontraron capítulos en el EPUB');
    }

    onProgress?.(40, `Procesando ${chapterInfos.length} capítulos...`);

    // Step 3: Extract text from each chapter
    const chapters: EpubChapter[] = [];
    let fullText = '';

    for (let i = 0; i < chapterInfos.length; i++) {
      const chapterInfo = chapterInfos[i];
      const chapterFile = zip.file(chapterInfo.path);

      if (chapterFile) {
        const chapterHTML = await chapterFile.async('text');
        const chapterTitle = extractChapterTitle(chapterHTML);
        const chapterText = extractTextFromHTML(chapterHTML);

        chapters.push({
          title: chapterTitle,
          content: chapterText,
          index: i
        });

        fullText += chapterText;

        // Update progress
        const progress = 40 + Math.floor((i / chapterInfos.length) * 50);
        onProgress?.(progress, `Procesando capítulo ${i + 1}/${chapterInfos.length}...`);
      }
    }

    if (!fullText.trim()) {
      throw new Error('No se pudo extraer texto del EPUB');
    }

    onProgress?.(100, 'Completado');

    return {
      metadata,
      chapters,
      fullText: fullText.trim()
    };

  } catch (error) {
    console.error('Error processing EPUB:', error);
    throw new Error(
      error instanceof Error
        ? `Error al procesar EPUB: ${error.message}`
        : 'Error desconocido al procesar el archivo EPUB'
    );
  }
}

/**
 * Check if a file is an EPUB based on extension
 */
export function isEpubFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.epub');
}
