import { budgetState, budgetStateInfo } from '../../utils/budgets';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './BudgetSummaryCard.css';

interface BudgetSummaryCardProps {
  monthlyBudget: number;
  /** Actual spending so far this period. */
  spent: number;
  /** The total of all category limits. */
  allocated: number;
  /** Estimated spending by month end. Null without enough data. */
  projectedTotal: number | null;
  /** For example "1–25 Oct". */
  periodLabel: string;
  /** For example "31 Oct". */
  monthEndLabel: string;
  onEdit: () => void;
}

export function BudgetSummaryCard({
  monthlyBudget,
  spent,
  allocated,
  projectedTotal,
  periodLabel,
  monthEndLabel,
  onEdit,
}: BudgetSummaryCardProps) {
  const percentUsed = (spent / monthlyBudget) * 100;
  const info = budgetStateInfo[budgetState(percentUsed)];
  const remaining = monthlyBudget - spent;
  const unallocated = monthlyBudget - allocated;

  let allocationText: string;
  if (allocated > monthlyBudget) {
    allocationText = `Your category limits add up to ${formatCurrency(allocated)}, which is ${formatCurrency(allocated - monthlyBudget)} more than your monthly budget.`;
  } else if (unallocated > 0) {
    allocationText = `${formatCurrency(unallocated)} of your budget is not given to a category.`;
  } else {
    allocationText = 'Your whole budget is given to categories.';
  }

  const estimateText =
    projectedTotal === null
      ? 'Not enough data yet for an estimate. It needs at least 7 days of spending.'
      : `At your recent pace, you would spend about ${formatCurrency(projectedTotal)} by ${monthEndLabel}, about ${formatCurrency(Math.abs(monthlyBudget - projectedTotal))} ${projectedTotal <= monthlyBudget ? 'under' : 'over'} your budget.`;

  return (
    <Card
      title="Monthly budget"
      description={`Spending so far, ${periodLabel}`}
      action={
        <Button variant="secondary" onClick={onEdit}>
          Edit budget
        </Button>
      }
    >
      <dl className="budget-tiles">
        <div>
          <dt>Budget</dt>
          <dd className="tabular">{formatCurrency(monthlyBudget)}</dd>
        </div>
        <div>
          <dt>Spent so far</dt>
          <dd className="tabular">{formatCurrency(spent)}</dd>
        </div>
        <div>
          <dt>{remaining >= 0 ? 'Remaining' : 'Over budget by'}</dt>
          <dd className="tabular">{formatCurrency(Math.abs(remaining))}</dd>
        </div>
        <div>
          <dt>Given to categories</dt>
          <dd className="tabular">{formatCurrency(allocated)}</dd>
        </div>
      </dl>

      <div className="budget-status">
        <Chip tone={info.tone}>{info.label}</Chip>
      </div>
      <ProgressBar
        percent={percentUsed}
        tone={info.progressTone}
        label={`${Math.round(percentUsed)}% of your monthly budget used`}
        ariaLabel="Monthly budget used"
      />

      <p
        className={allocated > monthlyBudget ? 'budget-line budget-line--attention' : 'budget-line'}
      >
        {allocationText}
      </p>
      <p className="budget-line budget-line--estimate">
        <Chip>Estimate</Chip>
        <span>{estimateText}</span>
      </p>
    </Card>
  );
}
