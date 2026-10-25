import { categories } from '../../data/categories';
import type { Transaction } from '../../data/transactions';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatShortDate } from '../../utils/formatDate';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
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
      <div className="recent">
        <table className="recent__table">
          <caption className="visually-hidden">Most recent transactions (sample data)</caption>
          <thead>
            <tr>
              <th scope="col">Merchant</th>
              <th scope="col" className="recent__col-date">
                Date
              </th>
              <th scope="col" className="recent__col-category">
                Category
              </th>
              <th scope="col" className="recent__num">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const category = categories[transaction.categoryId];
              const date = formatShortDate(transaction.date);
              const isIncome = transaction.direction === 'in';

              return (
                <tr key={transaction.id}>
                  <th scope="row" className="recent__merchant">
                    <span className="recent__name">{transaction.merchant}</span>
                    {/* On narrow screens the date and category move under the merchant name. */}
                    <span className="recent__meta">
                      <time dateTime={transaction.date}>{date}</time> · {category.label}
                      {transaction.needsReview ? ' · Needs review' : ''}
                    </span>
                  </th>
                  <td className="recent__col-date">
                    <time dateTime={transaction.date}>{date}</time>
                  </td>
                  <td className="recent__col-category">
                    <div className="recent__chips">
                      <Chip>{category.label}</Chip>
                      {transaction.needsReview && <Chip tone="warning">Needs review</Chip>}
                    </div>
                  </td>
                  <td className="recent__num tabular">
                    {isIncome ? (
                      <span className="recent__income">
                        <span className="visually-hidden">Income </span>
                        {formatCurrency(transaction.amount, { signed: true })}
                      </span>
                    ) : (
                      formatCurrency(transaction.amount)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="recent__note">
        Categories are assigned automatically. Correct them in Transactions.
      </p>
    </Card>
  );
}
