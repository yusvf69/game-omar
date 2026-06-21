import { useState, useEffect } from "react";
import { Swords, Server, Users, DollarSign, Shield, AlertTriangle, Activity, Globe, Database, Cpu, TrendingUp, ShoppingBag, Gamepad2, Zap, Power, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminWarRoomPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const liveUsers = 1247 + Math.floor(Math.sin(tick) * 18);
  const liveReqs = 3841 + Math.floor(Math.sin(tick * 0.7) * 200);
  const cpuAvg = 45 + Math.floor(Math.sin(tick * 0.3) * 8);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-full">
      {/* War Room Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Swords className="w-6 h-6 text-red-400" /> War Room
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Emergency command center · All systems visible at a glance</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency Mode Active</span>
        </div>
      </div>

      {/* Top-level status bar */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {[
          { label: "Users", value: liveUsers.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Servers", value: "5 / 5", icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Revenue", value: "$24.8K", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "CPU Avg", value: `${cpuAvg}%`, icon: Cpu, color: cpuAvg > 70 ? "text-red-400" : "text-emerald-400", bg: "bg-red-500/10" },
          { label: "API Req/s", value: liveReqs.toLocaleString(), icon: Activity, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Reports", value: "12", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Games", value: "1,247", icon: Gamepad2, color: "text-primary", bg: "bg-primary/10" },
          { label: "Flags", value: "3", icon: Shield, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl p-2.5 text-center border border-border", s.bg)}>
            <s.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", s.color)} />
            <p className="text-xs font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid - All Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Servers */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-primary" /> Servers</h2>
          {[
            { name: "US-East", cpu: 45, status: "stable" },
            { name: "EU-West", cpu: 38, status: "stable" },
            { name: "Asia-Pac", cpu: 78, status: "high" },
          ].map(s => (
            <div key={s.name} className="flex items-center gap-2 py-1.5 text-[10px]">
              <span className={cn("w-1.5 h-1.5 rounded-full", s.status === "stable" ? "bg-emerald-400" : "bg-yellow-400 animate-pulse")} />
              <span className="w-16 text-foreground">{s.name}</span>
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", s.cpu > 70 ? "bg-red-400" : "bg-emerald-400")} style={{ width: `${s.cpu}%` }} />
              </div>
              <span className="text-muted-foreground w-8 text-right">{s.cpu}%</span>
            </div>
          ))}
        </div>

        {/* Users */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> Users</h2>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-foreground tabular-nums">{liveUsers.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Online Now</p>
            <div className="flex gap-4 justify-center mt-2 text-[10px]">
              <span className="text-emerald-400">+{Math.floor(tick * 0.3)} new/h</span>
              <span className="text-red-400">-{Math.floor(tick * 0.1)} left/h</span>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-primary" /> Payments</h2>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Today's Revenue</span><span className="font-bold text-foreground">$4,280</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending Refunds</span><span className="text-yellow-400 font-bold">$1,240</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fraud Alerts</span><span className="text-red-400 font-bold">3</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sub Revenue</span><span className="font-bold text-foreground">$3,140</span></div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Security</h2>
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Login Attempts</span><span className="font-bold text-foreground">1,247/h</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Blocked IPs</span><span className="text-red-400 font-bold">23</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">DDoS Status</span><span className="text-emerald-400 font-bold">Normal</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Flagged Users</span><span className="text-yellow-400 font-bold">12</span></div>
          </div>
        </div>

        {/* Tournaments */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Tournaments</h2>
          <div className="space-y-1 text-[10px]">
            {[
              { name: "Weekly Champ", players: 64, status: "active" },
              { name: "Speed Run Cup", players: 32, status: "active" },
              { name: "Midnight Showdown", players: 128, status: "pending" },
            ].map(t => (
              <div key={t.name} className="flex items-center justify-between">
                <span className="text-foreground">{t.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t.players}p</span>
                  <span className={cn("w-1.5 h-1.5 rounded-full", t.status === "active" ? "bg-emerald-400" : "bg-yellow-400")} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-primary" /> Marketplace</h2>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Active Listings</span><span className="font-bold text-foreground">1,247</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Trades Today</span><span className="font-bold text-foreground">89</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Flagged Items</span><span className="text-red-400 font-bold">4</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Volume Today</span><span className="font-bold text-foreground">$6,420</span></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-red-500/20 rounded-2xl p-4">
        <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Emergency Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Restart All Servers", icon: Power, color: "bg-red-500/20 text-red-400 border-red-500/30" },
            { label: "Disable Marketplace", icon: ShoppingBag, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
            { label: "Pause Tournaments", icon: TrendingUp, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
            { label: "Lock New Registrations", icon: Users, color: "bg-red-500/20 text-red-400 border-red-500/30" },
            { label: "Enable Maintenance Mode", icon: EyeOff, color: "bg-red-500/40 text-white border-red-500/60" },
            { label: "Full Platform Shutdown", icon: Power, color: "bg-red-500/60 text-white border-red-500/80" },
          ].map(b => (
            <button key={b.label} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors hover:opacity-80", b.color)}>
              <b.icon className="w-3.5 h-3.5" /> {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
