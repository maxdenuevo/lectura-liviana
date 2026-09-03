import { memo, useId } from 'react';
import { theme } from '@/lib/theme';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { type LibraryEntry } from '@/hooks/useLibrary';
import BookCard from './BookCard';
import { CampfireIcon, UploadIcon } from '@/components/icons';

interface LibraryViewProps {
  showLibrary: boolean;
  books: LibraryEntry[];
  activeBookId: string | null;
  onClose: () => void;
  onOpenBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  /** Agrega un archivo (.txt, .md, .epub) sin abrirlo: queda para leer después */
  onFileAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Progreso de procesamiento de EPUB (0 = inactivo) */
  uploadProgress: number;
  uploadStatus: string;
}

function LibraryView({
  showLibrary,
  books,
  activeBookId,
  onClose,
  onOpenBook,
  onDeleteBook,
  onFileAdd,
  uploadProgress,
  uploadStatus,
}: LibraryViewProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(showLibrary);
  useBodyScrollLock(showLibrary);
  const fileInputId = useId();
  const isUploading = uploadProgress > 0;

  return (
    <>
      {showLibrary && (
        <div
          className="anim-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: theme.zIndex.modal,
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
            aria-labelledby="library-title"
            style={{
              borderRadius: theme.borderRadius.lg,
              padding: '2rem',
              maxWidth: '32rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: theme.colors.surfaceModal,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2
                  id="library-title"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: theme.fonts.weights.normal,
                    color: theme.colors.accentSecondary,
                    margin: 0,
                  }}
                >
                  Biblioteca
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Cerrar biblioteca"
                  style={{
                    fontSize: '1.5rem',
                    minWidth: '2.75rem',
                    minHeight: '2.75rem',
                    color: theme.colors.textMuted,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textMuted}
                >
                  ×
                </button>
              </div>

              {/* Agregar para leer después: el archivo entra a la biblioteca sin abrirse */}
              <div>
                <label
                  htmlFor={fileInputId}
                  aria-disabled={isUploading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '2.75rem',
                    padding: '0.625rem 1rem',
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.accentSubtle,
                    color: theme.colors.accent,
                    fontSize: '0.875rem',
                    fontWeight: theme.fonts.weights.medium,
                    cursor: isUploading ? 'wait' : 'pointer',
                    opacity: isUploading ? 0.6 : 1,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = theme.colors.accentDim; }}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.accentSubtle}
                >
                  <UploadIcon size="1.125rem" />
                  <span>{isUploading ? uploadStatus : 'Agregar archivo para leer después'}</span>
                </label>
                <input
                  id={fileInputId}
                  type="file"
                  accept=".txt,.md,.epub"
                  onChange={onFileAdd}
                  disabled={isUploading}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                />
                {isUploading && (
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploadProgress}
                    style={{
                      marginTop: '0.5rem',
                      height: '3px',
                      borderRadius: '2px',
                      backgroundColor: theme.colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: theme.colors.accent,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
                <p
                  style={{
                    margin: '0.5rem 0 0',
                    fontSize: '0.75rem',
                    color: theme.colors.textMuted,
                    textAlign: 'center',
                  }}
                >
                  .txt, .md o .epub. Para URLs, usa el menú de configuración.
                </p>
              </div>

              {books.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: theme.colors.textSecondary,
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ marginBottom: '0.5rem', color: theme.colors.accent }}>
                    <CampfireIcon size="2rem" />
                  </div>
                  Tu biblioteca está vacía.
                  <br />
                  Lo que agregues queda guardado aquí, disponible sin conexión, y recuerda dónde quedaste.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {books.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isActive={book.id === activeBookId}
                      onOpen={onOpenBook}
                      onDelete={onDeleteBook}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(LibraryView);
