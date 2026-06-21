import { useState } from "react";
import { useListGames } from "@workspace/api-client-react";
import {
  Code2, TrendingUp, Download, Star, DollarSign, Users, Plus, Upload, BarChart2, AlertCircle,
  CheckCircle, Clock, ArrowUpRight, ChevronRight, Settings, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useDeveloperStats } from "@/hooks/use-api";

const GAME_STATUS: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", label: "Active" },
  review: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "In Review" },
  rejected: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Rejected" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "games" | "analytics" | "revenue" | "settings">("dashboard");
  const { data: allGames = [] } = useListGames({ limit: 12 });
  const { data: devStats, isLoading: statsLoading } = useDeveloperStats();

  const monthlyData = MONTHS.slice(0, 6).map((month, i) => ({
    month,
    downloads: Math.floor(Math.random() * 20000) + 10000 + i * 2000,
    revenue: Math.floor(Math.random() * 6000) + 4000 + i * 800,
    users: Math.floor(Math.random() * 1000) + 800 + i * 150,
  }));

  const devGames = (devStats?.games ?? allGames.slice(0, 4)).map(g => ({
    ...g,
    devStatus: "active" as const,
    monthlyDownloads: typeof g.downloads === 'number' ? g.downloads : 0,
    monthlyRevenue: typeof g.price === 'number' ? Math.round(g.price * (typeof g.downloads === 'number' ? g.downloads : 1) * 0.0001) : 0,
    rating: typeof g.rating === 'number' ? g.rating : 0,
  }));

  const revenueSources = [
    { label: "Game Sales", amount: Math.round((devStats?.estimatedRevenue ?? 10000) * 0.6), pct: 60 },
    { label: "Subscription Share", amount: Math.round((devStats?.estimatedRevenue ?? 10000) * 0.25), pct: 25 },
    { label: "Marketplace Items", amount: Math.round((devStats?.estimatedRevenue ?? 10000) * 0.1), pct: 10 },
    { label: "Other", amount: Math.round((devStats?.estimatedRevenue ?? 10000) * 0.05), pct: 5 },
  ];

  const statsCards = [
    { label: "Total Downloads", value: statsLoading ? "..." : (devStats?.totalDownloads ?? 0).toLocaleString(), change: "+18.2%", icon: Download, color: "text-blue-400" },
    { label: "Monthly Revenue", value: statsLoading ? "..." : `$${(devStats?.estimatedRevenue ?? 0).toLocaleString()}`, change: "+28.4%", icon: DollarSign, color: "text-green-400" },
    { label: "Active Games", value: statsLoading ? "..." : `${devStats?.totalGames ?? 0}`, change: "+14.1%", icon: Users, color: "text-purple-400" },
    { label: "Avg. Rating", value: statsLoading ? "..." : `${devStats?.avgRating ?? 0}`, change: "+0.2", icon: Star, color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Code2 className="w-8 h-8 text-primary" /> Developer Portal
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">StarForge Studios · Verified Developer</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-all">
            <Plus className="w-4 h-4" /> Submit New Game
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-card rounded-xl p-1 w-fit">
          {(["dashboard", "games", "analytics", "revenue", "settings"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                activeTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-screen-xl mx-auto">

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-card border border-card-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={cn("w-5 h-5", stat.color)} />
                      <span className="text-xs text-green-400 font-semibold flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />{stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Revenue Chart */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Revenue & Downloads
                </h3>
                <select className="bg-secondary text-sm text-foreground rounded-lg px-3 py-1.5 border border-border focus:outline-none">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDownloads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #374151", borderRadius: 12 }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#gradRevenue)" strokeWidth={2} name="Revenue $" />
                  <Area yAxisId="right" type="monotone" dataKey="downloads" stroke="#8b5cf6" fill="url(#gradDownloads)" strokeWidth={2} name="Downloads" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Games Summary */}
            {statsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {devGames.map(game => {
                  const statusInfo = GAME_STATUS[game.devStatus] ?? GAME_STATUS.active;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={game.id} className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                      <div className="relative h-28">
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className={cn("absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", statusInfo.bg, statusInfo.color)}>
                          <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-sm text-foreground truncate">{game.title}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{game.monthlyDownloads.toLocaleString()}</span>
                          <span className="flex items-center gap-1 text-green-400"><DollarSign className="w-3 h-3" />{game.monthlyRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "games" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Your Games ({devGames.length})</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
                <Upload className="w-4 h-4" /> Submit New Game
              </button>
            </div>
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Game</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Downloads</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Revenue</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {devGames.map(game => {
                    const statusInfo = GAME_STATUS[game.devStatus] ?? GAME_STATUS.active;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={game.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{game.title}</p>
                              <p className="text-xs text-muted-foreground">{game.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("flex items-center gap-1.5 text-xs font-semibold", statusInfo.color)}>
                            <StatusIcon className="w-3.5 h-3.5" />{statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-foreground">{game.monthlyDownloads.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right text-sm text-green-400 font-semibold">${game.monthlyRevenue.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm text-yellow-400 flex items-center gap-0.5 justify-end font-semibold">
                            <Star className="w-3.5 h-3.5 fill-yellow-400" />{game.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Session Duration", value: "24.3 min", desc: "Avg per user", icon: Clock, color: "text-blue-400" },
                { label: "Total Reviews", value: `${devStats?.totalReviews ?? 0}`, desc: "Across all games", icon: Users, color: "text-green-400" },
                { label: "Crash Rate", value: "0.02%", desc: "Last 7 days", icon: AlertCircle, color: "text-red-400" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-card border border-card-border rounded-2xl p-5">
                    <Icon className={cn("w-6 h-6 mb-3", item.color)} />
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label} · {item.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-5">Monthly Active Users</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #374151", borderRadius: 12 }} />
                  <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="col-span-2 bg-card border border-card-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">Revenue Split</h3>
                <p className="text-sm text-muted-foreground mb-5">GamingOS takes 30%, you keep 70%</p>
                <div className="space-y-4">
                  {revenueSources.map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground">{item.label}</span>
                        <span className="font-bold text-foreground">${item.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-card-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">Next Payout</h3>
                <p className="text-4xl font-bold text-green-400">${Math.round((devStats?.estimatedRevenue ?? 0) * 0.7).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated July 1st</p>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Gross Revenue</span><span className="font-semibold text-foreground">${(devStats?.estimatedRevenue ?? 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (30%)</span><span className="text-red-400">-${Math.round((devStats?.estimatedRevenue ?? 0) * 0.3).toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-border/50 pt-3"><span className="text-muted-foreground">Net Payout (70%)</span><span className="font-bold text-green-400">${Math.round((devStats?.estimatedRevenue ?? 0) * 0.7).toLocaleString()}</span></div>
                </div>
                <button className="w-full mt-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                  View Payout History
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-xl space-y-5">
            {[
              { title: "Studio Profile", desc: "Manage your developer name, logo, and bio" },
              { title: "Payment Method", desc: "Bank account, PayPal, or crypto wallet" },
              { title: "API Access", desc: "API keys for integration with your systems" },
              { title: "Notification Preferences", desc: "Downloads, reviews, revenue alerts" },
              { title: "Team Members", desc: "Invite co-developers to your portal" },
            ].map(item => (
              <div key={item.title} className="bg-card border border-card-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer">
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
