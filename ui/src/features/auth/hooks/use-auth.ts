/**
 * Auth Hooks
 * Kombinasi Query + Mutations + Zustand
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authService } from "@/lib/api";
import { useAuthActions } from "@/stores/use-auth-store";

/**
 * Query Keys untuk Auth
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

// ==================== QUERIES ====================

/**
 * Hook to fetch current user
 */
export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.getMe,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to check if user is authenticated
 */
export function useAuthCheck(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      try {
        const user = await authService.getMe();
        return { isAuthenticated: true, user } as const;
      } catch {
        return { isAuthenticated: false, user: null } as const;
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
    retry: false,
  });
}

// ==================== MUTATIONS ====================

/**
 * Login Mutation Hook
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthActions();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.token.access_token, data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Welcome back!");
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Register Mutation Hook
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const { login } = useAuthActions();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      login(data.token.access_token, data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Account created successfully!");
    },
    onError: (error: Error) => {
      toast.error("Registration failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Logout Mutation Hook
 * Calls backend to invalidate refresh token, then clears local state
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthActions();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Even if backend logout fails, clear local state
      logout();
      queryClient.clear();
    },
  });
}

// ==================== ZUSTAND EXPORTS ====================

export {
  useAuthStore,
  useAuthActions,
  useAuthUser,
  useAuthToken,
  useIsAuthenticated,
  useAuthLoading,
  useAuthState,
} from "@/stores/use-auth-store";

// ==================== TYPES ====================

export type {
  User,
  AuthResponse,
  TokenResponse,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
} from "../types";
