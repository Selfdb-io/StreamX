/**
 * Generate a UUID that works in both secure (HTTPS) and non-secure (HTTP) contexts.
 * crypto.randomUUID() is only available in secure contexts, so we provide a fallback.
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID if available (secure contexts)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback for non-secure contexts (HTTP)
  // Uses crypto.getRandomValues which is available in all modern browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 3);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
