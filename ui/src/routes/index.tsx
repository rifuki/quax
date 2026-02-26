import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/home/components/LandingPage";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
