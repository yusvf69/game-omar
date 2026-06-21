import { useState, useEffect } from "react";
import { Server, Cpu, Activity, AlertTriangle, Database, Globe, RefreshCw, Power, BarChart3, Zap, Thermometer, HardDrive, Wifi, Clock, Shield, Users, Gamepad2, Swords, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_SERVERS = [
  { name: "US-East", cpu: 45, ram: 62, disk: 55, status: "stable", users: 1234, load: "normal", region: "Virginia" },
  { name: "EU-West", cpu: 38, ram: 55, disk: 48, status: "stable", users: 982, load: "normal", region: "Frankfurt" },
  { name: "Middle-East", cpu: 52, ram: 71, disk: 42, status: "stable", users: 456, load: "normal", region: "Dubai" },
  { name: "Asia-Pacific", cpu: 78, ram: 88, disk: 72, status: "high_load", users: 2341, load: "high", region: "Singapore" },
  { name: "South America", cpu: 32, ram: 45, disk: 38, status: "stable", users: 312, load: "normal", region: "Sao Paulo" },
];

const CRASH_DATA = [
  { game: "Cyber Arena", version: "2.4.1", device: "iPhone 17 Pro", rate: "2.3%", users: 147, status: "investigating", time: "5m ago" },
  { game: "Nebula Assault", version: "1.8.0", device: "Samsung S29", rate: "1.1%", users: 83, status: "monitoring", time: "1h ago" },
  { game: "Dragon's Lair: Reborn", version: "3.0.2", device: "PC (RTX 7090)", rate: "0.4%", users: 22, status: "resolved", time: "3h ago" },
];

const TOURNAMENTS = [
  { name: "Weekly Championship", game: "Cyber Arena", players: 64, status: "active", round: "Quarter Finals" },
  { name: "Speed Run Cup", game: "Speed Storm", players: 32, status: "active", round: "Semi Finals" },
  { name: "Midnight Showdown", game: "Mech Warfare Elite", players: 128, status: "pending", round: "Registration" },
];

export default function AdminServerOpsPage() {
  const [activeSection, setActiveSection] = useState<"servers" | "crashes" | "tournaments" | "marketplace">("servers");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operations Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Servers, crashes, tournaments & marketplace control</p>
        </div>
        <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 border",
          MOCK_SERVERS.some(s => s.status === "high_load") ? "bg-yellow-500/10 border-yellow-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
          <span className={cn("w-2 h-2 rounded-full animate-pulse", MOCK_SERVERS.some(s => s.status === "high_load") ? "bg-yellow-400" : "bg-emerald-400")} />
          <span className="text-xs font-semibold">{MOCK_SERVERS.some(s => s.status === "high_load") ? "High Load Detected" : "All Systems Operational"}</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-0.5 w-fit flex-wrap">
        {[
          { key: "servers" as const, label: "Servers", icon: Server },
          { key: "crashes" as const, label: "Live Crashes", icon: AlertTriangle },
          { key: "tournaments" as const, label: "Tournaments", icon: Swords },
          { key: "marketplace" as const, label: "Marketplace", icon: ShoppingBag },
        ].map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeSection === s.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {activeSection === "servers" && (
        <>
          {/* Global Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { label: "Network I/O", value: "2.4 Gbps", icon: Wifi, color: "text-emerald-400", pct: 62 },
              { label: "DB Queries", value: "8,421/s", icon: Database, color: "text-blue-400", pct: 45 },
              { label: "Avg Latency", value: "34ms", icon: Activity, color: "text-emerald-400", pct: 28 },
              { label: "Storage Used", value: "4.2 / 8 TB", icon: HardDrive, color: "text-amber-400", pct: 52 },
            ].map(m => (
              <div key={m.label} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon className={cn("w-3 h-3", m.color)} />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{m.value}</p>
                <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", m.pct > 70 ? "bg-red-400" : m.pct > 50 ? "bg-yellow-400" : "bg-emerald-400")} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Server Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_SERVERS.map(s => (
              <div key={s.name} className={cn("bg-card border rounded-2xl p-4", s.status === "high_load" ? "border-yellow-500/30" : "border-border")}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{s.name}</span>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                    s.status === "stable" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400")}>
                    {s.status.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <BarRow label="CPU" value={s.cpu} color={s.cpu > 70 ? "bg-red-400" : s.cpu > 50 ? "bg-yellow-400" : "bg-emerald-400"} />
                  <BarRow label="RAM" value={s.ram} color={s.ram > 70 ? "bg-red-400" : s.ram > 50 ? "bg-yellow-400" : "bg-emerald-400"} />
                  <BarRow label="Disk" value={s.disk} />
                  <BarRow label="Net" value={Math.floor(Math.random() * 40 + 30)} color="bg-blue-400" />
                  <BarRow label="DB" value={Math.floor(Math.random() * 30 + 20)} color="bg-violet-400" />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
                  <span>{s.users.toLocaleString()} users</span>
                  <span>{s.region}</span>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => alert(`Restarting ${s.name}...`)} className="flex-1 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold hover:bg-blue-500/30 transition-colors">
                    <RefreshCw className="w-3 h-3 inline mr-0.5" /> Restart
                  </button>
                  <button onClick={() => alert(`Scaling ${s.name}...`)} className="flex-1 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-bold hover:bg-green-500/30 transition-colors">
                    <Zap className="w-3 h-3 inline mr-0.5" /> Scale
                  </button>
                  <button onClick={() => alert(`Shutting down ${s.name} region...`)} className="py-1.5 px-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold hover:bg-red-500/30 transition-colors">
                    <Power className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Global Controls */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Global Operations</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Restart All", icon: RefreshCw, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", action: () => alert("Restarting all servers...") },
                { label: "Emergency Shutdown", icon: Power, color: "bg-red-500/20 text-red-400 border-red-500/30", action: () => confirm("Are you sure?") && alert("All servers shutting down!") },
                { label: "Rollback Deployment", icon: Clock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", action: () => alert("Rolling back to previous deployment...") },
                { label: "Scale All Services", icon: BarChart3, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", action: () => alert("Scaling all services...") },
              ].map(b => (
                <button key={b.label} onClick={b.action} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors hover:opacity-80", b.color)}>
                  <b.icon className="w-3.5 h-3.5" /> {b.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeSection === "crashes" && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Live Crash Reports</h2>
            <button className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold">Emergency Rollback</button>
          </div>
          <div className="space-y-2">
            {CRASH_DATA.map(c => (
              <div key={c.game} className={cn("flex items-start gap-3 p-3 rounded-xl border",
                c.status === "investigating" ? "bg-red-500/5 border-red-500/20" :
                c.status === "monitoring" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-background border-border")}>
                <AlertTriangle className={cn("w-5 h-5 flex-shrink-0 mt-0.5",
                  c.status === "investigating" ? "text-red-400" : c.status === "monitoring" ? "text-yellow-400" : "text-emerald-400")} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.game}</span>
                    <span className="text-xs text-muted-foreground">v{c.version}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                      c.status === "investigating" ? "bg-red-500/20 text-red-400" :
                      c.status === "monitoring" ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400")}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.device} · {c.users} users affected · Crash rate: {c.rate}</p>
                  <p className="text-[10px] text-muted-foreground">{c.time}</p>
                </div>
                <button className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold">Rollback</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "tournaments" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Active Tournaments</h2>
              <span className="text-xs text-muted-foreground">3 active · 128 total players</span>
            </div>
            <div className="space-y-2">
              {TOURNAMENTS.map(t => (
                <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                  <Swords className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.game} · {t.players} players · {t.round}</p>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                    t.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400")}>
                    {t.status}
                  </span>
                  <button onClick={() => alert(`Paused: ${t.name}`)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-500/30">Pause</button>
                </div>
              ))}
            </div>
            <button onClick={() => {
              const name = prompt("Tournament name:");
              if (name) alert(`Tournament "${name}" created!`);
            }} className="w-full mt-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors">Create Tournament</button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Quick Controls</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                <span className="text-foreground flex-1">Disqualify Team</span>
                <input placeholder="Team name..." className="w-28 px-2 py-1 bg-background border border-border rounded-lg text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                <button onClick={() => alert("Team disqualified!")} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold">Go</button>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                <span className="text-foreground flex-1">Adjust Rewards</span>
                <input type="number" placeholder="$" className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-[10px] text-foreground focus:outline-none focus:border-primary" />
                <button onClick={() => alert("Rewards adjusted!")} className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold">Set</button>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                <span className="text-foreground flex-1">Manual Match Result</span>
                <select className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] text-foreground">
                  <option>Team A wins</option>
                  <option>Team B wins</option>
                  <option>Draw</option>
                </select>
                <button onClick={() => alert("Result submitted!")} className="px-2 py-1 bg-primary/20 text-primary rounded-lg text-[10px] font-bold">Submit</button>
              </div>
              <button onClick={() => alert("Registration extended by 24h")} className="w-full flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors">
                <span className="text-foreground">Extend Registration</span>
                <span className="text-muted-foreground">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "marketplace" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Items */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Marketplace Oversight</h2>
                <span className="text-xs text-muted-foreground">1,247 items · 312 active sellers</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Legendary Sword of Flames", seller: "CraftMaster", price: "$49.99", sales: 342, flagged: false, risk: "low" },
                  { name: "Neon Cyber Skin Pack", seller: "SkinFactory", price: "$24.99", sales: 891, flagged: false, risk: "low" },
                  { name: "Rare Dragon Egg (suspicious)", seller: "UnknownTrader", price: "$999.99", sales: 0, flagged: true, risk: "high" },
                  { name: "Premium Battle Pass XP Boost", seller: "XP_Shop", price: "$14.99", sales: 2341, flagged: false, risk: "low" },
                ].map(item => (
                  <div key={item.name} className={cn("flex items-center gap-3 p-3 rounded-xl border",
                    item.flagged ? "bg-red-500/5 border-red-500/20" : "bg-background border-border")}>
                    <ShoppingBag className={cn("w-4 h-4", item.flagged ? "text-red-400" : "text-primary")} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.seller} · {item.sales} sales</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{item.price}</span>
                    {item.flagged && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">FLAGGED</span>}
                    {item.risk === "high" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">HIGH RISK</span>}
                    <button className={cn("px-2 py-1 rounded-lg text-[10px] font-bold",
                      item.flagged ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                      {item.flagged ? "Approve" : "Hide"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade History + Money Laundering */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3">Recent Trades</h2>
                <div className="space-y-1.5">
                  {[
                    { item: "Neon Skin Pack", from: "TraderA", to: "PlayerX", amount: "$24.99", time: "2m ago" },
                    { item: "Dragon Sword", from: "CraftMaster", to: "WarriorK", amount: "$149.99", time: "8m ago" },
                    { item: "Speed Boost", from: "XP_Shop", to: "Racer99", amount: "$9.99", time: "15m ago" },
                  ].map(t => (
                    <div key={t.item + t.time} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border text-xs">
                      <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground flex-1">{t.item}</span>
                      <span className="text-muted-foreground">{t.from} → {t.to}</span>
                      <span className="font-semibold">{t.amount}</span>
                      <span className="text-muted-foreground text-[10px]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-orange-500/20 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Money Laundering Detection
                </h2>
                <div className="space-y-1.5">
                  {[
                    { alert: "Rapid high-value trades between new accounts", severity: "high", accounts: "3 accounts involved", value: "$4,200" },
                    { alert: "Item flipped 400% above market price", severity: "medium", accounts: "2 accounts", value: "$890" },
                    { alert: "Circular trading pattern detected", severity: "high", accounts: "5 accounts in loop", value: "$12,400" },
                  ].map(a => (
                    <div key={a.alert} className="flex items-start gap-2 p-2 rounded-lg bg-background border border-border text-xs">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1", a.severity === "high" ? "bg-red-400" : "bg-yellow-400")} />
                      <div className="flex-1">
                        <p className="text-foreground">{a.alert}</p>
                        <p className="text-[10px] text-muted-foreground">{a.accounts} · {a.value}</p>
                      </div>
                      <button className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded font-bold">Investigate</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BarRow({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-6">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-foreground font-semibold w-8 text-right">{value}%</span>
    </div>
  );
}
