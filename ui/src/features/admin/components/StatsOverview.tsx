/**
 * Stats Overview Component
 * Display dashboard statistics cards
 */

import { Users, Shield, Key, KeyRound, TrendingUp } from "lucide-react";
import { useDashboardStats } from "../hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
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
        {(description || trend !== undefined) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend !== undefined && (
              <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
                {trend >= 0 ? "+" : ""}{trend}%
              </span>
            )}
            {description && ` ${description}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsOverview() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load stats
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Users"
        value={stats.total_users}
        icon={<Users className="h-full w-full" />}
        description="registered accounts"
      />
      <StatCard
        title="Admins"
        value={stats.total_admins}
        icon={<Shield className="h-full w-full" />}
        description="with admin privileges"
      />
      <StatCard
        title="API Keys"
        value={stats.total_api_keys}
        icon={<Key className="h-full w-full" />}
        description="total created"
      />
      <StatCard
        title="Active Keys"
        value={stats.active_api_keys}
        icon={<KeyRound className="h-full w-full" />}
        description="currently active"
      />
      <StatCard
        title="New This Month"
        value={stats.new_users_this_month}
        icon={<TrendingUp className="h-full w-full" />}
        description="new registrations"
      />
    </div>
  );
}
