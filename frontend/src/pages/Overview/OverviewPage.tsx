import { SpendingTrend } from '../../components/SpendingTrend/SpendingTrend';
import { SummaryCards } from '../../components/SummaryCards/SummaryCards';
import { dailySpending, trendPeriods } from '../../data/mockData';
import './OverviewPage.css';

export function OverviewPage() {
  return (
    <div className="overview">
      <SummaryCards />
      <SpendingTrend
        current={{ ...trendPeriods.current, daily: dailySpending.current }}
        previous={{ ...trendPeriods.previous, daily: dailySpending.previous }}
      />
    </div>
  );
}
