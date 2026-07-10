import { memo, useState } from 'react';
import { theme } from '@/lib/theme';
import { type LibraryEntry } from '@/hooks/useLibrary';

interface BookCardProps {
  book: LibraryEntry;
  isActive: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const SOURCE_LABELS: Record<LibraryEntry['source'], string> = {
  epub: 'EPUB',
  file: 'Archivo',
  url: 'Web',
  paste: 'Texto',
};

function formatWordCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
}

function BookCard({ book, isActive, onOpen, onDelete }: BookCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const percent = book.wordCount > 0
    ? Math.min(100, Math.round((book.savedIndex / book.wordCount) * 100))
    : 0;

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${isActive ? theme.colors.accent : theme.colors.border}`,
        backgroundColor: isActive ? theme.colors.accentFaint : theme.colors.surfaceDark,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: theme.fonts.weights.medium,
            color: theme.colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {book.title}
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            color: theme.colors.accentSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.sm,
            padding: '0.1rem 0.4rem',
            flexShrink: 0,
          }}
        >
          {SOURCE_LABELS[book.source]}
        </span>
      </div>

      {book.author && (
        <span style={{ fontSize: '0.8rem', color: theme.colors.textSecondary }}>{book.author}</span>
      )}

      {/* Barra de progreso */}
      <div
        style={{
          height: '3px',
          borderRadius: '2px',
          backgroundColor: theme.colors.border,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: theme.colors.accent,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
          {percent > 0 ? `${percent}% leído` : 'Sin empezar'} · {formatWordCount(book.wordCount)} palabras
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {confirmingDelete ? (
            <>
              <button
                onClick={() => onDelete(book.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  minHeight: '2rem',
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: 'rgba(180, 60, 40, 0.25)',
                  color: '#f0a090',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Borrar definitivamente
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                style={{
                  padding: '0.4rem 0.75rem',
                  minHeight: '2rem',
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Borrar ${book.title}`}
                style={{
                  padding: '0.4rem 0.6rem',
                  minHeight: '2rem',
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: 'transparent',
                  color: theme.colors.textMuted,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Borrar
              </button>
              <button
                onClick={() => onOpen(book.id)}
                style={{
                  padding: '0.4rem 1rem',
                  minHeight: '2rem',
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.accentSubtle,
                  color: theme.colors.accent,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: theme.fonts.weights.medium,
                }}
              >
                {isActive ? 'Leyendo' : percent > 0 ? 'Reanudar' : 'Leer'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(BookCard);
