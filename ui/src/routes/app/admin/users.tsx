import { createFileRoute } from "@tanstack/react-router";
import { UsersManagement } from "@/features/admin/components/UsersManagement";

export const Route = createFileRoute("/app/admin/users")({
  component: UsersManagement,
});
