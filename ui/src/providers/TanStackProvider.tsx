"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface TanStackProviderProps {
  children: ReactNode;
}

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

export default function TanStackProvider({ children }: TanStackProviderProps) {
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
