import { memo } from 'react';
import { theme } from '@/lib/theme';

interface GestureFeedbackProps {
  type: 'speed-up' | 'speed-down' | null;
  newWpm?: number;
}

function GestureFeedback({ type, newWpm }: GestureFeedbackProps) {
  if (!type) return null;

  return (
    <div
      key={`gesture-${type}-${newWpm}`}
      className="anim-fade-in"
      style={{
        position: 'fixed',
        top: '50%',
        left: type === 'speed-up' ? 'auto' : theme.spacing.xl,
        right: type === 'speed-up' ? theme.spacing.xl : 'auto',
        transform: 'translateY(-50%)',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surfaceModal,
        backdropFilter: 'blur(12px)',
        border: `2px solid ${theme.colors.accent}`,
        boxShadow: theme.shadows.controls,
        zIndex: theme.zIndex.notification,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.xs,
        }}
      >
        <span
          style={{
            fontSize: '2rem',
            color: theme.colors.accent,
          }}
        >
          {type === 'speed-up' ? '→' : '←'}
        </span>
        {newWpm && (
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: theme.fonts.weights.medium,
              color: theme.colors.accent,
            }}
          >
            {newWpm} ppm
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(GestureFeedback);
