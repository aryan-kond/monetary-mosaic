import type { ParsedCsv } from './csv';
import { numberShare, summarizeAmounts } from './importAmounts';
import { dateShare, detectDateFormat } from './importDates';
import {
  columnValues,
  type AmountLayout,
  type ColumnMapping,
  type FieldKey,
  type SignConvention,
} from './importMapping';

type Kind =
  'balance' | 'debit' | 'credit' | 'date' | 'description' | 'category' | 'currency' | 'amount';

/** Patterns that recognize column names. A higher number means a clearer match. */
const HEADER_RULES: Record<Kind, [RegExp, number][]> = {
  balance: [[/balance|\bbal\b/, 3]],
  debit: [
    [/^(debit|withdrawals?|dr)( amount| amt)?$/, 3],
    [/debit|withdraw|paid out|money out|\bdr\b/, 2],
  ],
  credit: [
    [/^(credit|deposits?|cr)( amount| amt)?$/, 3],
    [/credit|deposit|paid in|money in|\bcr\b/, 2],
  ],
  date: [
    [/^(transaction |txn |trans )?(date|dt)$/, 3],
    [/\bdate\b|\bdt\b/, 2],
    [/posted|posting/, 1],
  ],
  description: [
    [/^(description|narration|particulars|details|transaction details|merchant|payee)$/, 3],
    [/description|narration|particulars|merchant|payee|details|memo/, 2],
    [/remarks?|reference|\bnote\b/, 1],
  ],
  category: [
    [/^category$/, 3],
    [/category/, 2],
  ],
  currency: [[/^(currency|ccy)$/, 3]],
  amount: [
    [/^(transaction )?(amount|amt)( inr)?$/, 3],
    [/amount|\bamt\b|\bvalue\b/, 2],
  ],
};

/** When two kinds match equally well, the earlier one wins. */
const KIND_ORDER: Kind[] = [
  'balance',
  'debit',
  'credit',
  'date',
  'description',
  'category',
  'currency',
  'amount',
];

interface HeaderMatch {
  kind: Kind | null;
  score: number;
}

function matchHeader(header: string): HeaderMatch {
  const text = header
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  let best: HeaderMatch = { kind: null, score: 0 };

  for (const kind of KIND_ORDER) {
    for (const [pattern, score] of HEADER_RULES[kind]) {
      if (pattern.test(text) && score > best.score) best = { kind, score };
    }
  }
  return best;
}

interface ColumnStats {
  values: string[];
  dateShare: number;
  numberShare: number;
  textShare: number;
  averageLength: number;
}

function columnStats(parsed: ParsedCsv, index: number): ColumnStats {
  const values = columnValues(parsed, index);
  const count = values.length || 1;
  const text = values.filter(
    (value) => /[A-Za-z]/.test(value) && dateShare([value]) === 0 && numberShare([value]) === 0,
  ).length;

  return {
    values,
    dateShare: dateShare(values),
    numberShare: numberShare(values),
    textShare: text / count,
    averageLength: values.reduce((total, value) => total + value.length, 0) / count,
  };
}

/** Which sign means money out, based on the amounts in a column. Null when it cannot be told. */
export function signConventionFor(parsed: ParsedCsv, index: number): SignConvention | null {
  const summary = summarizeAmounts(columnValues(parsed, index));
  if (summary.explicit > 0) return 'negativeOut';
  if (summary.negative > 0 && summary.positive === 0) return 'negativeOut';
  if (summary.negative > 0)
    return summary.negative >= summary.positive ? 'negativeOut' : 'positiveOut';
  return null;
}

/** The date format for a column when it is clear, otherwise null. */
export function dateFormatFor(parsed: ParsedCsv, index: number) {
  return detectDateFormat(columnValues(parsed, index)).format;
}

export interface Detection {
  mapping: ColumnMapping;
  /** Fields chosen by a best guess, so the person is asked to check them. */
  guessed: FieldKey[];
}

/** Works out which column is which, from the column names and from what the values look like. */
export function detectColumns(parsed: ParsedCsv): Detection {
  const indexes = parsed.headers.map((_, index) => index);
  const stats = indexes.map((index) => columnStats(parsed, index));
  const matches = parsed.headers.map(matchHeader);
  const guessed: FieldKey[] = [];
  const used = new Set<number>();

  const scoreFor = (index: number, kind: Kind) =>
    matches[index].kind === kind ? matches[index].score : 0;

  const pickBest = (candidates: number[], kind: Kind) => {
    const ranked = [...candidates].sort((a, b) => scoreFor(b, kind) - scoreFor(a, kind));
    const index = ranked[0];
    return {
      index,
      named: scoreFor(index, kind) > 0,
      tied: ranked.length > 1 && scoreFor(ranked[1], kind) === scoreFor(index, kind),
    };
  };

  // Date: a column whose values look like dates, preferring one named like a date.
  let date: number | null = null;
  let dateCandidates = indexes.filter((index) => stats[index].dateShare >= 0.8);
  if (dateCandidates.length === 0) {
    dateCandidates = indexes.filter((index) => matches[index].kind === 'date');
  }
  if (dateCandidates.length > 0) {
    const best = pickBest(dateCandidates, 'date');
    date = best.index;
    used.add(date);
    if (!best.named || best.tied) guessed.push('date');
  }

  // Amounts: separate debit and credit columns, one amount column, or the only numeric column.
  const firstOfKind = (kind: Kind) =>
    indexes.find((index) => !used.has(index) && matches[index].kind === kind);
  const debitIndex = firstOfKind('debit');
  const creditIndex = firstOfKind('credit');
  const amountIndex = firstOfKind('amount');

  let layout: AmountLayout = 'single';
  let amount: number | null = null;
  let debit: number | null = null;
  let credit: number | null = null;

  if (debitIndex !== undefined || creditIndex !== undefined) {
    layout = 'split';
    debit = debitIndex ?? null;
    credit = creditIndex ?? null;
  } else if (amountIndex !== undefined) {
    amount = amountIndex;
  } else {
    const numeric = indexes.filter(
      (index) =>
        !used.has(index) &&
        matches[index].kind !== 'balance' &&
        stats[index].values.length > 0 &&
        stats[index].numberShare >= 0.8,
    );
    if (numeric.length === 1) {
      amount = numeric[0];
      guessed.push('amount');
    }
  }
  [amount, debit, credit].forEach((index) => {
    if (index !== null) used.add(index);
  });

  // Description: the text column named like one, otherwise the one with the longest text.
  let description: number | null = null;
  const textCandidates = indexes.filter(
    (index) =>
      !used.has(index) && matches[index].kind !== 'balance' && stats[index].textShare >= 0.6,
  );
  if (textCandidates.length > 0) {
    const best = pickBest(textCandidates, 'description');
    if (best.named) {
      description = best.index;
      if (best.tied) guessed.push('description');
    } else {
      description = [...textCandidates].sort(
        (a, b) => stats[b].averageLength - stats[a].averageLength,
      )[0];
      guessed.push('description');
    }
    used.add(description);
  }

  const optional = (kind: Kind, minTextShare: number) =>
    indexes.find(
      (index) =>
        !used.has(index) && matches[index].kind === kind && stats[index].textShare >= minTextShare,
    ) ?? null;

  return {
    mapping: {
      date,
      dateFormat: date === null ? null : dateFormatFor(parsed, date),
      description,
      layout,
      amount,
      signConvention:
        layout === 'single' && amount !== null ? signConventionFor(parsed, amount) : null,
      debit,
      credit,
      category: optional('category', 0.5),
      currency: optional('currency', 0),
    },
    guessed,
  };
}
