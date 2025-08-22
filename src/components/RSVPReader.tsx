'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionStats {
  wordsRead: number;
  totalTime: number;
  averageWpm: number;
}

const CONTROLS_HIDE_DELAY = 3000;

export default function RSVPReader() {
  // Estados principales
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  
  // Estados de UI
  const [showControls, setShowControls] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para la carga de URL
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Estados de sesión
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const sessionStartTime = useRef<number>(0);
  const wordsReadInSession = useRef<number>(0);
  
  // Refs
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseMoveTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHoveringControls = useRef<boolean>(false);

  const DEFAULT_TEXT = "Bienvenido a tu espacio de lectura rápida. Un lugar cálido y minimalista donde las palabras fluyen con naturalidad. Presiona espacio o toca la pantalla para comenzar.";

  // Cargar configuración inicial
  useEffect(() => {
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

  // Procesar palabras
  const words = useMemo(() => {
    return text.trim().split(/\s+/).filter(Boolean);
  }, [text]);

  // Auto-hide 
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

  // Event listeners
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

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      
      e.preventDefault();
      
      switch(e.key) {
        case ' ': 
          togglePlay(); 
          break;
        case 'r': 
        case 'R': 
          restart(); 
          break;
        case 'ArrowRight': 
          adjustSpeed(25); 
          break;
        case 'ArrowLeft': 
          adjustSpeed(-25); 
          break;
        case 'Escape': 
          setShowConfig(false); 
          break;
        case 'c': 
        case 'C': 
          setShowConfig(prev => !prev); 
          break;
      }
    };
    
    if (isPlaying) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      setShowControls(true);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    }
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }
    };
  }, [isPlaying, showControlsTemporarily]);

  // Timer principal de lectura
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

  // Guardar preferencias
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

  // Calcular punto focal (ORP)
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

  // Mostrar notificación
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  };

  // Handlers
  const togglePlay = useCallback(() => {
    if (!words.length) return;
    if (currentIndex >= words.length) {
      setCurrentIndex(0);
    }
    setIsPlaying(prev => !prev);
    showControlsTemporarily();
  }, [currentIndex, words.length, showControlsTemporarily]);

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
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Handlers para gestos móvil
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

  // Cargar archivo local
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
  
  // Función para cargar desde URL
  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
      setIsLoadingUrl(true);
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() })
      });
          
      const data = await response.json();
          
      if (data.success) {
        setText(data.content);
        restart();
        setShowConfig(false);
        showNotification(`${data.title} cargado`);
        setUrlInput('');
      } else {
        showNotification(data.error || 'Error al cargar URL');
      }
    } catch (error) {
      showNotification('Error de conexión');
    } finally {
      setIsLoadingUrl(false);
    }
  };
  
  // Cálculos para la UI
  const currentWord = words[currentIndex] || '';
  const wordParts = getWordParts(currentWord);
  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
  
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
          font-family: 'OpenDyslexic', serif !important;
          letter-spacing: 0.05em;
        }
        
        .slider-warm {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(251, 191, 36, 0.2);
          border-radius: 5px;
          outline: none;
        }
        
        .slider-warm::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #fbbf24;
          cursor: pointer;
          border-radius: 50%;
        }
        
        .slider-warm::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #fbbf24;
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
          fontFamily: useDyslexicFont ? 'OpenDyslexic, serif' : 'Inter, sans-serif',
          backgroundColor: '#1c1917',
          color: '#e7e5e4',
        }}
      >
        {/* Notificación flotante */}
        <AnimatePresence mode="wait">
          {notification && (
            <motion.div
              key={`notification-${notification}`}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '300',
                zIndex: 50,
                pointerEvents: 'none',
                backgroundColor: 'rgba(28, 25, 23, 0.9)',
                backdropFilter: 'blur(12px)',
                color: '#fbbf24',
              }}
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón flotante de menú */}
        <button
          onClick={() => setShowConfig(true)}
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            zIndex: 50,
            backgroundColor: 'rgba(28, 25, 23, 0.7)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(231, 229, 228, 0.4)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e7e5e4';
            e.currentTarget.style.backgroundColor = 'rgba(28, 25, 23, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(231, 229, 228, 0.4)';
            e.currentTarget.style.backgroundColor = 'rgba(28, 25, 23, 0.7)';
          }}
          aria-label="Menú"
        >
          ≡
        </button>

        {/* Indicador de estado */}
        {!isPlaying && words.length > 0 && (
          <div 
            style={{
              position: 'fixed',
              top: '1.5rem',
              left: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: '300',
              zIndex: 40,
              color: 'rgba(231, 229, 228, 0.4)',
            }}
          >
            {Math.round(progress)}% leído
          </div>
        )}

        {/* Área de lectura principal */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '64rem',
            padding: '0 1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Contenedor de la palabra */}
            <div 
              style={{
                position: 'relative',
                height: '8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    textAlign: 'center',
                    userSelect: 'none',
                  }}
                >
                  <span 
                    style={{
                      fontSize: 'clamp(3rem, 8vw, 6rem)',
                      fontWeight: '300',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span style={{ color: 'rgba(252, 211, 77, 0.6)' }}>{wordParts.pre}</span>
                    <span style={{ color: '#fcd34d', fontWeight: '400' }}>{wordParts.focal}</span>
                    <span style={{ color: 'rgba(252, 211, 77, 0.6)' }}>{wordParts.post}</span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Indicador de progreso */}
            <div 
              style={{
                width: '100%',
                maxWidth: '28rem',
                marginTop: '2rem',
                height: '2px',
                backgroundColor: 'rgba(180, 83, 9, 0.2)',
                borderRadius: '1px',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: 'rgba(251, 191, 36, 0.6)',
                  borderRadius: '1px',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        {/* Controles flotantes */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 40,
              }}
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
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(180, 83, 9, 0.2)',
                  backgroundColor: 'rgba(28, 25, 23, 0.8)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
                }}
              >
                <button 
                  onClick={() => adjustSpeed(-25)} 
                  style={{
                    fontSize: '1.25rem',
                    color: 'rgba(231, 229, 228, 0.6)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
                >
                  −
                </button>
                
                <span 
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '300',
                    minWidth: '70px',
                    textAlign: 'center',
                    color: 'rgba(231, 229, 228, 0.8)',
                  }}
                >
                  {wpm} ppm
                </span>
                
                <button 
                  onClick={() => adjustSpeed(25)} 
                  style={{
                    fontSize: '1.25rem',
                    color: 'rgba(231, 229, 228, 0.6)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
                >
                  +
                </button>
                
                <div 
                  style={{
                    width: '1px',
                    height: '1.5rem',
                    backgroundColor: 'rgba(180, 83, 9, 0.3)',
                  }}
                />
                
                <button 
                  onClick={togglePlay} 
                  style={{
                    fontSize: '1.5rem',
                    color: 'rgba(231, 229, 228, 0.8)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.8)'}
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? '॥' : '▶'}
                </button>
                
                <div 
                  style={{
                    width: '1px',
                    height: '1.5rem',
                    backgroundColor: 'rgba(180, 83, 9, 0.3)',
                  }}
                />
                
                <button 
                  onClick={restart} 
                  style={{
                    fontSize: '1.25rem',
                    color: 'rgba(231, 229, 228, 0.6)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
                  aria-label="Reiniciar"
                >
                  ↺
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de configuración modal */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 50,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowConfig(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  borderRadius: '1rem',
                  padding: '2rem',
                  maxWidth: '32rem',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(28, 25, 23, 0.95)',
                  backdropFilter: 'blur(12px)',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '300',
                        color: 'rgba(252, 211, 77, 0.8)',
                        margin: 0,
                      }}
                    >
                      Configuración
                    </h2>
                    <button 
                      onClick={() => setShowConfig(false)} 
                      style={{
                        fontSize: '1.5rem',
                        color: 'rgba(231, 229, 228, 0.4)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.4)'}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div>
                    <label 
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '300',
                        marginBottom: '0.5rem',
                        display: 'block',
                        color: 'rgba(252, 211, 77, 0.6)',
                      }}
                    >
                      Tu texto
                    </label>
                    <textarea 
                      value={text} 
                      onChange={(e) => setText(e.target.value)} 
                      style={{
                        width: '100%',
                        height: '8rem',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        resize: 'none',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: 'rgba(252, 211, 77, 0.8)',
                        fontSize: '0.875rem',
                      }}
                      placeholder="Pega tu texto aquí..."
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="file-input" 
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: 'rgba(252, 211, 77, 0.8)',
                        border: 'none',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
                    >
                      Seleccionar archivo (.txt, .md)
                    </label>
                    <input 
                      type="file" 
                      accept=".txt,.md" 
                      onChange={handleFileLoad} 
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                  </div>

                  {/* SECCIÓN DE URL */}
                  <div>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: '300',
                      marginBottom: '0.5rem',
                      display: 'block',
                      color: 'rgba(252, 211, 77, 0.6)',
                    }}>
                      Cargar desde URL
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://ejemplo.com/articulo"
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          color: 'rgba(252, 211, 77, 0.8)',
                          outline: 'none',
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleUrlLoad()}
                      />
                      <button 
                        onClick={handleUrlLoad}
                        disabled={isLoadingUrl || !urlInput.trim()}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          backgroundColor: isLoadingUrl ? 'rgba(0, 0, 0, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                          color: isLoadingUrl ? 'rgba(231, 229, 228, 0.4)' : '#fbbf24',
                          border: 'none',
                          cursor: isLoadingUrl ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isLoadingUrl ? '⟳' : '↓'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label 
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '300',
                          color: 'rgba(252, 211, 77, 0.6)',
                        }}
                      >
                        Velocidad de lectura
                      </label>
                      <span 
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#fbbf24',
                        }}
                      >
                        {wpm} ppm
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="1000" 
                      step="25" 
                      value={wpm} 
                      onChange={(e) => setWpm(Number(e.target.value))} 
                      className="slider-warm"
                    />
                  </div>
                  
                  <label 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <span 
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '300',
                        color: 'rgba(252, 211, 77, 0.6)',
                      }}
                    >
                      Fuente OpenDyslexic (especial para dislexia)
                    </span>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="checkbox" 
                        checked={useDyslexicFont} 
                        onChange={(e) => setUseDyslexicFont(e.target.checked)} 
                        style={{ 
                          position: 'absolute',
                          width: '1px',
                          height: '1px',
                          padding: 0,
                          margin: '-1px',
                          overflow: 'hidden',
                          clip: 'rect(0, 0, 0, 0)',
                          whiteSpace: 'nowrap',
                          border: 0,
                        }}
                      />
                      <div 
                        style={{
                          width: '3rem',
                          height: '1.5rem',
                          borderRadius: '0.75rem',
                          backgroundColor: useDyslexicFont ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <div 
                          style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            borderRadius: '50%',
                            margin: '0.125rem',
                            backgroundColor: '#e7e5e4',
                            transform: useDyslexicFont ? 'translateX(1.5rem)' : 'translateX(0)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>
                    </div>
                  </label>

                  {words.length > 0 && (
                    <div 
                      style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(231, 229, 228, 0.4)' }}>Total</span>
                        <span style={{ color: 'rgba(231, 229, 228, 0.6)' }}>{words.length} palabras</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(231, 229, 228, 0.4)' }}>Tiempo estimado</span>
                        <span style={{ color: 'rgba(231, 229, 228, 0.6)' }}>{formatTime(Math.ceil(words.length / wpm * 60))}</span>
                      </div>
                      {currentIndex > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span style={{ color: 'rgba(231, 229, 228, 0.4)' }}>Tiempo restante</span>
                          <span style={{ color: 'rgba(231, 229, 228, 0.6)' }}>{formatTime(timeRemaining)}</span>
                        </div>
                      )}
                      {sessionStats && (
                        <>
                          <div 
                            style={{
                              borderTop: '1px solid rgba(180, 83, 9, 0.2)',
                              margin: '0.5rem 0',
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'rgba(231, 229, 228, 0.4)' }}>Última sesión</span>
                            <span style={{ color: 'rgba(231, 229, 228, 0.6)' }}>{sessionStats.averageWpm} ppm promedio</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div 
                    style={{
                      fontSize: '0.75rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(180, 83, 9, 0.2)',
                      color: 'rgba(231, 229, 228, 0.3)',
                    }}
                  >
                    <p style={{ margin: '0 0 0.25rem 0' }}>
                      <strong>Espacio:</strong> play/pausa • <strong>R:</strong> reiniciar • <strong>←→:</strong> velocidad • <strong>C:</strong> config
                    </p>
                    <p style={{ margin: 0 }} className="md:hidden">
                      <strong>Tap:</strong> play/pausa • <strong>Swipe H:</strong> velocidad • <strong>Swipe V:</strong> config
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}