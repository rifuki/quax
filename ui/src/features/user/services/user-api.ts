/**
 * User API
 * Re-export from lib/api for backward compatibility
 */

import { userService } from "@/lib/api";
import type { User } from "@/features/auth";

export { userService as userApi };

// Re-export types
export type { User };
export type { UpdateUserData, UserProfileResponse } from "../types/user-types";
