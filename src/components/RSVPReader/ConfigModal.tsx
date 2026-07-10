import React, { memo } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { type ReadingFont } from '@/hooks/usePreferences';
import { EnrichedWord } from './types';
import { type EpubBook } from '@/lib/epubParser';
import EpubMetadataPreview from './EpubMetadataPreview';
import ChapterSelector from './ChapterSelector';

interface ConfigModalProps {
  showConfig: boolean;
  text: string;
  wpm: number;
  arrowStep: number;
  jumpWords: number;
  readingFont: ReadingFont;
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
  /** Presente solo cuando el texto pegado aún no está en la biblioteca */
  onSaveToLibrary?: () => void;
  onWpmChange: (wpm: number) => void;
  onArrowStepChange: (count: number) => void;
  onJumpWordsChange: (count: number) => void;
  onReadingFontChange: (font: ReadingFont) => void;
  onUrlInputChange: (url: string) => void;
  onUrlLoad: () => void;
  onFileLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChapterSelect?: (chapterIndex: number, chapterTitle: string) => void;
  formatTime: (seconds: number) => string;
}

function ConfigModal({
  showConfig,
  text,
  wpm,
  arrowStep,
  jumpWords,
  readingFont,
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
  onSaveToLibrary,
  onWpmChange,
  onArrowStepChange,
  onJumpWordsChange,
  onReadingFontChange,
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
    <>
      {showConfig && (
        <>
          <style>{`
            #config-textarea::placeholder,
            #config-url-input::placeholder {
              color: var(--accent-muted);
              opacity: 1;
            }
          `}</style>
          <div
          className="anim-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50,
            backgroundColor: 'var(--overlay)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div
            ref={modalRef}
            className="anim-fade-in-up"
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
              backgroundColor: 'var(--surface-modal)',
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
                    color: 'var(--accent-secondary)',
                    margin: 0,
                  }}
                >
                  Configuración
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Cerrar configuración"
                  style={{
                    fontSize: '1.5rem',
                    minWidth: '2.75rem',
                    minHeight: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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
                    color: 'var(--accent-secondary)',
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
                    color: 'var(--accent-secondary)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Pega tu texto aquí..."
                />
                {onSaveToLibrary && text.trim() && (
                  <button
                    onClick={onSaveToLibrary}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-dim)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-subtle)'}
                  >
                    Guardar en biblioteca
                  </button>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: '300',
                  marginBottom: '0.5rem',
                  display: 'block',
                  color: 'var(--accent-secondary)',
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
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-dim)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-subtle)'}
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
                    backgroundColor: 'var(--accent-faint)',
                    border: '1px solid var(--accent-dim)',
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--accent)',
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
                        backgroundColor: 'var(--accent)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent-secondary)',
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
                  color: 'var(--accent-secondary)',
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
                      color: 'var(--accent-secondary)',
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
                      backgroundColor: isLoadingUrl ? 'rgba(0, 0, 0, 0.2)' : 'var(--accent-subtle)',
                      color: isLoadingUrl ? 'var(--text-muted)' : 'var(--accent)',
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
                      color: 'var(--accent-secondary)',
                    }}
                  >
                    Velocidad de lectura
                  </label>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--accent)',
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
                      fontWeight: '400',
                      color: 'var(--accent-secondary)',
                    }}
                  >
                    Retroceso fino (←→)
                  </label>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--accent)',
                    }}
                  >
                    {arrowStep} {arrowStep === 1 ? 'palabra' : 'palabras'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={arrowStep}
                  onChange={(e) => onArrowStepChange(Number(e.target.value))}
                  className="slider-warm"
                  aria-label="Retroceso fino con flechas"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      color: 'var(--accent-secondary)',
                    }}
                  >
                    Salto grande (Shift+←→ / swipe)
                  </label>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--accent)',
                    }}
                  >
                    {jumpWords} palabras
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={jumpWords}
                  onChange={(e) => onJumpWordsChange(Number(e.target.value))}
                  className="slider-warm"
                  aria-label="Salto grande con Shift y flechas o swipe"
                />
              </div>

              <fieldset
                style={{
                  border: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <legend
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    marginBottom: '0.5rem',
                    padding: 0,
                    color: 'var(--accent-secondary)',
                  }}
                >
                  Fuente de lectura
                </legend>
                <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label="Fuente de lectura">
                  {([
                    { value: 'atkinson', label: 'Atkinson Hyperlegible', fontFamily: 'inherit' },
                    { value: 'opendyslexic', label: 'OpenDyslexic', fontFamily: "'OpenDyslexic', sans-serif" },
                  ] as const).map((option) => {
                    const selected = readingFont === option.value;
                    return (
                      <label
                        key={option.value}
                        style={{
                          flex: 1,
                          padding: '0.75rem 0.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          backgroundColor: selected ? 'var(--accent-subtle)' : 'transparent',
                          color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          fontFamily: option.fontFamily,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="reading-font"
                          value={option.value}
                          checked={selected}
                          onChange={() => onReadingFontChange(option.value)}
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
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {words.length > 0 && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatWordCount(words.length)} palabras</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tiempo estimado</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatTime(Math.ceil(words.length / wpm * 60))}</span>
                  </div>
                  {currentIndex > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tiempo restante</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatTime(timeRemaining)}</span>
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
                        onChapterSelect(chapter.index, chapter.title);
                      }}
                    />
                  )}
                </>
              )}

              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--accent-secondary)' }}>Teclado</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '1.75rem', lineHeight: 1.6 }}>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Espacio</strong> play/pausa</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>R</strong> reiniciar</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>↔</strong> retroceso fino</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Shift+↔</strong> salto grande</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>↕</strong> velocidad</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>C</strong> config</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Esc</strong> pausar/cerrar</div>
                  </div>
                </div>
                <div className="md:hidden">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <path d="M12 18h.01"/>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--accent-secondary)' }}>Gestos</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '1.75rem', lineHeight: 1.6 }}>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Tap</strong> play/pausa</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Doble tap</strong> config</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Swipe ↔</strong> adelantar/retroceder</div>
                    <div><strong style={{ color: 'var(--text-muted)' }}>Swipe ↕</strong> velocidad</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <p style={{ margin: 0 }}>
                  Hecho por{' '}
                  <a
                    href="http://maxdenuevo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--accent-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-muted)'}
                  >
                    maxdenuevo
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}

export default memo(ConfigModal);
