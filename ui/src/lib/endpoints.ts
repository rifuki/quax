export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    REFRESH: "/api/v1/auth/refresh",
  },
  USER: {
    ME: "/api/v1/users/me",
  },
  ADMIN: {
    USERS: "/api/v1/admin/users",
    LOG_LEVEL: "/api/v1/admin/log/level",
  },
} as const;
