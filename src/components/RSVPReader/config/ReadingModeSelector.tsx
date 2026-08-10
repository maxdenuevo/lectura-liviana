import { memo } from 'react';
import { type ReadingMode } from '../types';
import { MAX_CHUNK_SIZE, MIN_CHUNK_SIZE } from '@/lib/guidedChunks';

interface ReadingModeSelectorProps {
  readingMode: ReadingMode;
  chunkSize: number;
  onReadingModeChange: (mode: ReadingMode) => void;
  onChunkSizeChange: (size: number) => void;
}

const MODES = [
  { value: 'rsvp', label: 'Palabra a palabra', hint: 'Una palabra centrada' },
  { value: 'guided', label: 'Guiado', hint: 'Texto en flujo con foco móvil' },
] as const;

const CHUNK_SIZES = Array.from(
  { length: MAX_CHUNK_SIZE - MIN_CHUNK_SIZE + 1 },
  (_, i) => MIN_CHUNK_SIZE + i
);

/** Elige entre RSVP y lectura guiada, y el tamaño del grupo iluminado */
function ReadingModeSelector({
  readingMode,
  chunkSize,
  onReadingModeChange,
  onChunkSizeChange,
}: ReadingModeSelectorProps) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend
        style={{
          fontSize: '0.875rem',
          fontWeight: '400',
          marginBottom: '0.5rem',
          padding: 0,
          color: 'var(--accent-secondary)',
        }}
      >
        Modo de lectura
      </legend>

      <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label="Modo de lectura">
        {MODES.map((option) => {
          const selected = readingMode === option.value;
          return (
            <label
              key={option.value}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                borderRadius: '0.5rem',
                border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                backgroundColor: selected ? 'var(--accent-subtle)' : 'transparent',
                color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="radio"
                name="reading-mode"
                value={option.value}
                checked={selected}
                onChange={() => onReadingModeChange(option.value)}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              />
              {option.label}
              <span
                style={{
                  display: 'block',
                  marginTop: '0.2rem',
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                }}
              >
                {option.hint}
              </span>
            </label>
          );
        })}
      </div>

      {readingMode === 'guided' && (
        <div style={{ marginTop: '0.85rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.4rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Palabras por golpe de vista
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-muted)' }}>{chunkSize}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }} role="radiogroup" aria-label="Palabras por golpe de vista">
            {CHUNK_SIZES.map((size) => {
              const selected = chunkSize === size;
              return (
                <label
                  key={size}
                  style={{
                    flex: 1,
                    minHeight: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem',
                    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    backgroundColor: selected ? 'var(--accent-subtle)' : 'transparent',
                    color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="chunk-size"
                    value={size}
                    checked={selected}
                    onChange={() => onChunkSizeChange(size)}
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      padding: 0,
                      margin: '-1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 0,
                    }}
                  />
                  {size}
                </label>
              );
            })}
          </div>

          <p
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              margin: '0.5rem 0 0',
              lineHeight: 1.5,
            }}
          >
            El foco salta de grupo en grupo en vez de palabra por palabra: menos
            saltos de ojo y un ritmo constante que corta las relecturas. Los
            grupos nunca cruzan un punto ni un cambio de párrafo.
          </p>
        </div>
      )}
    </fieldset>
  );
}

export default memo(ReadingModeSelector);
