const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const fullDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const longDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
const weekdayShort = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
const weekdayLong = new Intl.DateTimeFormat('en-IN', { weekday: 'long' });

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "25 Oct". Built as a local date so it never shifts a day. */
export function formatShortDate(isoDate: string): string {
  return shortDate.format(parseIsoDate(isoDate));
}

/** "25 Oct 2026". */
export function formatFullDate(isoDate: string): string {
  return fullDate.format(parseIsoDate(isoDate));
}

/** "Sunday 25 October 2026", for screen readers. */
export function formatLongDate(isoDate: string): string {
  return longDate.format(parseIsoDate(isoDate));
}

/** "October 2026". */
export function formatMonthYear(isoDate: string): string {
  return monthYear.format(parseIsoDate(isoDate));
}

/** Day names starting on Monday, for example { short: 'Mon', long: 'Monday' }. */
export const weekdayNames = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(2026, 9, 5 + index); // 5 Oct 2026 is a Monday
  return { short: weekdayShort.format(date), long: weekdayLong.format(date) };
});

/** Returns the ISO date that many days before (negative) or after (positive) the given one. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whole days from one ISO date to another. Negative when the second date is earlier. */
export function daysBetween(startIso: string, endIso: string): number {
  const toUtc = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtc(endIso) - toUtc(startIso)) / 86400000);
}
