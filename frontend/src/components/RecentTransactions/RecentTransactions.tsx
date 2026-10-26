import type { Transaction } from '../../data/transactions';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import './RecentTransactions.css';

interface RecentTransactionsProps {
  transactions: Transaction[];
  /** Opens the full Transactions screen. */
  onViewAll: () => void;
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card title="Recent transactions" description="No transactions yet.">
        <p className="recent__empty">
          Use Import statement at the top of the page to add a CSV and see your latest activity
          here.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Recent transactions"
      description={`Latest ${transactions.length} transactions, sample data`}
      action={
        <Button variant="secondary" onClick={onViewAll}>
          View all transactions
        </Button>
      }
    >
      <TransactionsTable
        transactions={transactions}
        caption="Most recent transactions (sample data)"
      />
      <p className="recent__note">
        Categories are assigned automatically. Correct them in Transactions.
      </p>
    </Card>
  );
}
