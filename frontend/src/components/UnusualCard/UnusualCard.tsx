import { categories } from '../../data/categories';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatShortDate } from '../../utils/formatDate';
import type { UnusualItem } from '../../utils/insightStats';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import './UnusualCard.css';

interface UnusualCardProps {
  items: UnusualItem[];
  /** For example "1–25 Oct". */
  periodLabel: string;
  hiddenCount: number;
  onHide: (item: UnusualItem) => void;
  onRestoreAll: () => void;
}

export function UnusualCard({
  items,
  periodLabel,
  hiddenCount,
  onHide,
  onRestoreAll,
}: UnusualCardProps) {
  return (
    <Card
      title="Worth a look"
      description="Payments that stand out against your usual amounts, or look like a double charge. This is a prompt to check, not a judgment, and nothing here is changed."
      action={<Chip>Inferred</Chip>}
    >
      {items.length === 0 ? (
        <p className="unusual-empty">
          Nothing unusual found in {periodLabel}. We compare each payment with your usual amounts
          for its category, and look for the same amount paid twice in a row.
        </p>
      ) : (
        <ul className="unusual-list">
          {items.map((item) => {
            const { transaction } = item;
            return (
              <li key={transaction.id} className="unusual-row">
                <div className="unusual-row__head">
                  <div>
                    <h3 className="unusual-row__name">{transaction.merchant}</h3>
                    <p className="unusual-row__meta">
                      {formatShortDate(transaction.date)} ·{' '}
                      {categories[transaction.categoryId].label}
                    </p>
                  </div>
                  <p className="unusual-row__amount tabular">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <p className="unusual-row__reason">
                  <strong>
                    {item.kind === 'large' ? 'Larger than usual.' : 'Possible repeat.'}
                  </strong>{' '}
                  {item.reason}
                </p>
                <div>
                  <Button
                    variant="secondary"
                    size="compact"
                    aria-label={`Mark ${transaction.merchant} on ${formatShortDate(transaction.date)} as expected`}
                    onClick={() => onHide(item)}
                  >
                    Looks fine
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenCount > 0 && (
        <div className="unusual-hidden">
          <p>{hiddenCount} marked as expected</p>
          <Button variant="secondary" size="compact" onClick={onRestoreAll}>
            Show again
          </Button>
        </div>
      )}
    </Card>
  );
}
