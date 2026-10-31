import { formatCurrency } from '../../utils/formatCurrency';
import { formatShortDate } from '../../utils/formatDate';
import { Card } from '../Card/Card';
import './RecurringSummary.css';

interface RecurringSummaryProps {
  count: number;
  /** An estimate, worked out from the typical amounts. */
  monthlyTotal: number;
  /** A fact: what these payments added up to so far this month. */
  paidThisMonth: number;
  /** The share of this month's spending that went to them, 0 to 100. */
  paidShare: number;
  /** The payment due soonest. */
  next: { merchant: string; date: string } | null;
  /** For example "1–25 Oct". */
  periodLabel: string;
  /** The latest transaction date, for example "25 Oct". */
  asOfLabel: string;
}

export function RecurringSummary({
  count,
  monthlyTotal,
  paidThisMonth,
  paidShare,
  next,
  periodLabel,
  asOfLabel,
}: RecurringSummaryProps) {
  return (
    <Card
      title="Recurring payments"
      description={`Payments to the same merchant at a steady rhythm. Days are counted from your latest transaction, ${asOfLabel}.`}
    >
      <dl className="recurring-tiles">
        <div>
          <dt>Recurring payments</dt>
          <dd>{count}</dd>
          <dd className="recurring-tiles__sub">Inferred from your transactions</dd>
        </div>
        <div>
          <dt>About each month</dt>
          <dd className="tabular">{formatCurrency(Math.round(monthlyTotal))}</dd>
          <dd className="recurring-tiles__sub">Estimate, from typical amounts</dd>
        </div>
        <div>
          <dt>Paid so far this month</dt>
          <dd className="tabular">{formatCurrency(paidThisMonth)}</dd>
          <dd className="recurring-tiles__sub">
            {paidShare}% of your spending, {periodLabel}
          </dd>
        </div>
        <div>
          <dt>Next due</dt>
          <dd>{next ? next.merchant : '—'}</dd>
          <dd className="recurring-tiles__sub">
            {next ? `Expected ${formatShortDate(next.date)}` : 'Nothing expected yet'}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
