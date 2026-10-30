import { Chip } from '../Chip/Chip';
import { ProgressBar } from '../ProgressBar/ProgressBar';
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
        <div className="metric-card__progress">
          <ProgressBar
            percent={progress.percent}
            tone={progress.tone}
            label={progress.label}
            ariaLabel={progress.ariaLabel}
          />
        </div>
      )}
    </div>
  );
}
