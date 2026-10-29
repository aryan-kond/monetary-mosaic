import type { CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import type { ParsedCsv } from './csv';
import { categorize, normalize } from './categorize';
import { formatCurrency } from './formatCurrency';
import { formatShortDate } from './formatDate';
import { parseAmount } from './importAmounts';
import { readRow, type ColumnMapping, type ReadRow } from './importMapping';

export interface ImportRow {
  /** Row number as it appears in a spreadsheet, where the column names are row 1. */
  rowNumber: number;
  /** YYYY-MM-DD. */
  date: string;
  /** The text exactly as the bank wrote it. */
  description: string;
  /** A cleaned-up name, for example "Zomato". */
  merchant: string;
  /** Always positive, in rupees. */
  amount: number;
  direction: 'out' | 'in';
  categoryId: CategoryId;
  /** True when the category is a guess the person should check. */
  needsReview: boolean;
  /** Set when this looks like a transaction that is already in the app. */
  duplicate?: { merchant: string; reason: string };
}

export interface ExcludedRow {
  rowNumber: number;
  /** A short look at the row, so the person can find it in their file. */
  preview: string;
  reason: string;
}

export interface BuiltImport {
  rows: ImportRow[];
  excluded: ExcludedRow[];
}

export type DuplicateChoice = 'skip' | 'import';

/** Names are similar when one contains the other, or they share a word of four letters or more. */
function similarNames(a: string, b: string): boolean {
  const first = normalize(a);
  const second = normalize(b);
  if (!first || !second) return false;
  if (first.includes(second) || second.includes(first)) return true;

  const words = new Set(first.split(' ').filter((word) => word.length >= 4));
  return second.split(' ').some((word) => word.length >= 4 && words.has(word));
}

function previewOf(cells: string[]): string {
  const text = cells.filter(Boolean).join(', ');
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

/** Says in plain words why a row cannot be imported. */
function explainProblem(cells: string[], mapping: ColumnMapping, read: ReadRow): string {
  const cell = (index: number | null) => (index === null ? '' : (cells[index] ?? '').trim());

  if (read.date === null) {
    const raw = cell(mapping.date);
    return raw === '' ? 'The date is missing.' : `The date "${raw}" cannot be read.`;
  }

  if (mapping.layout === 'single') {
    const raw = cell(mapping.amount);
    if (raw === '') return 'The amount is missing.';
    const parsed = parseAmount(raw);
    if (!parsed) return `The amount "${raw}" cannot be read.`;
    if (parsed.value === 0) return 'The amount is zero, so there is nothing to import.';
    return 'We could not tell whether this money went out or came in.';
  }

  const debit = cell(mapping.debit);
  const credit = cell(mapping.credit);
  if (debit === '' && credit === '')
    return 'Neither the debit nor the credit column has an amount.';
  if (debit !== '' && parseAmount(debit) === null) {
    return `The debit amount "${debit}" cannot be read.`;
  }
  if (credit !== '' && parseAmount(credit) === null) {
    return `The credit amount "${credit}" cannot be read.`;
  }
  if (
    Math.abs(parseAmount(debit)?.value ?? 0) > 0 &&
    Math.abs(parseAmount(credit)?.value ?? 0) > 0
  ) {
    return 'Both debit and credit have amounts, so we cannot tell which way the money went.';
  }
  return 'The amount is zero, so there is nothing to import.';
}

/**
 * Reads every row of the file with the chosen columns. Rows that cannot be read are listed with a
 * reason, and rows that look like something already imported are marked as possible duplicates.
 * Nothing is imported or removed here.
 */
export function buildImportRows(
  parsed: ParsedCsv,
  mapping: ColumnMapping,
  existing: Transaction[],
  rules: Record<string, CategoryId>,
): BuiltImport {
  const rows: ImportRow[] = [];
  const excluded: ExcludedRow[] = [];

  parsed.rows.forEach((cells, index) => {
    const rowNumber = index + 2;
    const read = readRow(cells, mapping);
    const { date, amount, direction } = read;

    if (date === null || amount === null || direction === null) {
      excluded.push({
        rowNumber,
        preview: previewOf(cells),
        reason: explainProblem(cells, mapping, read),
      });
      return;
    }

    const bankCategory =
      mapping.category === null ? undefined : (cells[mapping.category] ?? '').trim() || undefined;
    const result = categorize({ description: read.description, direction, bankCategory, rules });

    // A match needs the same date, direction, and amount, and a similar name. An equal amount alone
    // is not enough, so two different purchases of the same price are never flagged.
    const match = existing.find(
      (transaction) =>
        transaction.date === date &&
        transaction.direction === direction &&
        Math.abs(transaction.amount - amount) < 0.005 &&
        similarNames(transaction.merchant, result.merchant),
    );

    rows.push({
      rowNumber,
      date,
      description: read.description,
      merchant: result.merchant,
      amount,
      direction,
      categoryId: result.categoryId,
      needsReview: result.uncertain,
      duplicate: match
        ? {
            merchant: match.merchant,
            reason: `Same date, same amount, and a similar name to "${match.merchant}" (${formatShortDate(match.date)}, ${formatCurrency(match.amount)}), which is already in your transactions.`,
          }
        : undefined,
    });
  });

  return { rows, excluded };
}

export interface ImportPlan {
  /** The rows that will be imported, with the person's category changes applied. */
  rows: ImportRow[];
  /** Possible duplicates the person chose to skip. */
  skipped: number;
  /** Possible duplicates still waiting for a decision. */
  undecided: number;
  moneyOut: number;
  moneyIn: number;
  firstDate: string | null;
  lastDate: string | null;
}

const toPaise = (value: number) => Math.round(value * 100);

/** Turns the person's decisions into the final list. Nothing is imported until they confirm it. */
export function planImport(
  built: BuiltImport,
  duplicateChoices: Record<number, DuplicateChoice>,
  categoryChoices: Record<number, CategoryId>,
): ImportPlan {
  const rows: ImportRow[] = [];
  let skipped = 0;
  let undecided = 0;
  let paiseOut = 0;
  let paiseIn = 0;

  for (const row of built.rows) {
    if (row.duplicate) {
      const choice = duplicateChoices[row.rowNumber];
      if (choice === undefined) {
        undecided += 1;
        continue;
      }
      if (choice === 'skip') {
        skipped += 1;
        continue;
      }
    }

    const chosen = row.direction === 'out' ? categoryChoices[row.rowNumber] : undefined;
    rows.push({
      ...row,
      categoryId: chosen ?? row.categoryId,
      needsReview: chosen ? false : row.needsReview,
    });

    if (row.direction === 'out') paiseOut += toPaise(row.amount);
    else paiseIn += toPaise(row.amount);
  }

  const dates = rows.map((row) => row.date).sort();
  return {
    rows,
    skipped,
    undecided,
    moneyOut: paiseOut / 100,
    moneyIn: paiseIn / 100,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
  };
}
