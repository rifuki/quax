import type { User } from "@/features/auth/types/auth-types";

// Extended user with timestamps (for admin view)
export interface UserWithTimestamps extends User {
  created_at?: string;
  updated_at?: string;
}

// Update user data
export interface UpdateUserData {
  name?: string;
  email?: string;
}

// Simple profile response
export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
}
