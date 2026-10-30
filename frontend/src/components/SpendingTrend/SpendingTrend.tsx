import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import './SpendingTrend.css';

// Chart colors mirror the design tokens. Recharts draws SVG, so we pass hex values directly.
const CURRENT_COLOR = '#3366CC'; // --color-primary
const PREVIOUS_COLOR = '#788397'; // --color-text-muted
const GRID_COLOR = '#E2E8F0'; // --color-border
const AXIS_TEXT_COLOR = '#596579'; // --color-text-secondary
/** Guidelines: chart transitions use 300-400 ms. */
const ANIMATION_MS = 350;

export interface TrendPeriod {
  /** Date range, for example "1–25 Oct". */
  label: string;
  /** Month abbreviation used in day labels, for example "Oct". */
  month: string;
  /** Plain-language description, for example "this month". */
  caption: string;
  /** Spending for each day, starting at day 1. */
  daily: number[];
}

interface SpendingTrendProps {
  current: TrendPeriod;
  /** Null when there is no spending in the comparison period, so nothing is made up. */
  previous: TrendPeriod | null;
  /** Named in the card when there is nothing to compare with, for example "1–25 Sep". */
  previousLabel: string;
}

interface TrendPoint {
  day: number;
  current: number;
  /** Missing when the comparison month has no such day. */
  previous?: number;
  currentDate: string;
  previousDate?: string;
}

function toCumulative(daily: number[]): number[] {
  let running = 0;
  return daily.map((amount) => {
    running += amount;
    return running;
  });
}

function buildPoints(current: TrendPeriod, previous: TrendPeriod | null): TrendPoint[] {
  const currentTotals = toCumulative(current.daily);
  const previousTotals = previous ? toCumulative(previous.daily) : [];

  return currentTotals.map((total, index) => {
    const hasPrevious = previous !== null && index < previousTotals.length;
    return {
      day: index + 1,
      current: total,
      previous: hasPrevious ? previousTotals[index] : undefined,
      currentDate: `${index + 1} ${current.month}`,
      previousDate: hasPrevious ? `${index + 1} ${previous.month}` : undefined,
    };
  });
}

function LineSwatch({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <svg className="trend__swatch" width="32" height="8" viewBox="0 0 32 8" aria-hidden="true">
      <line
        x1="1"
        y1="4"
        x2="31"
        y2="4"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={dashed ? '6 5' : undefined}
      />
    </svg>
  );
}

function TrendTooltip({ point }: { point: TrendPoint }) {
  return (
    <div className="trend-tooltip">
      <p className="trend-tooltip__title">Cumulative spending</p>
      <p className="trend-tooltip__row">
        <LineSwatch color={CURRENT_COLOR} />
        <span>{point.currentDate}</span>
        <strong className="tabular">{formatCurrency(point.current)}</strong>
      </p>
      {point.previous !== undefined && (
        <p className="trend-tooltip__row">
          <LineSwatch color={PREVIOUS_COLOR} dashed />
          <span>{point.previousDate}</span>
          <strong className="tabular">{formatCurrency(point.previous)}</strong>
        </p>
      )}
    </div>
  );
}

interface TooltipRenderProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}

function renderTrendTooltip({ active, payload }: TooltipRenderProps) {
  if (!active || !payload || payload.length === 0) return null;
  return <TrendTooltip point={payload[0].payload as TrendPoint} />;
}

export function SpendingTrend({ current, previous, previousLabel }: SpendingTrendProps) {
  const [showTable, setShowTable] = useState(false);
  const reducedMotion = useReducedMotion();
  const points = buildPoints(current, previous);

  const toggle = (
    <Button variant="secondary" onClick={() => setShowTable((value) => !value)}>
      {showTable ? 'View chart' : 'View data table'}
    </Button>
  );

  if (points.length === 0) {
    return (
      <Card title="Spending trend" description="No spending data for this period yet.">
        <p className="trend__note">Import a statement to see how your spending is trending.</p>
      </Card>
    );
  }

  const last = points[points.length - 1];
  const lastCompared = [...points].reverse().find((point) => point.previous !== undefined);
  const compared =
    lastCompared && lastCompared.previous
      ? { day: lastCompared.day, current: lastCompared.current, previous: lastCompared.previous }
      : null;
  const change = compared
    ? ((compared.current - compared.previous) / compared.previous) * 100
    : null;

  const summary =
    compared && change !== null
      ? `Line chart of cumulative spending. By day ${compared.day}, spending is ` +
        `${formatCurrency(compared.current)} in ${current.label}, compared with ` +
        `${formatCurrency(compared.previous)} in ${previous?.label ?? previousLabel}, which is ` +
        `${Math.abs(change).toFixed(1)}% ${change >= 0 ? 'higher' : 'lower'}.`
      : `Line chart of cumulative spending in ${current.label}. By day ${last.day}, spending is ` +
        `${formatCurrency(last.current)}.`;

  const description = previous
    ? `Cumulative spending, ${current.label} compared with ${previous.label}`
    : `Cumulative spending, ${current.label}. No spending found for ${previousLabel} to compare with.`;

  const ticks = points
    .map((point) => point.day)
    .filter((day) => day === 1 || day % 5 === 0 || (day === last.day && day % 5 >= 3));

  return (
    <Card title="Spending trend" description={description} action={toggle}>
      <ul className="trend__legend">
        <li className="trend__legend-item">
          <span className="trend__legend-label">
            <LineSwatch color={CURRENT_COLOR} />
            {current.label} ({current.caption})
          </span>
          <strong className="trend__legend-value tabular">{formatCurrency(last.current)}</strong>
        </li>
        {previous && compared && (
          <li className="trend__legend-item">
            <span className="trend__legend-label">
              <LineSwatch color={PREVIOUS_COLOR} dashed />
              {previous.label} ({previous.caption})
            </span>
            <strong className="trend__legend-value tabular">
              {formatCurrency(compared.previous)}
            </strong>
          </li>
        )}
      </ul>

      {showTable ? (
        <div
          className="trend__table-wrap"
          role="region"
          aria-label="Cumulative spending data table"
          tabIndex={0}
          data-lenis-prevent
        >
          <table className="trend__table">
            <caption className="visually-hidden">Cumulative spending by day</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col" className="trend__num">
                  {current.label}
                </th>
                {previous && (
                  <th scope="col" className="trend__num">
                    {previous.label}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.day}>
                  <th scope="row">Day {point.day}</th>
                  <td className="trend__num tabular">{formatCurrency(point.current)}</td>
                  {previous && (
                    <td className="trend__num tabular">
                      {point.previous === undefined ? '—' : formatCurrency(point.previous)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="trend__chart" role="img" aria-label={summary}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={points}
                margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
                accessibilityLayer={false}
              >
                <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                <XAxis
                  dataKey="day"
                  ticks={ticks}
                  tickLine={false}
                  tickMargin={8}
                  axisLine={{ stroke: GRID_COLOR }}
                  tick={{ fill: AXIS_TEXT_COLOR, fontSize: 13 }}
                />
                <YAxis
                  width={60}
                  tickCount={5}
                  domain={[0, 'auto']}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: AXIS_TEXT_COLOR, fontSize: 13 }}
                  tickFormatter={(value: number) => formatCompactCurrency(value)}
                />
                <Tooltip
                  cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }}
                  isAnimationActive={false}
                  content={renderTrendTooltip}
                />
                {previous && (
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke={PREVIOUS_COLOR}
                    strokeWidth={2}
                    strokeDasharray="6 5"
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={!reducedMotion}
                    animationDuration={ANIMATION_MS}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke={CURRENT_COLOR}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={!reducedMotion}
                  animationDuration={ANIMATION_MS}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="trend__note">
            Horizontal axis: day of the month. Vertical axis: cumulative spending in rupees.
          </p>
        </>
      )}
    </Card>
  );
}
