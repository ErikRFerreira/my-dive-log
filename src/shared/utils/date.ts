/**
 * Returns a date string in YYYY-MM-DD format using local date fields.
 * Suitable for HTML date input defaults and max values.
 */
export function getLocalDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
