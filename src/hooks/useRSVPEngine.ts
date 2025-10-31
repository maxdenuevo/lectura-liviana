import { useState, useEffect, useMemo } from 'react';
import { EnrichedWord, WordType } from '@/components/RSVPReader/types';
import { getPauseMultiplier } from '@/lib/textParser';

interface RSVPEngineConfig {
  words: EnrichedWord[];
  wpm: number;
  onComplete: () => void;
}

interface RSVPEngineResult {
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  timeRemaining: number;
  currentWord: string;
  currentWordType: WordType;
  setIsPlaying: (playing: boolean) => void;
  setCurrentIndex: (index: number) => void;
  togglePlay: () => void;
  restart: () => void;
  skipForward: (count: number) => void;
  skipBackward: (count: number) => void;
}

/**
 * Custom hook to manage the core RSVP reading engine
 *
 * Handles:
 * - Word-by-word progression
 * - Dynamic delays based on punctuation
 * - Progress tracking
 * - Play/pause state
 */
export function useRSVPEngine({ words, wpm, onComplete }: RSVPEngineConfig): RSVPEngineResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timer principal de lectura
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length) {
      if (currentIndex >= words.length && words.length > 0) {
        onComplete();
        setIsPlaying(false);
        setCurrentIndex(0);
      }
      return;
    }

    const currentWordObj = words[currentIndex];
    const baseDelay = 60000 / wpm;

    // Get pause multiplier based on word type and punctuation
    const multiplier = getPauseMultiplier(currentWordObj.type, currentWordObj.text);
    const delay = baseDelay * multiplier;

    const timer = setTimeout(() => {
      setCurrentIndex(i => i + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, words, wpm, onComplete]);

  // Calculate progress
  const progress = useMemo(() => {
    return words.length > 0 ? (currentIndex / words.length) * 100 : 0;
  }, [currentIndex, words.length]);

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!words.length || currentIndex >= words.length) return 0;
    const wordsLeft = words.length - currentIndex;
    return Math.ceil((wordsLeft / wpm) * 60);
  }, [words.length, currentIndex, wpm]);

  // Get current word and type
  const currentWordObj = words[currentIndex] || { text: '', type: 'normal' as WordType };
  const currentWord = currentWordObj.text;
  const currentWordType = currentWordObj.type;

  // Toggle play/pause
  const togglePlay = () => {
    if (!words.length) return;
    if (currentIndex >= words.length) {
      setCurrentIndex(0);
    }
    setIsPlaying(prev => !prev);
  };

  // Restart from beginning
  const restart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  // Skip forward by count words
  const skipForward = (count: number) => {
    if (!words.length) return;
    const newIndex = Math.min(currentIndex + count, words.length - 1);
    setCurrentIndex(newIndex);
  };

  // Skip backward by count words
  const skipBackward = (count: number) => {
    if (!words.length) return;
    const newIndex = Math.max(currentIndex - count, 0);
    setCurrentIndex(newIndex);
  };

  return {
    currentIndex,
    isPlaying,
    progress,
    timeRemaining,
    currentWord,
    currentWordType,
    setIsPlaying,
    setCurrentIndex,
    togglePlay,
    restart,
    skipForward,
    skipBackward,
  };
}
