import { categories } from '../../data/categories';
import type { CategoryChange } from '../../utils/insightStats';
import { formatCurrency } from '../../utils/formatCurrency';
import { Card } from '../Card/Card';
import './CategoryChangeCard.css';

interface CategoryChangeCardProps {
  changes: CategoryChange[];
  /** For example "1–25 Oct". */
  currentLabel: string;
  /** For example "1–25 Sep". */
  previousLabel: string;
  currentTotal: number;
  previousTotal: number;
}

/** "₹780 more (+18%)". Plain words, so a change is never judged good or bad. */
function changeText(change: number, percent: number | null): string {
  if (Math.abs(change) < 0.5) return 'No change';
  const words = `${formatCurrency(Math.abs(change))} ${change > 0 ? 'more' : 'less'}`;
  if (percent === null) return `${words} (new this month)`;
  if (Math.abs(percent) < 0.5) return words;
  return `${words} (${change > 0 ? '+' : '−'}${Math.abs(percent).toFixed(0)}%)`;
}

export function CategoryChangeCard({
  changes,
  currentLabel,
  previousLabel,
  currentTotal,
  previousTotal,
}: CategoryChangeCardProps) {
  const hasPrevious = previousTotal > 0;
  const totalChange = currentTotal - previousTotal;
  const totalPercent = hasPrevious ? (totalChange / previousTotal) * 100 : null;

  return (
    <Card
      title="What changed"
      description={
        hasPrevious
          ? `Spending by category, ${currentLabel} compared with the same days in ${previousLabel}. Biggest changes first.`
          : `Spending by category, ${currentLabel}.`
      }
    >
      {hasPrevious ? (
        <div className="change-wrap">
          {/* The roles keep this a table for screen readers even when CSS stacks the rows. */}
          <table className="change-table" role="table">
            <caption className="visually-hidden">
              Spending by category compared with the same days last month
            </caption>
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader" scope="col">
                  Category
                </th>
                <th role="columnheader" scope="col">
                  {currentLabel}
                </th>
                <th role="columnheader" scope="col">
                  {previousLabel}
                </th>
                <th role="columnheader" scope="col">
                  Change
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {changes.map((row) => (
                <tr key={row.categoryId} role="row">
                  <td role="cell" className="change-table__name">
                    {categories[row.categoryId].label}
                  </td>
                  <td role="cell" className="change-table__now tabular">
                    {formatCurrency(row.current)}
                  </td>
                  <td role="cell" className="change-table__before tabular">
                    {formatCurrency(row.previous)}
                  </td>
                  <td role="cell" className="change-table__change">
                    {changeText(row.change, row.changePercent)}
                  </td>
                </tr>
              ))}
              <tr role="row" className="change-table__total">
                <td role="cell" className="change-table__name">
                  Total spending
                </td>
                <td role="cell" className="change-table__now tabular">
                  {formatCurrency(currentTotal)}
                </td>
                <td role="cell" className="change-table__before tabular">
                  {formatCurrency(previousTotal)}
                </td>
                <td role="cell" className="change-table__change">
                  {changeText(totalChange, totalPercent)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="change-empty">
          No spending was found for {previousLabel}, so there is nothing to compare with yet.
        </p>
      )}
    </Card>
  );
}
