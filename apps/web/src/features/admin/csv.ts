/**
 * CSV export helpers.
 *
 * Exports are built entirely in the browser from the rows currently on screen:
 * no server request is made, nothing is uploaded, and the file lands in the
 * user's downloads folder. A UTF-8 BOM is prepended so Excel opens the Bangla
 * headings correctly.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function escapeCell(input: string | number): string {
  const text = String(input ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv<T>(columns: Array<CsvColumn<T>>, rows: T[]): string {
  const head = columns.map((column) => escapeCell(column.header)).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(','));
  return [head, ...body].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/** One-shot export: build and download in a single call. */
export function exportCsv<T>(filename: string, columns: Array<CsvColumn<T>>, rows: T[]): void {
  downloadCsv(filename, buildCsv(columns, rows));
}
