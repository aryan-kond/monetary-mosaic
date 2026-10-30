import { useState } from 'react';
import { BudgetDialog } from '../../components/BudgetDialog/BudgetDialog';
import { BudgetSummaryCard } from '../../components/BudgetSummaryCard/BudgetSummaryCard';
import { Card } from '../../components/Card/Card';
import { CategoryBudgetList } from '../../components/CategoryBudgetList/CategoryBudgetList';
import type { BudgetCategoryId } from '../../data/budgets';
import { categories } from '../../data/categories';
import type { Transaction } from '../../data/transactions';
import { buildBudgetRows } from '../../utils/budgets';
import { projectMonthEnd } from '../../utils/forecast';
import { formatCurrency } from '../../utils/formatCurrency';
import { dailySpendingFor, transactionsInPeriod } from '../../utils/periods';
import type { ReportingPeriod } from '../../utils/reportingPeriod';
import './BudgetsPage.css';

type Target = { kind: 'total' } | { kind: 'category'; categoryId: BudgetCategoryId };

interface BudgetsPageProps {
  transactions: Transaction[];
  /** The days the screen covers, or null when there are no transactions. */
  period: ReportingPeriod | null;
  monthlyBudget: number;
  categoryLimits: Partial<Record<BudgetCategoryId, number>>;
  onMonthlyBudgetChange: (amount: number) => void;
  /** Pass null to remove a limit. */
  onCategoryLimitChange: (categoryId: BudgetCategoryId, limit: number | null) => void;
}

export function BudgetsPage({
  transactions,
  period,
  monthlyBudget,
  categoryLimits,
  onMonthlyBudgetChange,
  onCategoryLimitChange,
}: BudgetsPageProps) {
  // What is being edited stays put while the dialog fades out, so its text does not change.
  const [target, setTarget] = useState<Target>({ kind: 'total' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  if (!period) {
    return (
      <Card
        title="Nothing to track yet"
        description="Your budgets appear once you have transactions."
      >
        <p className="page-placeholder">
          Import a statement from the Transactions screen to see how your spending compares with
          your budget.
        </p>
      </Card>
    );
  }

  const inPeriod = transactionsInPeriod(transactions, period.startDate, period.days);
  const daily = dailySpendingFor(inPeriod, period.startDate, period.days);
  const spent = daily.reduce((total, amount) => total + amount, 0);
  const projectedTotal = projectMonthEnd(daily, period.daysInMonth)?.projectedTotal ?? null;
  const rows = buildBudgetRows(inPeriod, period, categoryLimits);
  const allocated = Object.values(categoryLimits).reduce((total, limit) => total + limit, 0);

  const openDialog = (next: Target) => {
    setTarget(next);
    setSession((current) => current + 1);
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  let dialog: {
    title: string;
    description: string;
    fieldLabel: string;
    placeholder: string;
    initialValue: number | null;
    onRemove?: () => void;
    getHint: (amount: number) => string | undefined;
    onSave: (amount: number) => void;
  };

  if (target.kind === 'total') {
    dialog = {
      title: 'Edit monthly budget',
      description: 'The most you plan to spend in a month, across every category.',
      fieldLabel: 'Monthly budget',
      placeholder: 'Enter your monthly budget',
      initialValue: monthlyBudget,
      getHint: (amount) =>
        allocated > amount
          ? `Your category limits add up to ${formatCurrency(allocated)}, which is more than ${formatCurrency(amount)}.`
          : undefined,
      onSave: (amount) => {
        onMonthlyBudgetChange(amount);
        setNotice(
          `Monthly budget changed from ${formatCurrency(monthlyBudget)} to ${formatCurrency(amount)}.`,
        );
        closeDialog();
      },
    };
  } else {
    const { categoryId } = target;
    const label = categories[categoryId].label;
    const current = categoryLimits[categoryId] ?? null;
    const others = allocated - (current ?? 0);

    dialog = {
      title: current === null ? `Set a limit for ${label}` : `Edit the ${label} limit`,
      description: `The most you plan to spend on ${label} in a month.`,
      fieldLabel: `${label} limit`,
      placeholder: `Enter a monthly limit for ${label}`,
      initialValue: current,
      onRemove:
        current === null
          ? undefined
          : () => {
              onCategoryLimitChange(categoryId, null);
              setNotice(`Removed the ${label} limit.`);
              closeDialog();
            },
      getHint: (amount) =>
        others + amount > monthlyBudget
          ? `With this limit, your category limits add up to ${formatCurrency(others + amount)}, which is more than your monthly budget of ${formatCurrency(monthlyBudget)}.`
          : undefined,
      onSave: (amount) => {
        onCategoryLimitChange(categoryId, amount);
        setNotice(
          current === null
            ? `${label} limit set to ${formatCurrency(amount)}.`
            : `${label} limit changed from ${formatCurrency(current)} to ${formatCurrency(amount)}.`,
        );
        closeDialog();
      },
    };
  }

  return (
    <div className="budgets">
      {notice && (
        <div className="budgets__notice" role="status">
          {notice}
        </div>
      )}

      <BudgetSummaryCard
        monthlyBudget={monthlyBudget}
        spent={spent}
        allocated={allocated}
        projectedTotal={projectedTotal}
        periodLabel={period.shortLabel}
        monthEndLabel={period.monthEndLabel}
        onEdit={() => openDialog({ kind: 'total' })}
      />

      <CategoryBudgetList
        rows={rows}
        periodLabel={period.shortLabel}
        monthEndLabel={period.monthEndLabel}
        onEdit={(categoryId) => openDialog({ kind: 'category', categoryId })}
      />

      <BudgetDialog
        open={dialogOpen}
        session={session}
        title={dialog.title}
        description={dialog.description}
        fieldLabel={dialog.fieldLabel}
        placeholder={dialog.placeholder}
        initialValue={dialog.initialValue}
        onRemove={dialog.onRemove}
        getHint={dialog.getHint}
        onClose={closeDialog}
        onSave={dialog.onSave}
      />
    </div>
  );
}
