import { createFileRoute } from "@tanstack/react-router";
import { ApiKeysManagement } from "@/features/admin/components/ApiKeysManagement";

export const Route = createFileRoute("/app/admin/api-keys")({
  component: ApiKeysManagement,
});
