import { memo, useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

interface FirstVisitHintsProps {
  onDismiss?: () => void;
  onLoadExample?: (url: string) => void;
}

function FirstVisitHints({ onDismiss, onLoadExample }: FirstVisitHintsProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen hints before
    const hasSeenHints = localStorage.getItem('hasSeenHints');
    if (!hasSeenHints) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenHints', 'true');
    setShow(false);
    onDismiss?.();
  };

  return (
    <>
      {show && (
        <div
          className="anim-fade-in-up"
          style={{
            // La animación CSS pisa transform: se centra con márgenes auto
            position: 'fixed',
            bottom: theme.spacing.xl,
            left: 0,
            right: 0,
            margin: '0 auto',
            width: 'fit-content',
            animationDelay: '1s',
            animationDuration: '0.4s',
            maxWidth: '24rem',
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.surfaceModal,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.controls,
            zIndex: theme.zIndex.notification,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span style={{ fontSize: '1.5rem' }}>👋</span>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: theme.fonts.weights.medium,
                  color: theme.colors.accent,
                  margin: 0,
                }}
              >
                Bienvenido a Lectura Liviana
              </h3>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: theme.colors.textSecondary,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Presiona <kbd style={{
                padding: '0.125rem 0.375rem',
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.surfaceDark,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: theme.colors.accent,
              }}>Espacio</kbd> para comenzar a leer, o{' '}
              <kbd style={{
                padding: '0.125rem 0.375rem',
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.surfaceDark,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: theme.colors.accent,
              }}>?</kbd> para ver todos los atajos.
            </p>

            <div style={{ display: 'flex', gap: theme.spacing.sm, flexDirection: 'column' }}>
              <button
                onClick={handleDismiss}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.accentSubtle,
                  color: theme.colors.accent,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: theme.fonts.weights.medium,
                  transition: `all ${theme.transitions.normal} ease`,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.accentDim}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.accentSubtle}
              >
                Entendido
              </button>

              {onLoadExample && (
                <button
                  onClick={() => {
                    onLoadExample('https://www.gutenberg.org/files/84/84-0.txt');
                    handleDismiss();
                  }}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: 'transparent',
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: theme.fonts.weights.medium,
                    transition: `all ${theme.transitions.normal} ease`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.accent;
                    e.currentTarget.style.color = theme.colors.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border;
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  O prueba con Frankenstein
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(FirstVisitHints);
