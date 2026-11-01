import { categories } from '../../data/categories';
import type { Transaction } from '../../data/transactions';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatShortDate } from '../../utils/formatDate';
import { ActionMenu, type ActionMenuItem } from '../ActionMenu/ActionMenu';
import { Chip } from '../Chip/Chip';
import './TransactionsTable.css';

interface TransactionsTableProps {
  transactions: Transaction[];
  /** Read by screen readers only. */
  caption: string;
  /** When given, every row gets an actions menu that starts with Edit (or Review). */
  onEdit?: (transaction: Transaction) => void;
  /** When given, the actions menu also offers Delete. */
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  caption,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="txn-table-wrap">
      <table className="txn-table">
        <caption className="visually-hidden">{caption}</caption>
        {/* The four data columns share the width equally. The actions column is narrow and fixed. */}
        <colgroup>
          <col />
          <col />
          <col className="txn-table__col-category" />
          <col />
          {hasActions && <col className="txn-table__col-action" />}
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
            {hasActions && (
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

            const items: ActionMenuItem[] = [];
            if (onEdit) {
              items.push({
                id: 'edit',
                label: transaction.needsReview ? 'Review category' : 'Edit',
                onSelect: () => onEdit(transaction),
              });
            }
            if (onDelete) {
              items.push({
                id: 'delete',
                label: 'Delete',
                destructive: true,
                onSelect: () => onDelete(transaction),
              });
            }

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
                {hasActions && (
                  <td className="txn-table__actions">
                    <ActionMenu
                      label={`Actions for ${transaction.merchant}, ${date}`}
                      items={items}
                    />
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
