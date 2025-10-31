import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

interface GestureFeedbackProps {
  type: 'speed-up' | 'speed-down' | null;
  newWpm?: number;
}

export default function GestureFeedback({ type, newWpm }: GestureFeedbackProps) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          key={`gesture-${type}-${newWpm}`}
          initial={{ opacity: 0, x: type === 'speed-up' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: type === 'speed-up' ? 20 : -20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
