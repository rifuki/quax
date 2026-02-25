import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Users, Key, TrendingUp, Shield, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/features/auth";
import { useDashboardStats } from "@/features/admin";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboard,
});

const mockChartData = [
  { name: "Mon", users: 12 },
  { name: "Tue", users: 19 },
  { name: "Wed", users: 15 },
  { name: "Thu", users: 25 },
  { name: "Fri", users: 22 },
  { name: "Sat", users: 8 },
  { name: "Sun", users: 10 },
];

function AdminDashboard() {
  const user = useAuthUser();
  const { data: stats, isLoading } = useDashboardStats();
  const location = useLocation();
  const isChildRoute = location.pathname !== "/dashboard/admin";

  // Render child routes (Users, API Keys)
  if (isChildRoute) {
    return <Outlet />;
  }
  

  if (user?.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access this page. This area is restricted to administrators only.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your application settings, users, and API keys.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          description="Registered accounts"
          icon={<Users className="h-4 w-4" />}
          trend="+12%"
          trendUp={true}
          loading={isLoading}
        />
        <StatCard
          title="Administrators"
          value={stats?.total_admins || 0}
          description="With full access"
          icon={<Shield className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatCard
          title="API Keys"
          value={stats?.total_api_keys || 0}
          description="Total created"
          icon={<Key className="h-4 w-4" />}
          trend="+5%"
          trendUp={true}
          loading={isLoading}
        />
        <StatCard
          title="Active Keys"
          value={stats?.active_api_keys || 0}
          description="Currently active"
          icon={<TrendingUp className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Charts & Quick Links */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActionCard
              title="Manage Users"
              description="View, edit, and manage user accounts"
              href="/dashboard/admin/users"
              icon={<Users className="h-5 w-5" />}
            />
            <ActionCard
              title="API Keys"
              description="Create and manage API access keys"
              href="/dashboard/admin/api-keys"
              icon={<Key className="h-5 w-5" />}
            />
            <ActionCard
              title="System Settings"
              description="Configure application settings"
              href="/dashboard/admin/settings"
              icon={<TrendingUp className="h-5 w-5" />}
              comingSoon
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}

function StatCard({ title, value, description, icon, trend, trendUp, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={trendUp ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
              {trend}
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

function ActionCard({ title, description, href, icon, comingSoon }: ActionCardProps) {
  return (
    <Link
      to={href}
      className="group flex items-start gap-4 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors relative"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{title}</h4>
          {comingSoon && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              Soon
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
