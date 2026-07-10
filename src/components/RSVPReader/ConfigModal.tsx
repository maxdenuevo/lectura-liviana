import React, { memo } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { type ReadingFont } from '@/hooks/usePreferences';
import { EnrichedWord } from './types';
import { type EpubBook } from '@/lib/epubParser';
import EpubMetadataPreview from './EpubMetadataPreview';
import ChapterSelector from './ChapterSelector';
import TextSourcePanel from './config/TextSourcePanel';
import SpeedControls from './config/SpeedControls';
import FontSelector from './config/FontSelector';
import ReadingStats from './config/ReadingStats';

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

/** Shell del diálogo de configuración: compone los paneles de config/ */
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
                      fontWeight: '400',
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

                <TextSourcePanel
                  text={text}
                  urlInput={urlInput}
                  isLoadingUrl={isLoadingUrl}
                  epubProgress={epubProgress}
                  epubStatus={epubStatus}
                  onTextChange={onTextChange}
                  onSaveToLibrary={onSaveToLibrary}
                  onUrlInputChange={onUrlInputChange}
                  onUrlLoad={onUrlLoad}
                  onFileLoad={onFileLoad}
                />

                <SpeedControls
                  wpm={wpm}
                  arrowStep={arrowStep}
                  jumpWords={jumpWords}
                  onWpmChange={onWpmChange}
                  onArrowStepChange={onArrowStepChange}
                  onJumpWordsChange={onJumpWordsChange}
                />

                <FontSelector readingFont={readingFont} onReadingFontChange={onReadingFontChange} />

                <ReadingStats
                  wordCount={words.length}
                  currentIndex={currentIndex}
                  timeRemaining={timeRemaining}
                  wpm={wpm}
                  formatTime={formatTime}
                />

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
                      <div><strong style={{ color: 'var(--text-muted)' }}>Swipe ↔</strong> salto grande</div>
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
