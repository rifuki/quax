/**
 * User Query Hooks
 */

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/lib/api";

/**
 * Query Keys untuk User
 */
export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  byId: (id: string) => [...userKeys.all, id] as const,
};

/**
 * Hook to fetch current user profile
 */
export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userService.getMe,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}

// Alias untuk backward compatibility
export { useUserProfile as useUser };
