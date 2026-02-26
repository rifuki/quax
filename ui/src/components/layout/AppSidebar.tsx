import { Link, useLocation } from "@tanstack/react-router";
import {
  PanelLeft,
  User,
  Shield,
  MonitorSmartphone,
  Users,
  Key,
  LayoutDashboard
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthUser } from "@/features/auth/hooks/use-auth";

export function AppSidebar() {
  const user = useAuthUser();
  const isAdmin = user?.role === "admin";
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/app/admin") {
      return location.pathname === "/app/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between">
              <SidebarMenuButton size="lg" asChild>
                <Link to={isAdmin ? "/app/admin" : "/app"}>
                  <img src="/favicon.svg" alt="Quax Logo" className="aspect-square size-8" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Quax</span>
                    <span className="truncate text-xs text-muted-foreground">{isAdmin ? "Admin Dashboard" : "App"}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger className="ml-1 h-8 w-8 hidden md:flex">
                <PanelLeft className="h-4 w-4" />
              </SidebarTrigger>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(isAdmin ? "/app/admin" : "/app")} tooltip="Overview">
                <Link to={isAdmin ? "/app/admin" : "/app"}>
                  <LayoutDashboard className="size-4" />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {[
                { title: "Users", href: "/app/admin/users", icon: Users },
                { title: "API Keys", href: "/app/admin/api-keys", icon: Key },
              ].map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                    <Link to={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            {[
              { title: "Profile", href: "/app/settings/profile", icon: User },
              { title: "Security", href: "/app/settings/security", icon: Shield },
              { title: "Sessions", href: "/app/settings/sessions", icon: MonitorSmartphone },
            ].map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                  <Link to={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
