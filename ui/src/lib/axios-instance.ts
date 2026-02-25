import axios from "axios";

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

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
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
    // Handle API error format
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      
      if (isApiErrorResponse(data)) {
        return Promise.reject(data);
      }
      
      return Promise.reject(data);
    }

    // Handle token refresh on 401
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = response.data.data;
        localStorage.setItem("access_token", access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
