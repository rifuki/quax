/**
 * Auth Store
 * Zustand store for authentication state management
 * 
 * SECURITY NOTE: Access token is stored in MEMORY only (not localStorage).
 * This prevents XSS attacks from stealing the token.
 * Refresh token is handled via httpOnly cookie (backend-managed).
 */

import { create } from "zustand";

import type { User } from "@/features/auth";

// Auth store state interface
interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  actions: {
    login: (accessToken: string, user: User) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    updateToken: (token: string) => void;
  };
}

// Create auth store
export const useAuthStore = create<AuthState>()((set) => ({
  // Initial state
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading until auth check completes

  // Actions
  actions: {
    login: (accessToken, user) => {
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    logout: () => {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
    },

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    updateToken: (token) => {
      set({ accessToken: token });
    },
  },
}));

// Selector hooks for fine-grained reactivity
export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.accessToken);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

// Convenience hook for full auth state (use sparingly - causes more re-renders)
export const useAuthState = () =>
  useAuthStore((state) => ({
    user: state.user,
    accessToken: state.accessToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));
