const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Formats an ISO date (YYYY-MM-DD) as, for example, "25 Oct". Built as a local date so it never shifts a day. */
export function formatShortDate(isoDate: string): string {
  return shortDate.format(parseIsoDate(isoDate));
}

/** Returns the ISO date that many days before (negative) or after (positive) the given one. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
