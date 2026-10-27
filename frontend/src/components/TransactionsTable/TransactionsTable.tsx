import { categories } from '../../data/categories';
import type { Transaction } from '../../data/transactions';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatShortDate } from '../../utils/formatDate';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import './TransactionsTable.css';

interface TransactionsTableProps {
  transactions: Transaction[];
  /** Read by screen readers only. */
  caption: string;
  /** When given, every row gets an Edit button (Review when the category is uncertain). */
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionsTable({ transactions, caption, onEdit }: TransactionsTableProps) {
  return (
    <div className="txn-table-wrap">
      <table className="txn-table">
        <caption className="visually-hidden">{caption}</caption>
        {/* The four data columns share the width equally. The button column is fixed. */}
        <colgroup>
          <col />
          <col />
          <col className="txn-table__col-category" />
          <col />
          {onEdit && <col className="txn-table__col-action" />}
        </colgroup>
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
            {onEdit && (
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const category = categories[transaction.categoryId];
            const date = formatShortDate(transaction.date);
            const isIncome = transaction.direction === 'in';
            const actionLabel = transaction.needsReview ? 'Review' : 'Edit';

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
                  <div className="txn-table__category-cell">
                    <span>{category.label}</span>
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
                {onEdit && (
                  <td>
                    <Button
                      variant="secondary"
                      size="compact"
                      className="txn-table__edit"
                      aria-label={`${actionLabel} ${transaction.merchant} transaction`}
                      onClick={() => onEdit(transaction)}
                    >
                      {actionLabel}
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
