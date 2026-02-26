import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, EyeOff, ArrowRight, Loader2, Zap, ShieldCheck, Package } from "lucide-react";
import { useRegister, useIsAuthenticated, useAuthUser } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/app/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [name, setName] = useState(import.meta.env.DEV ? "Test User" : "");
  const [username, setUsername] = useState(import.meta.env.DEV ? "testuser" : "");
  const [email, setEmail] = useState(import.meta.env.DEV ? "test@example.com" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "password123" : "");
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();
  const user = useAuthUser();

  useEffect(() => {
    if (isAuthenticated) {
      // Handled by app layout
    }
  }, [isAuthenticated, navigate, user]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({ name, username, email, password });
      // Redirect handled globally.
    } catch { }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-8 lg:px-12 relative h-full">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <img src="/favicon.svg" alt="Quax" className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight">Quax</span>
          </div>

          {/* Form Card */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
              <p className="text-sm text-muted-foreground">Start your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-miku-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-miku-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-miku-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-11 pr-10 transition-all focus-visible:ring-2 focus-visible:ring-miku-primary/50"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-miku-primary to-miku-accent hover:opacity-90 transition-opacity text-base font-medium shadow-md hover:shadow-lg"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create account <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/app/login" className="font-semibold text-miku-primary hover:text-miku-accent transition-colors hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-12 pb-4">
            By signing up, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="relative hidden lg:flex h-full flex-col bg-zinc-950 p-10 text-white dark:border-l">
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-20 m-auto w-full max-w-sm">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-medium tracking-tight">Quax Fullstack Template</h2>
              <p className="text-sm text-zinc-400">
                A modern foundation for your next project, built with speed, security, and reliability in mind.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {[
                {
                  icon: Zap,
                  title: "High-Performance API",
                  desc: "Optimized Rust backend architecture"
                },
                {
                  icon: ShieldCheck,
                  title: "Secure Authentication",
                  desc: "Robust session & JWT management"
                },
                {
                  icon: Package,
                  title: "Production Ready",
                  desc: "Configured CI/CD & infrastructure"
                }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                    <feature.icon className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium leading-none text-zinc-100">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tech Stack Bubbles */}
            <div className="flex gap-2.5 pt-6">
              {["Rust", "React", "TypeScript"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-800 select-none"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
