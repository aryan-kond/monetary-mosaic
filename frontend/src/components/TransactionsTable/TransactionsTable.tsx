import { categories } from '../../data/categories';
import type { Transaction } from '../../data/transactions';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatShortDate } from '../../utils/formatDate';
import { Chip } from '../Chip/Chip';
import './TransactionsTable.css';

interface TransactionsTableProps {
  transactions: Transaction[];
  /** Read by screen readers only. */
  caption: string;
}

export function TransactionsTable({ transactions, caption }: TransactionsTableProps) {
  return (
    <div className="txn-table-wrap">
      <table className="txn-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Merchant</th>
            <th scope="col" className="txn-table__date">
              Date
            </th>
            <th scope="col" className="txn-table__category">
              Category
            </th>
            <th scope="col" className="txn-table__amount">
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
                <th scope="row" className="txn-table__merchant">
                  <span className="txn-table__name">{transaction.merchant}</span>
                  {/* On narrow screens the category column folds into this line. */}
                  <span className="txn-table__meta">
                    {category.label}
                    {transaction.needsReview ? ' · Needs review' : ''}
                  </span>
                </th>
                <td className="txn-table__date">
                  <time dateTime={transaction.date}>{date}</time>
                </td>
                <td className="txn-table__category">
                  <div className="txn-table__chips">
                    <Chip>{category.label}</Chip>
                    {transaction.needsReview && <Chip tone="warning">Needs review</Chip>}
                  </div>
                </td>
                <td className="txn-table__amount tabular">
                  {isIncome ? (
                    <span className="txn-table__income">
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
  );
}
