import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettings } from "@/features/settings/components/ProfileSettings";

export const Route = createFileRoute("/app/settings/profile")({
    component: ProfileSettings,
});
