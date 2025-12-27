import type { Dive } from '@/features/dives/types';

type CsvRow = {
  date: string;
  location: string;
  country: string;
  depth: number;
  duration: number;
  notes: string;
};

// Maps a Dive object to a CSV row format
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

// Converts an array of Dive objects to a CSV string
function convertToCsv(rows: CsvRow[]): string {
  const headers = Object.keys(rows[0]).join(',');

  const values = rows.map((row) =>
    Object.values(row)
      .map((value) =>
        `"${String(value).replace(/"/g, '""')}"`
      )
      .join(',')
  );

  return [headers, ...values].join('\n');
}

// Exports the given dives to a CSV file and triggers a download
export function exportDivesToCsv(dives: Dive[]) {
  if (!dives.length) return;

  const rows = dives.map(mapDiveToCsvRow);
  const csv = convertToCsv(rows);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'dives.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
