/**
 * Storage Helpers
 * Centralized localStorage management with SSR safety
 * 
 * NOTE: Access token is stored in MEMORY (Zustand) for security.
 * Only non-sensitive data should use localStorage.
 */

// Keys for localStorage (non-sensitive data only)
const REMEMBER_ME_KEY = "quax_remember_email";

/**
 * Get remembered email (for login form)
 */
export function getRememberedEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REMEMBER_ME_KEY);
}

/**
 * Set remembered email
 */
export function setRememberedEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBER_ME_KEY, email);
}

/**
 * Remove remembered email
 */
export function removeRememberedEmail(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REMEMBER_ME_KEY);
}

/**
 * Clear all app storage
 * Call this on logout
 */
export function clearAppStorage(): void {
  if (typeof window === "undefined") return;
  // Only clear non-auth related items
  // Auth tokens are in memory (Zustand) and httpOnly cookies
}

// Legacy cleanup: Remove old auth keys if they exist
// This runs once when the module is loaded
if (typeof window !== "undefined") {
  // Remove old csrf_token if exists (from previous implementation)
  localStorage.removeItem("quax_csrf_token");
}
