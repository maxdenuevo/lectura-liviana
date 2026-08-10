import { EnrichedWord } from '@/components/RSVPReader/types';

/**
 * Agrupación de palabras para el modo guiado.
 *
 * La técnica de lectura guiada reduce las regresiones (volver a leer lo ya
 * absorbido) moviendo el foco en grupos en vez de palabra por palabra: cada
 * salto de ojo cubre varias palabras y el ritmo se vuelve predecible.
 *
 * El motor RSVP sigue latiendo palabra a palabra, así que la duración de un
 * grupo es la suma de las de sus palabras — las pausas por puntuación de
 * getPauseMultiplier se respetan sin tocar el motor.
 */

/** Rango de palabras [start, end) que se ilumina junto */
export interface Chunk {
  start: number;
  end: number;
}

export const MIN_CHUNK_SIZE = 1;
export const MAX_CHUNK_SIZE = 5;

// Cierra el grupo al final de una frase o pausa fuerte, aunque no esté lleno:
// agrupar a través de un punto rompe el ritmo natural de la lectura.
// Admite comillas y cierres de paréntesis después del signo ("…dijo.»").
const PHRASE_END = /[.!?…:;]["'»”’)\]]*$/;

/**
 * Divide las palabras en grupos de como mucho `size`, sin cruzar bloques
 * (párrafos, títulos) ni finales de frase.
 */
export function buildChunks(words: EnrichedWord[], size: number): Chunk[] {
  const chunks: Chunk[] = [];
  if (words.length === 0) return chunks;

  const maxSize = Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, Math.round(size)));
  let start = 0;

  for (let i = 0; i < words.length; i++) {
    const isLastWord = i === words.length - 1;
    const blockEnds = isLastWord || words[i + 1].blockIndex !== words[i].blockIndex;
    const isFull = i - start + 1 >= maxSize;

    if (blockEnds || isFull || PHRASE_END.test(words[i].text)) {
      chunks.push({ start, end: i + 1 });
      start = i + 1;
    }
  }

  return chunks;
}

/**
 * Índice del grupo que contiene `wordIndex` (búsqueda binaria).
 * Fuera de rango devuelve el grupo más cercano, nunca -1.
 */
export function chunkAt(chunks: Chunk[], wordIndex: number): number {
  if (chunks.length === 0) return 0;

  let low = 0;
  let high = chunks.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (wordIndex < chunks[mid].start) high = mid - 1;
    else if (wordIndex >= chunks[mid].end) low = mid + 1;
    else return mid;
  }

  return Math.min(Math.max(low, 0), chunks.length - 1);
}
