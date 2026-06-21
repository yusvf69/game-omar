import { useState } from "react";
import { useGetRevenueStats, useGetSubscriptionBreakdown, useListGames, useListUsers } from "@workspace/api-client-react";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { BarChart3, Download, TrendingUp, Users, Gamepad2, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "90d" | "1y";

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(240 2% 12%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "hsl(0 0% 80%)" },
};

const USER_GROWTH = [
  { month: "Jan", newUsers: 120, churned: 12, net: 108 },
  { month: "Feb", newUsers: 148, churned: 18, net: 130 },
  { month: "Mar", newUsers: 172, churned: 15, net: 157 },
  { month: "Apr", newUsers: 195, churned: 22, net: 173 },
  { month: "May", newUsers: 240, churned: 19, net: 221 },
  { month: "Jun", newUsers: 287, churned: 28, net: 259 },
];

const REVENUE_BY_PLAN = [
  { plan: "VIP", revenue: 3800, color: "#fbbf24" },
  { plan: "Premium", revenue: 6200, color: "#a78bfa" },
  { plan: "Basic", revenue: 4100, color: "#60a5fa" },
  { plan: "Free", revenue: 0, color: "#8e8e93" },
];

const DOWNLOADS_BY_CATEGORY = [
  { category: "Action", downloads: 48000 },
  { category: "RPG", downloads: 35000 },
  { category: "Racing", downloads: 22000 },
  { category: "Strategy", downloads: 19000 },
  { category: "Sports", downloads: 14000 },
  { category: "Puzzle", downloads: 11000 },
];

const CONVERSION_FUNNEL = [
  { stage: "Visitors", count: 50000 },
  { stage: "Registered", count: 12400 },
  { stage: "Any Sub", count: 4800 },
  { stage: "Paid Sub", count: 2100 },
  { stage: "VIP", count: 480 },
];

const RETENTION = [
  { cohort: "Jan", d1: 85, d7: 62, d30: 41, d90: 28 },
  { cohort: "Feb", d1: 87, d7: 65, d30: 44, d90: 31 },
  { cohort: "Mar", d1: 83, d7: 61, d30: 39, d90: 27 },
  { cohort: "Apr", d1: 89, d7: 68, d30: 46, d90: 33 },
  { cohort: "May", d1: 91, d7: 71, d30: 49, d90: null },
  { cohort: "Jun", d1: 88, d7: 67, d30: null, d90: null },
];

const PERIOD_LABELS: Record<Period, string> = { "7d": "Last 7 Days", "30d": "Last 30 Days", "90d": "Last 90 Days", "1y": "Last Year" };

const REPORT_SECTIONS = [
  { id: "revenue", label: "Revenue", icon: CreditCard },
  { id: "users", label: "Users", icon: Users },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "retention", label: "Retention", icon: RefreshCw },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [section, setSection] = useState("revenue");

  const { data: revenue } = useGetRevenueStats();
  const { data: breakdown = [] } = useGetSubscriptionBreakdown();
  const { data: games = [] } = useListGames({ limit: 100 });
  const { data: users = [] } = useListUsers({ limit: 100 });

  const totalRevenue = revenue?.totalRevenue ?? 0;
  const mrr = revenue?.recentMonths?.slice(-1)[0]?.revenue ?? 0;

  const handleExport = () => {
    const rows = [
      ["Month", "Revenue"],
      ...(revenue?.recentMonths ?? []).map(m => [m.month, m.revenue]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gaming_os_revenue.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Platform Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Analytics, trends, and growth metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border",
                period === p ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}>
              {p}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={handleExport} className="ml-2 rounded-xl border-border">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {REPORT_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              section === s.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {/* Revenue Section */}
      {section === "revenue" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${Number(totalRevenue).toLocaleString()}</p>
              <p className="text-xs text-emerald-400 mt-1">+18.7% YoY</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Current MRR</p>
              <p className="text-2xl font-bold text-foreground">${mrr.toLocaleString()}</p>
              <p className="text-xs text-emerald-400 mt-1">+14.2% vs last month</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">ARPU</p>
              <p className="text-2xl font-bold text-foreground">${users.length ? (mrr / Math.max(1, users.length) * 100).toFixed(2) : "0.00"}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg revenue per user</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Trend</h3>
              {revenue?.recentMonths ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenue.recentMonths}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(221 90% 60%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(221 90% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(221 90% 60%)" fill="url(#revGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Skeleton className="h-56 rounded-xl" />}
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Plan</h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={REVENUE_BY_PLAN.filter(p => p.revenue > 0)} dataKey="revenue" nameKey="plan" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3}>
                    {REVENUE_BY_PLAN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {REVENUE_BY_PLAN.filter(p => p.revenue > 0).map(p => (
                  <div key={p.plan} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-muted-foreground">{p.plan}</span>
                    </div>
                    <span className="font-semibold text-foreground">${p.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      {section === "users" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{users.length.toLocaleString()}</p>
              <p className="text-xs text-emerald-400 mt-1">+12.4% this month</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === "active").length}</p>
              <p className="text-xs text-muted-foreground mt-1">{users.length ? ((users.filter(u => u.status === "active").length / users.length) * 100).toFixed(1) : 0}% of total</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground">17.3%</p>
              <p className="text-xs text-emerald-400 mt-1">Free → Paid</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={USER_GROWTH}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="newUsers" name="New" fill="hsl(221 90% 60%)" radius={[4,4,0,0]} />
                  <Bar dataKey="churned" name="Churned" fill="hsl(0 72% 55%)" radius={[4,4,0,0]} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0 0% 50%)" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Acquisition Funnel</h3>
              <div className="space-y-3 mt-2">
                {CONVERSION_FUNNEL.map((step, i) => {
                  const pct = (step.count / CONVERSION_FUNNEL[0].count) * 100;
                  return (
                    <div key={step.stage}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{step.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
                          <span className="font-semibold text-foreground">{step.count.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Games Section */}
      {section === "games" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Games</p>
              <p className="text-2xl font-bold text-foreground">{games.length}</p>
              <p className="text-xs text-emerald-400 mt-1">+3.1% this month</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-foreground">
                {games.length ? (games.reduce((s, g) => s + Number(g.rating), 0) / games.length).toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Across all titles</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Downloads</p>
              <p className="text-2xl font-bold text-foreground">{(games.reduce((s, g) => s + (g.downloads ?? 0), 0) / 1000).toFixed(0)}K</p>
              <p className="text-xs text-emerald-400 mt-1">+22.5% YoY</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Downloads by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={DOWNLOADS_BY_CATEGORY} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="category" tick={{ fill: "hsl(0 0% 60%)", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${(v/1000).toFixed(1)}K downloads`, ""]} />
                <Bar dataKey="downloads" fill="hsl(221 90% 60%)" radius={[0,4,4,0]}>
                  {DOWNLOADS_BY_CATEGORY.map((_, i) => (
                    <Cell key={i} fill={`hsl(${221 + i * 12} 80% ${55 + i * 3}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Retention Section */}
      {section === "retention" && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Retention by Cohort</h3>
            <p className="text-xs text-muted-foreground mb-5">% of users still active after N days from registration</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={RETENTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
                <XAxis dataKey="cohort" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0 0% 50%)" }} />
                <Line type="monotone" dataKey="d1" name="Day 1" stroke="hsl(221 90% 60%)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="d7" name="Day 7" stroke="hsl(142 70% 45%)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="d30" name="Day 30" stroke="hsl(38 92% 55%)" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="d90" name="Day 90" stroke="hsl(262 80% 60%)" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Day 1 Retention", value: "88%", color: "text-blue-400", trend: "+2.1%" },
              { label: "Day 7 Retention", value: "66%", color: "text-emerald-400", trend: "+3.4%" },
              { label: "Day 30 Retention", value: "44%", color: "text-amber-400", trend: "+1.8%" },
              { label: "Day 90 Retention", value: "30%", color: "text-violet-400", trend: "+0.9%" },
            ].map(m => (
              <div key={m.label} className="bg-card border border-border rounded-2xl p-5 text-center">
                <p className={cn("text-2xl font-bold", m.color)}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                <p className="text-xs text-emerald-400 mt-0.5">{m.trend}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
