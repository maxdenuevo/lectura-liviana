'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import NotificationToast from './NotificationToast';
import WordDisplay from './WordDisplay';
import ControlBar from './ControlBar';
import ConfigModal from './ConfigModal';
import ShortcutsHelp from './ShortcutsHelp';
import FirstVisitHints from './FirstVisitHints';
import GestureFeedback from './GestureFeedback';
import ScreenReaderAnnouncer from './ScreenReaderAnnouncer';
import { WordParts, EnrichedWord } from './types';
import { usePreferences } from '@/hooks/usePreferences';
import { useRSVPEngine } from '@/hooks/useRSVPEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useTextLoader } from '@/hooks/useTextLoader';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { theme } from '@/lib/theme';
import { parseText, parseSimpleText } from '@/lib/textParser';
import { type EpubBook } from '@/lib/epubParser';

const CONTROLS_HIDE_DELAY = 3000;
const DEFAULT_TEXT = "Bienvenido a tu espacio de lectura rápida. Un lugar cálido y minimalista donde las palabras fluyen con naturalidad. Presiona espacio o toca la pantalla para comenzar.";

export default function RSVPReader() {
  // Preferences (localStorage)
  const { wpm, setWpm, useDyslexicFont, setUseDyslexicFont, skipWords, setSkipWords, text, setText } = usePreferences(DEFAULT_TEXT);

  // Motion preferences
  const prefersReducedMotion = useReducedMotion();

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [notification, setNotification] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<{ type: 'speed-up' | 'speed-down' | null; wpm?: number }>({ type: null });
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [epubData, setEpubData] = useState<EpubBook | null>(null);

  // Refs for auto-hide controls
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseMoveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isHoveringControls = useRef<boolean>(false);

  // Process words - detect format and parse
  const words = useMemo((): EnrichedWord[] => {
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    // Try to parse as structured text (HTML or Markdown)
    try {
      const parsed = parseText(trimmedText);
      // If we got structured content, use it
      if (parsed.length > 0) return parsed;
    } catch (error) {
      console.warn('Failed to parse structured text, falling back to simple parsing:', error);
    }

    // Fallback to simple text parsing
    return parseSimpleText(trimmedText);
  }, [text]);

  // Notification helper
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  }, []);

  // RSVP Engine
  const {
    currentIndex,
    isPlaying,
    progress,
    timeRemaining,
    currentWord,
    currentWordType,
    setIsPlaying,
    togglePlay: engineTogglePlay,
    restart: engineRestart,
    skipForward: engineSkipForward,
    skipBackward: engineSkipBackward,
  } = useRSVPEngine({
    words,
    wpm,
    onComplete: () => showNotification('Lectura completada'),
  });

  // Auto-hide controls logic
  const startAutoHideTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (isPlaying && !isHoveringControls.current) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    startAutoHideTimer();
  }, [startAutoHideTimer]);

  // Wrap engine functions with UI feedback
  const togglePlay = useCallback(() => {
    engineTogglePlay();
    showControlsTemporarily();
    setSrAnnouncement(isPlaying ? 'Pausado' : 'Reproduciendo');
  }, [engineTogglePlay, showControlsTemporarily, isPlaying]);

  const restart = useCallback(() => {
    engineRestart();
    showNotification('Reiniciado');
    setSrAnnouncement('Lectura reiniciada desde el principio');
    setShowControls(true);
  }, [engineRestart, showNotification]);

  const adjustSpeed = useCallback((delta: number, showGesture = false) => {
    setWpm(prevWpm => {
      const newWpm = Math.max(100, Math.min(1000, prevWpm + delta));
      showNotification(`${newWpm} ppm`);

      // Show gesture feedback on mobile
      if (showGesture) {
        setGestureFeedback({ type: delta > 0 ? 'speed-up' : 'speed-down', wpm: newWpm });
        setTimeout(() => setGestureFeedback({ type: null }), 800);
      }

      // Announce speed change to screen readers
      setSrAnnouncement(`Velocidad ajustada a ${newWpm} palabras por minuto`);

      return newWpm;
    });
    showControlsTemporarily();
  }, [setWpm, showNotification, showControlsTemporarily]);

  const skipForward = useCallback(() => {
    engineSkipForward(skipWords);
    showControlsTemporarily();
    setSrAnnouncement(`Adelantado ${skipWords} ${skipWords === 1 ? 'palabra' : 'palabras'}`);
  }, [engineSkipForward, skipWords, showControlsTemporarily]);

  const skipBackward = useCallback(() => {
    engineSkipBackward(skipWords);
    showControlsTemporarily();
    setSrAnnouncement(`Retrocedido ${skipWords} ${skipWords === 1 ? 'palabra' : 'palabras'}`);
  }, [engineSkipBackward, skipWords, showControlsTemporarily]);

  const handleChapterSelect = useCallback((chapterContent: string, chapterTitle: string) => {
    setText(chapterContent);
    restart();
    setShowConfig(false);
    showNotification(`Capítulo cargado: ${chapterTitle}`);
    setSrAnnouncement(`Cambiando a: ${chapterTitle}`);
  }, [setText, restart, showNotification]);

  // Text loader
  const { urlInput, isLoadingUrl, epubProgress, epubStatus, setUrlInput, loadFromUrl, loadFromFile } = useTextLoader({
    onTextLoaded: (loadedText, title, loadedEpubData) => {
      setText(loadedText);
      setEpubData(loadedEpubData || null);
      restart();
      setShowConfig(false);
      showNotification(title ? `${title} cargado` : 'Texto cargado');
    },
    onError: showNotification,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onRestart: restart,
    onSpeedUp: () => adjustSpeed(25),
    onSpeedDown: () => adjustSpeed(-25),
    onSkipForward: skipForward,
    onSkipBackward: skipBackward,
    onToggleConfig: () => setShowConfig(prev => !prev),
    onCloseConfig: () => {
      setShowConfig(false);
      setShowHelp(false);
    },
    onShowHelp: () => setShowHelp(prev => !prev),
    isModalOpen: showConfig || showHelp,
  });

  // Touch gestures
  const { handleTouchStart, handleTouchEnd } = useTouchGestures({
    onTap: togglePlay,
    onDoubleTap: () => setShowConfig(prev => !prev),
    onSwipeLeft: skipBackward,
    onSwipeRight: skipForward,
    onSwipeUp: () => adjustSpeed(25, true),
    onSwipeDown: () => adjustSpeed(-25, true),
  });

  // Mouse move handler for auto-hide
  useEffect(() => {
    const handleMouseMove = () => {
      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }

      mouseMoveTimeout.current = setTimeout(() => {
        if (isPlaying && !isHoveringControls.current) {
          showControlsTemporarily();
        }
      }, 150);
    };

    if (isPlaying) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      setShowControls(true);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }
    };
  }, [isPlaying, showControlsTemporarily]);

  // Calculate word parts (ORP - Optimal Recognition Point)
  const getWordParts = (word: string): WordParts => {
    if (!word) return { pre: '', focal: '', post: '' };
    const len = word.length;
    let pivot = 1;
    if (len === 1) pivot = 0;
    else if (len >= 2 && len <= 5) pivot = 1;
    else if (len >= 6 && len <= 9) pivot = 2;
    else if (len >= 10 && len <= 13) pivot = 3;
    else pivot = 4;

    return {
      pre: word.slice(0, pivot),
      focal: word.slice(pivot, pivot + 1),
      post: word.slice(pivot + 1)
    };
  };

  const wordParts = getWordParts(currentWord);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .font-dyslexic {
          font-family: ${theme.fonts.dyslexic} !important;
          letter-spacing: 0.05em;
        }

        .slider-warm {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: ${theme.colors.accentSubtle};
          border-radius: 5px;
          outline: none;
        }

        .slider-warm::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: ${theme.colors.accent};
          cursor: pointer;
          border-radius: 50%;
        }

        .slider-warm::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: ${theme.colors.accent};
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>

      <div
        className={`h-screen overflow-hidden ${useDyslexicFont ? 'font-dyslexic' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          fontFamily: useDyslexicFont ? theme.fonts.dyslexic : theme.fonts.default,
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        {/* Notificación flotante */}
        <NotificationToast message={notification} />

        {/* First visit hints */}
        <FirstVisitHints
          onDismiss={() => {}}
          onLoadExample={(url) => {
            setUrlInput(url);
            // Wait for state to update, then load
            setTimeout(() => loadFromUrl(), 0);
          }}
        />

        {/* Gesture feedback */}
        <GestureFeedback type={gestureFeedback.type} newWpm={gestureFeedback.wpm} />

        {/* Shortcuts help */}
        <ShortcutsHelp showHelp={showHelp} onClose={() => setShowHelp(false)} />

        {/* Screen reader announcements */}
        <ScreenReaderAnnouncer message={srAnnouncement} />

        {/* Botón flotante de ayuda */}
        <button
          onClick={() => setShowHelp(true)}
          style={{
            position: 'fixed',
            top: theme.spacing.lg,
            left: theme.spacing.lg,
            width: theme.spacing.xxl,
            height: theme.spacing.xxl,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            zIndex: theme.zIndex.modal,
            backgroundColor: theme.colors.surfaceFloat,
            backdropFilter: 'blur(12px)',
            color: theme.colors.textMuted,
            border: 'none',
            cursor: 'pointer',
            transition: `all ${theme.transitions.normal} ease`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.text;
            e.currentTarget.style.backgroundColor = theme.colors.surfaceFloatHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.textMuted;
            e.currentTarget.style.backgroundColor = theme.colors.surfaceFloat;
          }}
          aria-label="Atajos de teclado"
        >
          ?
        </button>

        {/* Botón flotante de menú */}
        <button
          onClick={() => setShowConfig(true)}
          style={{
            position: 'fixed',
            top: theme.spacing.lg,
            right: theme.spacing.lg,
            width: theme.spacing.xxl,
            height: theme.spacing.xxl,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            zIndex: theme.zIndex.modal,
            backgroundColor: theme.colors.surfaceFloat,
            backdropFilter: 'blur(12px)',
            color: theme.colors.textMuted,
            border: 'none',
            cursor: 'pointer',
            transition: `all ${theme.transitions.normal} ease`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.text;
            e.currentTarget.style.backgroundColor = theme.colors.surfaceFloatHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.textMuted;
            e.currentTarget.style.backgroundColor = theme.colors.surfaceFloat;
          }}
          aria-label="Menú"
        >
          ≡
        </button>

        {/* Indicador de estado (moved to avoid overlap with help button) */}
        {!isPlaying && words.length > 0 && (
          <div
            style={{
              position: 'fixed',
              top: 'calc(1.5rem + 3rem + 0.5rem)', // Below help button
              left: theme.spacing.lg,
              fontSize: '0.875rem',
              fontWeight: theme.fonts.weights.light,
              zIndex: theme.zIndex.controls,
              color: theme.colors.textMuted,
            }}
          >
            {Math.round(progress)}% leído
          </div>
        )}

        {/* Área de lectura principal */}
        <WordDisplay
          currentIndex={currentIndex}
          wordParts={wordParts}
          wordType={currentWordType}
          progress={progress}
        />

        {/* Controles flotantes */}
        <ControlBar
          showControls={showControls}
          wpm={wpm}
          isPlaying={isPlaying}
          onAdjustSpeed={adjustSpeed}
          onTogglePlay={togglePlay}
          onRestart={restart}
          onSkipBackward={skipBackward}
          onSkipForward={skipForward}
          onMouseEnter={() => {
            isHoveringControls.current = true;
            if (controlsTimeout.current) {
              clearTimeout(controlsTimeout.current);
            }
          }}
          onMouseLeave={() => {
            isHoveringControls.current = false;
            startAutoHideTimer();
          }}
        />

        {/* Panel de configuración modal */}
        <ConfigModal
          showConfig={showConfig}
          text={text}
          wpm={wpm}
          skipWords={skipWords}
          useDyslexicFont={useDyslexicFont}
          urlInput={urlInput}
          isLoadingUrl={isLoadingUrl}
          epubProgress={epubProgress}
          epubStatus={epubStatus}
          epubData={epubData}
          words={words}
          currentIndex={currentIndex}
          timeRemaining={timeRemaining}
          onClose={() => setShowConfig(false)}
          onTextChange={setText}
          onWpmChange={setWpm}
          onSkipWordsChange={setSkipWords}
          onDyslexicFontChange={setUseDyslexicFont}
          onUrlInputChange={setUrlInput}
          onUrlLoad={loadFromUrl}
          onFileLoad={loadFromFile}
          onChapterSelect={handleChapterSelect}
          formatTime={formatTime}
        />
      </div>
    </>
  );
}
