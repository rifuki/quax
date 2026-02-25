import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  Zap,
  Lock,
  Server,
  Database,
  Code2,
  Github,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useIsAuthenticated } from "@/features/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopiedCommand(command);
      toast.success("Copied to clipboard!", {
        description: command,
        duration: 2000,
      });
      setTimeout(() => setCopiedCommand(null), 2000);
    });
  };

  const handleEnterApp = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/login" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Quax
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#stack"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tech Stack
              </a>
              <a
                href="#quickstart"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Quick Start
              </a>

            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="sm"
                onClick={handleEnterApp}
                className="hidden sm:inline-flex bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 "
              >
                <ArrowRight className="mr-2 w-4 h-4" />
                Enter App
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
            </span>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Open Source Starter Template
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Quick-start{" "}
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
              Axum
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Production-ready Rust backend template. Skip the boilerplate and 
            ship faster with built-in auth, database, and security.
          </p>

          {/* Terminal */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 text-left">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-2 text-xs text-zinc-400 font-mono">terminal</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-zinc-100">git clone https://github.com/rifuki/quax.git</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300  opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard("git clone https://github.com/rifuki/quax.git")}
                  >
                    {copiedCommand === "git clone https://github.com/rifuki/quax.git" ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-zinc-100">cd quax/api && cargo run</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300  opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard("cd quax/api && cargo run")}
                  >
                    {copiedCommand === "cd quax/api && cargo run" ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 text-zinc-500"># Server running at http://localhost:8080</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleEnterApp}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 h-12 text-base "
            >
              <ArrowRight className="mr-2 w-5 h-5" />
              Enter App
            </Button>
            <a href="https://github.com/rifuki/quax" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8"
              >
                <Github className="mr-2 w-5 h-5" />
                Star on GitHub
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "10x", label: "Faster Setup" },
              { value: "0", label: "Config Needed" },
              { value: "Rust", label: "Type Safe" },
              { value: "MIT", label: "License" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of the landing page... */}
      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Batteries Included
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build production-ready Rust APIs. 
              No more boilerplate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "JWT Authentication",
                description:
                  "Access + refresh tokens with httpOnly cookies. Automatic token rotation included.",
              },
              {
                icon: Lock,
                title: "Argon2 Password Hashing",
                description:
                  "Industry-leading password hashing. Secure by default, no configuration needed.",
              },
              {
                icon: Database,
                title: "PostgreSQL + SQLx",
                description:
                  "Type-safe database queries with compile-time checked SQL migrations included.",
              },
              {
                icon: Zap,
                title: "Rate Limiting",
                description:
                  "Built-in protection against brute force attacks. Configurable per IP out of the box.",
              },
              {
                icon: Server,
                title: "Request Tracing",
                description:
                  "Structured logging with request IDs. Performance metrics and HTTP tracing ready.",
              },
              {
                icon: Code2,
                title: "API Key Support",
                description:
                  "Machine-to-machine authentication with optional API key middleware.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group border-border hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 bg-card"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 p-8 sm:p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Ship?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Stop reinventing the wheel. Start building your product today 
              with a solid foundation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleEnterApp}
                className="bg-white text-red-600 hover:bg-white/90 h-12 px-8"
              >
                <ArrowRight className="mr-2 w-5 h-5" />
                Enter App
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-12 px-8"
              >
                <Github className="mr-2 w-5 h-5" />
                Star on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Quax
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              MIT License © 2026. Built with Rust for developers.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/rifuki/quax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
