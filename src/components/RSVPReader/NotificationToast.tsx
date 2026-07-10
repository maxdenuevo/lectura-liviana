import { memo } from 'react';

interface NotificationToastProps {
  message: string;
}

function NotificationToast({ message }: NotificationToastProps) {
  if (!message) return null;

  return (
    <div
      key={`notification-${message}`}
      className="anim-fade-in-down"
      style={{
        position: 'fixed',
        top: '2rem',
        left: 0,
        right: 0,
        margin: '0 auto',
        width: 'fit-content',
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '400',
        zIndex: 50,
        pointerEvents: 'none',
        backgroundColor: 'var(--notification-bg)',
        backdropFilter: 'blur(12px)',
        color: 'var(--accent)',
      }}
    >
      {message}
    </div>
  );
}

export default memo(NotificationToast);
