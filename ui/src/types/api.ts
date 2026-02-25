/**
 * Global API Types
 * Aligned with Quax backend: ApiSuccess<T> and ApiError
 */

// ==================== SUCCESS RESPONSE ====================

export interface ApiSuccess<T> {
  success: true;
  code: number;
  data: T | null;
  message: string;
  timestamp: number;
}

// Alias for backward compatibility
export type ApiResponse<T> = ApiSuccess<T>;

// ==================== ERROR RESPONSE ====================

export interface ApiError {
  success: false;
  code: number;
  error_code: string | null;  // e.g. "AUTH_001", "VAL_001"
  message: string;
  details: string | null;     // Only in debug mode
  timestamp: number;
}

// Legacy alias
export type ApiErrorResponse = ApiError;

// ==================== TYPE GUARDS ====================

/**
 * Check if error is an API error response
 * Matches Quax backend ApiError structure
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    error != null &&
    typeof error === "object" &&
    (error as ApiError).success === false &&
    typeof (error as ApiError).timestamp === "number" &&
    typeof (error as ApiError).message === "string"
  );
};

// Legacy alias
export const isApiErrorResponse = isApiError;

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && error.message === "Network Error";
};

// ==================== ERROR CODE CONSTANTS ====================
// Aligned with Quax backend: api/src/infrastructure/web/response/codes.rs

export const ErrorCodes = {
  AUTH: {
    INVALID_CREDENTIALS: "AUTH_001",
    EMAIL_EXISTS: "AUTH_002",
    TOKEN_EXPIRED: "AUTH_003",
    TOKEN_INVALID: "AUTH_004",
    UNAUTHORIZED: "AUTH_005",
    FORBIDDEN: "AUTH_006",
    API_KEY_INVALID: "AUTH_007",
  },
  VALIDATION: {
    INVALID_INPUT: "VAL_001",
    MISSING_FIELD: "VAL_002",
    INVALID_FORMAT: "VAL_003",
  },
  GENERIC: {
    NOT_FOUND: "GEN_001",
    INTERNAL: "GEN_002",
    RATE_LIMITED: "GEN_003",
  },
} as const;

// ==================== HELPERS ====================

/**
 * Get error code category
 */
export const getErrorCategory = (errorCode: string | null): string => {
  if (!errorCode) return "UNKNOWN";
  if (errorCode.startsWith("AUTH_")) return "AUTH";
  if (errorCode.startsWith("VAL_")) return "VALIDATION";
  if (errorCode.startsWith("GEN_")) return "GENERIC";
  return "UNKNOWN";
};

/**
 * Check if error has specific error code
 */
export const hasErrorCode = (
  error: unknown,
  code: string
): error is ApiError => {
  return isApiError(error) && error.error_code === code;
};
