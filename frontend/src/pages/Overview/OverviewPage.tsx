import { CategoryBreakdown } from '../../components/CategoryBreakdown/CategoryBreakdown';
import { SpendingTrend } from '../../components/SpendingTrend/SpendingTrend';
import { SummaryCards } from '../../components/SummaryCards/SummaryCards';
import { categorySpending, dailySpending, trendPeriods } from '../../data/mockData';
import './OverviewPage.css';

export function OverviewPage() {
  return (
    <div className="overview">
      <SummaryCards />
      <div className="overview__analysis">
        <div className="overview__analysis-grid">
          <SpendingTrend
            current={{ ...trendPeriods.current, daily: dailySpending.current }}
            previous={{ ...trendPeriods.previous, daily: dailySpending.previous }}
          />
          <CategoryBreakdown spending={categorySpending} periodLabel={trendPeriods.current.label} />
        </div>
      </div>
    </div>
  );
}
