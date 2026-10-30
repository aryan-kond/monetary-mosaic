import type { BudgetCategoryId } from '../../data/budgets';
import { categories } from '../../data/categories';
import { budgetStateInfo, type BudgetRow } from '../../utils/budgets';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './CategoryBudgetList.css';

interface CategoryBudgetListProps {
  rows: BudgetRow[];
  /** For example "1–25 Oct". */
  periodLabel: string;
  /** For example "31 Oct". */
  monthEndLabel: string;
  onEdit: (categoryId: BudgetCategoryId) => void;
}

/** One status per category. An estimate that passes the limit outranks "Nearing limit". */
function statusFor(row: BudgetRow): {
  label: string;
  tone: 'neutral' | 'positive' | 'warning' | 'negative';
} {
  if (row.state === null) return { label: 'No limit', tone: 'neutral' };
  if (row.state === 'over') return budgetStateInfo.over;
  if (row.projectedOver) return { label: 'Likely over', tone: 'warning' };
  return budgetStateInfo[row.state];
}

export function CategoryBudgetList({
  rows,
  periodLabel,
  monthEndLabel,
  onEdit,
}: CategoryBudgetListProps) {
  return (
    <Card
      title="Category limits"
      description={`Spending against each limit, ${periodLabel}. Estimates use your pace over the last 14 days.`}
    >
      <ul className="budget-list">
        {rows.map((row) => {
          const label = categories[row.categoryId].label;
          const status = statusFor(row);
          const { limit, remaining, percentUsed, projected } = row;

          return (
            <li key={row.categoryId} className="budget-row">
              <div className="budget-row__head">
                <div>
                  <h3 className="budget-row__name">{label}</h3>
                  <p className="budget-row__amounts tabular">
                    {formatCurrency(row.spent)}
                    {limit === null ? ' spent' : ` of ${formatCurrency(limit)}`}
                  </p>
                </div>
                <div className="budget-row__side">
                  <Chip tone={status.tone}>{status.label}</Chip>
                  <Button
                    variant="secondary"
                    size="compact"
                    aria-label={
                      limit === null ? `Set a limit for ${label}` : `Edit the ${label} limit`
                    }
                    onClick={() => onEdit(row.categoryId)}
                  >
                    {limit === null ? 'Set limit' : 'Edit limit'}
                  </Button>
                </div>
              </div>

              {limit !== null && percentUsed !== null && remaining !== null ? (
                <>
                  <ProgressBar
                    percent={percentUsed}
                    tone={row.state ? budgetStateInfo[row.state].progressTone : undefined}
                    label={`${Math.round(percentUsed)}% used`}
                    ariaLabel={`${label} budget used`}
                  />
                  <div className="budget-row__meta">
                    <p>
                      <strong>
                        {remaining >= 0
                          ? `${formatCurrency(remaining)} left`
                          : `${formatCurrency(-remaining)} over the limit`}
                      </strong>
                    </p>
                    <p>
                      {projected === null
                        ? 'Estimate: not enough data yet.'
                        : `Estimate for ${monthEndLabel}: ${formatCurrency(projected)}${
                            row.projectedOver
                              ? `, about ${formatCurrency(projected - limit)} over the limit.`
                              : '.'
                          }`}
                    </p>
                  </div>
                </>
              ) : (
                <p className="budget-row__meta">Set a limit to track this category.</p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
