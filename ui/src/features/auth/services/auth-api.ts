/**
 * Auth API
 * Re-export from lib/api for backward compatibility
 *
 * Note: New code should import directly from @/lib/api
 */

import { isApiError } from "@/types/api";

export { authService as authApi } from "@/lib/api";
export { isApiError, isApiError as isApiErrorResponse };

// Re-export error codes from Quax backend
export { ErrorCodes } from "@/types/api";

// Type-safe error helper - use useApiErrorParser hook for new code
export const getAuthErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Check if error is specific auth error
export const isAuthError = (error: unknown, errorCode: string): boolean => {
  return isApiError(error) && error.error_code === errorCode;
};
