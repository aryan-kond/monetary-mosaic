import type { ParsedCsv } from './csv';
import { numberShare, parseAmount, summarizeAmounts } from './importAmounts';
import { dateShare, detectDateFormat, parseDateValue, type DateFormat } from './importDates';

export type AmountLayout = 'single' | 'split';
/** Which sign means money going out, when amounts share one column. */
export type SignConvention = 'negativeOut' | 'positiveOut';

/** Column numbers start at 0. Null means no column has been chosen. */
export interface ColumnMapping {
  date: number | null;
  dateFormat: DateFormat | null;
  description: number | null;
  layout: AmountLayout;
  amount: number | null;
  signConvention: SignConvention | null;
  debit: number | null;
  credit: number | null;
  category: number | null;
  currency: number | null;
}

export type FieldKey =
  | 'date'
  | 'dateFormat'
  | 'description'
  | 'layout'
  | 'amount'
  | 'signConvention'
  | 'debit'
  | 'credit'
  | 'category'
  | 'currency';

export type MappingIssues = Partial<Record<FieldKey, string>>;

/** The non-empty values in one column. */
export function columnValues(parsed: ParsedCsv, index: number): string[] {
  return parsed.rows.map((row) => (row[index] ?? '').trim()).filter((value) => value !== '');
}

/** The first few different values in a column, to show as examples. */
export function sampleValues(parsed: ParsedCsv, index: number, count = 3): string[] {
  const seen: string[] = [];
  for (const value of columnValues(parsed, index)) {
    if (!seen.includes(value)) seen.push(value);
    if (seen.length === count) break;
  }
  return seen;
}

const RUPEE = /^(inr|rs\.?|rupees?|₹)$/i;

/** Checks the choices and says in plain words what is still missing or wrong. */
export function validateMapping(
  parsed: ParsedCsv,
  mapping: ColumnMapping,
): { issues: MappingIssues; ready: boolean } {
  const issues: MappingIssues = {};
  const valuesOf = (index: number | null) => (index === null ? [] : columnValues(parsed, index));

  if (mapping.date === null) {
    issues.date = 'Choose the column that holds each transaction date.';
  } else {
    const dates = valuesOf(mapping.date);
    if (dateShare(dates) < 0.5) {
      issues.date = 'Most values in this column do not look like dates. Choose another column.';
    } else if (detectDateFormat(dates).mixed) {
      issues.dateFormat =
        'The dates in this column are written in more than one style, so they cannot be read reliably. Export the file again with one date style.';
    } else if (mapping.dateFormat === null) {
      issues.dateFormat = 'Tell us how the dates are written.';
    }
  }

  if (mapping.description === null) {
    issues.description =
      'Choose the column that describes each transaction, such as Description or Narration.';
  }

  if (mapping.layout === 'single') {
    if (mapping.amount === null) {
      issues.amount = 'Choose the column that holds the amount.';
    } else {
      const amounts = valuesOf(mapping.amount);
      if (numberShare(amounts) < 0.5) {
        issues.amount = 'Most values in this column are not amounts. Choose another column.';
      } else {
        const summary = summarizeAmounts(amounts);
        if (summary.explicit === 0 && mapping.signConvention === null) {
          issues.signConvention = 'Tell us which amounts are money going out.';
        }
      }
    }
  } else if (mapping.debit === null && mapping.credit === null) {
    issues.debit = 'Choose a debit column, a credit column, or both.';
  } else if (mapping.debit !== null && mapping.debit === mapping.credit) {
    issues.credit = 'Debit and credit need to be different columns.';
  } else {
    if (mapping.debit !== null && numberShare(valuesOf(mapping.debit)) < 0.5) {
      issues.debit = 'Most values in this column are not amounts. Choose another column.';
    }
    if (mapping.credit !== null && numberShare(valuesOf(mapping.credit)) < 0.5) {
      issues.credit = 'Most values in this column are not amounts. Choose another column.';
    }
  }

  if (mapping.currency !== null) {
    const others = Array.from(
      new Set(valuesOf(mapping.currency).filter((code) => !RUPEE.test(code))),
    );
    if (others.length > 0) {
      issues.currency = `This file includes other currencies (${others.slice(0, 3).join(', ')}). Only rupees are supported for now. Remove those rows, or choose a different file.`;
    }
  }

  return { issues, ready: Object.keys(issues).length === 0 };
}

export interface ReadRow {
  /** YYYY-MM-DD, or null when the date cannot be read. */
  date: string | null;
  description: string;
  /** Always positive. Null when the amount cannot be read. */
  amount: number | null;
  direction: 'out' | 'in' | null;
}

/** Reads one row of the file using the chosen columns. */
export function readRow(row: string[], mapping: ColumnMapping): ReadRow {
  const cell = (index: number | null) => (index === null ? '' : (row[index] ?? '').trim());

  const date =
    mapping.date !== null && mapping.dateFormat !== null
      ? parseDateValue(cell(mapping.date), mapping.dateFormat)
      : null;
  const description = cell(mapping.description);

  let amount: number | null = null;
  let direction: ReadRow['direction'] = null;

  if (mapping.layout === 'single') {
    const parsed = parseAmount(cell(mapping.amount));
    if (parsed && parsed.value !== 0) {
      amount = Math.abs(parsed.value);
      if (parsed.explicit) {
        direction = parsed.explicit;
      } else if (mapping.signConvention === 'negativeOut') {
        direction = parsed.value < 0 ? 'out' : 'in';
      } else if (mapping.signConvention === 'positiveOut') {
        direction = parsed.value > 0 ? 'out' : 'in';
      }
    }
  } else {
    const debit = Math.abs(parseAmount(cell(mapping.debit))?.value ?? 0);
    const credit = Math.abs(parseAmount(cell(mapping.credit))?.value ?? 0);
    if (debit > 0 && credit === 0) {
      amount = debit;
      direction = 'out';
    } else if (credit > 0 && debit === 0) {
      amount = credit;
      direction = 'in';
    }
  }

  return { date, description, amount, direction };
}
