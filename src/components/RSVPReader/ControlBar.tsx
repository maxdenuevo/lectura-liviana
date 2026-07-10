import { motion, AnimatePresence } from 'framer-motion';

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

export default function ControlBar({
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
    <AnimatePresence>
      {showControls && (
        <motion.div
          key="controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
              gap: '1.5rem',
              padding: '1rem 1.5rem',
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
