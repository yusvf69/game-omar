import { useState } from "react";
import { Lock, Shield, Users, DollarSign, Server, Globe, Key, Sliders, Activity, Eye, EyeOff, Power, AlertTriangle, RefreshCw, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminRootPanelPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [rootKey, setRootKey] = useState("");

  if (!authenticated) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto mt-20">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Root Owner Panel</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your system owner key to access the root panel.</p>
          <input value={rootKey} onChange={e => setRootKey(e.target.value)} type="password" placeholder="System Owner Key" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-4" />
          <button onClick={() => rootKey && setAuthenticated(true)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm">Unlock Root Panel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Root Owner Panel</h1>
          <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1">
            <Lock className="w-3 h-3 text-red-400" /> System Owner · Full Access
          </p>
        </div>
        <button onClick={() => setAuthenticated(false)} className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold">Lock Panel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Admin Management */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Admin Management</h2>
          <div className="space-y-2 text-xs">
            {[
              { name: "Youssef", role: "Super Admin", status: "active" },
              { name: "Ahmed", role: "Admin", status: "active" },
              { name: "Sara", role: "Moderator", status: "inactive" },
            ].map(a => (
              <div key={a.name} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                <div>
                  <p className="font-semibold text-foreground">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.role}</p>
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold", a.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400")}>{a.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 bg-primary text-white rounded-xl text-xs font-bold">Add Admin</button>
        </div>

        {/* Revenue Configuration */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Revenue Config</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Platform Fee (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="50" defaultValue={30} className="flex-1 accent-primary" />
                <span className="font-bold text-foreground w-8">30%</span>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Marketplace Commission (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="30" defaultValue={10} className="flex-1 accent-primary" />
                <span className="font-bold text-foreground w-8">10%</span>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Tournament Entry Fee (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="20" defaultValue={5} className="flex-1 accent-primary" />
                <span className="font-bold text-foreground w-8">5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* System API Keys */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> System Keys</h2>
          <div className="space-y-2 text-xs">
            {[
              { name: "API Gateway Key", key: "sk_live_••••••••••••", status: "active" },
              { name: "Payment Processor", key: "pk_live_••••••••••••", status: "active" },
              { name: "AI Service Token", key: "ai_••••••••••••••••", status: "active" },
              { name: "CDN Secret", key: "cdn_••••••••••••••", status: "expired" },
            ].map(k => (
              <div key={k.name} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                <div>
                  <p className="font-semibold text-foreground">{k.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{k.key}</p>
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold", k.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>{k.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold">Rotate All Keys</button>
        </div>

        {/* System Configuration */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Sliders className="w-4 h-4 text-primary" /> System Config</h2>
          <div className="space-y-2 text-xs">
            {[
              { label: "Maintenance Mode", value: "Off", color: "text-emerald-400" },
              { label: "Registration Open", value: "Yes", color: "text-emerald-400" },
              { label: "AI Moderation", value: "Active", color: "text-emerald-400" },
              { label: "New Relic Monitoring", value: "Enabled", color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">{s.label}</span>
                <span className={cn("font-semibold", s.color)}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Shutdown */}
        <div className="bg-card border border-red-500/20 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Danger Zone</h2>
          <div className="space-y-2 text-xs">
            <button className="w-full py-2.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-bold">Disable All Tournaments</button>
            <button className="w-full py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold">Shutdown Platform</button>
            <button className="w-full py-2.5 bg-red-500/40 text-white border border-red-500/60 rounded-xl font-bold">Purge All Data</button>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Recent Root Actions</h2>
          <div className="space-y-1.5 text-[10px]">
            {[
              { action: "Revenue split changed to 30%", time: "2h ago" },
              { action: "New admin added: Sara", time: "1d ago" },
              { action: "API key rotated for Payments", time: "2d ago" },
              { action: "Server US-East restarted", time: "3d ago" },
            ].map(a => (
              <div key={a.action} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                <span className="text-foreground">{a.action}</span>
                <span className="text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
