import { useId } from 'react';
import './Field.css';

export interface RadioOption {
  value: string;
  label: string;
  /** A line of explanation under the label. */
  description?: string;
}

interface RadioGroupFieldProps {
  legend: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  /** Plain-language message when nothing valid is chosen. */
  error?: string;
}

export function RadioGroupField({ legend, value, options, onChange, error }: RadioGroupFieldProps) {
  const name = useId();
  const errorId = `${name}-error`;

  return (
    <fieldset className="radio-group" aria-describedby={error ? errorId : undefined}>
      <legend className="field__label">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="radio">
          <input
            type="radio"
            className="radio__input"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="radio__text">
            <span className="radio__label">{option.label}</span>
            {option.description && <span className="radio__hint">{option.description}</span>}
          </span>
        </label>
      ))}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
