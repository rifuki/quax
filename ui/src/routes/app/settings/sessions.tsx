import { createFileRoute } from "@tanstack/react-router";
import { SessionsSettings } from "@/features/settings/components/SessionsSettings";

export const Route = createFileRoute("/app/settings/sessions")({
    component: SessionsSettings,
});
