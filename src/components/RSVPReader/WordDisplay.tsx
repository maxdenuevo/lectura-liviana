import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { WordParts, WordType } from './types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEffect, useRef } from 'react';
import { getVisualStyle } from '@/lib/textParser';

interface WordDisplayProps {
  currentIndex: number;
  wordParts: WordParts;
  wordType: WordType;
  progress: number;
}

export default function WordDisplay({ currentIndex, wordParts, wordType, progress }: WordDisplayProps) {
  const prefersReducedMotion = useReducedMotion();
  const prevProgress = useRef(progress);

  // Detect restart (progress goes from high to low)
  const isRestarting = prevProgress.current > 50 && progress < 10;

  // Get visual style based on word type
  const visualStyle = getVisualStyle(wordType);

  useEffect(() => {
    prevProgress.current = progress;
  }, [progress]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '64rem',
        padding: '0 1rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Contenedor de la palabra */}
        <div
          style={{
            position: 'relative',
            height: '8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{
                duration: prefersReducedMotion ? 0 : Math.min(0.12 * visualStyle.durationMultiplier, 0.3),
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              <span
                style={{
                  fontSize: `calc(clamp(3rem, 8vw, 6rem) * ${visualStyle.sizeMultiplier})`,
                  fontWeight: wordType.startsWith('h') ? '400' : '300',
                  letterSpacing: '0.05em',
                  filter: `brightness(${visualStyle.brightnessMultiplier})`,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ color: `rgba(252, 211, 77, ${0.6 * visualStyle.brightnessMultiplier})` }}>{wordParts.pre}</span>
                <span style={{ color: `rgba(252, 211, 77, ${Math.min(1, 0.8 * visualStyle.brightnessMultiplier)})`, fontWeight: '400' }}>{wordParts.focal}</span>
                <span style={{ color: `rgba(252, 211, 77, ${0.6 * visualStyle.brightnessMultiplier})` }}>{wordParts.post}</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicador de progreso */}
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            marginTop: '2rem',
            height: '2px',
            backgroundColor: 'rgba(180, 83, 9, 0.2)',
            borderRadius: '1px',
          }}
        >
          <motion.div
            key={isRestarting ? 'restart' : 'progress'}
            style={{
              height: '100%',
              backgroundColor: 'rgba(251, 191, 36, 0.6)',
              borderRadius: '1px',
            }}
            initial={isRestarting ? { width: '0%' } : false}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: prefersReducedMotion ? 0 : (isRestarting ? 0.5 : 0.2),
              ease: [0.16, 1, 0.3, 1]
            }}
          />
        </div>
      </div>
    </div>
  );
}
