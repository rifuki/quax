import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";

export const Route = createFileRoute("/app/settings/security")({
    component: SecuritySettings,
});
