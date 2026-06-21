import { useState, useEffect } from "react";
import { useGetAdminDashboard, useGetRevenueStats, useGetSubscriptionBreakdown, useGetTopGames } from "@workspace/api-client-react";
import {
  Users, Gamepad2, DollarSign, Zap, TrendingUp, Shield, Star,
  Activity, Server, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Clock, CreditCard, UserCheck, Flame,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const STAT_CARDS = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", trend: "+12.4%" },
  { key: "totalGames" as const, label: "Total Games", icon: Gamepad2, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", trend: "+3.1%" },
  { key: "totalRevenue" as const, label: "Total Revenue", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", prefix: "$", trend: "+18.7%" },
  { key: "activeSubscriptions" as const, label: "Active Subs", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", trend: "+8.2%" },
];

const FINANCIAL_CARDS = [
  { label: "MRR", value: "$24,800", trend: "+14.2%", up: true, icon: CreditCard, color: "text-blue-400" },
  { label: "ARR", value: "$297,600", trend: "+14.2%", up: true, icon: TrendingUp, color: "text-emerald-400" },
  { label: "Churn Rate", value: "2.3%", trend: "-0.4%", up: false, icon: UserCheck, color: "text-violet-400" },
  { label: "Avg LTV", value: "$142", trend: "+$12", up: true, icon: Flame, color: "text-amber-400" },
];

const MONITOR_STATS = [
  { label: "Active Sessions", value: "1,247", status: "green", icon: Activity },
  { label: "API req/min", value: "3,841", status: "green", icon: Server },
  { label: "Error Rate", value: "0.08%", status: "green", icon: AlertTriangle },
  { label: "Uptime", value: "99.97%", status: "green", icon: CheckCircle2 },
];

const RECENT_ACTIVITY = [
  { type: "user", text: "New user registered: PixelHunter42", time: "2m ago", color: "text-blue-400" },
  { type: "sub", text: "VIP subscription purchased by NebulaCrusher", time: "5m ago", color: "text-amber-400" },
  { type: "game", text: "Dragon's Lair: Reborn reached 10K downloads", time: "12m ago", color: "text-emerald-400" },
  { type: "alert", text: "High traffic detected on /api/games", time: "18m ago", color: "text-orange-400" },
  { type: "sub", text: "Premium subscription renewed by ShadowStrike", time: "24m ago", color: "text-violet-400" },
  { type: "user", text: "User CyberWolf updated their profile", time: "31m ago", color: "text-blue-400" },
  { type: "game", text: "New game submitted for review: Quantum Drift", time: "45m ago", color: "text-emerald-400" },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(240 2% 12%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "hsl(0 0% 80%)" },
};

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const { data: revenue } = useGetRevenueStats();
  const { data: breakdown = [] } = useGetSubscriptionBreakdown();
  const { data: topGames = [] } = useGetTopGames();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const liveUsers = 1247 + Math.floor(Math.sin(tick) * 15);
  const liveReqs = 3841 + Math.floor(Math.sin(tick * 0.7) * 120);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Platform overview · Last updated just now</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">All Systems Operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(card => (
          <div key={card.key} className={cn("bg-card border rounded-2xl p-5 relative overflow-hidden", card.border)}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border", card.bg, card.border)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <p data-testid={`admin-stat-${card.key}`} className="text-2xl font-bold text-foreground tracking-tight">
                {card.prefix}{typeof dashboard?.[card.key] === "number" && card.key === "totalRevenue"
                  ? Number(dashboard[card.key]).toLocaleString("en-US", { maximumFractionDigits: 0 })
                  : dashboard?.[card.key] ?? 0}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">{card.trend}</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Monitoring */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Live Monitoring</h2>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Real-time
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {MONITOR_STATS.map((stat, i) => {
            const live = i === 0 ? liveUsers.toLocaleString() : i === 1 ? liveReqs.toLocaleString() : stat.value;
            return (
              <div key={stat.label} className="bg-background border border-border rounded-xl p-4 text-center">
                <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
                <p className="text-xl font-bold text-foreground tabular-nums">{live}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Control */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Financial Control</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FINANCIAL_CARDS.map(card => (
            <div key={card.label} className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className={cn("w-3.5 h-3.5", card.color)} />
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <div className={cn("flex items-center gap-1 mt-1", card.up ? "text-emerald-400" : "text-red-400")}>
                {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span className="text-xs font-medium">{card.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-5">Monthly Revenue</h2>
          {revenue?.recentMonths ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenue.recentMonths}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 90% 60%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(221 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(221 90% 60%)" fill="url(#revenueGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Skeleton className="h-[200px] rounded-xl" />}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Subscription Mix</h2>
          {breakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={breakdown} dataKey="count" nameKey="plan" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3}>
                    {breakdown.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {breakdown.map(b => (
                  <div key={b.plan} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                      <span className="text-muted-foreground capitalize">{b.plan}</span>
                    </div>
                    <span className="font-semibold text-foreground">{b.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : <Skeleton className="h-48 rounded-xl" />}
        </div>
      </div>

      {/* Top Games + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {topGames.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Top Games</h2>
            <div className="space-y-3">
              {topGames.slice(0, 5).map((game, i) => (
                <div key={game.id} data-testid={`top-game-${game.id}`} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <div className="w-10 h-7 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/80/56`; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{game.title}</p>
                    <p className="text-xs text-muted-foreground">{game.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span className="text-xs font-semibold">{Number(game.rating).toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground w-14 text-right">{(game.downloads / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", item.color.replace("text-", "bg-"))} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{dashboard.newUsersThisWeek}</p>
            <p className="text-xs text-muted-foreground mt-0.5">New Users This Week</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <Shield className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{dashboard.bannedUsers}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Banned Accounts</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{(dashboard.downloads / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Downloads</p>
          </div>
        </div>
      )}
    </div>
  );
}
