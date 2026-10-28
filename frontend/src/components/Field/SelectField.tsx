import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import './Field.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Explains what the field is for, or shows examples. */
  hint?: string;
  /** Plain-language message when the choice is not valid. */
  error?: string;
  /** Shown beside the label, for example a status chip. */
  badge?: ReactNode;
}

/** A native select, so it works with every keyboard, screen reader, and phone picker. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
  error,
  badge,
}: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <div className="field__label-row">
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
        {badge}
      </div>
      <div className="field__wrap">
        <select
          id={id}
          className="field__control field__control--select"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="field__icon field__icon--end"
          size={18}
          strokeWidth={1.75}
          aria-hidden="true"
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
