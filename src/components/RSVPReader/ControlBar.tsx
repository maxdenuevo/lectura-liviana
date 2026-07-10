import { memo } from 'react';

interface ControlBarProps {
  showControls: boolean;
  wpm: number;
  isPlaying: boolean;
  onAdjustSpeed: (delta: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function ControlBar({
  showControls,
  wpm,
  isPlaying,
  onAdjustSpeed,
  onTogglePlay,
  onRestart,
  onSkipBackward,
  onSkipForward,
  onMouseEnter,
  onMouseLeave,
}: ControlBarProps) {
  return (
    <>
      {showControls && (
        <div
          key="controls"
          className="anim-fade-in-up"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 40,
            pointerEvents: 'none',
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-controls)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 25px var(--accent-faint)',
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={() => onAdjustSpeed(-25)}
              style={{
                fontSize: '1.25rem',
                minWidth: '2.75rem',
                minHeight: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              −
            </button>

            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: '300',
                minWidth: '70px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
              }}
            >
              {wpm} ppm
            </span>

            <button
              onClick={() => onAdjustSpeed(25)}
              style={{
                fontSize: '1.25rem',
                minWidth: '2.75rem',
                minHeight: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              +
            </button>

            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'var(--border-light)',
              }}
            />

            <button
              onClick={onTogglePlay}
              style={{
                fontSize: '1.5rem',
                minWidth: '2.75rem',
                minHeight: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? '॥' : '▶'}
            </button>

            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'var(--border-light)',
              }}
            />

            <button
              onClick={onRestart}
              style={{
                fontSize: '1.25rem',
                minWidth: '2.75rem',
                minHeight: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              aria-label="Reiniciar"
            >
              ↺
            </button>

            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'var(--border-light)',
              }}
            />

            <button
              onClick={onSkipBackward}
              style={{
                fontSize: '1.25rem',
                minWidth: '2.75rem',
                minHeight: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              aria-label="Retroceder"
            >
              ←
            </button>

            <button
              onClick={onSkipForward}
              style={{
                fontSize: '1.25rem',
                minWidth: '2.75rem',
                minHeight: '2.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              aria-label="Adelantar"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(ControlBar);
