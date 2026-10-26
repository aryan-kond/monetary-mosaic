import { useId } from 'react';
import { Search } from 'lucide-react';
import './Field.css';

interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Say what can be searched, for example "Search merchant, category, or amount". */
  placeholder: string;
}

export function SearchField({ label, value, onChange, placeholder }: SearchFieldProps) {
  const id = useId();

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__wrap">
        <Search className="field__icon" size={18} strokeWidth={1.75} aria-hidden="true" />
        <input
          id={id}
          className="field__control field__control--with-icon"
          type="search"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
