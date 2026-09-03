import { Emphasis } from '@/components/RSVPReader/types';
import { decodeEntities } from './htmlText';

/**
 * Parser inline de Markdown (y del HTML suelto que Obsidian permite mezclar).
 *
 * Convierte una línea con `**negrita**`, `*cursiva*`, `` `código` ``, links,
 * wikilinks, highlights… en una lista de tramos (runs) con su énfasis. El
 * texto llega limpio de marcadores; el énfasis viaja aparte para que la vista
 * lo pinte sin volver a interpretar nada.
 */

export interface InlineRun {
  text: string;
  emphasis?: Emphasis;
}

interface State {
  bold: number;
  italic: number;
  code: boolean;
}

function emphasisOf(state: State): Emphasis | undefined {
  if (state.code) return 'code';
  if (state.bold > 0 && state.italic > 0) return 'bold-italic';
  if (state.bold > 0) return 'bold';
  if (state.italic > 0) return 'italic';
  return undefined;
}

/** Tags HTML inline que aportan énfasis; el resto se descarta conservando el contenido */
const HTML_BOLD = new Set(['b', 'strong']);
const HTML_ITALIC = new Set(['i', 'em', 'cite', 'dfn', 'var']);
const HTML_CODE = new Set(['code', 'kbd', 'samp', 'tt']);

const WORD_CHAR = /[\p{L}\p{N}]/u;

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && WORD_CHAR.test(ch);
}

/**
 * ¿Los `_` en esta posición abren o cierran énfasis? Un guion bajo pegado a
 * letras por ambos lados (snake_case, URLs) es texto, no formato.
 */
function underscoreIsDelimiter(src: string, at: number, len: number): boolean {
  const before = src[at - 1];
  const after = src[at + len];
  return !(isWordChar(before) && isWordChar(after));
}

export function parseInline(source: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const state: State = { bold: 0, italic: 0, code: false };
  let buffer = '';
  let current = emphasisOf(state);
  const openMarkers = new Set<string>();

  const flush = () => {
    if (buffer) runs.push(current ? { text: buffer, emphasis: current } : { text: buffer });
    buffer = '';
  };

  const setState = (mutate: () => void) => {
    flush();
    mutate();
    current = emphasisOf(state);
  };

  const toggleBold = () => setState(() => { state.bold = state.bold > 0 ? 0 : 1; });
  const toggleItalic = () => setState(() => { state.italic = state.italic > 0 ? 0 : 1; });

  const src = source;
  const n = src.length;
  let i = 0;

  while (i < n) {
    const ch = src[i];

    // Escape: \* \_ \# etc.
    if (ch === '\\' && i + 1 < n && /[\\`*_{}[\]()#+\-.!~=|<>]/.test(src[i + 1])) {
      buffer += src[i + 1];
      i += 2;
      continue;
    }

    // Código inline: todo hasta el cierre es literal
    if (ch === '`') {
      let ticks = 1;
      while (src[i + ticks] === '`') ticks++;
      const fence = '`'.repeat(ticks);
      const close = src.indexOf(fence, i + ticks);
      if (close !== -1) {
        setState(() => { state.code = true; });
        buffer += src.slice(i + ticks, close).trim();
        setState(() => { state.code = false; });
        i = close + ticks;
        continue;
      }
      buffer += fence;
      i += ticks;
      continue;
    }

    // Comentarios de Obsidian: %% oculto %%
    if (ch === '%' && src[i + 1] === '%') {
      const close = src.indexOf('%%', i + 2);
      if (close !== -1) {
        i = close + 2;
        continue;
      }
    }

    // Imagen ![alt](url) o embed ![[archivo]] → solo el texto alternativo
    if (ch === '!' && src[i + 1] === '[') {
      if (src[i + 2] === '[') {
        const close = src.indexOf(']]', i + 3);
        if (close !== -1) {
          i = close + 2;
          continue;
        }
      } else {
        const link = matchLink(src, i + 1);
        if (link) {
          buffer += link.text;
          i = link.end;
          continue;
        }
      }
    }

    // Wikilink [[Nota]] o [[Nota|alias]] o [[Nota#sección]]
    if (ch === '[' && src[i + 1] === '[') {
      const close = src.indexOf(']]', i + 2);
      if (close !== -1) {
        const inner = src.slice(i + 2, close);
        const pipe = inner.indexOf('|');
        const label = pipe !== -1 ? inner.slice(pipe + 1) : inner.split('#')[0];
        buffer += label;
        i = close + 2;
        continue;
      }
    }

    // Nota al pie [^1]: se omite la referencia
    if (ch === '[' && src[i + 1] === '^') {
      const close = src.indexOf(']', i + 2);
      if (close !== -1 && !/\s/.test(src.slice(i + 2, close))) {
        i = close + 1;
        continue;
      }
    }

    // Link [texto](url) → texto
    if (ch === '[') {
      const link = matchLink(src, i);
      if (link) {
        buffer += link.text;
        i = link.end;
        continue;
      }
    }

    // Highlight ==texto== (Obsidian) y tachado ~~texto~~: solo se quitan los marcadores
    if ((ch === '=' && src[i + 1] === '=') || (ch === '~' && src[i + 1] === '~')) {
      const marker = ch + ch;
      if (openMarkers.has(marker)) {
        openMarkers.delete(marker);
        i += 2;
        continue;
      }
      const close = src.indexOf(marker, i + 2);
      if (close !== -1 && close > i + 2) {
        openMarkers.add(marker);
        i += 2;
        continue;
      }
    }

    // Asteriscos (*** / ** / *) y guiones bajos (___ / __ / _)
    if (ch === '*' || ch === '_') {
      let count = 1;
      while (src[i + count] === ch && count < 3) count++;
      const marker = ch.repeat(count);
      // Un marcador es formato si cierra algo abierto o si tiene cierre más adelante;
      // un asterisco suelto ("5 * 3") o un guion bajo dentro de una palabra es texto.
      const isOpen = count === 3 ? state.bold > 0 || state.italic > 0 : count === 2 ? state.bold > 0 : state.italic > 0;
      const hasClose = src.indexOf(marker, i + count) !== -1;
      const spaced = /\s/.test(src[i - 1] ?? ' ') && /\s/.test(src[i + count] ?? ' ');
      const allowed = ch === '*' ? !spaced : underscoreIsDelimiter(src, i, count);
      if (allowed && (isOpen || hasClose)) {
        if (count === 3) { toggleBold(); toggleItalic(); }
        else if (count === 2) toggleBold();
        else toggleItalic();
        i += count;
        continue;
      }
      buffer += marker;
      i += count;
      continue;
    }

    // HTML inline
    if (ch === '<') {
      const tag = matchTag(src, i);
      if (tag) {
        const { name, closing, end } = tag;
        if (name === 'br') buffer += ' ';
        else if (HTML_BOLD.has(name)) setState(() => { state.bold += closing ? -1 : 1; if (state.bold < 0) state.bold = 0; });
        else if (HTML_ITALIC.has(name)) setState(() => { state.italic += closing ? -1 : 1; if (state.italic < 0) state.italic = 0; });
        else if (HTML_CODE.has(name)) setState(() => { state.code = !closing; });
        // Cualquier otro tag (span, u, mark, sub, a…) se descarta y queda el contenido
        i = end;
        continue;
      }
      // Comentario HTML <!-- … -->
      if (src.startsWith('<!--', i)) {
        const close = src.indexOf('-->', i + 4);
        if (close !== -1) {
          i = close + 3;
          continue;
        }
      }
    }

    buffer += ch;
    i++;
  }

  flush();

  return runs.map(run => ({ ...run, text: decodeEntities(run.text) }));
}

function matchLink(src: string, at: number): { text: string; end: number } | null {
  if (src[at] !== '[') return null;
  let depth = 0;
  let j = at;
  for (; j < src.length; j++) {
    if (src[j] === '[') depth++;
    else if (src[j] === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  if (j >= src.length || src[j + 1] !== '(') return null;
  const closeParen = src.indexOf(')', j + 2);
  if (closeParen === -1) return null;
  return { text: src.slice(at + 1, j), end: closeParen + 1 };
}

const TAG_RE = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*)?\/?>/;

function matchTag(src: string, at: number): { name: string; closing: boolean; end: number } | null {
  const m = TAG_RE.exec(src.slice(at, at + 200));
  if (!m) return null;
  return { name: m[2].toLowerCase(), closing: m[1] === '/', end: at + m[0].length };
}

/** Texto plano de una línea, sin marcadores (para títulos de sección) */
export function stripInline(source: string): string {
  return parseInline(source).map(run => run.text).join('').replace(/\s+/g, ' ').trim();
}
