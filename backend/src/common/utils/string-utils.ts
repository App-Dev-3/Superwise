/**
 * Safely converts any value to a string for logging
 *
 * This function explicitly handles different types to ensure
 * proper string conversion without relying on automatic toString()
 */
export function safeStringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  // Handle Error objects specially to get message and stack
  if (value instanceof Error) {
    return value.stack || value.message;
  }

  // For objects and arrays, use JSON.stringify
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      // Ignore the error and return a fallback
      return '[Circular or Unserializable Object]';
    }
  }

  // Default case - convert to string
  return String(value);
}
