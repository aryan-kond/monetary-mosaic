import { addMonths } from './calendar';
import {
  daysBetween,
  formatFullDate,
  formatMonthName,
  formatMonthShort,
  formatShortDate,
  shiftIsoDate,
} from './formatDate';

/** A run of days at the start of a month. */
export interface PeriodRange {
  /** YYYY-MM-DD. */
  startDate: string;
  days: number;
  /** For example "1 Oct – 25 Oct 2026". */
  label: string;
  /** For example "1–25 Oct". */
  shortLabel: string;
  /** For example "Oct". */
  month: string;
  /** For example "October". */
  monthName: string;
}

export interface ReportingPeriod extends PeriodRange {
  /** The latest transaction date. */
  endDate: string;
  daysInMonth: number;
  /** For example "31 Oct". */
  monthEndLabel: string;
  /** The same days of the month before, so comparisons are fair. It can be shorter than this period. */
  previous: PeriodRange;
}

function monthRange(startDate: string, days: number): PeriodRange {
  const endDate = shiftIsoDate(startDate, days - 1);
  const month = formatMonthShort(startDate);

  return {
    startDate,
    days,
    label: `${formatShortDate(startDate)} – ${formatFullDate(endDate)}`,
    shortLabel: `${Number(startDate.slice(8))}–${Number(endDate.slice(8))} ${month}`,
    month,
    monthName: formatMonthName(startDate),
  };
}

/**
 * The Overview covers the month of the most recent transaction, from the 1st to that day. It is
 * compared with the same days of the month before. Returns null when there are no transactions.
 */
export function getReportingPeriod(items: { date: string }[]): ReportingPeriod | null {
  if (items.length === 0) return null;

  const latest = items.reduce((max, item) => (item.date > max ? item.date : max), items[0].date);
  const startDate = `${latest.slice(0, 8)}01`;
  const days = daysBetween(startDate, latest) + 1;

  const previousStart = addMonths(startDate, -1);
  const daysInPreviousMonth = daysBetween(previousStart, startDate);
  const monthEnd = shiftIsoDate(addMonths(startDate, 1), -1);

  return {
    ...monthRange(startDate, days),
    endDate: latest,
    daysInMonth: Number(monthEnd.slice(8)),
    monthEndLabel: formatShortDate(monthEnd),
    previous: monthRange(previousStart, Math.min(days, daysInPreviousMonth)),
  };
}
