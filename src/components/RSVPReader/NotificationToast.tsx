import { memo } from 'react';

export type NotificationType = 'info' | 'error';

interface NotificationToastProps {
  message: string;
  type?: NotificationType;
  onDismiss?: () => void;
}

function NotificationToast({ message, type = 'info', onDismiss }: NotificationToastProps) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      key={`notification-${message}`}
      className="anim-fade-in-down"
      role={isError ? 'alert' : 'status'}
      style={{
        position: 'fixed',
        top: '2rem',
        left: 0,
        right: 0,
        margin: '0 auto',
        width: 'fit-content',
        maxWidth: 'min(28rem, calc(100vw - 2rem))',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: isError ? '0.75rem 0.75rem 0.75rem 1.25rem' : '0.75rem 1.5rem',
        borderRadius: isError ? '0.75rem' : '9999px',
        border: isError ? '1px solid var(--border-light)' : 'none',
        fontSize: '0.875rem',
        fontWeight: '400',
        zIndex: 60,
        // Los errores persisten y respetan los saltos de línea del hint
        whiteSpace: 'pre-line',
        pointerEvents: isError ? 'auto' : 'none',
        backgroundColor: 'var(--notification-bg)',
        backdropFilter: 'blur(12px)',
        color: 'var(--accent)',
      }}
    >
      <span style={{ lineHeight: 1.5 }}>{message}</span>
      {isError && onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          style={{
            flexShrink: 0,
            minWidth: '2rem',
            minHeight: '2rem',
            marginTop: '-0.25rem',
            border: 'none',
            borderRadius: '0.5rem',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default memo(NotificationToast);
