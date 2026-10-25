import type { ReactNode } from 'react';
import { CalendarDays } from 'lucide-react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  /** Reporting period, shown as "Reporting period: ...". */
  period?: string;
  /** Shows a "Sample data" label so sample figures are never mistaken for real ones. */
  sampleData?: boolean;
  /** The page's primary action, for example the Import statement button. */
  action?: ReactNode;
}

export function PageHeader({ title, period, sampleData = false, action }: PageHeaderProps) {
  const hasMeta = Boolean(period) || sampleData;

  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {hasMeta && (
          <div className="page-header__meta">
            {period && (
              <p className="page-header__period">
                <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Reporting period: {period}</span>
              </p>
            )}
            {sampleData && <span className="page-header__chip">Sample data</span>}
          </div>
        )}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
}
