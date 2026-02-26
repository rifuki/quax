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
import { ThemeToggle } from "@/components/ThemeToggle";
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
  ChevronRight,
  Blocks,
  Layers,
  Terminal,
} from "lucide-react";
import { useIsAuthenticated } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"api" | "ui">("api");

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
      navigate({ to: "/app" });
    } else {
      navigate({ to: "/app/login" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            <div className="flex items-center gap-2 z-10">
              <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">Quax</span>
            </div>

            {/* Centered nav links */}
            <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
              <div className="flex items-center gap-8 pointer-events-auto">
                <a
                  href="#quickstart"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quick Start
                </a>
                <a
                  href="#stack"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tech Stack
                </a>
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 z-10">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="quickstart" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-miku-primary/10 border border-miku-primary/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-miku-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-miku-primary-dark"></span>
            </span>
            <span className="text-sm font-medium text-miku-primary-dark dark:text-miku-primary-light">
              Open Source Starter Template
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Quick-start{" "}
            <span className="bg-gradient-to-r from-miku-primary via-miku-accent to-miku-secondary-dark bg-clip-text text-transparent">
              Axum
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Full-stack Rust + React template. Skip the boilerplate and ship
            faster with built-in auth, database, and UI.
          </p>

          {/* Terminal */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 text-left shadow-2xl">
              <div className="flex items-center justify-between px-4 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5 py-3">
                    <div className="w-3 h-3 rounded-full bg-miku-accent"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("api")}
                      className={`px-3 py-2.5 text-xs font-mono transition-colors border-b-2 ${activeTab === "api"
                        ? "text-zinc-100 border-miku-primary"
                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                        }`}
                    >
                      terminal 1 (api)
                    </button>
                    <button
                      onClick={() => setActiveTab("ui")}
                      className={`px-3 py-2.5 text-xs font-mono transition-colors border-b-2 ${activeTab === "ui"
                        ? "text-zinc-100 border-miku-secondary"
                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                        }`}
                    >
                      terminal 2 (ui)
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 font-mono text-sm space-y-4 text-zinc-300 min-h-[180px]">
                {activeTab === "api" ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start justify-between group">
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
                        <div className="flex gap-2">
                          <span className="text-miku-primary-light shrink-0">$</span>
                          <span className="text-zinc-100">
                            git clone https://github.com/rifuki/quax.git
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-miku-primary-light shrink-0">$</span>
                          <span className="text-zinc-100">cd quax/api</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-miku-primary-light shrink-0">$</span>
                          <span className="text-zinc-100">
                            cp .env.example .env
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-miku-primary-light shrink-0">$</span>
                          <span className="text-zinc-100">
                            docker compose --profile db up -d
                          </span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <span className="text-miku-primary-light shrink-0">$</span>
                          <span className="text-zinc-100">cargo run</span>
                        </div>
                        <div className="text-zinc-500">
                          # API running at http://localhost:8080
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                        onClick={() =>
                          copyToClipboard(
                            "git clone https://github.com/rifuki/quax.git\ncd quax/api\ncp .env.example .env\ndocker compose --profile db up -d\ncargo run",
                          )
                        }
                      >
                        {copiedCommand ===
                          "git clone https://github.com/rifuki/quax.git\ncd quax/api\ncp .env.example .env\ndocker compose --profile db up -d\ncargo run" ? (
                          <Check className="h-3 w-3 text-miku-primary" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start justify-between group">
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
                        <div className="flex gap-2">
                          <span className="text-miku-secondary-light shrink-0">$</span>
                          <span className="text-zinc-100">cd quax/ui</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <span className="text-miku-secondary-light shrink-0">$</span>
                          <span className="text-zinc-100">
                            npm i && npm run dev
                          </span>
                        </div>
                        <div className="text-zinc-500">
                          # UI running at http://localhost:5173
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                        onClick={() =>
                          copyToClipboard("cd quax/ui\nnpm i && npm run dev")
                        }
                      >
                        {copiedCommand ===
                          "cd quax/ui\nnpm i && npm run dev" ? (
                          <Check className="h-3 w-3 text-miku-primary" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleEnterApp}
              className="group bg-gradient-to-r from-miku-primary to-miku-accent-dark hover:from-miku-primary-dark hover:to-miku-accent-darker text-white px-8 h-12 text-base shadow-lg shadow-miku-primary/20 transition-all hover:shadow-miku-primary/40"
            >
              Enter App
              <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <a
              href="https://github.com/rifuki/quax"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="h-12 px-8">
                <Github className="mr-2 w-5 h-5" />
                Star on GitHub
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "Auth", label: "Built-in JWT" },
              { value: "Safe", label: "Compile-checked SQL" },
              { value: "Rust", label: "High Performance" },
              { value: "MIT", label: "Open Source" },
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

      {/* Tech Stack Section */}
      <section id="stack" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Modern Tech Stack
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with the most reliable and developer-friendly tools
              available today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Backend Stack */}
            <Card className="border-border hover:border-miku-primary/50 transition-all duration-300 bg-card overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-miku-primary to-miku-accent" />
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-miku-primary/10 flex items-center justify-center">
                    <Server className="w-6 h-6 text-miku-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Backend (API)</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Rust & Axum Ecosystem
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 flex-shrink-0 rounded bg-muted/50">
                    <Code2 className="w-5 h-5 text-miku-primary-light" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Rust & Axum
                    </div>
                    <div className="text-sm text-muted-foreground">
                      High performance, type-safe, concurrent web framework.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 flex-shrink-0 rounded bg-muted/50">
                    <Database className="w-5 h-5 text-miku-primary-light" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      PostgreSQL & SQLx
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Compile-time verified queries and robust migrations.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 flex-shrink-0 rounded bg-muted/50">
                    <Lock className="w-5 h-5 text-miku-primary-light" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      JWT & Argon2
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Secure authentication flow with robust password handling.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frontend Stack */}
            <Card className="border-border hover:border-miku-secondary/50 transition-all duration-300 bg-card overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-miku-accent to-miku-secondary-dark" />
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-miku-secondary/10 flex items-center justify-center">
                    <Blocks className="w-6 h-6 text-miku-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Frontend (UI)</CardTitle>
                    <CardDescription className="text-base mt-1">
                      React & TypeScript
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 flex-shrink-0 rounded bg-muted/50">
                    <Layers className="w-5 h-5 text-miku-secondary-light" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      React & Vite
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lightning fast HMR, modern component structure.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 flex-shrink-0 rounded bg-muted/50">
                    <Terminal className="w-5 h-5 text-miku-secondary-light" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Tailwind & shadcn/ui
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Beautifully designed, accessible, customizable components.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 flex-shrink-0 rounded bg-muted/50">
                    <Zap className="w-5 h-5 text-miku-secondary-light" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      TanStack (Router & Query)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type-safe routing and declarative data fetching.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Batteries Included
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build production-ready Rust APIs. No more
              boilerplate.
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
                className="group border-border hover:border-miku-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-miku-primary/10 bg-card"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-miku-primary/10 to-miku-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-miku-primary-dark dark:text-miku-primary-light" />
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

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="./favicon.svg" />
              <span className="text-xl font-bold text-foreground">Quax</span>
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
