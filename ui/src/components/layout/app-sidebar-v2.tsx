import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  Settings,
  ChevronRight,
  LogOut,
  Command,
  Menu,
  X,
  Bell,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthUser, useLogout } from "@/features/auth";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Profile", href: "/dashboard/profile", icon: User },
];

const adminNavItem: NavItem = {
  title: "Admin",
  href: "/dashboard/admin",
  icon: Settings,
  items: [
    { title: "Overview", href: "/dashboard/admin" },
    { title: "Users", href: "/dashboard/admin/users" },
    { title: "API Keys", href: "/dashboard/admin/api-keys" },
  ],
};

// Mock notifications
const notifications = [
  { id: 1, title: "New user registered", description: "john@example.com joined", time: "2 min ago", unread: true },
  { id: 2, title: "API Key created", description: "Production key was created", time: "1 hour ago", unread: true },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function AppSidebar({ mobileOpen, setMobileOpen }: AppSidebarProps) {
  const location = useLocation();
  const user = useAuthUser();
  const logout = useLogout();
  const isAdmin = user?.role === "admin";
  const [collapsed, setCollapsed] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
            <Command className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-lg whitespace-nowrap">Quax</span>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Admin Dashboard</p>
            </div>
          )}
        </Link>
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors",
            collapsed && "rotate-180"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {[...navItems, ...(isAdmin ? [adminNavItem] : [])].map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            isActive={isActive}
            collapsed={collapsed}
            isMobile={true}
          />
        ))}
      </nav>

      {/* Notifications (Desktop only) */}
      {!collapsed && (
        <div className="px-3 pb-2 hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 relative">
                <Bell className="h-4 w-4" />
                <span className="flex-1 text-left">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications ({unreadCount} new)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{n.title}</span>
                    {n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{n.description}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* User Profile */}
      <div className="border-t p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 ">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 rounded-lg border p-3  hover:bg-accent transition-colors">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/admin">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r bg-background transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function NavItemComponent({
  item,
  isActive,
  collapsed,
  isMobile,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  collapsed: boolean;
  isMobile: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const active = isActive(item.href);
  const Icon = item.icon;

  // Auto-expand if child is active
  useEffect(() => {
    if (item.items?.some((sub) => isActive(sub.href))) {
      setIsOpen(true);
    }
  }, [item.items, isActive]);

  if (!isMobile && collapsed) {
    return (
      <Link to={item.href}>
        <Button
          variant={active ? "secondary" : "ghost"}
          size="icon"
          className="w-full"
          title={item.title}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </Link>
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
              {!collapsed && <span>{item.title}</span>}
            </div>
            {!collapsed && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className={cn("space-y-1", !collapsed && "pl-9")}>
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
        className={cn("w-full", collapsed ? "justify-center" : "justify-start gap-3")}
      >
        <Icon className="h-4 w-4" />
        {!collapsed && <span>{item.title}</span>}
      </Button>
    </Link>
  );
}

// Mobile menu trigger component
export function MobileMenuTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  );
}
