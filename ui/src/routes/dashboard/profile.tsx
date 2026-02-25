import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "@/features/user";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return <UserProfile />;
}
