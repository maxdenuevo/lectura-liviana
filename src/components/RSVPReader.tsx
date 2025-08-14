'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Iconos SVG ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

const RestartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
);

const ThemeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

// --- Tipos ---
type Theme = 'night' | 'day' | 'sepia' | 'contrast';
type SpeedPreset = 'beginner' | 'comfort' | 'fast' | 'expert';

interface SessionStats {
  wordsRead: number;
  totalTime: number;
  averageWpm: number;
  pauseCount: number;
  comprehensionScore?: number;
}

interface TextMetrics {
  difficulty: 'easy' | 'medium' | 'hard';
  avgWordLength: number;
  sentenceCount: number;
  suggestedWpm: number;
}

// --- Configuración de temas ---
const themes: Record<Theme, any> = {
  night: {
    bg: 'bg-stone-900',
    cardBg: 'bg-stone-800',
    border: 'border-stone-700',
    text: 'text-stone-200',
    textMuted: 'text-stone-500',
    accent: 'text-orange-400',
    button: 'bg-orange-600 hover:bg-orange-700',
    secondary: 'bg-stone-700 hover:bg-stone-600'
  },
  day: {
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-200 hover:bg-gray-300'
  },
  sepia: {
    bg: 'bg-amber-50',
    cardBg: 'bg-yellow-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    textMuted: 'text-amber-600',
    accent: 'text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
    secondary: 'bg-amber-200 hover:bg-amber-300'
  },
  contrast: {
    bg: 'bg-black',
    cardBg: 'bg-gray-900',
    border: 'border-white',
    text: 'text-white',
    textMuted: 'text-gray-400',
    accent: 'text-yellow-400',
    button: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    secondary: 'bg-gray-800 hover:bg-gray-700'
  }
};

// --- Presets de velocidad ---
const speedPresets: Record<SpeedPreset, { wpm: number; label: string; description: string }> = {
  beginner: { wpm: 200, label: 'Principiante', description: 'Ideal para empezar' },
  comfort: { wpm: 300, label: 'Cómodo', description: 'Ritmo relajado' },
  fast: { wpm: 500, label: 'Rápido', description: 'Lectura ágil' },
  expert: { wpm: 800, label: 'Experto', description: 'Velocidad máxima' }
};

export default function RSVPReader() {
  // --- Estados principales ---
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theme, setTheme] = useState<Theme>('night');
  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  
  // --- Estados de UI ---
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [shortcutFeedback, setShortcutFeedback] = useState('');
  const [zenMode, setZenMode] = useState(false);
  
  // --- Estados de características ---
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [showBreathingPauses, setShowBreathingPauses] = useState(true);
  const [useSmartChunking, setUseSmartChunking] = useState(true);
  const [savedPosition, setSavedPosition] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [textMetrics, setTextMetrics] = useState<TextMetrics | null>(null);
  
  // --- Estados de carga ---
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  
  // --- Refs para tracking ---
  const sessionStartTime = useRef<number>(0);
  const wordsReadInSession = useRef<number>(0);
  const pauseCount = useRef<number>(0);
  const breathingCounter = useRef<number>(0);

  // --- Cargar configuración inicial ---
  useEffect(() => {
    const defaultText = "Pega tu texto o carga un archivo. La presentación visual en serie rápida (RSVP) muestra las palabras de forma secuencial para eliminar el movimiento ocular y aumentar tu velocidad de lectura. Esta herramienta está optimizada para sesiones largas de lectura con características avanzadas como pausas de respiración, modo adaptativo y análisis de dificultad del texto.";
    
    setText(localStorage.getItem('text') || defaultText);
    setWpm(Number(localStorage.getItem('wpm')) || 300);

    // --- CORRECCIÓN ---
    // Se valida que el tema guardado en localStorage sea una clave válida en el objeto `themes`.
    // Si no es válido, se establece un tema por defecto ('night') para evitar errores.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme in themes) {
      setTheme(savedTheme as Theme);
    } else {
      setTheme('night');
    }
    // --- FIN DE LA CORRECCIÓN ---

    setUseDyslexicFont(localStorage.getItem('dyslexic') === 'true');
    setAdaptiveMode(localStorage.getItem('adaptive') === 'true');
    setShowBreathingPauses(localStorage.getItem('breathing') !== 'false');
    
    // Recuperar posición guardada
    const saved = Number(localStorage.getItem('lastPosition')) || 0;
    const savedText = localStorage.getItem('lastText') || '';
    if (savedText === (localStorage.getItem('text') || defaultText) && saved > 0) {
      setSavedPosition(saved);
    }
  }, []);

  // --- Función de chunking inteligente ---
  const smartChunk = useCallback((text: string): string[] => {
    if (!useSmartChunking) {
      return text.trim().split(/\s+/).filter(Boolean);
    }

    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    
    sentences.forEach(sentence => {
      // Dividir por unidades de significado
      const phrases = sentence.split(/,\s*/);
      phrases.forEach(phrase => {
        // Agrupar artículos, preposiciones y adjetivos con sus sustantivos
        const words = phrase.split(/\s+/);
        let i = 0;
        while (i < words.length) {
          let chunk = words[i];
          
          // Palabras cortas se agrupan con la siguiente
          if (i < words.length - 1 && words[i].length <= 3) {
            chunk += ' ' + words[i + 1];
            i += 2;
            
            // Si la siguiente también es corta, agrégala
            if (i < words.length && words[i].length <= 4) {
              chunk += ' ' + words[i];
              i++;
            }
          } else {
            i++;
          }
          
          if (chunk) chunks.push(chunk);
        }
      });
    });
    
    return chunks;
  }, [useSmartChunking]);

  // --- Analizar métricas del texto ---
  const analyzeText = useCallback((text: string): TextMetrics => {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const avgWordLength = words.reduce((acc, word) => acc + word.length, 0) / words.length;
    
    // Calcular dificultad basada en longitud de palabras y oraciones
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    let suggestedWpm = 300;
    
    if (avgWordLength < 4 && sentences.length > 0) {
      difficulty = 'easy';
      suggestedWpm = 400;
    } else if (avgWordLength > 6) {
      difficulty = 'hard';
      suggestedWpm = 250;
    }
    
    // Índice Flesch-Kincaid simplificado
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    if (avgWordsPerSentence > 20) {
      difficulty = 'hard';
      suggestedWpm = Math.min(suggestedWpm, 250);
    }
    
    return {
      difficulty,
      avgWordLength,
      sentenceCount: sentences.length,
      suggestedWpm
    };
  }, []);

  // --- Procesar palabras ---
  const { words, paragraphIndices } = useMemo(() => {
    const chunks = smartChunk(text);
    const paragraphs: number[] = [];
    
    // Detectar saltos de párrafo
    let currentPos = 0;
    text.split('\n\n').forEach((para, idx) => {
      if (para.trim()) {
        paragraphs.push(currentPos);
        currentPos += para.split(/\s+/).filter(Boolean).length;
      }
    });
    
    return { words: chunks, paragraphIndices: paragraphs };
  }, [text, smartChunk]);

  // --- Actualizar métricas cuando cambie el texto ---
  useEffect(() => {
    if (text) {
      const metrics = analyzeText(text);
      setTextMetrics(metrics);
      
      // Sugerir velocidad si es la primera vez
      if (!localStorage.getItem('wpm')) {
        setWpm(metrics.suggestedWpm);
      }
    }
  }, [text, analyzeText]);

  // --- Calcular tiempo restante ---
  const calculateTimeRemaining = useCallback(() => {
    if (currentIndex >= words.length) return 0;
    
    let totalMs = 0;
    const baseDelay = 60000 / wpm;
    
    for (let i = currentIndex; i < words.length; i++) {
      let delay = baseDelay;
      const word = words[i];
      
      // Pausas inteligentes
      if (word.endsWith(',')) delay *= 1.3;
      else if (word.endsWith(':') || word.endsWith(';')) delay *= 1.5;
      else if (/[.!?]$/.test(word)) delay *= 2;
      
      // Pausas de respiración cada 50 palabras
      if (showBreathingPauses && (i - currentIndex) % 50 === 0 && i > currentIndex) {
        delay += 1500; // 1.5 segundos de pausa
      }
      
      totalMs += delay;
    }
    
    return Math.ceil(totalMs / 1000);
  }, [currentIndex, words, wpm, showBreathingPauses]);

  // --- Guardar preferencias ---
  useEffect(() => {
    localStorage.setItem('wpm', wpm.toString());
    localStorage.setItem('theme', theme);
    localStorage.setItem('dyslexic', useDyslexicFont.toString());
    localStorage.setItem('adaptive', adaptiveMode.toString());
    localStorage.setItem('breathing', showBreathingPauses.toString());
    localStorage.setItem('text', text);
    localStorage.setItem('lastText', text);
  }, [wpm, theme, useDyslexicFont, adaptiveMode, showBreathingPauses, text]);

  // --- Guardar posición al pausar ---
  useEffect(() => {
    if (!isPlaying && currentIndex > 0) {
      localStorage.setItem('lastPosition', currentIndex.toString());
      pauseCount.current++;
    }
  }, [isPlaying, currentIndex]);

  // --- Iniciar sesión ---
  useEffect(() => {
    if (isPlaying && sessionStartTime.current === 0) {
      sessionStartTime.current = Date.now();
      wordsReadInSession.current = 0;
      pauseCount.current = 0;
    }
  }, [isPlaying]);

  // --- Timer principal con pausas de respiración ---
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length) {
      // Fin de la sesión
      if (currentIndex >= words.length && sessionStartTime.current > 0) {
        const totalTime = (Date.now() - sessionStartTime.current) / 1000;
        const avgWpm = Math.round((wordsReadInSession.current / totalTime) * 60);
        
        setSessionStats({
          wordsRead: wordsReadInSession.current,
          totalTime: Math.round(totalTime),
          averageWpm: avgWpm,
          pauseCount: pauseCount.current,
          comprehensionScore: undefined // Podría implementarse con quiz
        });
        
        setShowStats(true);
        sessionStartTime.current = 0;
      }
      return;
    }

    const currentChunk = words[currentIndex];
    let delay = 60000 / wpm;
    
    // Modo adaptativo: ajustar velocidad según complejidad
    if (adaptiveMode && currentChunk) {
      const wordLength = currentChunk.split(' ')[0].length;
      if (wordLength > 8) delay *= 1.2;
      else if (wordLength < 4) delay *= 0.9;
    }
    
    // Pausas según puntuación
    if (currentChunk.endsWith(',')) delay *= 1.3;
    else if (currentChunk.endsWith(':') || currentChunk.endsWith(';')) delay *= 1.5;
    else if (/[.!?]$/.test(currentChunk)) delay *= 2;
    
    // Pausa de respiración cada 50 palabras
    breathingCounter.current++;
    let isBreathingPause = false;
    if (showBreathingPauses && breathingCounter.current >= 50) {
      isBreathingPause = true;
      breathingCounter.current = 0;
      delay += 1500;
      
      setTimeout(() => {
        showFeedback('Respira...');
      }, delay - 1500);
    }

    const timer = setTimeout(() => {
      setCurrentIndex(i => i + 1);
      wordsReadInSession.current++;
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, words, wpm, adaptiveMode, showBreathingPauses]);

  // --- Handlers ---
  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setSavedPosition(0);
    breathingCounter.current = 0;
    localStorage.removeItem('lastPosition');
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!words.length) return;
    if (currentIndex >= words.length) {
      setCurrentIndex(0);
      breathingCounter.current = 0;
    }
    setIsPlaying(p => !p);
  }, [words.length, currentIndex]);

  const handleWpmChange = (val: number) => {
    setWpm(Math.max(50, Math.min(1200, val)));
  };

  const handleContinueFromSaved = () => {
    setCurrentIndex(savedPosition);
    setSavedPosition(0);
    setIsPlaying(true);
  };

  const jumpToParagraph = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const next = paragraphIndices.find(p => p > currentIndex);
      if (next !== undefined) {
        setCurrentIndex(next);
        showFeedback('Siguiente párrafo');
      }
    } else {
      const current = paragraphIndices.findIndex(p => p > currentIndex);
      const prev = paragraphIndices[Math.max(0, current - 2)];
      if (prev !== undefined) {
        setCurrentIndex(prev);
        showFeedback('Párrafo anterior');
      }
    }
  };

  const showFeedback = (message: string) => {
    setShortcutFeedback(message);
    setTimeout(() => setShortcutFeedback(''), 2000);
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string || '';
      setText(content);
      setArticleTitle(file.name.replace(/\.[^/.]+$/, ""));
      handleRestart();
      setShowSettings(false);
      
      // Analizar y mostrar métricas
      const metrics = analyzeText(content);
      setTextMetrics(metrics);
      showFeedback(`Cargado: ${file.name} (Dificultad: ${metrics.difficulty})`);
    };
    reader.readAsText(file);
  };

  const handleFetchUrl = async () => {
    if (!url.startsWith('http')) {
      showFeedback('URL inválida');
      return;
    }
    
    setIsLoadingUrl(true);
    
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (data.error) {
        showFeedback("Error: " + data.error);
      } else {
        setText(data.content || "Sin contenido");
        setArticleTitle(data.title || "Artículo");
        handleRestart();
        setShowSettings(false);
        
        // Analizar texto
        const metrics = analyzeText(data.content);
        setTextMetrics(metrics);
        showFeedback(`${data.title} (${metrics.difficulty})`);
      }
    } catch {
      showFeedback("Error al cargar");
    } finally {
      setIsLoadingUrl(false);
      setUrl('');
    }
  };

  // --- Atajos de teclado ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      
      const handlers: Record<string, () => void> = {
        'Space': () => {
          e.preventDefault();
          handlePlayPause();
          showFeedback(isPlaying ? 'Pausado' : 'Reproduciendo');
        },
        'KeyR': () => {
          handleRestart();
          showFeedback('Reiniciado');
        },
        'KeyZ': () => {
          setZenMode(!zenMode);
          showFeedback(zenMode ? 'Modo normal' : 'Modo Zen');
        },
        'KeyT': () => {
          const themeOrder: Theme[] = ['night', 'day', 'sepia', 'contrast'];
          const currentIdx = themeOrder.indexOf(theme);
          const nextTheme = themeOrder[(currentIdx + 1) % themeOrder.length];
          setTheme(nextTheme);
          showFeedback(`Tema: ${nextTheme}`);
        },
        'KeyS': () => {
          setShowStats(!showStats);
        },
        'Escape': () => {
          if (zenMode) setZenMode(false);
          else if (showStats) setShowStats(false);
          else setShowSettings(false);
        }
      };
      
      if (handlers[e.code]) {
        handlers[e.code]();
      } else if (e.code === 'ArrowRight') {
        if (e.shiftKey) {
          jumpToParagraph('next');
        } else {
          const newWpm = wpm + (e.ctrlKey ? 50 : 10);
          handleWpmChange(newWpm);
          showFeedback(`${newWpm} PPM`);
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.shiftKey) {
          jumpToParagraph('prev');
        } else {
          const newWpm = wpm - (e.ctrlKey ? 50 : 10);
          handleWpmChange(newWpm);
          showFeedback(`${newWpm} PPM`);
        }
      } else if (e.code === 'ArrowUp') {
        setCurrentIndex(i => Math.max(0, i - 1));
      } else if (e.code === 'ArrowDown') {
        setCurrentIndex(i => Math.min(words.length - 1, i + 1));
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePlayPause, handleRestart, wpm, words.length, isPlaying, zenMode, theme, showStats, paragraphIndices, currentIndex]);

  // --- Calcular punto focal óptimo (ORP) ---
  const getFocusedWord = (chunk: string) => {
    if (!chunk) return { pre: '', focal: '', post: '' };
    const word = chunk.split(' ')[0];
    
    // ORP en ~35% de la palabra
    const len = word.length;
    let pivotIndex = Math.floor(len * 0.35);
    if (len <= 2) pivotIndex = 0;
    else if (len <= 4) pivotIndex = 1;
    
    return {
      pre: word.slice(0, pivotIndex),
      focal: word.slice(pivotIndex, pivotIndex + 1),
      post: word.slice(pivotIndex + 1),
      rest: chunk.split(' ').slice(1).join(' ')
    };
  };

  const currentParts = getFocusedWord(words[currentIndex] || '');
  const currentTheme = themes[theme];
  const fontClass = useDyslexicFont ? 'font-opendyslexic' : 'font-sans';
  
  const progressPercentage = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
  const timeRemaining = calculateTimeRemaining();

  // --- Modo Zen ---
  if (zenMode) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-black ${fontClass}`}>
        <div className="relative">
          {/* Guías visuales sutiles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-orange-400/10 to-transparent" />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.15 }}
              className="text-6xl md:text-8xl font-light tracking-wide text-center px-8"
            >
              <span className="text-gray-600">{currentParts.pre}</span>
              <span className="text-orange-400 font-medium focal-letter">{currentParts.focal}</span>
              <span className="text-gray-400">{currentParts.post}</span>
              {currentParts.rest && (
                <span className="text-gray-500 ml-3">{currentParts.rest}</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Indicador minimalista de progreso */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-900">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} ${fontClass}`}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Feedback flotante */}
        <AnimatePresence>
          {shortcutFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-full text-white font-medium z-50 shadow-lg"
            >
              {shortcutFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header con información contextual */}
        <div className="w-full max-w-4xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {articleTitle && (
                <span className={`text-sm ${currentTheme.textMuted}`}>{articleTitle}</span>
              )}
              {textMetrics && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  textMetrics.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  textMetrics.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {textMetrics.difficulty === 'easy' ? 'Fácil' :
                   textMetrics.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg ${currentTheme.secondary} transition-all`}
                title="Estadísticas (S)"
              >
                <StatsIcon />
              </button>
              <button
                onClick={() => {
                  const themeOrder: Theme[] = ['night', 'day', 'sepia', 'contrast'];
                  const idx = themeOrder.indexOf(theme);
                  setTheme(themeOrder[(idx + 1) % 4]);
                }}
                className={`p-2 rounded-lg ${currentTheme.secondary} transition-all`}
                title="Cambiar tema (T)"
              >
                <ThemeIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Botón para continuar desde posición guardada */}
        {savedPosition > 0 && !isPlaying && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleContinueFromSaved}
            className={`mb-4 text-sm ${currentTheme.accent} hover:underline`}
          >
            Continuar desde palabra {savedPosition} ({Math.round((savedPosition / words.length) * 100)}%)
          </motion.button>
        )}
        
        {/* Display principal con guías visuales */}
        <div className="relative w-full max-w-4xl mb-6">
          {/* Guías de enfoque */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="focal-guide w-px h-3/4 bg-gradient-to-b from-transparent via-current to-transparent opacity-5" />
          </div>
          
          {/* Efecto de viñeta sutil */}
          <div className="absolute inset-0 bg-radial-fade pointer-events-none rounded-lg" />
          
          <div className={`relative h-48 ${currentTheme.cardBg} rounded-lg flex items-center justify-center shadow-2xl ${currentTheme.border} border overflow-hidden`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -10, filter: 'blur(2px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 10, filter: 'blur(2px)' }}
                transition={{ 
                  duration: wpm > 600 ? 0.08 : 0.15,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="text-5xl md:text-7xl font-medium tracking-wide text-center px-8"
              >
                <span className="opacity-80">{currentParts.pre}</span>
                <span className={`${currentTheme.accent} font-bold focal-letter relative`}>
                  {currentParts.focal}
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-50" />
                </span>
                <span className="opacity-80">{currentParts.post}</span>
                {currentParts.rest && (
                  <span className="opacity-60 ml-3">{currentParts.rest}</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Barra de progreso mejorada */}
        <div className="w-full max-w-md mb-6">
          <div className={`${currentTheme.cardBg} rounded-full h-3 relative overflow-hidden`}>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Marcadores de párrafos sutiles */}
            {paragraphIndices.map((paraIndex, i) => {
              const position = (paraIndex / words.length) * 100;
              return position > 0 && position < 100 && (
                <div 
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-white/20"
                  style={{ left: `${position}%` }}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs mt-2">
            <span className={currentTheme.textMuted}>
              {Math.round(progressPercentage)}%
            </span>
            <span className={currentTheme.textMuted}>
              {currentIndex + 1} / {words.length}
            </span>
            <span className={currentTheme.textMuted}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Controles principales */}
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={handlePlayPause} 
            className={`p-5 ${currentTheme.button} rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-white`}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button 
            onClick={handleRestart} 
            className={`p-4 ${currentTheme.secondary} rounded-full transition-all duration-200 shadow-lg`}
          >
            <RestartIcon />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-4 ${currentTheme.secondary} rounded-full transition-all duration-200 shadow-lg`}
          >
            <SettingsIcon />
          </button>
        </div>

        {/* Control de velocidad con presets */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-medium ${currentTheme.accent}`}>
              {wpm} PPM
            </span>
            
            {/* Presets de velocidad */}
            <div className="flex gap-1">
              {Object.entries(speedPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => {
                    handleWpmChange(preset.wpm);
                    showFeedback(preset.label);
                  }}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    Math.abs(wpm - preset.wpm) < 50
                      ? currentTheme.button + ' text-white'
                      : currentTheme.secondary
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          <input 
            type="range" 
            min="50" 
            max="1200" 
            step="10" 
            value={wpm} 
            onChange={(e) => handleWpmChange(Number(e.target.value))} 
            className="w-full slider-custom"
          />
        </div>

        {/* Panel de estadísticas */}
        <AnimatePresence>
          {showStats && sessionStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-40`}
              onClick={() => setShowStats(false)}
            >
              <div 
                className={`${currentTheme.cardBg} rounded-xl p-8 max-w-md w-full shadow-2xl ${currentTheme.border} border`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6">Sesión Completada</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className={currentTheme.textMuted}>Palabras leídas:</span>
                    <span className="font-medium">{sessionStats.wordsRead}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={currentTheme.textMuted}>Tiempo total:</span>
                    <span className="font-medium">
                      {Math.floor(sessionStats.totalTime / 60)}:{(sessionStats.totalTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={currentTheme.textMuted}>Velocidad promedio:</span>
                    <span className="font-medium">{sessionStats.averageWpm} PPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={currentTheme.textMuted}>Pausas:</span>
                    <span className="font-medium">{sessionStats.pauseCount}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowStats(false)}
                  className={`w-full mt-6 py-3 ${currentTheme.button} rounded-lg text-white font-medium`}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de configuración */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`w-full max-w-4xl ${currentTheme.cardBg} rounded-lg p-6 mb-4 ${currentTheme.border} border`}
            >
              {/* Toggles de características */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="flex items-center justify-between">
                  <span>Modo Adaptativo</span>
                  <input 
                    type="checkbox" 
                    checked={adaptiveMode}
                    onChange={(e) => setAdaptiveMode(e.target.checked)}
                    className="toggle-switch"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span>Pausas de Respiración</span>
                  <input 
                    type="checkbox" 
                    checked={showBreathingPauses}
                    onChange={(e) => setShowBreathingPauses(e.target.checked)}
                    className="toggle-switch"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span>Chunking Inteligente</span>
                  <input 
                    type="checkbox" 
                    checked={useSmartChunking}
                    onChange={(e) => setUseSmartChunking(e.target.checked)}
                    className="toggle-switch"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span>Fuente OpenDyslexic</span>
                  <input 
                    type="checkbox" 
                    checked={useDyslexicFont}
                    onChange={(e) => setUseDyslexicFont(e.target.checked)}
                    className="toggle-switch"
                  />
                </label>
              </div>

              {/* URL input */}
              <div className="flex items-center space-x-2 mb-4">
                <input 
                  type="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  placeholder="URL de artículo..." 
                  className={`flex-grow p-3 ${currentTheme.cardBg} ${currentTheme.border} border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
                <button 
                  onClick={handleFetchUrl} 
                  disabled={isLoadingUrl}
                  className={`py-3 px-6 ${currentTheme.button} disabled:opacity-50 rounded-lg transition-all duration-200 text-white font-medium`}
                >
                  {isLoadingUrl ? 'Cargando...' : 'Leer'}
                </button>
              </div>

              {/* Archivo */}
              <input 
                type="file" 
                accept=".txt,.md"
                onChange={handleFileLoad}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className={`${currentTheme.secondary} py-3 px-6 rounded-lg mb-4 cursor-pointer inline-block transition-all duration-200`}
              >
                📁 Cargar Archivo
              </label>

              {/* Textarea */}
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full h-32 p-4 ${currentTheme.cardBg} ${currentTheme.border} border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="Escribe o pega tu texto aquí..."
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Atajos de teclado */}
        {!showSettings && (
          <div className={`text-xs ${currentTheme.textMuted} text-center space-y-1`}>
            <div>
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded`}>Espacio</kbd> Play/Pausa • 
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded mx-1`}>R</kbd> Reiniciar • 
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded`}>Z</kbd> Modo Zen • 
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded mx-1`}>T</kbd> Tema
            </div>
            <div>
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded`}>←→</kbd> Velocidad • 
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded`}>Shift+←→</kbd> Párrafos • 
              <kbd className={`px-2 py-1 ${currentTheme.cardBg} rounded mx-1`}>S</kbd> Estadísticas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
