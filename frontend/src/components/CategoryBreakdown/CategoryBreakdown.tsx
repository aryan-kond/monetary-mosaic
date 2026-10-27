import { categories } from '../../data/categories';
import { formatCurrency } from '../../utils/formatCurrency';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import './CategoryBreakdown.css';
import type { CategorySpend } from '../../utils/spending';

interface CategoryBreakdownProps {
  spending: CategorySpend[];
  /** Date range shown in the card description, for example "1–25 Oct". */
  periodLabel: string;
}

/** Largest first, with "Other" always last. */
function sortSpending(spending: CategorySpend[]): CategorySpend[] {
  return [...spending].sort((a, b) => {
    if (a.categoryId === 'other') return 1;
    if (b.categoryId === 'other') return -1;
    return b.amount - a.amount;
  });
}

export function CategoryBreakdown({ spending, periodLabel }: CategoryBreakdownProps) {
  const rows = sortSpending(spending);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const largest = Math.max(...rows.map((row) => row.amount), 0);

  if (total === 0) {
    return (
      <Card
        title="Spending by category"
        description={`No categorized spending in ${periodLabel} yet.`}
      >
        <p className="category-note">Import a statement to see where your money goes.</p>
      </Card>
    );
  }

  return (
    <Card
      title="Spending by category"
      description={`${periodLabel}, ${formatCurrency(total)} in total`}
      action={<Chip>Inferred</Chip>}
    >
      <ul className="category-list">
        {rows.map((row) => {
          const category = categories[row.categoryId];
          const share = Math.round((row.amount / total) * 100);
          const barWidth = largest === 0 ? 0 : (row.amount / largest) * 100;

          return (
            <li key={row.categoryId} className="category-row">
              <div className="category-row__top">
                <span className="category-row__name">{category.label}</span>
                <span className="category-row__amount tabular">
                  <strong>{formatCurrency(row.amount)}</strong>
                  <span className="category-row__share">{share}%</span>
                </span>
              </div>
              <div className="category-row__track" aria-hidden="true">
                <div
                  className="category-row__fill"
                  style={{ width: `${barWidth}%`, background: category.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="category-note">
        Categories are assigned automatically and can be corrected in Transactions. Bars are scaled
        to the largest category.
      </p>
    </Card>
  );
}
