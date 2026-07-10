import { memo } from 'react';

interface ReadingStatsProps {
  wordCount: number;
  currentIndex: number;
  timeRemaining: number;
  wpm: number;
  formatTime: (seconds: number) => string;
}

function formatWordCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
}

/** Panel de estadísticas del texto activo */
function ReadingStats({ wordCount, currentIndex, timeRemaining, wpm, formatTime }: ReadingStatsProps) {
  if (wordCount === 0) return null;

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Total</span>
        <span style={{ color: 'var(--text-secondary)' }}>{formatWordCount(wordCount)} palabras</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Tiempo estimado</span>
        <span style={{ color: 'var(--text-secondary)' }}>{formatTime(Math.ceil(wordCount / wpm * 60))}</span>
      </div>
      {currentIndex > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Tiempo restante</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formatTime(timeRemaining)}</span>
        </div>
      )}
    </div>
  );
}

export default memo(ReadingStats);
