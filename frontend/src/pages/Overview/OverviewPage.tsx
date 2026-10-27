import { CategoryBreakdown } from '../../components/CategoryBreakdown/CategoryBreakdown';
import { ForecastCard } from '../../components/ForecastCard/ForecastCard';
import { InsightsCard } from '../../components/InsightsCard/InsightsCard';
import { RecentTransactions } from '../../components/RecentTransactions/RecentTransactions';
import { SpendingTrend } from '../../components/SpendingTrend/SpendingTrend';
import { SummaryCards } from '../../components/SummaryCards/SummaryCards';
import {
  forecastConfig,
  previousDailySpending,
  previousPeriod,
  reportingPeriod,
  summaryData,
  trendPeriods,
} from '../../data/mockData';
import type { Transaction } from '../../data/transactions';
import { projectMonthEnd } from '../../utils/forecast';
import { buildInsights } from '../../utils/insights';
import { dailySpendingFor, totalIncome, transactionsInPeriod } from '../../utils/periods';
import { spendingByCategory } from '../../utils/spending';
import { findSort, sortTransactions } from '../../utils/transactionSort';
import './OverviewPage.css';

interface OverviewPageProps {
  transactions: Transaction[];
  onViewAllTransactions: () => void;
}

export function OverviewPage({ transactions, onViewAllTransactions }: OverviewPageProps) {
  // Every figure here follows the transactions, so an edit on the Transactions screen shows up.
  const { startDate, days } = reportingPeriod;
  const inPeriod = transactionsInPeriod(transactions, startDate, days);
  const dailyCurrent = dailySpendingFor(inPeriod, startDate, days);
  const totalSpent = dailyCurrent.reduce((sum, amount) => sum + amount, 0);

  const forecast = projectMonthEnd(dailyCurrent, forecastConfig.daysInMonth);
  const categorySpending = spendingByCategory(inPeriod);
  const insights = buildInsights({
    spending: categorySpending,
    reviewCount: transactions.filter((transaction) => transaction.needsReview).length,
    previousDining: previousPeriod.diningSpend,
    previousMonthName: previousPeriod.monthName,
  });
  const recent = sortTransactions(transactions, findSort('date-desc')).slice(0, 8);

  return (
    <div className="overview">
      <SummaryCards totalSpent={totalSpent} totalIncome={totalIncome(inPeriod)} />

      <div className="overview__row">
        <div className="overview__grid overview__grid--analysis">
          <SpendingTrend
            current={{ ...trendPeriods.current, daily: dailyCurrent }}
            previous={{ ...trendPeriods.previous, daily: previousDailySpending }}
          />
          <CategoryBreakdown spending={categorySpending} periodLabel={trendPeriods.current.label} />
        </div>
      </div>

      <div className="overview__row">
        <div className="overview__grid overview__grid--outlook">
          <ForecastCard
            forecast={forecast}
            budget={summaryData.monthlyBudget}
            monthEndLabel={forecastConfig.monthEndLabel}
            coverageLabel={trendPeriods.current.label}
          />
          <InsightsCard insights={insights} periodLabel={trendPeriods.current.label} />
        </div>
      </div>

      <RecentTransactions transactions={recent} onViewAll={onViewAllTransactions} />
    </div>
  );
}
