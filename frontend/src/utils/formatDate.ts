const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const longDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
const monthLong = new Intl.DateTimeFormat('en-IN', { month: 'long' });
const weekdayShort = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
const weekdayLong = new Intl.DateTimeFormat('en-IN', { weekday: 'long' });
const timeFormat = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "25 Oct". Built as a local date so it never shifts a day. */
export function formatShortDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "25 Oct 2026". */
export function formatFullDate(isoDate: string): string {
  return `${formatShortDate(isoDate)} ${parseIsoDate(isoDate).getFullYear()}`;
}

/** "Sunday 25 October 2026", for screen readers. */
export function formatLongDate(isoDate: string): string {
  return longDate.format(parseIsoDate(isoDate));
}

/** "October 2026". */
export function formatMonthYear(isoDate: string): string {
  return monthYear.format(parseIsoDate(isoDate));
}

/** "Oct". */
export function formatMonthShort(isoDate: string): string {
  return MONTHS_SHORT[parseIsoDate(isoDate).getMonth()];
}

/** "October". */
export function formatMonthName(isoDate: string): string {
  return monthLong.format(parseIsoDate(isoDate));
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
/** "29 Oct 2026, 3:42 pm", in the person's own time zone. */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}, ${timeFormat.format(date)}`;
}
