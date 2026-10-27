export type Delimiter = ',' | ';' | '\t' | '|';

const DELIMITERS: Delimiter[] = [',', ';', '\t', '|'];

export interface CsvResult {
  delimiter: Delimiter;
  rows: string[][];
}

/** A statement that has been read and checked, ready for the next step. */
export interface ParsedCsv {
  fileName: string;
  fileSize: number;
  delimiter: Delimiter;
  /** The first row, which holds the column names. */
  headers: string[];
  /** Every row after the header. */
  rows: string[][];
  /** True when this came from the built-in sample, not the person's own file. */
  isSample: boolean;
}

/** Picks the separator used most in the first line, ignoring anything inside quotes. */
function detectDelimiter(text: string): Delimiter {
  const counts = new Map<Delimiter, number>(DELIMITERS.map((delimiter) => [delimiter, 0]));
  let inQuotes = false;

  for (const char of text) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && (char === '\n' || char === '\r')) {
      break;
    } else if (!inQuotes && counts.has(char as Delimiter)) {
      counts.set(char as Delimiter, (counts.get(char as Delimiter) ?? 0) + 1);
    }
  }

  let best: Delimiter = ',';
  let bestCount = 0;
  for (const [delimiter, count] of counts) {
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Reads CSV text into rows of cells. Handles quoted values (including commas and doubled quotes
 * inside them), Windows and Mac line endings, and skips blank lines.
 */
export function parseCsv(input: string): CsvResult {
  const text = input.replace(/^\uFEFF/, '').replace(/^[\r\n]+/, '');
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const endCell = () => {
    row.push(cell.trim());
    cell = '';
  };
  const endRow = () => {
    endCell();
    if (row.some((value) => value !== '')) rows.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.trim() === '') {
      inQuotes = true;
      cell = '';
    } else if (char === delimiter) {
      endCell();
    } else if (char === '\n') {
      endRow();
    } else if (char === '\r') {
      if (text[index + 1] === '\n') index += 1;
      endRow();
    } else {
      cell += char;
    }
  }

  if (cell !== '' || row.length > 0) endRow();
  return { delimiter, rows };
}
