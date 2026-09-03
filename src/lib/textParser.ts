import { Emphasis, EnrichedWord, WordType } from '@/components/RSVPReader/types';
import { stripUnsafeHtml } from './htmlText';
import { parseInline, stripInline, type InlineRun } from './inlineMarkdown';

/**
 * Parses text with HTML or Markdown formatting and enriches words with structural metadata
 */

// Lazy-load DOMPurify solo en el cliente para evitar problemas con SSR
let DOMPurify: typeof import('dompurify').default | null = null;
if (typeof window !== 'undefined') {
  import('dompurify').then(module => {
    DOMPurify = module.default;
  });
}

// Configuración de DOMPurify para permitir solo tags seguros necesarios para el parsing
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'hr',
  'div', 'section', 'article', 'main', 'header', 'footer', 'aside',
  'figure', 'figcaption', 'table', 'tr', 'td', 'th', 'dl', 'dt', 'dd',
  'strong', 'b', 'em', 'i', 'cite', 'kbd',
];
const ALLOWED_ATTR: string[] = []; // No necesitamos atributos

/** Un bloque visual (párrafo, título, ítem…) con sus tramos inline */
interface ParsedSegment {
  runs: InlineRun[];
  type: WordType;
  sectionTitle?: string;
  blockIndex: number;
}

/** Tags que abren un bloque visual propio (párrafo, título, ítem, cita…) */
const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'hr',
  'figure', 'figcaption', 'table', 'tr', 'dl', 'dt', 'dd',
]);

/** Celdas de tabla: van en línea dentro de la fila, separadas por un espacio */
const SPACED_TAGS = new Set(['td', 'th']);

const HTML_BOLD = new Set(['strong', 'b']);
const HTML_ITALIC = new Set(['em', 'i', 'cite']);

/**
 * ¿Conviene leer este texto como documento HTML?
 *
 * Basta un `<br>` o un `<u>` en una nota de Obsidian para que un detector
 * ingenuo lo tome por HTML y tire toda la estructura Markdown. Solo vamos por
 * el camino HTML cuando hay tags de bloque reales y no hay señales Markdown
 * que pesen más.
 */
function isHTML(text: string): boolean {
  if (/<!doctype\s|<html[\s>]|<body[\s>]/i.test(text)) return true;

  const blockTags = text.match(/<\/?(p|div|h[1-6]|ul|ol|li|blockquote|pre|section|article|table|tr)[\s>/]/gi);
  if (!blockTags) return false;

  const markdownLines = text.match(/^\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s?|```)/gm);
  const markdownInline = text.match(/\*\*[^*\n]+\*\*|__[^_\n]+__/g);
  const markdownSignals = (markdownLines?.length ?? 0) + (markdownInline?.length ?? 0);

  return blockTags.length > markdownSignals;
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
    // Si DOMPurify no está cargado aún, limpieza básica por regex
    sanitizedHtml = stripUnsafeHtml(html);
  }

  // Create a temporary container to parse HTML
  const container = document.createElement('div');
  container.innerHTML = sanitizedHtml;

  // Bloque actual: los tags inline (code, em…) heredan el del bloque que los contiene.
  // Los nodos de texto consecutivos de un mismo bloque se acumulan en un segmento.
  let blockCounter = 0;
  let currentBlock = 0;
  let open: ParsedSegment | null = null;

  const closeSegment = () => {
    if (open && open.runs.some(run => run.text.trim())) segments.push(open);
    open = null;
  };

  const pushRun = (text: string, type: WordType, emphasis: Emphasis | undefined) => {
    if (!open || open.blockIndex !== currentBlock) {
      closeSegment();
      open = { runs: [], type, sectionTitle: lastSectionTitle, blockIndex: currentBlock };
    }
    open.runs.push(emphasis ? { text, emphasis } : { text });
  };

  interface Inline {
    type: WordType;
    bold: boolean;
    italic: boolean;
  }

  const emphasisOf = ({ type, bold, italic }: Inline): Emphasis | undefined => {
    if (type === 'code') return undefined; // el bloque ya es código
    if (bold && italic) return 'bold-italic';
    if (bold) return 'bold';
    if (italic) return 'italic';
    return undefined;
  };

  // Walk through DOM nodes
  function walkNode(node: Node, inherited: Inline) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text.trim()) pushRun(text, inherited.type, emphasisOf(inherited));
      else if (text && open) pushRun(' ', inherited.type, undefined); // espacio entre inlines
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    // <br> corta el bloque sin contener nada
    if (tagName === 'br') {
      currentBlock = ++blockCounter;
      return;
    }

    const style: Inline = { ...inherited };

    // Determine type based on tag
    if (tagName.match(/^h[1-6]$/)) {
      style.type = tagName as WordType;
      lastSectionTitle = element.textContent?.trim();
    } else if (tagName === 'li') {
      style.type = 'list-item';
    } else if (tagName === 'pre') {
      style.type = 'code';
    } else if (tagName === 'blockquote') {
      style.type = 'blockquote';
    }

    if (HTML_BOLD.has(tagName)) style.bold = true;
    if (HTML_ITALIC.has(tagName)) style.italic = true;

    const isInlineCode = tagName === 'code' || tagName === 'kbd';

    const isBlock = BLOCK_TAGS.has(tagName);
    if (isBlock) currentBlock = ++blockCounter;
    if (SPACED_TAGS.has(tagName) && open) pushRun(' ', style.type, undefined);

    if (isInlineCode && style.type !== 'code') {
      // Código inline: mismo bloque, énfasis 'code'
      const text = element.textContent ?? '';
      if (text.trim()) pushRun(text, style.type, 'code');
    } else {
      // Recurse through children
      node.childNodes.forEach(child => walkNode(child, style));
    }

    // El texto que siga a un bloque arranca uno nuevo (HTML mal anidado incluido)
    if (isBlock) currentBlock = ++blockCounter;
  }

  container.childNodes.forEach(node => walkNode(node, { type: 'normal', bold: false, italic: false }));
  closeSegment();

  return segments;
}

const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const UNORDERED_RE = /^\s*[-*+]\s+(?:\[[ xX]\]\s+)?(.*)$/;
const ORDERED_RE = /^\s*\d{1,9}[.)]\s+(.*)$/;
const BLOCKQUOTE_RE = /^\s*>+\s?(.*)$/;
const CALLOUT_RE = /^\[![\w-]+\][+-]?\s*/;
const HR_RE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const FENCE_RE = /^\s{0,3}(```|~~~)/;
const TABLE_SEPARATOR_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const FOOTNOTE_DEF_RE = /^\[\^[^\]]+\]:\s*(.*)$/;

/**
 * Parse Markdown text and extract structured segments
 */
function parseMarkdown(markdown: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let lastSectionTitle: string | undefined;
  let blockCounter = 0;

  // Párrafo en curso: las líneas seguidas (sin línea en blanco) son un mismo bloque
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const runs = parseInline(paragraph.join(' '));
    if (runs.some(run => run.text.trim())) {
      segments.push({ runs, type: 'normal', sectionTitle: lastSectionTitle, blockIndex: blockCounter++ });
    }
    paragraph = [];
  };

  const push = (source: string, type: WordType) => {
    flushParagraph();
    const runs = parseInline(source);
    if (runs.some(run => run.text.trim())) {
      segments.push({ runs, type, sectionTitle: lastSectionTitle, blockIndex: blockCounter++ });
    }
  };

  let start = 0;
  // Frontmatter YAML de Obsidian: se omite
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((line, i) => i > 0 && /^(---|\.\.\.)\s*$/.test(line));
    if (end !== -1) start = end + 1;
  }

  let inFence = false;

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (FENCE_RE.test(line)) {
      flushParagraph();
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      if (trimmed) {
        flushParagraph();
        segments.push({ runs: [{ text: line }], type: 'code', sectionTitle: lastSectionTitle, blockIndex: blockCounter++ });
      }
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (HR_RE.test(line) || TABLE_SEPARATOR_RE.test(line)) {
      flushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(HEADING_RE);
    if (headingMatch) {
      const level = headingMatch[1].length;
      lastSectionTitle = stripInline(headingMatch[2]);
      push(headingMatch[2], `h${level}` as WordType);
      continue;
    }

    const listMatch = line.match(UNORDERED_RE) ?? line.match(ORDERED_RE);
    if (listMatch) {
      push(listMatch[1], 'list-item');
      continue;
    }

    const blockquoteMatch = line.match(BLOCKQUOTE_RE);
    if (blockquoteMatch) {
      const content = blockquoteMatch[1].replace(CALLOUT_RE, '');
      push(content, 'blockquote');
      continue;
    }

    const footnoteMatch = trimmed.match(FOOTNOTE_DEF_RE);
    if (footnoteMatch) {
      push(footnoteMatch[1], 'normal');
      continue;
    }

    // Fila de tabla: las celdas se leen seguidas
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      push(trimmed.slice(1, -1).split('|').map(cell => cell.trim()).filter(Boolean).join(' · '), 'normal');
      continue;
    }

    // Línea de párrafo (los tags de bloque HTML sueltos se convierten en espacio)
    paragraph.push(trimmed.replace(/<\/?(p|div|br)\b[^>]*>/gi, ' '));
  }

  flushParagraph();

  return segments;
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

/**
 * Convierte los tramos de un bloque en palabras. Una palabra hereda el énfasis
 * de su primera letra: en `**"Autor"**.` el punto final no es negrita, pero
 * la palabra sí.
 */
function runsToWords(runs: InlineRun[]): { text: string; emphasis?: Emphasis }[] {
  const words: { text: string; emphasis?: Emphasis }[] = [];
  let text = '';
  let emphasis: Emphasis | undefined;
  let decided = false;

  const flush = () => {
    if (text) words.push(emphasis ? { text, emphasis } : { text });
    text = '';
    emphasis = undefined;
    decided = false;
  };

  for (const run of runs) {
    for (const ch of run.text) {
      if (/\s/.test(ch)) {
        flush();
        continue;
      }
      if (!decided) {
        if (WORD_CHAR.test(ch)) {
          emphasis = run.emphasis;
          decided = true;
        } else if (!text) {
          emphasis = run.emphasis; // provisional, por si la palabra es solo puntuación
        }
      }
      text += ch;
    }
  }
  flush();

  return words;
}

/**
 * Convert parsed segments into enriched words
 */
function segmentsToEnrichedWords(segments: ParsedSegment[]): EnrichedWord[] {
  const enrichedWords: EnrichedWord[] = [];

  for (const segment of segments) {
    for (const word of runsToWords(segment.runs)) {
      enrichedWords.push({
        text: word.text,
        type: segment.type,
        sectionTitle: segment.sectionTitle,
        blockIndex: segment.blockIndex,
        ...(word.emphasis ? { emphasis: word.emphasis } : {}),
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
 * Fallback: Convert plain text to enriched words.
 * Cada línea es un bloque, para que el modo guiado conserve los párrafos
 * incluso en el camino de emergencia (texto >1MB o parseo fallido).
 */
export function parseSimpleText(text: string): EnrichedWord[] {
  const enrichedWords: EnrichedWord[] = [];

  text.trim().split(/\n+/).forEach((line, blockIndex) => {
    for (const word of line.trim().split(/\s+/)) {
      if (word) {
        enrichedWords.push({ text: word, type: 'normal' as WordType, blockIndex });
      }
    }
  });

  return enrichedWords;
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
