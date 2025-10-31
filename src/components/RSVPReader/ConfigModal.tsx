import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { EnrichedWord } from './types';
import { type EpubBook } from '@/lib/epubParser';
import EpubMetadataPreview from './EpubMetadataPreview';
import ChapterSelector from './ChapterSelector';

interface ConfigModalProps {
  showConfig: boolean;
  text: string;
  wpm: number;
  skipWords: number;
  useDyslexicFont: boolean;
  urlInput: string;
  isLoadingUrl: boolean;
  epubProgress: number;
  epubStatus: string;
  epubData: EpubBook | null;
  words: EnrichedWord[];
  currentIndex: number;
  timeRemaining: number;
  onClose: () => void;
  onTextChange: (text: string) => void;
  onWpmChange: (wpm: number) => void;
  onSkipWordsChange: (count: number) => void;
  onDyslexicFontChange: (enabled: boolean) => void;
  onUrlInputChange: (url: string) => void;
  onUrlLoad: () => void;
  onFileLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChapterSelect?: (chapterContent: string, chapterTitle: string) => void;
  formatTime: (seconds: number) => string;
}

export default function ConfigModal({
  showConfig,
  text,
  wpm,
  skipWords,
  useDyslexicFont,
  urlInput,
  isLoadingUrl,
  epubProgress,
  epubStatus,
  epubData,
  words,
  currentIndex,
  timeRemaining,
  onClose,
  onTextChange,
  onWpmChange,
  onSkipWordsChange,
  onDyslexicFontChange,
  onUrlInputChange,
  onUrlLoad,
  onFileLoad,
  onChapterSelect,
  formatTime,
}: ConfigModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(showConfig);
  useBodyScrollLock(showConfig);

  // Format large numbers with K suffix
  const formatWordCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <AnimatePresence mode="wait">
      {showConfig && (
        <>
          <style>{`
            #config-textarea::placeholder,
            #config-url-input::placeholder {
              color: rgba(252, 211, 77, 0.4);
              opacity: 1;
            }
          `}</style>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            willChange: 'opacity',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="config-modal-title"
            style={{
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '32rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'rgba(28, 25, 23, 0.98)',
              willChange: 'transform, opacity',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2
                  id="config-modal-title"
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
                  onClick={onClose}
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
                  Pega aquí abajo tu texto 
                </label>
                <textarea
                  id="config-textarea"
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
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
                    boxSizing: 'border-box',
                  }}
                  placeholder="Pega tu texto aquí..."
                />
              </div>

              <div>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: '300',
                  marginBottom: '0.5rem',
                  display: 'block',
                  color: 'rgba(252, 211, 77, 0.6)',
                }}>
                  Cargar desde tu computador
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label
                    htmlFor="file-input"
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'rgba(251, 191, 36, 0.2)',
                      color: '#fbbf24',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.2)'}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span>Seleccionar archivo (.txt, .md, .epub)</span>
                  </label>
                  <input
                    type="file"
                    accept=".txt,.md,.epub"
                    onChange={onFileLoad}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                </div>

                {/* EPUB Progress Indicator */}
                {epubProgress > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#fbbf24',
                      marginBottom: '0.5rem',
                    }}>
                      {epubStatus}
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${epubProgress}%`,
                        height: '100%',
                        backgroundColor: '#fbbf24',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(252, 211, 77, 0.6)',
                      marginTop: '0.25rem',
                      textAlign: 'right',
                    }}>
                      {epubProgress}%
                    </div>
                  </div>
                )}
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
                  Cargar desde internet
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="config-url-input"
                    type="url"
                    value={urlInput}
                    onChange={(e) => onUrlInputChange(e.target.value)}
                    placeholder="https://ejemplo.com/articulo"
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'rgba(252, 211, 77, 0.8)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && onUrlLoad()}
                  />
                  <button
                    onClick={onUrlLoad}
                    disabled={isLoadingUrl || !urlInput.trim()}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: isLoadingUrl ? 'rgba(0, 0, 0, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                      color: isLoadingUrl ? 'rgba(231, 229, 228, 0.4)' : '#fbbf24',
                      border: 'none',
                      cursor: isLoadingUrl ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '1.125rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '3rem',
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
                  onChange={(e) => onWpmChange(Number(e.target.value))}
                  className="slider-warm"
                />
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
                    Salto de palabras (flechas)
                  </label>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#fbbf24',
                    }}
                  >
                    {skipWords} {skipWords === 1 ? 'palabra' : 'palabras'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  step="1"
                  value={skipWords}
                  onChange={(e) => onSkipWordsChange(Number(e.target.value))}
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
                    fontFamily: 'OpenDyslexic, sans-serif',
                  }}
                >
                  Fuente especial para dislexia
                </span>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={useDyslexicFont}
                    onChange={(e) => onDyslexicFontChange(e.target.checked)}
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
                      height: '1.75rem',
                      borderRadius: '0.875rem',
                      backgroundColor: useDyslexicFont ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      transition: 'background-color 0.2s ease',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.125rem',
                    }}
                  >
                    <div
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        backgroundColor: '#e7e5e4',
                        transform: useDyslexicFont ? 'translateX(1.25rem)' : 'translateX(0)',
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
                    <span style={{ color: 'rgba(231, 229, 228, 0.6)' }}>{formatWordCount(words.length)} palabras</span>
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
                </div>
              )}

              {/* EPUB Metadata and Chapter Navigation */}
              {epubData && (
                <>
                  <EpubMetadataPreview epubData={epubData} />

                  {epubData.chapters.length > 0 && onChapterSelect && (
                    <ChapterSelector
                      chapters={epubData.chapters}
                      onChapterSelect={(chapter) => {
                        onChapterSelect(chapter.content, chapter.title);
                      }}
                    />
                  )}
                </>
              )}

              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(180, 83, 9, 0.2)',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(252, 211, 77, 0.6)" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'rgba(252, 211, 77, 0.6)' }}>Teclado</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(231, 229, 228, 0.4)', paddingLeft: '1.75rem', lineHeight: 1.6 }}>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>Espacio</strong> play/pausa</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>R</strong> reiniciar</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>↔</strong> adelantar/retroceder</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>↕</strong> velocidad</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>C</strong> config</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>Esc</strong> pausar/cerrar</div>
                  </div>
                </div>
                <div className="md:hidden">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(252, 211, 77, 0.6)" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <path d="M12 18h.01"/>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'rgba(252, 211, 77, 0.6)' }}>Gestos</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(231, 229, 228, 0.4)', paddingLeft: '1.75rem', lineHeight: 1.6 }}>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>Tap</strong> play/pausa</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>Doble tap</strong> config</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>Swipe ↔</strong> adelantar/retroceder</div>
                    <div><strong style={{ color: 'rgba(231, 229, 228, 0.5)' }}>Swipe ↕</strong> velocidad</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(180, 83, 9, 0.2)',
                  textAlign: 'center',
                  color: 'rgba(231, 229, 228, 0.3)',
                }}
              >
                <p style={{ margin: 0 }}>
                  Hecho por{' '}
                  <a
                    href="http://maxdenuevo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'rgba(251, 191, 36, 0.6)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(251, 191, 36, 0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(251, 191, 36, 0.6)'}
                  >
                    maxdenuevo
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
