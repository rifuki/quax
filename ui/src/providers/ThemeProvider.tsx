"use client";

// React
import { type ComponentProps } from "react";

// External Libraries
import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * ThemeProvider Component
 *
 * This component wraps the application with the Next.js ThemeProvider to manage themes.
 * It allows for easy switching between light and dark themes.
 */
export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
