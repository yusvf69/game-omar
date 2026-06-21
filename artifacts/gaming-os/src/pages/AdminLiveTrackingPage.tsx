import { useState, useEffect } from "react";
import { Users, MapPin, Gamepad2, Monitor, Globe, Activity, Wifi, WifiOff, Clock, Smartphone, Shield, AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_USERS = [
  { id: 1, username: "PixelHunter42", game: "Cyber Arena", session: "2h 14m", location: "Egypt", device: "iPhone 18 Pro", subscription: "Premium", status: "active" },
  { id: 2, username: "NebulaCrusher", game: "Dragon's Lair: Reborn", session: "45m", location: "UAE", device: "Samsung Galaxy S30", subscription: "VIP", status: "active" },
  { id: 3, username: "ShadowStrike", game: "Mech Warfare Elite", session: "3h 02m", location: "Saudi Arabia", device: "PC", subscription: "Premium", status: "active" },
  { id: 4, username: "CyberWolf", game: "Nebula Assault", session: "1h 30m", location: "Egypt", device: "iPad Pro", subscription: "Basic", status: "active" },
  { id: 5, username: "PhoenixRider", game: "Speed Storm", session: "12m", location: "Kuwait", device: "PlayStation 6", subscription: "VIP", status: "active" },
];

const REGIONS = [
  { name: "US-East", status: "stable", users: 1234, color: "bg-green-400" },
  { name: "EU-West", status: "stable", users: 982, color: "bg-green-400" },
  { name: "Middle-East", status: "stable", users: 456, color: "bg-green-400" },
  { name: "Asia-Pacific", status: "high_load", users: 2341, color: "bg-yellow-400" },
];

export default function AdminLiveTrackingPage() {
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const onlineNow = 1247 + Math.floor(Math.sin(tick) * 12);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Tracking Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Real-time user monitoring across all regions</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">{onlineNow.toLocaleString()} online now</span>
        </div>
      </div>

      {/* Live Map */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Global Live Map</h2>
        </div>
        <div className="relative h-48 rounded-xl bg-gradient-to-br from-[#0a0a1a] to-[#0d1b3e] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full px-4 relative z-10">
            {REGIONS.map(r => (
              <div key={r.name} className="bg-background/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={cn("w-2 h-2 rounded-full", r.color, r.status === "high_load" && "animate-pulse")} />
                  <span className="text-xs font-semibold text-foreground">{r.name}</span>
                </div>
                <p className="text-lg font-bold text-foreground tabular-nums">{r.users.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.status.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Active Sessions
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search user..." className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="space-y-1">
            {MOCK_USERS.map(u => (
              <div key={u.id}
                onClick={() => setSelectedUser(u)}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border border-transparent",
                  selectedUser?.id === u.id ? "bg-primary/10 border-primary/30" : "hover:bg-secondary"
                )}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {u.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{u.username}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" /> {u.game}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {u.session}
                  </p>
                  <span className={cn("text-[10px]", u.subscription === "VIP" ? "text-yellow-400" : u.subscription === "Premium" ? "text-purple-400" : "text-blue-400")}>
                    {u.subscription}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Detail Panel */}
        <div className="bg-card border border-border rounded-2xl p-5">
          {selectedUser ? (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-4">User Session</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.username[0]}
                </div>
                <div>
                  <p className="font-bold text-foreground">@{selectedUser.username}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <DetailRow icon={Gamepad2} label="Playing" value={selectedUser.game} />
                <DetailRow icon={Clock} label="Session" value={selectedUser.session} />
                <DetailRow icon={MapPin} label="Location" value={selectedUser.location} />
                <DetailRow icon={Monitor} label="Device" value={selectedUser.device} />
                <DetailRow icon={Shield} label="Plan" value={selectedUser.subscription} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30">Ban</button>
                <button className="py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold hover:bg-yellow-500/30">Shadow Ban</button>
                <button className="py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30">Message</button>
                <button className="py-2 bg-secondary text-foreground rounded-xl text-xs font-bold hover:bg-secondary/80">View Profile</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Select a user to view session details</p>
            </div>
          )}
        </div>
      </div>

      {/* Device & Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Devices</p>
          <div className="space-y-1.5">
            {[{ name: "iOS", pct: 42 }, { name: "Android", pct: 31 }, { name: "PC", pct: 18 }, { name: "Console", pct: 9 }].map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-12 text-muted-foreground">{d.name}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-8 text-right font-semibold text-foreground">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Top Games Now</p>
          <div className="space-y-2">
            {["Cyber Arena", "Dragon's Lair: Reborn", "Nebula Assault"].map((g, i) => (
              <div key={g} className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                <span className="text-xs text-foreground">{g}</span>
                <span className="ml-auto text-xs text-muted-foreground">{[342, 289, 156][i]} players</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Activity className="w-3 h-3" /> New Users</p>
          <p className="text-2xl font-bold text-foreground">+28</p>
          <p className="text-xs text-muted-foreground">in the last hour</p>
          <p className="text-xs text-muted-foreground mt-1">Total: 12,847 registered</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium ml-auto">{value}</span>
    </div>
  );
}
