// Shared types for RSVPReader components

export interface WordParts {
  pre: string;
  focal: string;
  post: string;
}

export type WordType = 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'list-item' | 'code' | 'blockquote';

/** Énfasis inline (negrita, cursiva, código); ausente = texto normal */
export type Emphasis = 'bold' | 'italic' | 'bold-italic' | 'code';

export interface EnrichedWord {
  text: string;
  type: WordType;
  sectionTitle?: string; // For breadcrumbs (optional future feature)
  emphasis?: Emphasis;
  /**
   * Bloque de origen (párrafo, título, ítem de lista). El RSVP no lo usa, pero
   * el modo guiado reconstruye los párrafos agrupando palabras consecutivas que
   * comparten este valor. No es correlativo: solo importa que cambie entre bloques.
   */
  blockIndex: number;
}

/** rsvp = una palabra centrada; guided = texto en flujo con foco móvil */
export type ReadingMode = 'rsvp' | 'guided';
