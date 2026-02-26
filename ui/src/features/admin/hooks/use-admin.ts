import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/lib/api";

export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  logs: () => [...adminKeys.all, "logs"] as const,
};

export function useUsersList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: adminService.getUsers,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}

// Alias for backward compatibility
export { useUsersList as useUsers };

export function useDashboardStats() {
  return useQuery({
    queryKey: [...adminKeys.all, "stats"],
    queryFn: adminService.getDashboardStats,
    staleTime: 30 * 1000,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "admin" | "user" }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      // Invalidate users list to refresh the table
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: [...adminKeys.all, "api-keys"],
    queryFn: adminService.getApiKeys,
    staleTime: 30 * 1000,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      scopes,
      expiresDays,
    }: {
      name: string;
      scopes: string[];
      expiresDays?: number;
    }) => adminService.createApiKey(name, scopes, expiresDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "api-keys"] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "api-keys"] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "api-keys"] });
    },
  });
}
