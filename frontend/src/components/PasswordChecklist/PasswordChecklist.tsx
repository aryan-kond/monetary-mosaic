import { Check } from 'lucide-react';
import './PasswordChecklist.css';

interface ChecklistRule {
  id: string;
  label: string;
  met: boolean;
}

/** What a good password needs, with each item ticked off as it is met. */
export function PasswordChecklist({ rules }: { rules: ChecklistRule[] }) {
  return (
    <ul className="checklist" aria-label="Password requirements">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={rule.met ? 'checklist__item checklist__item--met' : 'checklist__item'}
        >
          <span className="checklist__icon" aria-hidden="true">
            {rule.met && <Check size={12} strokeWidth={3} />}
          </span>
          <span>
            {rule.label}
            <span className="visually-hidden">{rule.met ? ', done' : ', not yet'}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
