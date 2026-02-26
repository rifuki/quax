import { userService } from "@/lib/api";
import type { User } from "@/features/auth/types/auth-types";

export { userService as userApi };

// Re-export types
export type { User };
export type { UpdateUserData, UserProfileResponse } from "../types/user-types";
