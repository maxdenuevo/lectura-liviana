'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tipos ---
interface SessionStats {
  wordsRead: number;
  totalTime: number;
  averageWpm: number;
}

// --- Componente Principal ---
export default function RSVPReader() {
  // --- Estados principales ---
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  
  // --- Estados de UI ---
  const [showControls, setShowControls] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Estados de sesión ---
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const sessionStartTime = useRef<number>(0);
  const wordsReadInSession = useRef<number>(0);
  
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // --- Texto por defecto ---
  const DEFAULT_TEXT = "Bienvenido a tu espacio de lectura rápida. Un lugar cálido y minimalista donde las palabras fluyen con naturalidad. Presiona espacio o toca la pantalla para comenzar.";

  // --- Cargar configuración inicial ---
  useEffect(() => {
    // Se envuelve en un try-catch por si localStorage no está disponible (ej. en SSR)
    try {
      const savedText = localStorage.getItem('savedText');
      setText(savedText || DEFAULT_TEXT);
      setWpm(Number(localStorage.getItem('savedWpm')) || 300);
      setUseDyslexicFont(localStorage.getItem('dyslexic') === 'true');
    } catch (error) {
      console.error("No se pudo acceder a localStorage:", error);
      setText(DEFAULT_TEXT);
    }
  }, []);

  // --- Procesar palabras ---
  const words = useMemo(() => {
    return text.trim().split(/\s+/).filter(Boolean);
  }, [text]);

  // --- Auto-ocultar controles ---
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  }, [isPlaying]);

  // --- Lógica para mostrar/ocultar controles ---
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (isPlaying) {
        controlsTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, 5000);
      }
    };
    
    const handleTouch = () => {
      showControlsTemporarily();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouch);
    
    // Muestra los controles si el lector está pausado
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, showControlsTemporarily]);

  // --- Timer principal de lectura ---
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length) {
      if (currentIndex >= words.length && sessionStartTime.current > 0) {
        const totalTime = (Date.now() - sessionStartTime.current) / 1000;
        const avgWpm = totalTime > 0 ? Math.round((wordsReadInSession.current / totalTime) * 60) : 0;
        
        setSessionStats({
          wordsRead: wordsReadInSession.current,
          totalTime: Math.round(totalTime),
          averageWpm: avgWpm
        });
        
        sessionStartTime.current = 0;
        showNotification('Lectura completada');
        setIsPlaying(false);
        setCurrentIndex(0);
      }
      return;
    }

    if (sessionStartTime.current === 0) {
      sessionStartTime.current = Date.now();
      wordsReadInSession.current = 0;
      setSessionStats(null);
    }

    const currentWord = words[currentIndex];
    let delay = 60000 / wpm;
    
    if (currentWord?.endsWith(',')) delay *= 1.3;
    else if (currentWord?.endsWith(':') || currentWord?.endsWith(';')) delay *= 1.5;
    else if (/[.!?]$/.test(currentWord || '')) delay *= 2;

    const timer = setTimeout(() => {
      setCurrentIndex(i => i + 1);
      wordsReadInSession.current++;
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, words, wpm]);

  // --- Guardar preferencias ---
  useEffect(() => {
    try {
      localStorage.setItem('savedWpm', wpm.toString());
      localStorage.setItem('dyslexic', useDyslexicFont.toString());
      if (text && text !== DEFAULT_TEXT) {
        localStorage.setItem('savedText', text);
      }
    } catch (error) {
      console.error("No se pudo acceder a localStorage:", error);
    }
  }, [wpm, text, useDyslexicFont, DEFAULT_TEXT]);

  // --- Calcular punto focal (ORP) ---
  const getWordParts = (word: string) => {
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

  // --- Mostrar notificación ---
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  };

  // --- Handlers ---
  const togglePlay = useCallback(() => {
    if (!words.length) return;
    if (currentIndex >= words.length) {
      setCurrentIndex(0);
    }
    setIsPlaying(prev => !prev);
    setShowControls(true);
  }, [currentIndex, words.length]);

  const restart = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    sessionStartTime.current = 0;
    wordsReadInSession.current = 0;
    setSessionStats(null);
    showNotification('Reiniciado');
    setShowControls(true);
  }, []);

  const adjustSpeed = useCallback((delta: number) => {
    setWpm(prevWpm => {
      const newWpm = Math.max(100, Math.min(1000, prevWpm + delta));
      showNotification(`${newWpm} ppm`);
      return newWpm;
    });
    setShowControls(true);
  }, []);

  // --- Handlers para gestos en móvil ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      togglePlay();
      return;
    }
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      adjustSpeed(deltaX > 0 ? 25 : -25);
    } else if (Math.abs(deltaY) > 50) {
      setShowConfig(prev => !prev);
    }
  };

  // --- Atajos de teclado ---
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      e.preventDefault();
      switch(e.key) {
        case ' ': togglePlay(); break;
        case 'r': case 'R': restart(); break;
        case 'ArrowRight': adjustSpeed(25); break;
        case 'ArrowLeft': adjustSpeed(-25); break;
        case 'Escape': setShowConfig(false); break;
        case 'c': case 'C': setShowConfig(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, restart, adjustSpeed]);

  // --- Cargar desde URL (Requiere una API en /api/fetch-url) ---
  const loadFromUrl = async (url: string) => {
    if (!url.startsWith('http')) {
      showNotification('URL inválida');
      return;
    }
    setIsLoading(true);
    try {
      // NOTA: Esta llamada a fetch requiere que tengas un endpoint de API
      // en tu proyecto que reciba una URL y devuelva su contenido.
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!response.ok) throw new Error('Respuesta de red no fue OK');
      const data = await response.json();
      if (data.content) {
        setText(data.content);
        restart();
        setShowConfig(false);
        showNotification('Artículo cargado');
      } else {
        showNotification(data.error || 'Error al cargar contenido');
      }
    } catch (err) {
      showNotification('Error de conexión o API');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Cargar archivo local ---
  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        restart();
        setShowConfig(false);
        showNotification(`${file.name} cargado`);
      }
    };
    reader.readAsText(file);
  };
  
  // --- Cálculos para la UI ---
  const currentWord = words[currentIndex] || '';
  const wordParts = getWordParts(currentWord);
  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
  // NOTA: Reemplazamos 'font-dyslexic' por una fuente estándar como 'font-serif'
  // para asegurar que funcione sin necesidad de configurar fuentes personalizadas.
  const fontClass = useDyslexicFont ? 'font-serif' : 'font-sans';
  
  const timeRemaining = useMemo(() => {
    if (!words.length || currentIndex >= words.length) return 0;
    const wordsLeft = words.length - currentIndex;
    return Math.ceil((wordsLeft / wpm) * 60);
  }, [words.length, currentIndex, wpm]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      // NOTA: Reemplazamos 'bg-candlelight' por un color estándar de Tailwind.
      className={`min-h-screen bg-gray-900 text-gray-200 ${fontClass} transition-all duration-300`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Estilos para el slider, añadidos aquí para que el componente sea autocontenido */}
      <style>{`
        .slider-warm {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(252, 211, 77, 0.2);
          border-radius: 5px;
          outline: none;
        }
        .slider-warm::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #fde68a;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-warm::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #fde68a;
          cursor: pointer;
          border-radius: 50%;
        }
      `}</style>

      {/* Notificación flotante */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-stone-900/90 backdrop-blur-md rounded-full text-amber-400 text-sm font-light z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante de menú */}
      <button
        onClick={() => setShowConfig(true)}
        className="fixed top-6 right-6 w-12 h-12 bg-stone-900/50 backdrop-blur-md rounded-full flex items-center justify-center text-amber-100/40 hover:text-amber-100 hover:bg-stone-900/70 transition-all z-30 text-2xl"
        aria-label="Menú"
      >
        ≡
      </button>

      {/* Indicador de estado */}
      {!isPlaying && words.length > 0 && (
        <div className="fixed top-6 left-6 text-amber-100/40 text-sm font-light">
          {Math.round(progress)}% leído
        </div>
      )}

      {/* Área de lectura principal */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative w-full max-w-4xl">
          <div className="relative h-32 md:h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
                className="text-center select-none"
              >
                <span className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide">
                  <span className="text-amber-200/60">{wordParts.pre}</span>
                  <span className="text-amber-100 font-normal">{wordParts.focal}</span>
                  <span className="text-amber-200/60">{wordParts.post}</span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicador de progreso */}
          <div className="absolute -bottom-20 left-0 right-0 h-0.5 bg-amber-900/20">
            <motion.div
              className="h-full bg-amber-400/40"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      {/* Controles flotantes */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        onMouseEnter={() => setShowControls(true)}
      >
        <div className="flex items-center gap-6 px-6 py-4 bg-stone-900/80 backdrop-blur-md rounded-full border border-amber-900/20">
          <button onClick={() => adjustSpeed(-25)} className="text-amber-100/60 hover:text-amber-100 transition-colors text-xl">−</button>
          <span className="text-amber-100/80 text-sm font-light min-w-[70px] text-center">{wpm} ppm</span>
          <button onClick={() => adjustSpeed(25)} className="text-amber-100/60 hover:text-amber-100 transition-colors text-xl">+</button>
          <div className="w-px h-6 bg-amber-900/30"></div>
          <button onClick={togglePlay} className="text-amber-100/80 hover:text-amber-100 transition-colors text-2xl" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>{isPlaying ? '॥' : '▶'}</button>
          <div className="w-px h-6 bg-amber-900/30"></div>
          <button onClick={restart} className="text-amber-100/60 hover:text-amber-100 transition-colors text-xl" aria-label="Reiniciar">↺</button>
        </div>
      </motion.div>

      {/* Panel de configuración modal */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfig(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-900/90 backdrop-blur rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-light text-amber-100/80">Configuración</h2>
                  <button onClick={() => setShowConfig(false)} className="text-amber-100/40 hover:text-amber-100 text-2xl">×</button>
                </div>
                <div>
                  <label className="text-amber-100/60 text-sm font-light mb-2 block">Tu texto</label>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 p-4 bg-black/30 text-amber-100/80 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/30 placeholder-amber-100/20" placeholder="Pega tu texto aquí..."/>
                </div>
                <div>
                  <label htmlFor="file-input" className="block w-full p-3 bg-black/30 text-amber-100/80 rounded-lg text-center cursor-pointer hover:bg-black/40 transition-colors">Seleccionar archivo (.txt, .md)</label>
                  <input type="file" accept=".txt,.md" onChange={handleFileLoad} className="hidden" id="file-input"/>
                </div>
                <div>
                  <label className="text-amber-100/60 text-sm font-light mb-2 block">Cargar desde URL</label>
                  <div className="flex gap-2">
                    <input type="url" placeholder="https://..." className="flex-1 p-3 bg-black/30 text-amber-100/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400/30 placeholder-amber-100/20" id="url-input"/>
                    <button onClick={() => { const input = document.getElementById('url-input') as HTMLInputElement; if (input?.value) loadFromUrl(input.value); }} disabled={isLoading} className="px-6 py-3 bg-amber-400/20 text-amber-100 rounded-lg hover:bg-amber-400/30 transition-colors disabled:opacity-50">{isLoading ? '...' : 'Cargar'}</button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-amber-100/60 text-sm font-light">Velocidad de lectura</label>
                    <span className="text-amber-400 text-sm font-medium">{wpm} ppm</span>
                  </div>
                  <input type="range" min="100" max="1000" step="25" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="w-full slider-warm"/>
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-amber-100/60 text-sm font-light">Fuente alternativa (Serif)</span>
                  <div className="relative"><input type="checkbox" checked={useDyslexicFont} onChange={(e) => setUseDyslexicFont(e.target.checked)} className="sr-only"/><div className={`w-12 h-6 rounded-full transition-colors ${useDyslexicFont ? 'bg-amber-400/30' : 'bg-black/30'}`}><div className={`w-5 h-5 bg-amber-100 rounded-full transition-transform ${useDyslexicFont ? 'translate-x-6' : 'translate-x-1'} transform m-0.5`}/></div></div>
                </label>
                {words.length > 0 && (
                  <div className="p-4 bg-black/20 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-amber-100/40">Total</span><span className="text-amber-100/60">{words.length} palabras</span></div>
                    <div className="flex justify-between text-sm"><span className="text-amber-100/40">Tiempo estimado</span><span className="text-amber-100/60">{formatTime(Math.ceil(words.length / wpm * 60))}</span></div>
                    {currentIndex > 0 && (<div className="flex justify-between text-sm"><span className="text-amber-100/40">Tiempo restante</span><span className="text-amber-100/60">{formatTime(timeRemaining)}</span></div>)}
                    {sessionStats && (<><div className="border-t border-amber-900/20 my-2"></div><div className="flex justify-between text-sm"><span className="text-amber-100/40">Última sesión</span><span className="text-amber-100/60">{sessionStats.averageWpm} ppm promedio</span></div></>)}
                  </div>
                )}
                <div className="text-amber-100/30 text-xs space-y-1 pt-4 border-t border-amber-900/20">
                  <p><b>Espacio:</b> play/pausa • <b>R:</b> reiniciar • <b>←→:</b> velocidad • <b>C:</b> config</p>
                  <p className="md:hidden"><b>Tap:</b> play/pausa • <b>Swipe H:</b> velocidad • <b>Swipe V:</b> config</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
