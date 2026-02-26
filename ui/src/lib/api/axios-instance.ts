/**
 * Axios Instance Configuration
 * Global axios instance with interceptors for auth and error handling
 * 
 * SECURITY: Access token is stored in MEMORY (Zustand), not localStorage.
 * This prevents XSS attacks from stealing tokens.
 */

import axios from "axios";

// WARNING: Always import http_api_url directly from './api-url', NOT from the barrel/index '../api'.
// Importing from the index can cause circular imports and build errors.
import { http_api_url } from "./api-url";

// Endpoints
import { API_ENDPOINTS } from "./endpoints";

// Import Zustand store for token management
import { useAuthStore } from "@/stores/use-auth-store";

// Create Axios Instance with default configuration
const apiClient = axios.create({
  baseURL: http_api_url,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Required for httpOnly cookies (refresh token)
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Subscribe to token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers with new token
 */
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

/**
 * Get current access token from Zustand store
 */
function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/**
 * Logout helper - clears auth state and redirects
 */
function handleLogout() {
  useAuthStore.getState().actions.logout();
  window.location.href = "/app/login";
}

// Response Interceptor: handles responses, token refresh, and error extraction
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (
        originalRequest.url === API_ENDPOINTS.AUTH.LOGIN ||
        originalRequest.url === API_ENDPOINTS.AUTH.REGISTER ||
        originalRequest.url === API_ENDPOINTS.AUTH.REFRESH
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token using httpOnly cookie
        const response = await axios.post(
          `${http_api_url}${API_ENDPOINTS.AUTH.REFRESH}`,
          {},
          { withCredentials: true }
        );

        const { access_token } = response.data.data;
        
        // Update token in Zustand store (memory only)
        useAuthStore.getState().actions.updateToken(access_token);

        // Notify subscribers and retry queued requests
        onTokenRefreshed(access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract API error data from response
    if (axios.isAxiosError(error) && error.response) {
      const { data } = error.response;
      if (data) {
        return Promise.reject(data);
      }
    }

    return Promise.reject(error);
  }
);

// Request Interceptor: attaches access token to headers if available
apiClient.interceptors.request.use(
  (config) => {
    // Skip token for refresh endpoint (it uses httpOnly cookie)
    if (config.url === API_ENDPOINTS.AUTH.REFRESH) {
      return config;
    }

    // Get token from Zustand store (memory)
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
