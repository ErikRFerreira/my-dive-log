/**
 * Utility functions for exporting dive log data to CSV format.
 * 
 * This module handles the conversion of dive records into CSV format and
 * triggers browser downloads. It properly escapes CSV values to handle
 * special characters like quotes and commas.
 */

import type { Dive } from '@/features/dives/types';

/** Simplified dive data structure for CSV export */
type CsvRow = {
  date: string;
  location: string;
  country: string;
  depth: number;
  duration: number;
  notes: string;
};

/**
 * Maps a Dive object to a simplified CSV row format.
 * 
 * Extracts only the essential fields needed for CSV export and provides
 * fallback values for optional fields.
 * 
 * @param dive - The dive object to map
 * @returns A simplified row object containing core dive information
 */
function mapDiveToCsvRow(dive: Dive): CsvRow {
  return {
    date: dive.date,
    location: dive.locations?.name ?? '',
    country: dive.locations?.country ?? '',
    depth: dive.depth,
    duration: dive.duration,
    notes: dive.notes ?? '',
  };
}

/**
 * Converts an array of CSV row objects to a properly formatted CSV string.
 * 
 * Generates a CSV file with headers and properly escaped values. All values
 * are wrapped in double quotes and internal quotes are escaped by doubling them
 * (standard CSV escaping).
 * 
 * @param rows - Array of row objects to convert
 * @returns CSV-formatted string with headers and data rows
 */
function convertToCsv(rows: CsvRow[]): string {
  // Extract headers from first row's keys
  const headers = Object.keys(rows[0]).join(',');

  // Convert each row to CSV format with proper escaping
  const values = rows.map((row) =>
    Object.values(row)
      .map((value) =>
        // Wrap in quotes and escape internal quotes by doubling them
        `"${String(value).replace(/"/g, '""')}"`
      )
      .join(',')
  );

  return [headers, ...values].join('\n');
}

/**
 * Exports dive records to a CSV file and triggers a browser download.
 * 
 * This function:
 * 1. Converts dive objects to simplified CSV row format
 * 2. Generates a properly formatted CSV string
 * 3. Creates a Blob with UTF-8 encoding
 * 4. Creates a temporary download link and triggers it
 * 5. Cleans up DOM elements and object URLs
 * 
 * The resulting file is named "dives.csv" and will be saved to the user's
 * default download location.
 * 
 * @param dives - Array of dive records to export
 * @returns void - Does nothing if the array is empty
 * 
 * @example
 * exportDivesToCsv(userDives);
 */
export function exportDivesToCsv(dives: Dive[]) {
  if (!dives.length) return;

  // Transform dive objects to CSV row format
  const rows = dives.map(mapDiveToCsvRow);
  const csv = convertToCsv(rows);

  // Create a Blob with proper CSV MIME type and UTF-8 encoding
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create temporary anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'dives.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL to free memory
  URL.revokeObjectURL(url);
}
