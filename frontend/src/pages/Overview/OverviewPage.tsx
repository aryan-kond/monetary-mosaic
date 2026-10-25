import { CategoryBreakdown } from '../../components/CategoryBreakdown/CategoryBreakdown';
import { ForecastCard } from '../../components/ForecastCard/ForecastCard';
import { InsightsCard } from '../../components/InsightsCard/InsightsCard';
import { RecentTransactions } from '../../components/RecentTransactions/RecentTransactions';
import { SpendingTrend } from '../../components/SpendingTrend/SpendingTrend';
import { SummaryCards } from '../../components/SummaryCards/SummaryCards';
import {
  categorySpending,
  dailySpending,
  forecastConfig,
  insights,
  summaryData,
  trendPeriods,
} from '../../data/mockData';
import { recentTransactions } from '../../data/transactions';
import { projectMonthEnd } from '../../utils/forecast';
import './OverviewPage.css';

interface OverviewPageProps {
  onViewAllTransactions: () => void;
}

export function OverviewPage({ onViewAllTransactions }: OverviewPageProps) {
  const forecast = projectMonthEnd(dailySpending.current, forecastConfig.daysInMonth);

  return (
    <div className="overview">
      <SummaryCards />

      <div className="overview__row">
        <div className="overview__grid overview__grid--analysis">
          <SpendingTrend
            current={{ ...trendPeriods.current, daily: dailySpending.current }}
            previous={{ ...trendPeriods.previous, daily: dailySpending.previous }}
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

      <RecentTransactions transactions={recentTransactions} onViewAll={onViewAllTransactions} />
    </div>
  );
}
