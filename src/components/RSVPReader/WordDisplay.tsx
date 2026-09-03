import { memo, useEffect, useRef } from 'react';
import { Emphasis, WordParts, WordType } from './types';
import { getVisualStyle } from '@/lib/textParser';

interface WordDisplayProps {
  currentIndex: number;
  wordParts: WordParts;
  wordType: WordType;
  emphasis?: Emphasis;
  progress: number;
}

// Hot path: se re-renderiza en cada palabra. Sin framer-motion — el remount
// del div con key + @keyframes CSS anima la entrada a costo casi nulo.
function WordDisplay({ currentIndex, wordParts, wordType, emphasis, progress }: WordDisplayProps) {
  const prevProgress = useRef(progress);

  // Detect restart (progress goes from high to low)
  const isRestarting = prevProgress.current > 50 && progress < 10;

  // Get visual style based on word type
  const visualStyle = getVisualStyle(wordType);
  const isBold = wordType.startsWith('h') || emphasis === 'bold' || emphasis === 'bold-italic';
  const isItalic = emphasis === 'italic' || emphasis === 'bold-italic';

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
          <div
            key={currentIndex}
            className="word-in"
            style={{
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                fontSize: `calc(clamp(3rem, 8vw, 6rem) * ${visualStyle.sizeMultiplier})`,
                fontWeight: isBold ? '700' : '400',
                fontStyle: isItalic ? 'italic' : 'normal',
                fontFamily: emphasis === 'code' ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
                letterSpacing: '0.05em',
                filter: `brightness(${visualStyle.brightnessMultiplier})`,
                textShadow: '0 0 32px rgba(244, 162, 97, 0.22)',
              }}
            >
              <span style={{ color: 'var(--word-prepost)' }}>{wordParts.pre}</span>
              <span style={{ color: 'var(--word-focal)', fontWeight: '700' }}>{wordParts.focal}</span>
              <span style={{ color: 'var(--word-prepost)' }}>{wordParts.post}</span>
            </span>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            marginTop: '2rem',
            height: '2px',
            backgroundColor: 'var(--border)',
            borderRadius: '1px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--accent-muted)',
              borderRadius: '1px',
              transition: isRestarting ? 'none' : 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(WordDisplay);
