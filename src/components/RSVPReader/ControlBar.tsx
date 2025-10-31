import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

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
              border: '1px solid rgba(180, 83, 9, 0.2)',
              backgroundColor: 'rgba(28, 25, 23, 0.8)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={() => onAdjustSpeed(-25)}
              style={{
                fontSize: '1.25rem',
                color: 'rgba(231, 229, 228, 0.6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
            >
              −
            </button>

            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: '300',
                minWidth: '70px',
                textAlign: 'center',
                color: 'rgba(231, 229, 228, 0.8)',
              }}
            >
              {wpm} ppm
            </span>

            <button
              onClick={() => onAdjustSpeed(25)}
              style={{
                fontSize: '1.25rem',
                color: 'rgba(231, 229, 228, 0.6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
            >
              +
            </button>

            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'rgba(180, 83, 9, 0.3)',
              }}
            />

            <button
              onClick={onTogglePlay}
              style={{
                fontSize: '1.5rem',
                color: 'rgba(231, 229, 228, 0.8)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.8)'}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? '॥' : '▶'}
            </button>

            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'rgba(180, 83, 9, 0.3)',
              }}
            />

            <button
              onClick={onRestart}
              style={{
                fontSize: '1.25rem',
                color: 'rgba(231, 229, 228, 0.6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
              aria-label="Reiniciar"
            >
              ↺
            </button>

            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'rgba(180, 83, 9, 0.3)',
              }}
            />

            <button
              onClick={onSkipBackward}
              style={{
                fontSize: '1.25rem',
                color: 'rgba(231, 229, 228, 0.6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
              aria-label="Retroceder"
            >
              ←
            </button>

            <button
              onClick={onSkipForward}
              style={{
                fontSize: '1.25rem',
                color: 'rgba(231, 229, 228, 0.6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e7e5e4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(231, 229, 228, 0.6)'}
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
