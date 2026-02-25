"use client";

// React
import { useState, type ReactNode } from "react";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Type Definitions
interface TanStackProviderProps {
  children: ReactNode;
}

// Global query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 6 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * TanStackProvider Component
 *
 * This component initializes the TanStack Query Client and provides it to the application.
 * It wraps the children components with the QueryClientProvider to enable data fetching capabilities.
 */
export default function TanStackProvider({ children }: TanStackProviderProps) {
  // Initialize QueryClient
  const [localQueryClient] = useState(() => queryClient);

  return (
    <QueryClientProvider client={localQueryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
