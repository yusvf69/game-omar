import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Gamepad2, Store, Trophy, Heart, Users, BarChart3,
  ListVideo, CreditCard, ChevronLeft, ChevronRight,
  User, Zap, ShieldCheck, ShoppingBag, Swords, Search,
  Code2, Newspaper, Menu, X, FileText, LogOut, LogIn, Headphones, Bell, TrendingUp, Settings, Calendar, MessageCircle, Shield, UserPlus, Home,
  Radio, AlertTriangle, Server, Lock, Brain, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getUserId } from "@/hooks/use-api";

function getNavItems() {
  return [
    { label: "Today", icon: Newspaper, href: "/" },
    { label: "Browse Games", icon: ListVideo, href: "/games" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Subscriptions", icon: CreditCard, href: "/store/subscriptions" },
    { label: "Marketplace", icon: ShoppingBag, href: "/marketplace" },
    { label: "Tournaments", icon: Swords, href: "/tournaments" },
    { label: "Leaderboard", icon: TrendingUp, href: "/leaderboard" },
    { label: "Events", icon: Calendar, href: "/events" },
    { label: "Achievements", icon: Trophy, href: "/achievements" },
    { label: "Friends", icon: Users, href: "/friends" },
    { label: "Chat", icon: MessageCircle, href: "/chat" },
    { label: "Guilds", icon: Shield, href: "/guilds" },
    { label: "Parties", icon: UserPlus, href: "/parties" },
    { label: "Voice", icon: Headphones, href: "/voice" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Wishlist", icon: Heart, href: "/wishlist" },
    { label: "My Profile", icon: User, href: `/profile/${getUserId()}` },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Developer", icon: Code2, href: "/developer" },
  ];
}

const adminItems = [
  { label: "Dashboard", icon: BarChart3, href: "/admin" },
  { label: "Featured System", icon: Star, href: "/admin/featured" },
  { label: "Live Tracking", icon: Radio, href: "/admin/live" },
  { label: "Games", icon: Gamepad2, href: "/admin/games" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Subscriptions", icon: ShieldCheck, href: "/admin/subscriptions" },
  { label: "Financial", icon: TrendingUp, href: "/admin/financial" },
  { label: "Moderation", icon: Shield, href: "/admin/moderation" },
  { label: "Fraud Detection", icon: AlertTriangle, href: "/admin/fraud" },
  { label: "Server Ops", icon: Server, href: "/admin/servers" },
  { label: "Notifications", icon: Bell, href: "/admin/notifications" },
  { label: "AI Insights", icon: Brain, href: "/admin/ai-insights" },
  { label: "Reports", icon: FileText, href: "/admin/reports" },
  { label: "Root Panel", icon: Lock, href: "/admin/root" },
  { label: "War Room", icon: Swords, href: "/admin/war-room" },
];

const bottomNavItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Games", icon: ListVideo, href: "/games" },
  { label: "Search", icon: Search, href: "/search" },
  { label: "Chat", icon: MessageCircle, href: "/chat" },
  { label: "Profile", icon: User, href: `/profile/${getUserId()}` },
];

function UserInfo({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all w-full"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <>
      <Link
        href={`/profile/${user?.id}`}
        onClick={onNavigate}
        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
          <img
            src={user?.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.username}`}
            alt=""
            className="w-full h-full"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user?.username}</p>
          <p className="text-xs text-muted-foreground truncate capitalize">{user?.subscriptionPlan ?? "free"}</p>
        </div>
      </Link>
      <button
        onClick={() => { logout(); onNavigate?.(); }}
        title="Sign out"
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </>
  );
}

function NotificationBadge() {
  const [count, setCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/notifications/${getUserId()}/unread-count`);
        const data = await res.json();
        setCount(data.count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-xl text-foreground tracking-wide">GamingOS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Platform</p>
        )}
        <ul className="space-y-0.5 px-2">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="relative">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label === "Notifications" && <NotificationBadge />}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 px-2">
          {!collapsed && (
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Admin</p>
          )}
          <ul className="space-y-0.5">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
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

      {/* User info + collapse toggle */}
      <div className="border-t border-sidebar-border flex-shrink-0">
        {!collapsed && (
          <div className="px-4 py-3 flex items-center gap-3">
            <UserInfo />
          </div>
        )}
        <div className="p-3 pt-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-foreground hover:bg-secondary">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">GamingOS</span>
        </Link>
        <Link href={`/profile/${getUserId()}`} className="p-1 rounded-full bg-secondary overflow-hidden">
          <User className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">GamingOS</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
            <p className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Platform</p>
            <ul className="space-y-0.5 px-2">
              {getNavItems().map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="relative">
                        <Icon className="w-4 h-4" />
                        {item.label === "Notifications" && <NotificationBadge />}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Admin</p>
            <ul className="space-y-0.5 px-2">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-sidebar-border px-4 py-3">
            <UserInfo onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      </aside>

      {/* Desktop sidebar - hidden on mdDown, collapsible */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14 pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-2 py-1 safe-area-bottom">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {item.label === "Notifications" && <NotificationBadge />}
              </span>
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
