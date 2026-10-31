import { categories } from '../../data/categories';
import { formatCurrency } from '../../utils/formatCurrency';
import { daysBetween, formatShortDate } from '../../utils/formatDate';
import type { RecurringPattern } from '../../utils/recurring';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import './RecurringList.css';

interface RecurringListProps {
  patterns: RecurringPattern[];
  /** The latest transaction date. Days to the next payment are counted from here. */
  asOf: string;
  hiddenCount: number;
  onHide: (pattern: RecurringPattern) => void;
  onRestoreAll: () => void;
}

function relativeDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days > 1) return `in ${days} days`;
  if (days === -1) return 'yesterday';
  return `${-days} days ago`;
}

export function RecurringList({
  patterns,
  asOf,
  hiddenCount,
  onHide,
  onRestoreAll,
}: RecurringListProps) {
  return (
    <Card
      title="Detected payments"
      description="We found these by looking for the same merchant being paid at a steady rhythm. They are inferred, so check them and hide any that are wrong. Expected dates are estimates."
      action={<Chip>Inferred</Chip>}
    >
      {patterns.length === 0 ? (
        <p className="recurring-empty">
          No recurring payments found yet. We look for payments to the same merchant about a month
          apart, or every week, with similar amounts. It works best with at least two months of
          transactions.
        </p>
      ) : (
        <ul className="recurring-list">
          {patterns.map((pattern) => {
            const daysToNext = daysBetween(asOf, pattern.nextDate);
            const shownDates = pattern.payments
              .slice(-4)
              .map((payment) => formatShortDate(payment.date));

            return (
              <li key={pattern.key} className="recurring-row">
                <div className="recurring-row__head">
                  <div>
                    <h3 className="recurring-row__name">{pattern.merchant}</h3>
                    <p className="recurring-row__meta">
                      {categories[pattern.categoryId].label} ·{' '}
                      {pattern.cadence === 'monthly' ? 'Every month' : 'Every week'}
                    </p>
                  </div>
                  <div className="recurring-row__side">
                    <div className="recurring-row__amount">
                      <p className="recurring-row__price tabular">
                        {pattern.fixedAmount
                          ? formatCurrency(pattern.typical)
                          : `${formatCurrency(pattern.min)} to ${formatCurrency(pattern.max)}`}
                      </p>
                      {!pattern.fixedAmount && (
                        <p className="recurring-row__meta">
                          Usually about {formatCurrency(pattern.typical)}
                        </p>
                      )}
                    </div>
                    <Chip tone={pattern.confidence === 'likely' ? 'neutral' : 'warning'}>
                      {pattern.confidence === 'likely' ? 'Likely' : 'Possible'}
                    </Chip>
                  </div>
                </div>

                <div className="recurring-row__details">
                  <p>
                    Last paid <strong>{formatShortDate(pattern.lastDate)}</strong>.{' '}
                    {daysToNext >= 0 ? (
                      <>
                        Next expected <strong>{formatShortDate(pattern.nextDate)}</strong> (
                        {relativeDays(daysToNext)}).
                      </>
                    ) : (
                      <>
                        Expected <strong>{formatShortDate(pattern.nextDate)}</strong> (
                        {relativeDays(daysToNext)}) and not seen yet.
                      </>
                    )}
                  </p>
                  <p>
                    Seen {pattern.payments.length} times
                    {pattern.payments.length > shownDates.length ? ', most recently' : ''}:{' '}
                    {shownDates.join(', ')}.
                  </p>
                </div>

                <div>
                  <Button
                    variant="secondary"
                    size="compact"
                    aria-label={`Hide ${pattern.merchant} from recurring payments`}
                    onClick={() => onHide(pattern)}
                  >
                    Not recurring
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenCount > 0 && (
        <div className="recurring-hidden">
          <p>{hiddenCount} hidden</p>
          <Button variant="secondary" size="compact" onClick={onRestoreAll}>
            Restore hidden
          </Button>
        </div>
      )}
    </Card>
  );
}
