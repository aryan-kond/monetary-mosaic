import { Check } from 'lucide-react';
import './StepIndicator.css';

interface StepIndicatorProps {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Import progress">
      <ol className="steps">
        {steps.map((label, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'upcoming';

          return (
            <li
              key={label}
              className={`steps__item steps__item--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="steps__marker" aria-hidden="true">
                {state === 'done' ? <Check size={16} strokeWidth={2.25} /> : index + 1}
              </span>
              <span className="steps__label">
                <span className="visually-hidden">
                  Step {index + 1} of {steps.length}:{' '}
                </span>
                {label}
                {state === 'done' && <span className="visually-hidden"> (completed)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
