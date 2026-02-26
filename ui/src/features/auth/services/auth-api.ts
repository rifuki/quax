import { isApiError } from "@/types/api";

export { authService as authApi } from "@/lib/api";
export { isApiError, isApiError as isApiErrorResponse };

export { ErrorCodes } from "@/types/api";

export const getAuthErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export const isAuthError = (error: unknown, errorCode: string): boolean => {
  return isApiError(error) && error.error_code === errorCode;
};
