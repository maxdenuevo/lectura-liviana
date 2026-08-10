import { useState, useEffect } from 'react';
import { type ReadingMode } from '@/components/RSVPReader/types';
import { MAX_CHUNK_SIZE, MIN_CHUNK_SIZE } from '@/lib/guidedChunks';

export type ReadingFont = 'atkinson' | 'opendyslexic';

const DEFAULT_WPM = 300;
const DEFAULT_READING_FONT: ReadingFont = 'atkinson';
// Retroceso fino con ←→ (releer una frase) vs salto grande con Shift+←→
const DEFAULT_ARROW_STEP = 3;
const DEFAULT_JUMP_WORDS = 25;
const DEFAULT_READING_MODE: ReadingMode = 'rsvp';
// 3 palabras: suficiente para agrupar sin exceder el golpe de vista
const DEFAULT_CHUNK_SIZE = 3;

/**
 * Custom hook to manage user preferences with localStorage persistence.
 * El texto/libros viven en IndexedDB (useLibrary); aquí solo ajustes livianos.
 */
export function usePreferences() {
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [readingFont, setReadingFont] = useState<ReadingFont>(DEFAULT_READING_FONT);
  const [arrowStep, setArrowStep] = useState(DEFAULT_ARROW_STEP);
  const [jumpWords, setJumpWords] = useState(DEFAULT_JUMP_WORDS);
  const [readingMode, setReadingMode] = useState<ReadingMode>(DEFAULT_READING_MODE);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    try {
      const savedWpm = localStorage.getItem('savedWpm');
      const savedArrowStep = localStorage.getItem('arrowStep');

      // Migración desde la preferencia booleana anterior ('dyslexic')
      let savedFont = localStorage.getItem('readingFont');
      if (!savedFont && localStorage.getItem('dyslexic') === 'true') {
        savedFont = 'opendyslexic';
        localStorage.removeItem('dyslexic');
      }

      // Migración: 'skipWords' pasa a ser el salto grande ('jumpWords')
      let savedJumpWords = localStorage.getItem('jumpWords');
      const legacySkip = localStorage.getItem('skipWords');
      if (!savedJumpWords && legacySkip) {
        savedJumpWords = legacySkip;
        localStorage.removeItem('skipWords');
      }

      const savedMode = localStorage.getItem('readingMode');
      const savedChunkSize = Number(localStorage.getItem('chunkSize'));

      setWpm(savedWpm ? Number(savedWpm) : DEFAULT_WPM);
      setReadingFont(savedFont === 'opendyslexic' ? 'opendyslexic' : DEFAULT_READING_FONT);
      setArrowStep(savedArrowStep ? Number(savedArrowStep) : DEFAULT_ARROW_STEP);
      setJumpWords(savedJumpWords ? Number(savedJumpWords) : DEFAULT_JUMP_WORDS);
      setReadingMode(savedMode === 'guided' ? 'guided' : DEFAULT_READING_MODE);
      setChunkSize(
        savedChunkSize >= MIN_CHUNK_SIZE && savedChunkSize <= MAX_CHUNK_SIZE
          ? savedChunkSize
          : DEFAULT_CHUNK_SIZE
      );
    } catch (error) {
      console.error('No se pudo acceder a localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem('savedWpm', wpm.toString());
      localStorage.setItem('readingFont', readingFont);
      localStorage.setItem('arrowStep', arrowStep.toString());
      localStorage.setItem('jumpWords', jumpWords.toString());
      localStorage.setItem('readingMode', readingMode);
      localStorage.setItem('chunkSize', chunkSize.toString());
    } catch (error) {
      console.error('No se pudo guardar en localStorage:', error);
    }
  }, [wpm, readingFont, arrowStep, jumpWords, readingMode, chunkSize, isLoaded]);

  return {
    wpm,
    setWpm,
    readingFont,
    setReadingFont,
    arrowStep,
    setArrowStep,
    jumpWords,
    setJumpWords,
    readingMode,
    setReadingMode,
    chunkSize,
    setChunkSize,
    isLoaded,
  };
}
