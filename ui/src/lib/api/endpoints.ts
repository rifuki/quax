/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for all API routes
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  USER: {
    ME: "/users/me",
    UPDATE: "/users/me",
  },
  ADMIN: {
    USERS: "/admin/users",
    LOG_LEVEL: "/admin/log/level",
    STATS: "/admin/stats",
    USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    API_KEYS: "/admin/api-keys",
    API_KEY_REVOKE: (id: string) => `/admin/api-keys/${id}/revoke`,
    API_KEY_DELETE: (id: string) => `/admin/api-keys/${id}`,
  },
} as const;
