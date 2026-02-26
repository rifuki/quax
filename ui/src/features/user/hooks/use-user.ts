import { useQuery } from "@tanstack/react-query";

import { userService } from "@/lib/api";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  byId: (id: string) => [...userKeys.all, id] as const,
};

import { useIsAuthenticated } from "@/features/auth/hooks/use-auth";

export function useUserProfile(options?: { enabled?: boolean }) {
  const isAuth = useIsAuthenticated();

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userService.getMe,
    enabled: isAuth && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}

// Alias for backward compatibility
export { useUserProfile as useUser };
