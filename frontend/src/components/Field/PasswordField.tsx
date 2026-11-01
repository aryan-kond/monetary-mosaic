import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Field.css';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Tells the browser whether to offer a saved password or to suggest a new one. */
  autoComplete: 'current-password' | 'new-password';
  name?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
}

/** A password field with a button that shows or hides what was typed. Pasting is allowed. */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  name,
  hint,
  error,
  placeholder,
}: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__wrap">
        <input
          id={id}
          name={name}
          className="field__control field__control--with-action"
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="field__action"
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
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
