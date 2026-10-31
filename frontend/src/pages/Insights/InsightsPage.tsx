import { useState } from 'react';
import { BarList, type BarItem } from '../../components/BarList/BarList';
import { Card } from '../../components/Card/Card';
import { CategoryChangeCard } from '../../components/CategoryChangeCard/CategoryChangeCard';
import { UnusualCard } from '../../components/UnusualCard/UnusualCard';
import type { Transaction } from '../../data/transactions';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  compareCategories,
  findUnusual,
  topMerchants,
  weekdayAverages,
} from '../../utils/insightStats';
import { transactionsInPeriod } from '../../utils/periods';
import type { ReportingPeriod } from '../../utils/reportingPeriod';
import { sum } from '../../utils/stats';
import './InsightsPage.css';

/** A weekday pattern needs at least two of each day to mean anything. */
const MIN_DAYS_FOR_WEEKDAYS = 14;
/** The top day has to beat the next by this share before it is called out. */
const CLEAR_LEAD = 0.1;

const money = (amount: number) => formatCurrency(Math.round(amount));
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
const spentIn = (items: Transaction[]) =>
  sum(items.filter((item) => item.direction === 'out').map((item) => item.amount));

interface InsightsPageProps {
  transactions: Transaction[];
  /** The days the screen covers, or null when there are no transactions. */
  period: ReportingPeriod | null;
  /** Payments the person marked as expected. These are transaction ids. */
  hiddenKeys: string[];
  onHide: (key: string) => void;
  onRestoreAll: () => void;
}

export function InsightsPage({
  transactions,
  period,
  hiddenKeys,
  onHide,
  onRestoreAll,
}: InsightsPageProps) {
  const [notice, setNotice] = useState<string | null>(null);

  if (!period) {
    return (
      <Card
        title="Nothing to look at yet"
        description="Insights appear once you have transactions."
      >
        <p className="page-placeholder">
          Import a statement from the Transactions screen. Two or more months work best.
        </p>
      </Card>
    );
  }

  const { previous } = period;
  const inPeriod = transactionsInPeriod(transactions, period.startDate, period.days);
  const inPrevious = transactionsInPeriod(transactions, previous.startDate, previous.days);
  const spent = spentIn(inPeriod);
  const previousSpent = spentIn(inPrevious);
  const hasPrevious = previousSpent > 0;

  // Average per day, compared with the same days last month.
  const perDay = spent / period.days;
  const perDayChange = hasPrevious
    ? ((perDay - previousSpent / previous.days) / (previousSpent / previous.days)) * 100
    : null;
  let perDaySub: string;
  if (perDayChange === null) perDaySub = `Nothing to compare with in ${previous.shortLabel}`;
  else if (Math.abs(perDayChange) < 0.05) perDaySub = `Same as ${previous.shortLabel}`;
  else
    perDaySub = `${Math.abs(perDayChange).toFixed(1)}% ${perDayChange > 0 ? 'higher' : 'lower'} than ${previous.shortLabel}`;

  // Which day of the week is busiest. If two days are close, we say it is even.
  const weekdays = period.days >= MIN_DAYS_FOR_WEEKDAYS ? weekdayAverages(inPeriod, period) : null;
  let busiestTitle = '—';
  let busiestSub = 'Needs about two weeks of spending';
  let busiestIndex: number | null = null;
  if (weekdays) {
    const [top, second] = [...weekdays].sort((a, b) => b.average - a.average);
    const clear =
      top.average > 0 &&
      (second.average === 0 || (top.average - second.average) / second.average >= CLEAR_LEAD);
    if (clear) {
      busiestTitle = top.label;
      busiestIndex = top.index;
      busiestSub = `About ${money(top.average)} on average, rent excluded`;
    } else {
      busiestTitle = 'Fairly even';
      busiestSub =
        top.average > 0
          ? `${top.label} and ${second.label} are highest, at about ${money(top.average)} and ${money(second.average)} a day`
          : 'No everyday spending yet';
    }
  }

  const merchants = topMerchants(inPeriod, 5);
  const topMerchant = merchants[0];
  const changes = compareCategories(inPeriod, inPrevious);

  const allUnusual = findUnusual(transactions, inPeriod);
  const unusual = allUnusual.filter((item) => !hiddenKeys.includes(item.transaction.id));
  const hiddenCount = allUnusual.length - unusual.length;

  const weekdayItems: BarItem[] = weekdays
    ? weekdays.map((day) => ({
        id: String(day.index),
        label: day.label,
        valueText: `${money(day.average)} a day`,
        detail: day.index === busiestIndex ? 'Busiest day' : undefined,
        fraction: day.average / Math.max(...weekdays.map((other) => other.average), 1),
      }))
    : [];
  const merchantItems: BarItem[] = merchants.map((merchant) => ({
    id: merchant.key,
    label: merchant.merchant,
    valueText: formatCurrency(merchant.total),
    detail: plural(merchant.payments, 'payment'),
    fraction: merchant.total / merchants[0].total,
  }));

  return (
    <div className="insights">
      {notice && (
        <div className="insights__notice" role="status">
          {notice}
        </div>
      )}

      <dl className="insight-tiles">
        <div>
          <dt>Average per day</dt>
          <dd className="tabular">{money(perDay)}</dd>
          <dd className="insight-tiles__sub">{perDaySub}</dd>
        </div>
        <div>
          <dt>Busiest day</dt>
          <dd>{busiestTitle}</dd>
          <dd className="insight-tiles__sub">{busiestSub}</dd>
        </div>
        <div>
          <dt>Top merchant</dt>
          <dd>{topMerchant ? topMerchant.merchant : '—'}</dd>
          <dd className="insight-tiles__sub">
            {topMerchant
              ? `${formatCurrency(topMerchant.total)} across ${plural(topMerchant.payments, 'payment')}, rent excluded`
              : 'No spending yet'}
          </dd>
        </div>
        <div>
          <dt>Worth a look</dt>
          <dd>{unusual.length}</dd>
          <dd className="insight-tiles__sub">
            {unusual.length > 0 ? 'Payments to check, below' : 'Nothing unusual found'}
          </dd>
        </div>
      </dl>

      <CategoryChangeCard
        changes={changes}
        currentLabel={period.shortLabel}
        previousLabel={previous.shortLabel}
        currentTotal={spent}
        previousTotal={previousSpent}
      />

      <div className="insights__row">
        <div className="insights__grid">
          <Card
            title="When you spend"
            description={`Average everyday spending on each day of the week, ${period.shortLabel}. Rent is left out.`}
          >
            {weekdays ? (
              <BarList items={weekdayItems} />
            ) : (
              <p className="insights__empty">
                A weekday pattern needs about two weeks of spending. It will appear as more days are
                added.
              </p>
            )}
          </Card>

          <Card
            title="Where it went"
            description={`The merchants that took the most money, ${period.shortLabel}. Rent is left out.`}
          >
            {merchants.length > 0 ? (
              <BarList items={merchantItems} />
            ) : (
              <p className="insights__empty">No spending found for this period yet.</p>
            )}
          </Card>
        </div>
      </div>

      <UnusualCard
        items={unusual}
        periodLabel={period.shortLabel}
        hiddenCount={hiddenCount}
        onHide={(item) => {
          onHide(item.transaction.id);
          setNotice(
            `Marked ${item.transaction.merchant} as expected. Use Show again to bring it back.`,
          );
        }}
        onRestoreAll={() => {
          onRestoreAll();
          setNotice('Showing every payment again.');
        }}
      />
    </div>
  );
}
