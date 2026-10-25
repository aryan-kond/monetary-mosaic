import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  Minus,
  TriangleAlert,
} from 'lucide-react';
import { summaryData } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { MetricCard, type MetricBadge, type MetricProgress } from '../MetricCard/MetricCard';
import './SummaryCards.css';

type Direction = 'up' | 'down';

/**
 * Compares a value with the same days of the previous month.
 * Only the favorable direction is shown in green. An unfavorable change stays neutral,
 * because red is reserved for real issues, not for spending existing.
 */
function getTrend(
  current: number,
  previous: number,
  periodLabel: string,
  favorable: Direction,
): MetricBadge | undefined {
  if (previous === 0) return undefined;
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.05) {
    return { tone: 'neutral', icon: Minus, text: `Same as ${periodLabel}` };
  }
  const direction: Direction = change > 0 ? 'up' : 'down';
  return {
    tone: direction === favorable ? 'positive' : 'neutral',
    icon: direction === 'up' ? ArrowUpRight : ArrowDownRight,
    text: `${Math.abs(change).toFixed(1)}% ${direction === 'up' ? 'above' : 'below'} ${periodLabel}`,
  };
}

/** Threshold states are explicit: under 80% on track, 80-100% nearing limit, above 100% over. */
function getBudgetStatus(percentUsed: number): {
  badge: MetricBadge;
  progressTone: MetricProgress['tone'];
} {
  if (percentUsed > 100) {
    return {
      badge: { tone: 'negative', icon: CircleAlert, text: 'Over budget' },
      progressTone: 'negative',
    };
  }
  if (percentUsed >= 80) {
    return {
      badge: { tone: 'warning', icon: TriangleAlert, text: 'Nearing limit' },
      progressTone: 'warning',
    };
  }
  return {
    badge: { tone: 'positive', icon: CircleCheck, text: 'On track' },
    progressTone: undefined,
  };
}

export function SummaryCards() {
  const {
    totalSpent,
    previousTotalSpent,
    totalIncome,
    previousTotalIncome,
    monthlyBudget,
    previousPeriodShort,
  } = summaryData;

  const netCashFlow = totalIncome - totalSpent;
  const previousNetCashFlow = previousTotalIncome - previousTotalSpent;
  const budgetRemaining = monthlyBudget - totalSpent;
  const percentUsed = (totalSpent / monthlyBudget) * 100;
  const budgetStatus = getBudgetStatus(percentUsed);

  return (
    <section className="summary-cards" aria-label="Financial summary">
      <ul className="summary-cards__grid">
        <li>
          <MetricCard
            label="Total Spent"
            value={formatCurrency(totalSpent)}
            note="Money out this period"
            badge={getTrend(totalSpent, previousTotalSpent, previousPeriodShort, 'down')}
          />
        </li>
        <li>
          <MetricCard
            label="Total Income"
            value={formatCurrency(totalIncome)}
            note="Money in this period"
            badge={getTrend(totalIncome, previousTotalIncome, previousPeriodShort, 'up')}
          />
        </li>
        <li>
          <MetricCard
            label="Net Cash Flow"
            value={formatCurrency(netCashFlow, { signed: true })}
            note="Income minus spending"
            badge={getTrend(netCashFlow, previousNetCashFlow, previousPeriodShort, 'up')}
          />
        </li>
        <li>
          <MetricCard
            label="Budget Remaining"
            value={formatCurrency(budgetRemaining)}
            note={`of ${formatCurrency(monthlyBudget)} monthly budget`}
            badge={budgetStatus.badge}
            progress={{
              percent: percentUsed,
              tone: budgetStatus.progressTone,
              label: `${Math.round(percentUsed)}% of budget used`,
              ariaLabel: 'Monthly budget used',
            }}
          />
        </li>
      </ul>
    </section>
  );
}
