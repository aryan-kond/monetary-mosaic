import { useId } from 'react';
import './Field.css';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** "email" brings up the email keyboard on phones and turns off auto-capitalizing. */
  type?: 'text' | 'email';
  inputMode?: 'text' | 'numeric';
  /** Helps password managers. Ordinary fields leave it off. */
  autoComplete?: string;
  /** The field's name, which password managers also use. */
  name?: string;
  /** Short symbol shown inside the field, such as ₹. */
  prefix?: string;
  /** Task-specific guidance, for example "Enter your monthly budget". It is not a label. */
  placeholder?: string;
  /** Explains the expected format or a consequence. */
  hint?: string;
  /** Plain-language message when the value is not valid. */
  error?: string;
  maxLength?: number;
  /** "pill" gives the field fully rounded ends. */
  shape?: 'default' | 'pill';
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
  name,
  prefix,
  placeholder,
  hint,
  error,
  maxLength,
  shape = 'default',
}: TextFieldProps) {
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
        {prefix && (
          <span className="field__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          className={prefix ? 'field__control field__control--with-prefix' : 'field__control'}
          type={type}
          inputMode={inputMode}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete={autoComplete ?? 'off'}
          autoCapitalize={type === 'email' ? 'none' : undefined}
          spellCheck={type === 'email' ? false : undefined}
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
