/**
 * Utility function to normalize email addresses to lowercase
 * Used in DTOs to ensure email case consistency
 */
export function normalizeEmail(value: unknown): string {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  // If not a string, convert to string and lowercase
  return String(value).toLowerCase();
}
