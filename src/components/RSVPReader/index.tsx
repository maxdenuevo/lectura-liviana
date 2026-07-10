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
import LibraryView from '@/components/Library/LibraryView';
import { WordParts, EnrichedWord } from './types';
import { usePreferences } from '@/hooks/usePreferences';
import { useRSVPEngine } from '@/hooks/useRSVPEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useTextLoader } from '@/hooks/useTextLoader';
import { useLibrary } from '@/hooks/useLibrary';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { theme } from '@/lib/theme';
import { parseText, parseSimpleText } from '@/lib/textParser';
import { type EpubBook } from '@/lib/epubParser';
import { type StoredBook } from '@/lib/db';

const CONTROLS_HIDE_DELAY = 3000;
const DEFAULT_TEXT = "Bienvenido a tu espacio de lectura rápida. Un lugar cálido y minimalista donde las palabras fluyen con naturalidad. Presiona espacio o toca la pantalla para comenzar.";

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function RSVPReader() {
  // Preferences (localStorage)
  const { wpm, setWpm, readingFont, setReadingFont, skipWords, setSkipWords } = usePreferences();
  const useDyslexicFont = readingFont === 'opendyslexic';

  // Texto activo (viene de la biblioteca o del textarea) y posición de reanudación
  const [text, setText] = useState('');
  const [initialIndex, setInitialIndex] = useState(0);

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
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

  // Biblioteca (IndexedDB): abre el último libro al montar y reanuda su posición
  const handleBookOpened = useCallback((book: StoredBook, savedIndex: number) => {
    setInitialIndex(savedIndex);
    setText(book.fullText);
    setEpubData(
      book.metadata && book.chapters && book.chapters.length > 0
        ? { metadata: book.metadata, chapters: book.chapters, fullText: book.fullText }
        : null
    );
    setShowConfig(false);
    setShowLibrary(false);
    showNotification(savedIndex > 0 ? `${book.title} — reanudando` : book.title);
  }, [showNotification]);

  const {
    books,
    activeBookId,
    isLibraryLoaded,
    openBook,
    addBookToLibrary,
    removeBook,
    detachActiveBook,
  } = useLibrary({ onBookOpened: handleBookOpened, onError: showNotification });

  // Texto de bienvenida solo si la biblioteca cargó vacía
  useEffect(() => {
    if (isLibraryLoaded && !activeBookId && !text) {
      setText(DEFAULT_TEXT);
    }
  }, [isLibraryLoaded, activeBookId, text]);

  // RSVP Engine
  const {
    currentIndex,
    isPlaying,
    progress,
    timeRemaining,
    currentWord,
    currentWordType,
    setIsPlaying,
    setCurrentIndex,
    togglePlay: engineTogglePlay,
    restart: engineRestart,
    skipForward: engineSkipForward,
    skipBackward: engineSkipBackward,
  } = useRSVPEngine({
    words,
    wpm,
    initialIndex,
    onComplete: () => showNotification('Lectura completada'),
  });

  // Persistir la posición del libro activo (throttled + flush al pausar/salir)
  useReadingProgress(activeBookId, currentIndex, isPlaying);

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

  // Offsets de palabra por capítulo: navegar capítulos mueve el índice sobre el
  // texto completo, así la posición guardada y los capítulos comparten un solo índice
  const chapterOffsets = useMemo(() => {
    if (!epubData) return [];
    const offsets: number[] = [];
    let acc = 0;
    for (const chapter of epubData.chapters) {
      offsets.push(acc);
      const trimmed = chapter.content.trim();
      acc += trimmed ? trimmed.split(/\s+/).length : 0;
    }
    return offsets;
  }, [epubData]);

  const handleChapterSelect = useCallback((chapterIndex: number, chapterTitle: string) => {
    setIsPlaying(false);
    setCurrentIndex(Math.min(chapterOffsets[chapterIndex] ?? 0, Math.max(words.length - 1, 0)));
    setShowConfig(false);
    showNotification(`Capítulo: ${chapterTitle}`);
    setSrAnnouncement(`Cambiando a: ${chapterTitle}`);
  }, [chapterOffsets, words.length, setIsPlaying, setCurrentIndex, showNotification]);

  // Text loader: todo lo cargado entra a la biblioteca y se abre desde ahí
  const { urlInput, isLoadingUrl, epubProgress, epubStatus, setUrlInput, loadFromUrl, loadFromFile } = useTextLoader({
    onTextLoaded: (loadedText, source, title, loadedEpubData) => {
      addBookToLibrary({
        title: title || 'Sin título',
        author: loadedEpubData?.metadata.author,
        source,
        fullText: loadedText,
        metadata: loadedEpubData?.metadata,
        chapters: loadedEpubData?.chapters,
      });
    },
    onError: showNotification,
  });

  // El textarea edita texto efímero: se despega del libro activo
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setInitialIndex(0);
    setEpubData(null);
    detachActiveBook();
  }, [detachActiveBook]);

  // Guardar el texto pegado como libro
  const handleSaveToLibrary = useCallback(() => {
    if (!text.trim()) return;
    const firstWords = text.trim().split(/\s+/).slice(0, 6).join(' ');
    addBookToLibrary({
      title: firstWords.length > 40 ? `${firstWords.slice(0, 40)}…` : firstWords,
      source: 'paste',
      fullText: text,
    });
    showNotification('Guardado en la biblioteca');
  }, [text, addBookToLibrary, showNotification]);

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
      setShowLibrary(false);
    },
    onShowHelp: () => setShowHelp(prev => !prev),
    isModalOpen: showConfig || showHelp || showLibrary,
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

  const wordParts = getWordParts(currentWord);

  // Callbacks estables para que los hijos memoizados no se re-rendericen por tick
  const closeConfig = useCallback(() => setShowConfig(false), []);
  const closeHelp = useCallback(() => setShowHelp(false), []);
  const openHelp = useCallback(() => setShowHelp(true), []);
  const openConfig = useCallback(() => setShowConfig(true), []);
  const openLibrary = useCallback(() => setShowLibrary(true), []);
  const closeLibrary = useCallback(() => setShowLibrary(false), []);

  const handleLoadExample = useCallback((url: string) => {
    setUrlInput(url);
    // Wait for state to update, then load
    setTimeout(() => loadFromUrl(), 0);
  }, [setUrlInput, loadFromUrl]);

  const handleControlsMouseEnter = useCallback(() => {
    isHoveringControls.current = true;
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  }, []);

  const handleControlsMouseLeave = useCallback(() => {
    isHoveringControls.current = false;
    startAutoHideTimer();
  }, [startAutoHideTimer]);

  return (
    <>
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
        {/* Halo de vela + viñeta (estático, no cuesta nada por tick) */}
        <div className="candle-scene" aria-hidden="true" />

        {/* Notificación flotante */}
        <NotificationToast message={notification} />

        {/* First visit hints */}
        <FirstVisitHints onLoadExample={handleLoadExample} />

        {/* Gesture feedback */}
        <GestureFeedback type={gestureFeedback.type} newWpm={gestureFeedback.wpm} />

        {/* Shortcuts help */}
        <ShortcutsHelp showHelp={showHelp} onClose={closeHelp} />

        {/* Biblioteca */}
        <LibraryView
          showLibrary={showLibrary}
          books={books}
          activeBookId={activeBookId}
          onClose={closeLibrary}
          onOpenBook={openBook}
          onDeleteBook={removeBook}
        />

        {/* Screen reader announcements */}
        <ScreenReaderAnnouncer message={srAnnouncement} />

        {/* Botón flotante de ayuda */}
        <button
          onClick={openHelp}
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
          onClick={openConfig}
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

        {/* Botón flotante de biblioteca */}
        <button
          onClick={openLibrary}
          style={{
            position: 'fixed',
            top: 'calc(1.5rem + 3rem + 0.5rem)',
            right: theme.spacing.lg,
            width: theme.spacing.xxl,
            height: theme.spacing.xxl,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          aria-label="Biblioteca"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
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
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
        />

        {/* Panel de configuración modal */}
        <ConfigModal
          showConfig={showConfig}
          text={text}
          wpm={wpm}
          skipWords={skipWords}
          readingFont={readingFont}
          urlInput={urlInput}
          isLoadingUrl={isLoadingUrl}
          epubProgress={epubProgress}
          epubStatus={epubStatus}
          epubData={epubData}
          words={words}
          // Gateados con el modal cerrado: sin esto, cada palabra re-renderizaría el modal entero
          currentIndex={showConfig ? currentIndex : 0}
          timeRemaining={showConfig ? timeRemaining : 0}
          onClose={closeConfig}
          onTextChange={handleTextChange}
          onSaveToLibrary={activeBookId ? undefined : handleSaveToLibrary}
          onWpmChange={setWpm}
          onSkipWordsChange={setSkipWords}
          onReadingFontChange={setReadingFont}
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
