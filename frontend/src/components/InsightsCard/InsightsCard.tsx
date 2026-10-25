import type { Insight } from '../../data/mockData';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import './InsightsCard.css';

interface InsightsCardProps {
  insights: Insight[];
  /** The range the insights describe, for example "1–25 Oct". */
  periodLabel: string;
}

const KIND_LABELS: Record<Insight['kind'], { text: string; tone: 'neutral' | 'warning' }> = {
  observed: { text: 'Observed', tone: 'neutral' },
  review: { text: 'Needs review', tone: 'warning' },
};

export function InsightsCard({ insights, periodLabel }: InsightsCardProps) {
  if (insights.length === 0) {
    return (
      <Card title="Insights" description="Nothing to flag right now.">
        <p className="insights__note">
          Insights appear here as you import more statements and spending patterns emerge.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Insights" description={`Patterns in your spending, ${periodLabel}`}>
      <ul className="insights__list">
        {insights.map((insight) => {
          const kind = KIND_LABELS[insight.kind];
          return (
            <li key={insight.id} className="insights__item">
              <Chip tone={kind.tone}>{kind.text}</Chip>
              <h3 className="insights__title">{insight.title}</h3>
              <p className="insights__detail">{insight.detail}</p>
            </li>
          );
        })}
      </ul>
      <p className="insights__note">
        Insights describe your imported data and are not financial advice.
      </p>
    </Card>
  );
}
