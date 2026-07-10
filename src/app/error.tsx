'use client';

import { theme } from '@/lib/theme';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: theme.spacing.xl,
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: theme.fonts.weights.medium, margin: 0 }}>
        Algo salió mal
      </h2>
      <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary, margin: 0, maxWidth: '28rem' }}>
        {error.message || 'Ocurrió un error inesperado al mostrar el lector.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          borderRadius: theme.borderRadius.sm,
          backgroundColor: theme.colors.accentSubtle,
          color: theme.colors.accent,
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: theme.fonts.weights.medium,
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
