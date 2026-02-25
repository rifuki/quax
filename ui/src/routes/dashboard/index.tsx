import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Shield, 
  Mail, 
  Calendar, 
  Clock, 
  Activity,
  Key,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Monitor,
  Globe,
  Smartphone
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/features/auth";
import { useDashboardStats } from "@/features/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  component: UserDashboard,
});

// Mock login history - nanti diganti dengan data dari API
const recentLogins = [
  { id: 1, device: "Chrome on macOS", location: "Jakarta, Indonesia", ip: "182.1.xxx.xxx", time: "Just now", current: true },
  { id: 2, device: "Safari on iPhone", location: "Jakarta, Indonesia", ip: "182.1.xxx.xxx", time: "2 hours ago", current: false },
  { id: 3, device: "Firefox on Windows", location: "Bandung, Indonesia", ip: "114.5.xxx.xxx", time: "Yesterday", current: false },
];

function UserDashboard() {
  const user = useAuthUser();
  const { data: stats } = useDashboardStats();

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Administrator Dashboard" : "User Dashboard"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/dashboard/admin">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/dashboard/profile">
              Edit Profile
            </Link>
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Account Type"
          value={isAdmin ? "Administrator" : "Standard User"}
          icon={<Shield className="h-4 w-4" />}
          badge={user.role}
          color={isAdmin ? "orange" : "blue"}
        />
        <StatCard
          title="Email"
          value={user.email}
          icon={<Mail className="h-4 w-4" />}
          truncate
        />
        <StatCard
          title="Member Since"
          value={new Date(user.created_at || Date.now()).toLocaleDateString()}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Last Login"
          value="Just now"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Admin Stats - Only for Admin */}
      {isAdmin && stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.total_users.toString()}
            icon={<Users className="h-4 w-4" />}
            color="green"
          />
          <StatCard
            title="Active API Keys"
            value={stats.active_api_keys.toString()}
            icon={<Key className="h-4 w-4" />}
            color="purple"
          />
          <StatCard
            title="New Users (This Month)"
            value={`+${stats.new_users_this_month}`}
            icon={<Activity className="h-4 w-4" />}
            color="cyan"
          />
          <StatCard
            title="Total Admins"
            value={stats.total_admins.toString()}
            icon={<Shield className="h-4 w-4" />}
            color="red"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Login History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Login History
              </CardTitle>
              <CardDescription>Recent login activity on your account</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogins.map((login) => (
                <div key={login.id} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {login.device.includes("iPhone") || login.device.includes("Android") ? (
                        <Smartphone className="h-5 w-5 text-primary" />
                      ) : (
                        <Monitor className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{login.device}</span>
                        {login.current && (
                          <Badge variant="outline" className="text-green-600 border-green-600">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {login.location}
                        </span>
                        <span>•</span>
                        <span>{login.ip}</span>
                        <span>•</span>
                        <span>{login.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickAction
                title="Edit Profile"
                description="Update your information"
                href="/dashboard/profile"
                icon={<Settings className="h-4 w-4" />}
              />
              <QuickAction
                title="Change Password"
                description="Secure your account"
                href="/dashboard/profile"
                icon={<Shield className="h-4 w-4" />}
              />
              {isAdmin && (
                <QuickAction
                  title="API Keys"
                  description="Manage API access"
                  href="/dashboard/admin/api-keys"
                  icon={<Key className="h-4 w-4" />}
                />
              )}
              <QuickAction
                title="Logout"
                description="Sign out from all devices"
                href="#"
                icon={<LogOut className="h-4 w-4" />}
                danger
              />
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-sm">🔒 Security Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication for enhanced security on your admin account.
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-orange-600">
                Learn more <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  badge?: string;
  truncate?: boolean;
  color?: "orange" | "blue" | "green" | "purple" | "cyan" | "red";
}

function StatCard({ title, value, icon, badge, truncate, color = "blue" }: StatCardProps) {
  const colorClasses = {
    orange: "bg-orange-500/10 text-orange-600",
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
    red: "bg-red-500/10 text-red-600",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
          {title}
        </CardTitle>
        <div className={cn("h-8 w-8 rounded-md p-1.5", colorClasses[color])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-lg font-semibold", truncate && "truncate")}>
          {value}
        </div>
        {badge && (
          <Badge 
            variant={badge === "admin" ? "destructive" : "default"} 
            className="mt-2"
          >
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon,
  danger,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors group",
        danger 
          ? "hover:bg-destructive/10 hover:border-destructive/50" 
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
        danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-medium", danger && "text-destructive")}>{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
