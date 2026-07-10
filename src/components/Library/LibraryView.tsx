import { memo } from 'react';
import { theme } from '@/lib/theme';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { type LibraryEntry } from '@/hooks/useLibrary';
import BookCard from './BookCard';

interface LibraryViewProps {
  showLibrary: boolean;
  books: LibraryEntry[];
  activeBookId: string | null;
  onClose: () => void;
  onOpenBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
}

function LibraryView({
  showLibrary,
  books,
  activeBookId,
  onClose,
  onOpenBook,
  onDeleteBook,
}: LibraryViewProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(showLibrary);
  useBodyScrollLock(showLibrary);

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
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕯️</div>
                  Tu biblioteca está vacía.
                  <br />
                  Carga un EPUB, archivo o URL desde el menú de configuración: los libros quedan
                  guardados aquí y recuerdan dónde quedaste.
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
