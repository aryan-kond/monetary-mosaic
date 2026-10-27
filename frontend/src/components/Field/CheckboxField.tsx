import { useId } from 'react';
import './Field.css';

interface CheckboxFieldProps {
  label: string;
  /** Extra explanation under the label. */
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ label, hint, checked, onChange }: CheckboxFieldProps) {
  const hintId = useId();

  return (
    <label className="checkbox">
      <input
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="checkbox__text">
        <span className="checkbox__label">{label}</span>
        {hint && (
          <span id={hintId} className="checkbox__hint">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
