import type { UserWithTimestamps } from "@/features/user/types/user-types";

// Re-export extended user type
export type { UserWithTimestamps as User };

// Log level request
export interface LogLevelRequest {
  level: "trace" | "debug" | "info" | "warn" | "error";
}

// Backward compatible alias
export type { LogLevelRequest as ChangeLogLevelRequest };

export interface DashboardStats {
  total_users: number;
  total_admins: number;
  total_api_keys: number;
  active_api_keys: number;
  new_users_this_month: number;
}

export interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}
