const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

/** Formats an ISO date (YYYY-MM-DD) as, for example, "25 Oct". Built as a local date so it never shifts a day. */
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return shortDate.format(new Date(year, month - 1, day));
}
