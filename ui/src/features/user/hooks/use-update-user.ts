/**
 * Update User Mutation Hook
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userService } from "@/lib/api";
import { useAuthActions } from "@/stores/use-auth-store";
import { authKeys } from "@/features/auth";
import { userKeys } from "./use-user";

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthActions();

  return useMutation({
    mutationFn: userService.updateMe,
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Profile updated!");
    },
    onError: (error: Error) => {
      toast.error("Update failed", {
        description: error.message,
      });
    },
  });
}
