import { useId } from 'react';
import './Field.css';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Tells the browser whether to offer a saved password or to suggest a new one. */
  autoComplete: 'current-password' | 'new-password';
  /** Whether what was typed is shown. The page owns this, so one checkbox can control every field. */
  revealed: boolean;
  name?: string;
  /** "pill" gives the field fully rounded ends. */
  shape?: 'default' | 'pill';
  hint?: string;
  error?: string;
}

/** A password field. Pasting is allowed, so password managers work. */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  revealed,
  name,
  shape = 'default',
  hint,
  error,
}: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={shape === 'pill' ? 'field field--pill' : 'field'}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__wrap">
        <input
          id={id}
          name={name}
          className="field__control"
          type={revealed ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
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
