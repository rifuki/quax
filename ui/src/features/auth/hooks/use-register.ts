import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/lib/api";
import { useAuthActions } from "@/stores/use-auth-store";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

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
