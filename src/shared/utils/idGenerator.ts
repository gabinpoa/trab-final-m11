/**
 * Simple ID generator to avoid ESM module issues with uuid package
 * Generates unique IDs using timestamp and random string
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
}

/**
 * Generate a short ID (8 characters) for tracking codes
 */
export function generateShortId(): string {
  const timestamp = Date.now().toString(36);
  return timestamp.substring(0, 8).toUpperCase();
}
