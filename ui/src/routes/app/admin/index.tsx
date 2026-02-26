import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";

export const Route = createFileRoute("/app/admin/")({
  component: AdminDashboard,
});
