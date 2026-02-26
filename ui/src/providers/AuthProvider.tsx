import { useEffect, useState } from "react";
import { useAuthActions } from "@/stores/use-auth-store";
import { authService } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { login, logout, updateToken } = useAuthActions();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      console.log("[AuthProvider] Starting auth check...");

      try {
        console.log("[AuthProvider] Calling refreshToken...");
        const accessToken = await authService.refreshToken();

        if (cancelled) return;
        console.log("[AuthProvider] refreshToken success:", accessToken.substring(0, 20) + "...");

        updateToken(accessToken);
        console.log("[AuthProvider] Token saved to Zustand");

        console.log("[AuthProvider] Calling getMe...");
        const user = await authService.getMe();

        if (cancelled) return;
        console.log("[AuthProvider] getMe success:", user.email);

        login(accessToken, user);
        console.log("[AuthProvider] Login complete!");

      } catch (error: any) {
        if (!cancelled) {
          console.error("[AuthProvider] Auth failed:", error.message || error);
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
          console.log("[AuthProvider] Auth check complete");
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [login, logout, updateToken]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-miku-primary" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
