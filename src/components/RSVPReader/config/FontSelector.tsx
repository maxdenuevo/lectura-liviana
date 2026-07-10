import { memo } from 'react';
import { type ReadingFont } from '@/hooks/usePreferences';

interface FontSelectorProps {
  readingFont: ReadingFont;
  onReadingFontChange: (font: ReadingFont) => void;
}

/** Selector de fuente de lectura (Atkinson Hyperlegible / OpenDyslexic) */
function FontSelector({ readingFont, onReadingFontChange }: FontSelectorProps) {
  return (
    <fieldset
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <legend
        style={{
          fontSize: '0.875rem',
          fontWeight: '400',
          marginBottom: '0.5rem',
          padding: 0,
          color: 'var(--accent-secondary)',
        }}
      >
        Fuente de lectura
      </legend>
      <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label="Fuente de lectura">
        {([
          { value: 'atkinson', label: 'Atkinson Hyperlegible', fontFamily: 'inherit' },
          { value: 'opendyslexic', label: 'OpenDyslexic', fontFamily: "'OpenDyslexic', sans-serif" },
        ] as const).map((option) => {
          const selected = readingFont === option.value;
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
                fontFamily: option.fontFamily,
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="radio"
                name="reading-font"
                value={option.value}
                checked={selected}
                onChange={() => onReadingFontChange(option.value)}
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
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default memo(FontSelector);
