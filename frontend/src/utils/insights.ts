import { categories } from '../data/categories';
import { formatCurrency } from './formatCurrency';
import type { CategorySpend } from './spending';

export interface Insight {
  id: string;
  /** "observed" is a fact from the data. "review" asks the user to check something. */
  kind: 'observed' | 'review';
  title: string;
  detail: string;
}

interface InsightInput {
  spending: CategorySpend[];
  /** Transactions whose category still needs a check. */
  reviewCount: number;
  previousDining: number;
  previousMonthName: string;
}

/** Insights are worked out from the transactions, so they stay true when a category changes. */
export function buildInsights({
  spending,
  reviewCount,
  previousDining,
  previousMonthName,
}: InsightInput): Insight[] {
  const insights: Insight[] = [];
  const total = spending.reduce((sum, row) => sum + row.amount, 0);
  const dining = spending.find((row) => row.categoryId === 'dining')?.amount ?? 0;

  if (previousDining > 0 && dining > previousDining * 1.05) {
    const percent = Math.round((dining / previousDining - 1) * 100);
    insights.push({
      id: 'dining-trend',
      kind: 'observed',
      title: 'Dining is trending above last month',
      detail: `You have spent ${formatCurrency(dining)} on dining so far, about ${percent}% more than the same days in ${previousMonthName} (${formatCurrency(previousDining)}).`,
    });
  }

  const largest = [...spending].sort((a, b) => b.amount - a.amount)[0];
  if (largest && total > 0) {
    const share = Math.round((largest.amount / total) * 100);
    insights.push({
      id: 'largest-category',
      kind: 'observed',
      title: `${categories[largest.categoryId].label} is your largest expense`,
      detail: `${formatCurrency(largest.amount)} is ${share}% of the ${formatCurrency(total)} spent so far.`,
    });
  }

  if (reviewCount > 0) {
    insights.push({
      id: 'category-review',
      kind: 'review',
      title: `${reviewCount} ${reviewCount === 1 ? 'transaction needs' : 'transactions need'} a category check`,
      detail:
        'Their categories were assigned automatically with low confidence. Review them in Transactions to keep your totals accurate.',
    });
  }

  return insights;
}
