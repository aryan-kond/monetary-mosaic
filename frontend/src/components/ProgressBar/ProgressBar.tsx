import './ProgressBar.css';

interface ProgressBarProps {
  /** 0 to 100. Values above 100 fill the bar, and the label keeps the real number. */
  percent: number;
  /** Omit for the default blue. */
  tone?: 'warning' | 'negative';
  /** Visible text with the numeric value, for example "74% used". */
  label: string;
  /** Accessible name for the bar. */
  ariaLabel: string;
}

export function ProgressBar({ percent, tone, label, ariaLabel }: ProgressBarProps) {
  const fill = Math.min(Math.max(percent, 0), 100);
  const fillClass = tone ? `progress__fill progress__fill--${tone}` : 'progress__fill';

  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
        aria-valuetext={label}
      >
        <div className={fillClass} style={{ width: `${fill}%` }} />
      </div>
      <p className="progress__label">{label}</p>
    </div>
  );
}
