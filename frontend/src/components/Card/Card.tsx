import { useId, type ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title: string;
  /** One line of context, such as the period or what the numbers mean. */
  description?: string;
  /** Optional control shown at the top right, for example a view toggle. */
  action?: ReactNode;
  children: ReactNode;
}

/** Standard panel for charts and grouped content: white, fine border, restrained shadow. */
export function Card({ title, description, action, children }: CardProps) {
  const headingId = useId();

  return (
    <section className="card" aria-labelledby={headingId}>
      <header className="card__header">
        <div>
          <h2 id={headingId} className="card__title">
            {title}
          </h2>
          {description && <p className="card__description">{description}</p>}
        </div>
        {action && <div className="card__action">{action}</div>}
      </header>
      {children}
    </section>
  );
}
