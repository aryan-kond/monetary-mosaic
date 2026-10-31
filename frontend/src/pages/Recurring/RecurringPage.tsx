import { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { RecurringList } from '../../components/RecurringList/RecurringList';
import { RecurringSummary } from '../../components/RecurringSummary/RecurringSummary';
import type { Transaction } from '../../data/transactions';
import { daysBetween, formatShortDate } from '../../utils/formatDate';
import { transactionsInPeriod } from '../../utils/periods';
import { detectRecurring, monthlyEquivalent } from '../../utils/recurring';
import type { ReportingPeriod } from '../../utils/reportingPeriod';
import './RecurringPage.css';

interface RecurringPageProps {
  transactions: Transaction[];
  /** The days the screen covers, or null when there are no transactions. */
  period: ReportingPeriod | null;
  /** Payments the person marked "not recurring". */
  hiddenKeys: string[];
  onHide: (key: string) => void;
  onRestoreAll: () => void;
}

export function RecurringPage({
  transactions,
  period,
  hiddenKeys,
  onHide,
  onRestoreAll,
}: RecurringPageProps) {
  const [notice, setNotice] = useState<string | null>(null);

  if (!period) {
    return (
      <Card
        title="Nothing to look at yet"
        description="Recurring payments appear once you have transactions."
      >
        <p className="page-placeholder">
          Import a statement from the Transactions screen. Two or more months work best.
        </p>
      </Card>
    );
  }

  // Patterns are found in every transaction, so earlier months count as history.
  const visible = detectRecurring(transactions).filter(
    (pattern) => !hiddenKeys.includes(pattern.key),
  );
  const hiddenCount = hiddenKeys.length;

  const monthlyTotal = visible.reduce((total, pattern) => total + monthlyEquivalent(pattern), 0);

  // Facts for this month: what these payments really added up to so far.
  const paidThisMonth = visible
    .flatMap((pattern) => pattern.payments)
    .filter((payment) => {
      const offset = daysBetween(period.startDate, payment.date);
      return offset >= 0 && offset < period.days;
    })
    .reduce((total, payment) => total + payment.amount, 0);
  const spentThisMonth = transactionsInPeriod(transactions, period.startDate, period.days)
    .filter((transaction) => transaction.direction === 'out')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const paidShare = spentThisMonth > 0 ? Math.round((paidThisMonth / spentThisMonth) * 100) : 0;

  const next = visible[0] ? { merchant: visible[0].merchant, date: visible[0].nextDate } : null;

  return (
    <div className="recurring">
      {notice && (
        <div className="recurring__notice" role="status">
          {notice}
        </div>
      )}

      <RecurringSummary
        count={visible.length}
        monthlyTotal={monthlyTotal}
        paidThisMonth={paidThisMonth}
        paidShare={paidShare}
        next={next}
        periodLabel={period.shortLabel}
        asOfLabel={formatShortDate(period.endDate)}
      />

      <RecurringList
        patterns={visible}
        asOf={period.endDate}
        hiddenCount={hiddenCount}
        onHide={(pattern) => {
          onHide(pattern.key);
          setNotice(
            `Hid ${pattern.merchant}. It is no longer shown as a recurring payment. Use Restore hidden to bring it back.`,
          );
        }}
        onRestoreAll={() => {
          onRestoreAll();
          setNotice('Restored every hidden payment.');
        }}
      />
    </div>
  );
}
