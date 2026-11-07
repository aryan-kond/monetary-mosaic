import { useId, type CSSProperties } from 'react';
import './CheckboxField.css';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The text beside the box. */
  label?: string;
  /** Extra explanation under the label. */
  hint?: string;
  /** The color of the box when checked. Defaults to the app's primary blue. */
  color?: string;
  /** The color of the hover ring. Defaults to the lighter blue from the logo. */
  secondaryColor?: string;
  /** Text size in px, and so the size of the box (1.6 times the text). From 12 to 24. */
  size?: number;
  /** Animation speed. 0.5 is half as fast, 2 is twice as fast. */
  speed?: number;
}

/**
 * A checkbox that pops with a small bounce while its tick draws itself. It is a real checkbox, so
 * keyboard, screen readers, and password managers all work as usual.
 */
export function CheckboxField({
  checked,
  onChange,
  label = 'I agree',
  hint,
  color,
  secondaryColor,
  size = 16,
  speed = 1,
}: CheckboxFieldProps) {
  const hintId = useId();

  // Unset colors fall back to the design tokens in CheckboxField.css.
  const style = {
    '--cb-s': `${clamp(size, 12, 24)}px`,
    '--cb-k': clamp(speed, 0.5, 2),
    '--cb-c1': color,
    '--cb-c2': secondaryColor,
  } as CSSProperties;

  return (
    <div className="cb" style={style}>
      <label className="cb__row">
        <input
          className="cb__input"
          type="checkbox"
          checked={checked}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="cb__box" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" />
          </svg>
        </span>
        <span className="cb__label">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="cb__hint">
          {hint}
        </p>
      )}
    </div>
  );
}
