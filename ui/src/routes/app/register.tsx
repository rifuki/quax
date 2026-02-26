import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth/components/RegisterPage";

export const Route = createFileRoute("/app/register")({
  component: RegisterPage,
});
