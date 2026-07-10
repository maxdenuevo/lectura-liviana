import { memo } from 'react';
import { theme } from '@/lib/theme';

interface EmptyStateProps {
  onOpenLibrary: () => void;
  onOpenConfig: () => void;
}

/** Se muestra en lugar de la palabra cuando no hay ningún texto activo */
function EmptyState({ onOpenLibrary, onOpenConfig }: EmptyStateProps) {
  return (
    <div
      className="anim-fade-in"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '24rem',
        padding: '0 1rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing.lg,
      }}
    >
      <div style={{ fontSize: '2.5rem' }} aria-hidden="true">🕯️</div>
      <p
        style={{
          margin: 0,
          fontSize: '1rem',
          color: theme.colors.textSecondary,
          lineHeight: 1.6,
        }}
      >
        No hay nada para leer todavía.
      </p>
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <button
          onClick={onOpenLibrary}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            minHeight: '2.75rem',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.accentSubtle,
            color: theme.colors.accent,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: theme.fonts.weights.medium,
          }}
        >
          Abrir biblioteca
        </button>
        <button
          onClick={onOpenConfig}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            minHeight: '2.75rem',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: 'transparent',
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Cargar texto
        </button>
      </div>
    </div>
  );
}

export default memo(EmptyState);
