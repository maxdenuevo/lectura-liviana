import { useState, useEffect } from 'react';

interface Preferences {
  wpm: number;
  useDyslexicFont: boolean;
  savedText: string | null;
  skipWords: number;
}

const DEFAULT_WPM = 300;
const DEFAULT_DYSLEXIC = false;
const DEFAULT_SKIP_WORDS = 25;

/**
 * Custom hook to manage user preferences with localStorage persistence
 * Handles loading, saving, and providing preferences state
 */
export function usePreferences(defaultText: string) {
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [useDyslexicFont, setUseDyslexicFont] = useState(DEFAULT_DYSLEXIC);
  const [skipWords, setSkipWords] = useState(DEFAULT_SKIP_WORDS);
  const [text, setText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    try {
      const savedText = localStorage.getItem('savedText');
      const savedWpm = localStorage.getItem('savedWpm');
      const savedDyslexic = localStorage.getItem('dyslexic');
      const savedSkipWords = localStorage.getItem('skipWords');

      setText(savedText || defaultText);
      setWpm(savedWpm ? Number(savedWpm) : DEFAULT_WPM);
      setUseDyslexicFont(savedDyslexic === 'true');
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
      localStorage.setItem('dyslexic', useDyslexicFont.toString());
      localStorage.setItem('skipWords', skipWords.toString());

      // Only save text if it's not the default
      if (text && text !== defaultText) {
        localStorage.setItem('savedText', text);
      }
    } catch (error) {
      console.error('No se pudo guardar en localStorage:', error);
    }
  }, [wpm, useDyslexicFont, skipWords, text, isLoaded, defaultText]);

  return {
    wpm,
    setWpm,
    useDyslexicFont,
    setUseDyslexicFont,
    skipWords,
    setSkipWords,
    text,
    setText,
    isLoaded,
  };
}
