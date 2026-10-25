import type { MonthEndForecast } from '../../utils/forecast';
import { formatCurrency } from '../../utils/formatCurrency';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import './ForecastCard.css';

interface ForecastCardProps {
  forecast: MonthEndForecast | null;
  budget: number;
  /** For example "31 Oct". */
  monthEndLabel: string;
  /** The range of actual data the estimate is based on, for example "1–25 Oct". */
  coverageLabel: string;
}

export function ForecastCard({
  forecast,
  budget,
  monthEndLabel,
  coverageLabel,
}: ForecastCardProps) {
  if (!forecast) {
    return (
      <Card title="Month-end forecast" description="Not enough data yet to make an estimate.">
        <p className="forecast__note">
          A forecast needs at least 7 days of spending. Import a statement to see one.
        </p>
      </Card>
    );
  }

  const {
    spentSoFar,
    estimatedRemaining,
    projectedTotal,
    dailyAverage,
    remainingDays,
    windowDays,
  } = forecast;

  const scale = Math.max(budget, projectedTotal, 1);
  const spentPercent = (spentSoFar / scale) * 100;
  const estimatePercent = (estimatedRemaining / scale) * 100;
  const budgetPercent = (budget / scale) * 100;

  const difference = budget - projectedTotal;
  const withinBudget = difference >= 0;

  const barSummary =
    `Spent ${formatCurrency(spentSoFar)} so far, plus an estimated ` +
    `${formatCurrency(estimatedRemaining)} more by ${monthEndLabel}, ` +
    `against a monthly budget of ${formatCurrency(budget)}.`;

  return (
    <Card
      title="Month-end forecast"
      description={`Estimate for ${monthEndLabel}, based on actual spending from ${coverageLabel}`}
      action={<Chip>Estimate</Chip>}
    >
      <p className="forecast__label">Estimated total by {monthEndLabel}</p>
      <p className="forecast__value tabular">{formatCurrency(projectedTotal)}</p>

      <div className="forecast__status">
        <Chip tone={withinBudget ? 'positive' : 'warning'}>
          {withinBudget ? 'Projected within budget' : 'Projected to exceed budget'}
        </Chip>
        <p className="forecast__difference">
          About {formatCurrency(Math.abs(difference))} {withinBudget ? 'under' : 'over'} your{' '}
          {formatCurrency(budget)} monthly budget
        </p>
      </div>

      <div className="forecast-bar" role="img" aria-label={barSummary}>
        <div className="forecast-bar__track">
          <div className="forecast-bar__actual" style={{ width: `${spentPercent}%` }} />
          <div className="forecast-bar__estimate" style={{ width: `${estimatePercent}%` }} />
        </div>
        <span className="forecast-bar__marker" style={{ left: `${budgetPercent}%` }} />
      </div>

      <ul className="forecast__legend">
        <li>
          <span className="forecast__swatch forecast__swatch--actual" aria-hidden="true" />
          <span>Spent so far (actual)</span>
          <strong className="tabular">{formatCurrency(spentSoFar)}</strong>
        </li>
        <li>
          <span className="forecast__swatch forecast__swatch--estimate" aria-hidden="true" />
          <span>Estimated rest of month</span>
          <strong className="tabular">{formatCurrency(estimatedRemaining)}</strong>
        </li>
        <li>
          <span className="forecast__swatch forecast__swatch--budget" aria-hidden="true" />
          <span>Monthly budget</span>
          <strong className="tabular">{formatCurrency(budget)}</strong>
        </li>
      </ul>

      <p className="forecast__note">
        How this is estimated: the remaining {remainingDays} days are assumed to match your average
        over the last {windowDays} days (about {formatCurrency(dailyAverage)} a day). Bills that
        have not been paid yet are not included, so the real total may differ.
      </p>
    </Card>
  );
}
