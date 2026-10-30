import { CategoryBreakdown } from '../../components/CategoryBreakdown/CategoryBreakdown';
import { Card } from '../../components/Card/Card';
import { ForecastCard } from '../../components/ForecastCard/ForecastCard';
import { InsightsCard } from '../../components/InsightsCard/InsightsCard';
import { RecentTransactions } from '../../components/RecentTransactions/RecentTransactions';
import { SpendingTrend } from '../../components/SpendingTrend/SpendingTrend';
import { SummaryCards } from '../../components/SummaryCards/SummaryCards';
import { monthlyBudget } from '../../data/mockData';
import type { Transaction } from '../../data/transactions';
import { projectMonthEnd } from '../../utils/forecast';
import { buildInsights } from '../../utils/insights';
import { dailySpendingFor, totalIncome, transactionsInPeriod } from '../../utils/periods';
import type { ReportingPeriod } from '../../utils/reportingPeriod';
import { spendingByCategory } from '../../utils/spending';
import { findSort, sortTransactions } from '../../utils/transactionSort';
import './OverviewPage.css';

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

interface OverviewPageProps {
  transactions: Transaction[];
  /** The days the Overview covers, or null when there are no transactions. */
  period: ReportingPeriod | null;
  onViewAllTransactions: () => void;
}

export function OverviewPage({ transactions, period, onViewAllTransactions }: OverviewPageProps) {
  if (!period) {
    return (
      <Card
        title="Nothing to show yet"
        description="Your overview appears once you have transactions."
      >
        <p className="page-placeholder">
          Use Import statement at the top of the page to add a CSV statement.
        </p>
      </Card>
    );
  }

  // Every figure follows the transactions, so edits and imports show up here.
  const { previous } = period;
  const inPeriod = transactionsInPeriod(transactions, period.startDate, period.days);
  const inPrevious = transactionsInPeriod(transactions, previous.startDate, previous.days);

  const dailyCurrent = dailySpendingFor(inPeriod, period.startDate, period.days);
  const dailyPrevious = dailySpendingFor(inPrevious, previous.startDate, previous.days);
  const totalSpent = sum(dailyCurrent);
  const previousSpent = sum(dailyPrevious);
  // Without spending last month there is nothing honest to compare with.
  const hasPrevious = previousSpent > 0;

  const forecast = projectMonthEnd(dailyCurrent, period.daysInMonth);
  const categorySpending = spendingByCategory(inPeriod);
  const previousDining =
    spendingByCategory(inPrevious).find((row) => row.categoryId === 'dining')?.amount ?? 0;
  const insights = buildInsights({
    spending: categorySpending,
    reviewCount: transactions.filter((transaction) => transaction.needsReview).length,
    previousDining: hasPrevious ? previousDining : 0,
    previousMonthName: previous.monthName,
  });
  const recent = sortTransactions(transactions, findSort('date-desc')).slice(0, 8);

  return (
    <div className="overview">
      <SummaryCards
        totalSpent={totalSpent}
        totalIncome={totalIncome(inPeriod)}
        previousTotalSpent={previousSpent}
        previousTotalIncome={totalIncome(inPrevious)}
        previousPeriodShort={previous.shortLabel}
        monthlyBudget={monthlyBudget}
      />

      <div className="overview__row">
        <div className="overview__grid overview__grid--analysis">
          <SpendingTrend
            current={{
              label: period.shortLabel,
              month: period.month,
              caption: 'this month',
              daily: dailyCurrent,
            }}
            previous={
              hasPrevious
                ? {
                    label: previous.shortLabel,
                    month: previous.month,
                    caption: 'same days last month',
                    daily: dailyPrevious,
                  }
                : null
            }
            previousLabel={previous.shortLabel}
          />
          <CategoryBreakdown spending={categorySpending} periodLabel={period.shortLabel} />
        </div>
      </div>

      <div className="overview__row">
        <div className="overview__grid overview__grid--outlook">
          <ForecastCard
            forecast={forecast}
            budget={monthlyBudget}
            monthEndLabel={period.monthEndLabel}
            coverageLabel={period.shortLabel}
          />
          <InsightsCard insights={insights} periodLabel={period.shortLabel} />
        </div>
      </div>

      <RecentTransactions transactions={recent} onViewAll={onViewAllTransactions} />
    </div>
  );
}
