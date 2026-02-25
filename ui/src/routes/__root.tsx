import { Fragment } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

// Providers
import { TanStackProvider, ThemeProvider } from "@/providers";

// Components
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <Fragment>
      <TanStackProvider>
        <ThemeProvider defaultTheme="system" enableSystem attribute="class">
          <Outlet />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </TanStackProvider>
      <TanStackRouterDevtools />
    </Fragment>
  );
}
