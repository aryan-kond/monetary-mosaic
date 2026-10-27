import { formatFileSize } from './formatFileSize';
import { parseCsv, type ParsedCsv } from './csv';

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** An error whose message is safe to show to the person, in plain language. */
export class UploadError extends Error {}

const NOT_CSV_HINTS: Record<string, string> = {
  xlsx: 'In Excel, choose File, then Save As, then CSV, and upload that file.',
  xls: 'In Excel, choose File, then Save As, then CSV, and upload that file.',
  pdf: 'PDF statements cannot be read. Look for a CSV or Excel download in your bank.',
};

/** Checks CSV text and turns it into rows. Throws an UploadError that says how to fix the problem. */
export function buildParsedCsv(
  text: string,
  fileName: string,
  fileSize: number,
  isSample = false,
): ParsedCsv {
  if (text.includes('\u0000')) {
    throw new UploadError(
      `"${fileName}" does not look like a text file. Export your statement as CSV and try again.`,
    );
  }

  const { delimiter, rows } = parseCsv(text);

  if (rows.length === 0) {
    throw new UploadError(
      `"${fileName}" is empty. Check that the export finished, then try again.`,
    );
  }
  if (rows.length === 1) {
    throw new UploadError(
      `"${fileName}" has column names but no transactions. Choose a longer date range when you export it.`,
    );
  }
  if (rows[0].length < 2) {
    throw new UploadError(
      `We could only find one column in "${fileName}". A statement needs at least a date and an amount. Check that it is a CSV export.`,
    );
  }

  return {
    fileName,
    fileSize,
    delimiter,
    headers: rows[0],
    rows: rows.slice(1),
    isSample,
  };
}

/** Reads a file from the person's computer, entirely in the browser. */
export async function readCsvFile(file: File): Promise<ParsedCsv> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (extension !== 'csv' && file.type !== 'text/csv') {
    const hint =
      NOT_CSV_HINTS[extension] ??
      "In your bank's website or app, export or download your statement as CSV.";
    throw new UploadError(`"${file.name}" is not a CSV file. ${hint}`);
  }
  if (file.size === 0) {
    throw new UploadError(
      `"${file.name}" is empty. Check that the export finished, then try again.`,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError(
      `"${file.name}" is ${formatFileSize(file.size)}, and the limit is 5 MB. Try exporting a shorter date range.`,
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new UploadError(`We could not read "${file.name}". Try choosing the file again.`);
  }

  return buildParsedCsv(text, file.name, file.size);
}
