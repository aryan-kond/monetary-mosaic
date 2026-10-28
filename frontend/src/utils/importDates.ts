export type DateFormat = 'dmy' | 'mdy' | 'ymd';

export const dateFormatNames: Record<DateFormat, string> = {
  dmy: 'day/month/year',
  mdy: 'month/day/year',
  ymd: 'year/month/day',
};

const MONTH_SHORT = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type SplitDate =
  | { kind: 'named'; day: number; month: number; year: number }
  | { kind: 'ymd'; year: number; month: number; day: number }
  /** Two numbers that could be day and month in either order, such as 03/04/2026. */
  | { kind: 'pair'; first: number; second: number; year: number };

function expandYear(text: string): number {
  const year = Number(text);
  if (text.length >= 3) return year;
  return year < 70 ? 2000 + year : 1900 + year;
}

function monthNumber(name: string): number | null {
  const index = MONTH_SHORT.indexOf(name.slice(0, 3).toLowerCase());
  return index === -1 ? null : index + 1;
}

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function toIso(year: number, month: number, day: number): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Breaks a date written in a common style into parts, without deciding day versus month yet. */
function splitDate(value: string): SplitDate | null {
  // Ignore a time of day after the date.
  const text = value
    .trim()
    .split(/[T\s](?=\d{1,2}:\d{2})/)[0]
    .trim();

  const dayThenName = text.match(/^(\d{1,2})[\s\-/.]+([A-Za-z]{3,9})\.?[\s\-/.,]+(\d{2}|\d{4})$/);
  if (dayThenName) {
    const month = monthNumber(dayThenName[2]);
    return month
      ? { kind: 'named', day: Number(dayThenName[1]), month, year: expandYear(dayThenName[3]) }
      : null;
  }

  const nameThenDay = text.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{2}|\d{4})$/);
  if (nameThenDay) {
    const month = monthNumber(nameThenDay[1]);
    return month
      ? { kind: 'named', day: Number(nameThenDay[2]), month, year: expandYear(nameThenDay[3]) }
      : null;
  }

  const yearFirst = text.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (yearFirst) {
    return {
      kind: 'ymd',
      year: Number(yearFirst[1]),
      month: Number(yearFirst[2]),
      day: Number(yearFirst[3]),
    };
  }

  const pair = text.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})$/);
  if (pair) {
    return {
      kind: 'pair',
      first: Number(pair[1]),
      second: Number(pair[2]),
      year: expandYear(pair[3]),
    };
  }

  return null;
}

function looksLikeDate(value: string): boolean {
  const split = splitDate(value);
  if (!split) return false;
  if (split.kind === 'pair') {
    return split.first >= 1 && split.first <= 31 && split.second >= 1 && split.second <= 31;
  }
  return isRealDate(split.year, split.month, split.day);
}

/** The share of values (0 to 1) that look like a date. */
export function dateShare(values: string[]): number {
  if (values.length === 0) return 0;
  return values.filter(looksLikeDate).length / values.length;
}

/** Turns a date from the file into YYYY-MM-DD, or null when it cannot be read. */
export function parseDateValue(value: string, format: DateFormat): string | null {
  const split = splitDate(value);
  if (!split) return null;

  let year: number;
  let month: number;
  let day: number;

  if (split.kind === 'pair') {
    year = split.year;
    if (format === 'mdy') {
      month = split.first;
      day = split.second;
    } else {
      day = split.first;
      month = split.second;
    }
  } else {
    ({ year, month, day } = split);
  }

  return isRealDate(year, month, day) ? toIso(year, month, day) : null;
}

export interface DateFormatDetection {
  /** The format when it is clear, otherwise null. */
  format: DateFormat | null;
  /** True when day and month could be either way, so the person has to say. */
  ambiguous: boolean;
  /** True when the dates use more than one style, so no single format fits them. */
  mixed: boolean;
  /** One date from the file, shown both ways, for the question. */
  example?: { text: string; dayFirst: string; monthFirst: string };
}

export function detectDateFormat(values: string[]): DateFormatDetection {
  const splits: { text: string; split: SplitDate }[] = [];
  for (const text of values) {
    const split = splitDate(text);
    if (split && looksLikeDate(text)) splits.push({ text, split });
  }
  if (splits.length === 0) return { format: null, ambiguous: false, mixed: false };

  const pairs = splits.flatMap(({ text, split }) =>
    split.kind === 'pair' ? [{ text, ...split }] : [],
  );
  const yearFirstCount = splits.filter(({ split }) => split.kind === 'ymd').length;

  if (pairs.length > 0 && yearFirstCount > 0)
    return { format: null, ambiguous: false, mixed: true };
  if (pairs.length === 0) {
    return { format: yearFirstCount > 0 ? 'ymd' : 'dmy', ambiguous: false, mixed: false };
  }

  const dayFirst = pairs.some((pair) => pair.first > 12);
  const monthFirst = pairs.some((pair) => pair.second > 12);
  if (dayFirst && monthFirst) return { format: null, ambiguous: false, mixed: true };
  if (dayFirst) return { format: 'dmy', ambiguous: false, mixed: false };
  if (monthFirst) return { format: 'mdy', ambiguous: false, mixed: false };

  // Every value could be read either way. If none of them would differ, it does not matter.
  const example = pairs.find((pair) => pair.first !== pair.second);
  if (!example) return { format: 'dmy', ambiguous: false, mixed: false };

  return {
    format: null,
    ambiguous: true,
    mixed: false,
    example: {
      text: example.text,
      dayFirst: `${example.first} ${MONTH_LONG[example.second - 1]} ${example.year}`,
      monthFirst: `${example.second} ${MONTH_LONG[example.first - 1]} ${example.year}`,
    },
  };
}
