import { EnrichedWord, WordType } from '@/components/RSVPReader/types';

/**
 * Parses text with HTML or Markdown formatting and enriches words with structural metadata
 */

// Lazy-load DOMPurify solo en el cliente para evitar problemas con SSR
let DOMPurify: any = null;
if (typeof window !== 'undefined') {
  import('dompurify').then(module => {
    DOMPurify = module.default;
  });
}

// Configuración de DOMPurify para permitir solo tags seguros necesarios para el parsing
const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br'];
const ALLOWED_ATTR: string[] = []; // No necesitamos atributos

// HTML tag patterns
const HTML_HEADING_REGEX = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
const HTML_TAG_REGEX = /<[^>]+>/g;
const HTML_LIST_ITEM_REGEX = /<li[^>]*>(.*?)<\/li>/gi;
const HTML_CODE_REGEX = /<code[^>]*>(.*?)<\/code>/gi;
const HTML_BLOCKQUOTE_REGEX = /<blockquote[^>]*>(.*?)<\/blockquote>/gi;

// Markdown patterns
const MD_HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;
const MD_LIST_ITEM_REGEX = /^[\s]*[-*+]\s+(.+)$/gm;
const MD_CODE_INLINE_REGEX = /`([^`]+)`/g;
const MD_BLOCKQUOTE_REGEX = /^>\s+(.+)$/gm;

interface ParsedSegment {
  text: string;
  type: WordType;
  sectionTitle?: string;
}

/**
 * Detect if text contains HTML tags
 */
function isHTML(text: string): boolean {
  return /<[^>]+>/.test(text);
}

/**
 * Parse HTML text and extract structured segments
 */
function parseHTML(html: string): ParsedSegment[] {
  // Verificar que estamos en el navegador (client-side)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // En el servidor, fallback a parsing simple sin DOM
    console.warn('parseHTML called on server, falling back to simple parsing');
    return [];
  }

  const segments: ParsedSegment[] = [];
  let currentPosition = 0;
  let lastSectionTitle: string | undefined;

  // Sanitizar HTML antes de parsearlo para prevenir XSS
  let sanitizedHtml = html;
  if (DOMPurify) {
    sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      KEEP_CONTENT: true, // Mantener el contenido de tags no permitidos
    });
  } else {
    // Si DOMPurify no está cargado aún, usar un regex simple para remover scripts y eventos
    sanitizedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remover event handlers
      .replace(/javascript:/gi, ''); // Remover javascript: URLs
  }

  // Create a temporary container to parse HTML
  const container = document.createElement('div');
  container.innerHTML = sanitizedHtml;

  // Walk through DOM nodes
  function walkNode(node: Node, inherited: WordType = 'normal') {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        segments.push({
          text,
          type: inherited,
          sectionTitle: lastSectionTitle,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      let nodeType: WordType = inherited;

      // Determine type based on tag
      if (tagName.match(/^h[1-6]$/)) {
        nodeType = tagName as WordType;
        lastSectionTitle = element.textContent?.trim();
      } else if (tagName === 'li') {
        nodeType = 'list-item';
      } else if (tagName === 'code' || tagName === 'pre') {
        nodeType = 'code';
      } else if (tagName === 'blockquote') {
        nodeType = 'blockquote';
      }

      // Recurse through children
      node.childNodes.forEach(child => walkNode(child, nodeType));
    }
  }

  container.childNodes.forEach(node => walkNode(node));

  return segments;
}

/**
 * Clean inline markdown formatting (bold, italic, code, links)
 */
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')              // Remove inline code backticks
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')   // Remove bold+italic ***text***
    .replace(/\*\*([^*]+)\*\*/g, '$1')       // Remove bold **text**
    .replace(/\*([^*]+)\*/g, '$1')           // Remove italic *text*
    .replace(/__([^_]+)__/g, '$1')           // Remove bold __text__
    .replace(/_([^_]+)_/g, '$1')             // Remove italic _text_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links [text](url)
    .replace(/~~([^~]+)~~/g, '$1');          // Remove strikethrough ~~text~~
}

/**
 * Parse Markdown text and extract structured segments
 */
function parseMarkdown(markdown: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const lines = markdown.split('\n');
  let lastSectionTitle: string | undefined;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check for heading
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = cleanInlineMarkdown(headingMatch[2]);
      lastSectionTitle = text;
      segments.push({
        text,
        type: `h${level}` as WordType,
        sectionTitle: lastSectionTitle,
      });
      continue;
    }

    // Check for list item
    const listMatch = trimmedLine.match(/^[\s]*[-*+]\s+(.+)$/);
    if (listMatch) {
      segments.push({
        text: cleanInlineMarkdown(listMatch[1]),
        type: 'list-item',
        sectionTitle: lastSectionTitle,
      });
      continue;
    }

    // Check for blockquote
    const blockquoteMatch = trimmedLine.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      segments.push({
        text: cleanInlineMarkdown(blockquoteMatch[1]),
        type: 'blockquote',
        sectionTitle: lastSectionTitle,
      });
      continue;
    }

    // Regular paragraph - clean inline formatting
    const cleanedText = cleanInlineMarkdown(trimmedLine);
    segments.push({
      text: cleanedText,
      type: 'normal',
      sectionTitle: lastSectionTitle,
    });
  }

  return segments;
}

/**
 * Convert parsed segments into enriched words
 */
function segmentsToEnrichedWords(segments: ParsedSegment[]): EnrichedWord[] {
  const enrichedWords: EnrichedWord[] = [];

  for (const segment of segments) {
    const words = segment.text.trim().split(/\s+/).filter(Boolean);

    for (const word of words) {
      enrichedWords.push({
        text: word,
        type: segment.type,
        sectionTitle: segment.sectionTitle,
      });
    }
  }

  return enrichedWords;
}

/**
 * Main parsing function - detects format and returns enriched words
 */
export function parseText(text: string): EnrichedWord[] {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  // Límite de seguridad para prevenir ReDoS: 1MB de texto
  const MAX_TEXT_LENGTH = 1024 * 1024; // 1MB
  if (trimmedText.length > MAX_TEXT_LENGTH) {
    // Si el texto es demasiado largo, truncar y usar parsing simple
    console.warn(`Text too long for structured parsing (${trimmedText.length} chars). Using simple parsing.`);
    return parseSimpleText(trimmedText.slice(0, MAX_TEXT_LENGTH));
  }

  // Detect format
  const isHTMLFormat = isHTML(trimmedText);

  // Parse based on format
  const segments = isHTMLFormat ? parseHTML(trimmedText) : parseMarkdown(trimmedText);

  // Convert to enriched words
  return segmentsToEnrichedWords(segments);
}

/**
 * Fallback: Convert plain text (space-separated words) to enriched words
 */
export function parseSimpleText(text: string): EnrichedWord[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => ({
      text: word,
      type: 'normal' as WordType,
    }));
}

/**
 * Get pause multiplier based on word type (for RSVP engine)
 */
export function getPauseMultiplier(type: WordType, punctuation: string): number {
  // Base multiplier from punctuation
  let multiplier = 1;

  if (punctuation.endsWith(',')) {
    multiplier = 1.3;
  } else if (punctuation.endsWith(':') || punctuation.endsWith(';')) {
    multiplier = 1.5;
  } else if (/[.!?]$/.test(punctuation)) {
    multiplier = 2;
  }

  // Additional multiplier based on type
  switch (type) {
    case 'h1':
      return Math.max(multiplier, 2.5); // Longest pause for H1
    case 'h2':
      return Math.max(multiplier, 2.0);
    case 'h3':
      return Math.max(multiplier, 1.8);
    case 'h4':
    case 'h5':
    case 'h6':
      return Math.max(multiplier, 1.5);
    case 'list-item':
      return Math.max(multiplier, 1.3);
    case 'blockquote':
      return Math.max(multiplier, 1.4);
    default:
      return multiplier;
  }
}

/**
 * Get visual style multipliers for word display
 */
export function getVisualStyle(type: WordType): {
  sizeMultiplier: number;
  brightnessMultiplier: number;
  durationMultiplier: number;
} {
  switch (type) {
    case 'h1':
      return { sizeMultiplier: 1.3, brightnessMultiplier: 1.5, durationMultiplier: 2.0 };
    case 'h2':
      return { sizeMultiplier: 1.2, brightnessMultiplier: 1.4, durationMultiplier: 1.8 };
    case 'h3':
      return { sizeMultiplier: 1.15, brightnessMultiplier: 1.3, durationMultiplier: 1.6 };
    case 'h4':
      return { sizeMultiplier: 1.1, brightnessMultiplier: 1.2, durationMultiplier: 1.4 };
    case 'h5':
    case 'h6':
      return { sizeMultiplier: 1.05, brightnessMultiplier: 1.1, durationMultiplier: 1.2 };
    case 'list-item':
      return { sizeMultiplier: 1.0, brightnessMultiplier: 1.1, durationMultiplier: 1.1 };
    case 'blockquote':
      return { sizeMultiplier: 1.0, brightnessMultiplier: 0.9, durationMultiplier: 1.2 };
    case 'code':
      return { sizeMultiplier: 0.95, brightnessMultiplier: 1.0, durationMultiplier: 1.0 };
    default:
      return { sizeMultiplier: 1.0, brightnessMultiplier: 1.0, durationMultiplier: 1.0 };
  }
}
