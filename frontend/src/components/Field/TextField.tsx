import { useId } from 'react';
import './Field.css';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: 'text' | 'numeric';
  /** Short symbol shown inside the field, such as ₹. */
  prefix?: string;
  /** Explains the expected format or a consequence. */
  hint?: string;
  /** Plain-language message when the value is not valid. */
  error?: string;
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChange,
  inputMode,
  prefix,
  hint,
  error,
  maxLength,
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__wrap">
        {prefix && (
          <span className="field__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={prefix ? 'field__control field__control--with-prefix' : 'field__control'}
          type="text"
          inputMode={inputMode}
          value={value}
          maxLength={maxLength}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
