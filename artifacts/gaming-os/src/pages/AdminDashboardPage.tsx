import { useGetAdminDashboard, useGetRevenueStats, useGetSubscriptionBreakdown, useGetTopGames } from "@workspace/api-client-react";
import { Users, Gamepad2, DollarSign, Zap, TrendingUp, Shield, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const STAT_CARDS = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users, color: "text-blue-400", bg: "bg-blue-900/20" },
  { key: "totalGames" as const, label: "Total Games", icon: Gamepad2, color: "text-violet-400", bg: "bg-violet-900/20" },
  { key: "totalRevenue" as const, label: "Total Revenue", icon: DollarSign, color: "text-green-400", bg: "bg-green-900/20", prefix: "$" },
  { key: "activeSubscriptions" as const, label: "Active Subs", icon: Zap, color: "text-amber-400", bg: "bg-amber-900/20" },
];

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const { data: revenue } = useGetRevenueStats();
  const { data: breakdown = [] } = useGetSubscriptionBreakdown();
  const { data: topGames = [] } = useGetTopGames();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p data-testid={`admin-stat-${card.key}`} className="text-2xl font-bold text-foreground">
                {card.prefix}{typeof dashboard?.[card.key] === "number" && card.key === "totalRevenue"
                  ? Number(dashboard[card.key]).toLocaleString("en-US", { maximumFractionDigits: 0 })
                  : dashboard?.[card.key] ?? 0}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-5">Monthly Revenue</h2>
          {revenue?.recentMonths ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenue.recentMonths}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 90% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 19% 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 24% 10%)", border: "1px solid hsl(217 19% 20%)", borderRadius: 8 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(221 90% 60%)" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Skeleton className="h-[200px] rounded-lg" />}
        </div>

        {/* Plan Breakdown Pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Subscription Breakdown</h2>
          {breakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={breakdown} dataKey="count" nameKey="plan" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {breakdown.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(222 24% 10%)", border: "1px solid hsl(217 19% 20%)", borderRadius: 8 }}
                    formatter={(v: number, name: string) => [v, name]}
                  />
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
          ) : <Skeleton className="h-48 rounded-lg" />}
        </div>
      </div>

      {/* Top Games */}
      {topGames.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Top Games</h2>
          <div className="space-y-3">
            {topGames.slice(0, 5).map((game, i) => (
              <div key={game.id} data-testid={`top-game-${game.id}`} className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <div className="w-10 h-7 rounded overflow-hidden flex-shrink-0">
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
                <span className="text-xs text-muted-foreground w-16 text-right">{(game.downloads / 1000).toFixed(0)}K dl</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{dashboard.newUsersThisWeek}</p>
            <p className="text-xs text-muted-foreground">New Users This Week</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Shield className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{dashboard.bannedUsers}</p>
            <p className="text-xs text-muted-foreground">Banned Users</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{(dashboard.downloads / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Total Downloads</p>
          </div>
        </div>
      )}
    </div>
  );
}
