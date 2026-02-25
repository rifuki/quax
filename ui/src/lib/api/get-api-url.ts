/**
 * Get API URL from environment variables
 * SSR-safe environment variable reader
 */
export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || "http://localhost:8080";
}
