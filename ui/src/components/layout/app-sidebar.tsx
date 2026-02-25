import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  Settings,
  ChevronRight,
  LogOut,
  Command,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthUser, useLogout } from "@/features/auth";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: "Admin",
    href: "/dashboard/admin",
    icon: Settings,
    items: [
      { title: "Overview", href: "/dashboard/admin" },
      { title: "Users", href: "/dashboard/admin?tab=users" },
      { title: "API Keys", href: "/dashboard/admin?tab=api-keys" },
    ],
  },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function AppSidebar({ isCollapsed, setIsCollapsed }: AppSidebarProps) {
  const location = useLocation();
  const user = useAuthUser();
  const logout = useLogout();
  const isAdmin = user?.role === "admin";

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Command className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Quax</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Command className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-3">
          {[...navItems, ...(isAdmin ? adminNavItems : [])].map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t p-3">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full"
                  onClick={() => logout.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => logout.mutate()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent",
            "transition-transform duration-300",
            isCollapsed && "rotate-180"
          )}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </aside>
    </TooltipProvider>
  );
}

function NavItemComponent({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  isCollapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const active = isActive(item.href);
  const Icon = item.icon;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.href}>
            <Button
              variant={active ? "secondary" : "ghost"}
              size="icon"
              className="w-full"
            >
              <Icon className="h-4 w-4" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  if (item.items) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={active ? "secondary" : "ghost"}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {item.title}
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-90"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pl-9">
          {item.items.map((subItem) => (
            <Link key={subItem.href} to={subItem.href}>
              <Button
                variant={isActive(subItem.href) ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                size="sm"
              >
                {subItem.title}
              </Button>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link to={item.href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className="w-full justify-start gap-3"
      >
        <Icon className="h-4 w-4" />
        {item.title}
      </Button>
    </Link>
  );
}
