import { useState, useEffect } from 'react';

export type ReadingFont = 'atkinson' | 'opendyslexic';

const DEFAULT_WPM = 300;
const DEFAULT_READING_FONT: ReadingFont = 'atkinson';
const DEFAULT_SKIP_WORDS = 25;

/**
 * Custom hook to manage user preferences with localStorage persistence
 * Handles loading, saving, and providing preferences state
 */
export function usePreferences(defaultText: string) {
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [readingFont, setReadingFont] = useState<ReadingFont>(DEFAULT_READING_FONT);
  const [skipWords, setSkipWords] = useState(DEFAULT_SKIP_WORDS);
  const [text, setText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    try {
      const savedText = localStorage.getItem('savedText');
      const savedWpm = localStorage.getItem('savedWpm');
      const savedSkipWords = localStorage.getItem('skipWords');

      // Migración desde la preferencia booleana anterior ('dyslexic')
      let savedFont = localStorage.getItem('readingFont');
      if (!savedFont && localStorage.getItem('dyslexic') === 'true') {
        savedFont = 'opendyslexic';
        localStorage.removeItem('dyslexic');
      }

      setText(savedText || defaultText);
      setWpm(savedWpm ? Number(savedWpm) : DEFAULT_WPM);
      setReadingFont(savedFont === 'opendyslexic' ? 'opendyslexic' : DEFAULT_READING_FONT);
      setSkipWords(savedSkipWords ? Number(savedSkipWords) : DEFAULT_SKIP_WORDS);
      setIsLoaded(true);
    } catch (error) {
      console.error('No se pudo acceder a localStorage:', error);
      setText(defaultText);
      setIsLoaded(true);
    }
  }, [defaultText]);

  // Save preferences when they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem('savedWpm', wpm.toString());
      localStorage.setItem('readingFont', readingFont);
      localStorage.setItem('skipWords', skipWords.toString());

      // Only save text if it's not the default
      if (text && text !== defaultText) {
        localStorage.setItem('savedText', text);
      }
    } catch (error) {
      console.error('No se pudo guardar en localStorage:', error);
    }
  }, [wpm, readingFont, skipWords, text, isLoaded, defaultText]);

  return {
    wpm,
    setWpm,
    readingFont,
    setReadingFont,
    skipWords,
    setSkipWords,
    text,
    setText,
    isLoaded,
  };
}
