import { shiftIsoDate } from './formatDate';

/** A local date as YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parts(isoDate: string): [year: number, month: number, day: number] {
  const [year, month, day] = isoDate.split('-').map(Number);
  return [year, month - 1, day];
}

/** 0 for Monday through 6 for Sunday. */
export function weekdayIndex(isoDate: string): number {
  const [year, month, day] = parts(isoDate);
  return (new Date(year, month, day).getDay() + 6) % 7;
}

/** Moves by whole months, keeping the day where it exists (31 Jan plus one month is 28 Feb). */
export function addMonths(isoDate: string, months: number): string {
  const [year, month, day] = parts(isoDate);
  const lastDay = new Date(year, month + months + 1, 0).getDate();
  return toIsoDate(new Date(year, month + months, Math.min(day, lastDay)));
}

export interface CalendarDay {
  isoDate: string;
  /** False for the greyed days that belong to the previous or next month. */
  inMonth: boolean;
}

/** Six weeks starting on Monday, so the calendar keeps the same height every month. */
export function buildMonthGrid(cursorIso: string): CalendarDay[][] {
  const [year, month] = parts(cursorIso);
  const firstOfMonth = toIsoDate(new Date(year, month, 1));
  const gridStart = shiftIsoDate(firstOfMonth, -weekdayIndex(firstOfMonth));

  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const isoDate = shiftIsoDate(gridStart, week * 7 + day);
      return { isoDate, inMonth: parts(isoDate)[1] === month };
    }),
  );
}
