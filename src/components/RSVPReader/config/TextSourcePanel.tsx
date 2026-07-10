import React, { memo } from 'react';

interface TextSourcePanelProps {
  text: string;
  urlInput: string;
  isLoadingUrl: boolean;
  epubProgress: number;
  epubStatus: string;
  onTextChange: (text: string) => void;
  /** Presente solo cuando el texto pegado aún no está en la biblioteca */
  onSaveToLibrary?: () => void;
  onUrlInputChange: (url: string) => void;
  onUrlLoad: () => void;
  onFileLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Fuentes de texto: pegar, archivo local (.txt/.md/.epub) y URL */
function TextSourcePanel({
  text,
  urlInput,
  isLoadingUrl,
  epubProgress,
  epubStatus,
  onTextChange,
  onSaveToLibrary,
  onUrlInputChange,
  onUrlLoad,
  onFileLoad,
}: TextSourcePanelProps) {
  return (
    <>
      <div>
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: '400',
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
          fontWeight: '400',
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
          fontWeight: '400',
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
            aria-label="Cargar URL"
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
    </>
  );
}

export default memo(TextSourcePanel);
