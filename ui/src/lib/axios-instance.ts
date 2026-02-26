import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // httpOnly cookies
});

// Error types matching Quax backend format
export type ApiErrorDetails = {
  code: number;
  message: string;
  details: string | null;
};

export type ApiErrorResponse = {
  success: false;
  error_code?: string;
  message: string;
  details?: string | null;
  timestamp: number;
};

export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
  return (
    typeof error === "object" &&
    error !== null &&
    "success" in error &&
    error.success === false &&
    "message" in error &&
    typeof (error as ApiErrorResponse).message === "string"
  );
};

// Request interceptor - add auth token from Zustand
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors & token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints that shouldn't trigger a token refresh loop on 401
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/change-password');

    // 1. Handle token refresh on 401
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = response.data.data;
        useAuthStore.getState().actions.updateToken(access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().actions.logout();
        window.location.href = "/app/login";
        return Promise.reject(refreshError);
      }
    }

    // 2. Handle generic API error format unwrapping
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;

      if (isApiErrorResponse(data)) {
        return Promise.reject(data);
      }

      return Promise.reject(data);
    }

    return Promise.reject(error);
  }
);
