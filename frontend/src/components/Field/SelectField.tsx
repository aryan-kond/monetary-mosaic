import { useId } from 'react';
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
}

/** A native select, so it works with every keyboard, screen reader, and phone picker. */
export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const id = useId();

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__wrap">
        <select
          id={id}
          className="field__control field__control--select"
          value={value}
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
    </div>
  );
}
