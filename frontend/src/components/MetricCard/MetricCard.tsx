import { Chip } from '../Chip/Chip';
import './MetricCard.css';

export interface MetricBadge {
  tone: 'positive' | 'neutral' | 'warning' | 'negative';
  /** Short label, 13 characters or fewer. */
  text: string;
  /** Plain text shown beside the chip, for example "than 1–25 Sep". */
  context?: string;
}

export interface MetricProgress {
  /** 0 to 100. Values above 100 fill the bar but keep the real number in the label. */
  percent: number;
  /** Omit for the default blue. */
  tone?: 'warning' | 'negative';
  /** Visible label with the numeric value, for example "74% of budget used". */
  label: string;
  /** Accessible name for the bar. */
  ariaLabel: string;
}

interface MetricCardProps {
  /** What the number is: spending, income, net cash flow, or budget remaining. */
  label: string;
  value: string;
  /** One short line of context under the value. */
  note: string;
  badge?: MetricBadge;
  progress?: MetricProgress;
}

export function MetricCard({ label, value, note, badge, progress }: MetricCardProps) {
  const fillPercent = progress ? Math.min(Math.max(progress.percent, 0), 100) : 0;
  const fillClass = [
    'metric-progress__fill',
    progress?.tone && `metric-progress__fill--${progress.tone}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="metric-card">
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value tabular">{value}</p>
      <p className="metric-card__note">{note}</p>

      {badge && (
        <div className="metric-card__badge-row">
          <Chip tone={badge.tone}>{badge.text}</Chip>
          {badge.context && <span className="metric-card__context">{badge.context}</span>}
        </div>
      )}

      {progress && (
        <div className="metric-progress">
          <div
            className="metric-progress__track"
            role="progressbar"
            aria-label={progress.ariaLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fillPercent)}
            aria-valuetext={progress.label}
          >
            <div className={fillClass} style={{ width: `${fillPercent}%` }} />
          </div>
          <p className="metric-progress__label">{progress.label}</p>
        </div>
      )}
    </div>
  );
}
