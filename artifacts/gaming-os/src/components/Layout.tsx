import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Gamepad2, Store, Trophy, Heart, Users, BarChart3,
  ListVideo, CreditCard, ChevronLeft, ChevronRight,
  User, Zap, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_USER_ID = 1;

const navItems = [
  { label: "Store", icon: Store, href: "/" },
  { label: "Browse Games", icon: ListVideo, href: "/games" },
  { label: "Subscriptions", icon: CreditCard, href: "/store/subscriptions" },
  { label: "Achievements", icon: Trophy, href: "/achievements" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
  { label: "My Profile", icon: User, href: `/profile/${DEMO_USER_ID}` },
];

const adminItems = [
  { label: "Dashboard", icon: BarChart3, href: "/admin" },
  { label: "Games", icon: Gamepad2, href: "/admin/games" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Subscriptions", icon: ShieldCheck, href: "/admin/subscriptions" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-xl text-foreground tracking-wide">
              GamingOS
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {!collapsed && (
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Platform
            </p>
          )}
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 px-2">
            {!collapsed && (
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Admin
              </p>
            )}
            <ul className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-testid={`nav-admin-${item.label.toLowerCase()}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            data-testid="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
