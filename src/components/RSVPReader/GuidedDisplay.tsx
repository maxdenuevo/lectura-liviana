import { memo, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { Emphasis, EnrichedWord, WordType } from './types';
import { buildChunks, chunkAt, type Chunk } from '@/lib/guidedChunks';

interface GuidedDisplayProps {
  words: EnrichedWord[];
  currentIndex: number;
  chunkSize: number;
  progress: number;
}

/**
 * Ventana de palabras montadas en el DOM. Un libro son cientos de miles de
 * <span>: montamos solo el entorno del foco y re-cortamos con histéresis, para
 * que el corte ocurra cada ~150 palabras y no en cada tick.
 */
const WINDOW_BEFORE = 180;
const WINDOW_AFTER = 320;
const MARGIN_BACK = 70;
const MARGIN_FORWARD = 150;

/** Altura donde se ancla el grupo activo (0.5 = centro exacto) */
const FOCUS_RATIO = 0.44;

const EMPTY_CHUNK: Chunk = { start: 0, end: 0 };

function computeRange(index: number, total: number) {
  return {
    start: Math.max(0, index - WINDOW_BEFORE),
    end: Math.min(total, index + WINDOW_AFTER),
  };
}

/** Tipografía por tipo de bloque; los tamaños son relativos al del track */
function blockStyle(type: WordType): CSSProperties {
  const base: CSSProperties = { margin: '0 0 1.15em', padding: 0 };

  switch (type) {
    case 'h1':
      return { ...base, fontSize: '1.7em', fontWeight: 700, lineHeight: 1.3, margin: '1.6em 0 0.7em' };
    case 'h2':
      return { ...base, fontSize: '1.42em', fontWeight: 700, lineHeight: 1.35, margin: '1.4em 0 0.6em' };
    case 'h3':
      return { ...base, fontSize: '1.22em', fontWeight: 700, lineHeight: 1.4, margin: '1.2em 0 0.5em' };
    case 'h4':
    case 'h5':
    case 'h6':
      return { ...base, fontSize: '1.08em', fontWeight: 700, margin: '1.1em 0 0.5em' };
    case 'list-item':
      return { ...base, paddingLeft: '1.4em', textIndent: '-1.4em', margin: '0 0 0.6em' };
    case 'blockquote':
      return {
        ...base,
        fontStyle: 'italic',
        paddingLeft: '1em',
        borderLeft: '2px solid var(--border-light)',
        margin: '0 0 1.15em',
      };
    case 'code':
      return {
        ...base,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.88em',
        whiteSpace: 'pre-wrap',
      };
    default:
      return base;
  }
}

const HEADING = /^h[1-6]$/;

/** Negrita/cursiva/código inline; undefined = sin estilo extra */
function emphasisStyle(emphasis: Emphasis | undefined): CSSProperties | undefined {
  switch (emphasis) {
    case 'bold':
      return { fontWeight: 700 };
    case 'italic':
      return { fontStyle: 'italic' };
    case 'bold-italic':
      return { fontWeight: 700, fontStyle: 'italic' };
    case 'code':
      return { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.9em' };
    default:
      return undefined;
  }
}

interface BlockProps {
  words: EnrichedWord[];
  from: number;
  to: number;
  active: Chunk;
  activeRef: RefObject<HTMLSpanElement | null>;
}

/** Un bloque (párrafo, título, ítem) con sus palabras individuales */
function renderBlock({ words, from, to, active, activeRef }: BlockProps): ReactNode {
  const type = words[from].type;
  const Tag = (HEADING.test(type) ? type : 'p') as 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  // El bloque que contiene el foco se atenúa menos: da contexto sin robar atención
  const holdsFocus = active.start < to && active.end > from;
  const restClass = holdsFocus ? 'guided-word guided-word--near' : 'guided-word';

  const nodes: ReactNode[] = [];
  for (let i = from; i < to; i++) {
    const isActive = i >= active.start && i < active.end;
    nodes.push(
      <span
        key={i}
        ref={i === active.start ? activeRef : undefined}
        className={isActive ? 'guided-word guided-word--on' : restClass}
        style={emphasisStyle(words[i].emphasis)}
      >
        {words[i].text}
      </span>
    );
    if (i < to - 1) nodes.push(' ');
  }

  return (
    <Tag key={`b${from}`} style={blockStyle(type)}>
      {type === 'list-item' && <span className={restClass} aria-hidden="true">{'• '}</span>}
      {nodes}
    </Tag>
  );
}

/**
 * Modo guiado: el texto se lee en flujo y un foco cálido avanza por grupos de
 * palabras, marcando el ritmo. Comparte el reloj del RSVP (`currentIndex`), así
 * que velocidad, saltos y posición guardada valen igual en los dos modos.
 */
function GuidedDisplay({ words, currentIndex, chunkSize, progress }: GuidedDisplayProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);

  const chunks = useMemo(() => buildChunks(words, chunkSize), [words, chunkSize]);

  // Identidad estable mientras el foco no cambie de grupo: los memos de abajo
  // se saltan los ticks intermedios (con 3 palabras, 2 de cada 3 no tocan el DOM)
  const activeChunk = useMemo(
    () => chunks[chunkAt(chunks, currentIndex)] ?? EMPTY_CHUNK,
    [chunks, currentIndex]
  );

  // Ventana derivada en render con histéresis (el ref es solo caché: mismo
  // input, mismo resultado). Con un efecto habría un frame de contenido viejo
  // tras un salto de capítulo.
  const rangeRef = useRef({ start: 0, end: 0 });
  const wordsRef = useRef(words);
  let range = rangeRef.current;
  const needsReslice =
    range.end === 0 ||
    (currentIndex < range.start + MARGIN_BACK && range.start > 0) ||
    (currentIndex > range.end - MARGIN_FORWARD && range.end < words.length);

  if (wordsRef.current !== words || needsReslice) {
    wordsRef.current = words;
    range = computeRange(currentIndex, words.length);
    rangeRef.current = range;
  }

  const content = useMemo(() => {
    const blocks: ReactNode[] = [];
    let i = range.start;

    while (i < range.end) {
      const block = words[i].blockIndex;
      const from = i;
      while (i < range.end && words[i].blockIndex === block) i++;
      blocks.push(renderBlock({ words, from, to: i, active: activeChunk, activeRef }));
    }

    return blocks;
  }, [words, range.start, range.end, activeChunk]);

  // Mantiene el grupo activo anclado a la misma altura. Medimos en lugar de
  // acumular desplazamientos: así sobrevive a reflows, cambios de fuente y
  // re-cortes de ventana sin desincronizarse.
  const lastStart = useRef(range.start);
  const isFirstAlign = useRef(true);
  useLayoutEffect(() => {
    const align = (animate: boolean) => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const active = activeRef.current;
      if (!track || !viewport || !active) return;

      const offset = viewport.clientHeight * FOCUS_RATIO - (active.offsetTop + active.offsetHeight / 2);

      if (animate) {
        track.style.transform = `translate3d(0, ${offset}px, 0)`;
        return;
      }

      // El contenido cambió bajo los pies: animar el delta sería un salto falso
      track.style.transition = 'none';
      track.style.transform = `translate3d(0, ${offset}px, 0)`;
      void track.offsetHeight; // fuerza el reflow antes de devolver la transición
      track.style.transition = '';
    };

    // Al montar no hay posición previa que animar: anclar de golpe
    align(!isFirstAlign.current && lastStart.current === range.start);
    isFirstAlign.current = false;
    lastStart.current = range.start;

    const onResize = () => align(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeChunk, range.start, range.end]);

  if (words.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        ref={viewportRef}
        className="guided-viewport"
        style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center' }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '42rem' }}>
          <div
            ref={trackRef}
            className="guided-track"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '0 1.5rem' }}
          >
            {content}
          </div>
        </div>
      </div>

      {/* Indicador de progreso, por encima de la barra de controles */}
      <div
        style={{
          position: 'absolute',
          bottom: '6.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '28rem',
          padding: '0 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ height: '2px', backgroundColor: 'var(--border)', borderRadius: '1px' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--accent-muted)',
              borderRadius: '1px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(GuidedDisplay);
