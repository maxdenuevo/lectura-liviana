import { memo } from 'react';

interface SpeedControlsProps {
  wpm: number;
  arrowStep: number;
  jumpWords: number;
  onWpmChange: (wpm: number) => void;
  onArrowStepChange: (count: number) => void;
  onJumpWordsChange: (count: number) => void;
}

interface SliderRowProps {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  ariaLabel: string;
  onChange: (value: number) => void;
}

function SliderRow({ label, valueLabel, min, max, step, value, ariaLabel, onChange }: SliderRowProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: '400',
            color: 'var(--accent-secondary)',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--accent)',
          }}
        >
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-warm"
        aria-label={ariaLabel}
      />
    </div>
  );
}

/** Velocidad de lectura y tamaños de salto */
function SpeedControls({
  wpm,
  arrowStep,
  jumpWords,
  onWpmChange,
  onArrowStepChange,
  onJumpWordsChange,
}: SpeedControlsProps) {
  return (
    <>
      <SliderRow
        label="Velocidad de lectura"
        valueLabel={`${wpm} ppm`}
        min={100}
        max={1000}
        step={25}
        value={wpm}
        ariaLabel="Velocidad de lectura en palabras por minuto"
        onChange={onWpmChange}
      />
      <SliderRow
        label="Retroceso fino (←→)"
        valueLabel={`${arrowStep} ${arrowStep === 1 ? 'palabra' : 'palabras'}`}
        min={1}
        max={5}
        step={1}
        value={arrowStep}
        ariaLabel="Retroceso fino con flechas"
        onChange={onArrowStepChange}
      />
      <SliderRow
        label="Salto grande (Shift+←→ / swipe)"
        valueLabel={`${jumpWords} palabras`}
        min={5}
        max={80}
        step={5}
        value={jumpWords}
        ariaLabel="Salto grande con Shift y flechas o swipe"
        onChange={onJumpWordsChange}
      />
    </>
  );
}

export default memo(SpeedControls);
