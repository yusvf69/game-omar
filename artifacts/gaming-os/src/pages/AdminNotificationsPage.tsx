import { useState } from "react";
import { Bell, Mail, Globe, Smartphone, Send, Users, Gamepad2, Crown, DollarSign, Shield, MessageCircle, Filter, CheckCircle2, Clock, Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = "push" | "email" | "in_app" | "sms";
type TargetType = "all" | "country" | "game" | "tier";

const RECENT_BROADCASTS = [
  { id: 1, title: "Weekend Sale is Live!", channel: "push", target: "All Users", sent: 12470, opened: 8230, time: "2h ago", status: "active" },
  { id: 2, title: "Patch 3.1.0 Available Now", channel: "in_app", target: "Cyber Arena players", sent: 3450, opened: 2891, time: "1d ago", status: "active" },
  { id: 3, title: "Your Premium is Expiring", channel: "email", target: "Premium users", sent: 892, opened: 567, time: "2d ago", status: "completed" },
  { id: 4, title: "VIP Tournament Invitation", channel: "push", target: "VIP users", sent: 234, opened: 198, time: "3d ago", status: "completed" },
];

const TERRITORIES = [
  { code: "EG", name: "Egypt", users: 2840 },
  { code: "AE", name: "UAE", users: 1560 },
  { code: "SA", name: "Saudi Arabia", users: 2310 },
  { code: "KW", name: "Kuwait", users: 890 },
  { code: "QA", name: "Qatar", users: 670 },
  { code: "US", name: "United States", users: 4230 },
  { code: "GB", name: "United Kingdom", users: 1980 },
  { code: "DE", name: "Germany", users: 1450 },
];

const GAMES_LIST = ["Cyber Arena", "Dragon's Lair: Reborn", "Nebula Assault", "Speed Storm", "Mech Warfare Elite"];
const TIERS = ["Free", "Basic", "Premium", "VIP"];

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"broadcast" | "history" | "templates">("broadcast");
  const [channel, setChannel] = useState<Channel>("push");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Notification System</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Broadcast push, email & in-app notifications</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
          <Bell className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">{RECENT_BROADCASTS.filter(b => b.status === "active").length} active campaigns</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-0.5 w-fit">
        {[
          { key: "broadcast" as const, label: "New Broadcast", icon: Send },
          { key: "history" as const, label: "Campaign History", icon: Clock },
          { key: "templates" as const, label: "Templates", icon: MessageCircle },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === tab.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Compose Notification</h2>

            {/* Channel Selection */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-2">Delivery Channel</label>
              <div className="flex gap-1.5">
                {[
                  { key: "push" as const, label: "Push", icon: Bell },
                  { key: "email" as const, label: "Email", icon: Mail },
                  { key: "in_app" as const, label: "In-App", icon: Globe },
                  { key: "sms" as const, label: "SMS", icon: Smartphone },
                ].map(c => (
                  <button key={c.key} onClick={() => setChannel(c.key)}
                    className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                      channel === c.key ? "bg-primary/20 border-primary/40 text-primary" : "bg-background border-border text-muted-foreground hover:text-foreground")}>
                    <c.icon className="w-3.5 h-3.5" /> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground block mb-1">Notification Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekend Sale is Live!" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground block mb-1">Message Body</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter your notification message..." rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none" />
            </div>

            {/* Target Selection */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-2">Target Audience</label>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {[
                  { key: "all" as const, label: "All Users", icon: Users },
                  { key: "country" as const, label: "Country", icon: Globe },
                  { key: "game" as const, label: "Per Game", icon: Gamepad2 },
                  { key: "tier" as const, label: "Subscription", icon: Crown },
                ].map(t => (
                  <button key={t.key} onClick={() => setTargetType(t.key)}
                    className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[10px] font-medium transition-colors",
                      targetType === t.key ? "bg-primary/20 border-primary/40 text-primary" : "bg-background border-border text-muted-foreground hover:text-foreground")}>
                    <t.icon className="w-3 h-3" /> {t.label}
                  </button>
                ))}
              </div>

              {targetType === "country" && (
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                  {TERRITORIES.map(t => (
                    <label key={t.code} className="flex items-center gap-2 p-1.5 rounded-lg bg-background border border-border text-xs cursor-pointer hover:border-primary/30">
                      <input type="checkbox" className="accent-primary" />
                      <span className="text-foreground">{t.name}</span>
                      <span className="ml-auto text-muted-foreground">{t.users.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              )}
              {targetType === "game" && (
                <div className="space-y-1">
                  {GAMES_LIST.map(g => (
                    <label key={g} className="flex items-center gap-2 p-1.5 rounded-lg bg-background border border-border text-xs cursor-pointer hover:border-primary/30">
                      <input type="checkbox" className="accent-primary" />
                      <span className="text-foreground">{g}</span>
                    </label>
                  ))}
                </div>
              )}
              {targetType === "tier" && (
                <div className="flex gap-1.5">
                  {TIERS.map(t => (
                    <label key={t} className="flex items-center gap-1.5 p-2 rounded-lg bg-background border border-border text-xs cursor-pointer hover:border-primary/30">
                      <input type="checkbox" className="accent-primary" />
                      <span className="text-foreground">{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule toggle */}
            <div className="flex items-center justify-between mb-4 p-3 bg-background border border-border rounded-xl">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground">Schedule for later</span>
              </div>
              <button onClick={() => setSchedule(!schedule)}
                className={cn("w-9 h-5 rounded-full transition-colors", schedule ? "bg-primary" : "bg-secondary")}>
                <div className={cn("w-3.5 h-3.5 rounded-full bg-white transition-transform", schedule ? "translate-x-4" : "translate-x-0.5")} />
              </button>
            </div>

            {schedule && (
              <div className="mb-4">
                <input type="datetime-local" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary" />
              </div>
            )}

            {/* Send */}
            <button disabled={!title || !message} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 hover:bg-primary/90 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send to {targetType === "all" ? "All Users" : "Selected Audience"}
            </button>
          </div>

          {/* Preview Stats */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Delivery Estimate</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Reach</span><span className="font-bold text-foreground">12,847 users</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Push Channel</span><span className="font-bold text-foreground">~11,200 delivered</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Open Rate</span><span className="font-bold text-emerald-400">~68%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Click Rate</span><span className="font-bold text-blue-400">~24%</span></div>
                <div className="mt-3 p-3 bg-background border border-border rounded-xl">
                  <p className="text-muted-foreground mb-1">Preview</p>
                  <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                    <Bell className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{title || "Notification Title"}</p>
                      <p className="text-xs text-muted-foreground">{message || "Your notification message will appear here..."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Template Quick Pick</h2>
              <div className="space-y-2">
                {[
                  { name: "Sale Event", desc: "Flash sale announcement" },
                  { name: "Patch Notes", desc: "New version available" },
                  { name: "Subscription", desc: "Renewal reminder" },
                  { name: "Tournament", desc: "Tournament starting soon" },
                ].map(t => (
                  <button key={t.name} onClick={() => { setTitle(t.name); setMessage(t.desc); }} className="w-full text-left p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors">
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Campaign History</h2>
          <div className="space-y-2">
            {RECENT_BROADCASTS.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center",
                  c.channel === "push" ? "bg-blue-500/20 text-blue-400" :
                  c.channel === "email" ? "bg-purple-500/20 text-purple-400" :
                  "bg-emerald-500/20 text-emerald-400")}>
                  {c.channel === "push" ? <Bell className="w-4 h-4" /> :
                   c.channel === "email" ? <Mail className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Target: {c.target} · Sent: {c.sent.toLocaleString()} · Opened: {c.opened.toLocaleString()}</p>
                </div>
                <span className="text-xs text-muted-foreground">{c.time}</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                  c.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                  c.status === "completed" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400")}>
                  {c.status}
                </span>
                <button className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Sale Flash", channels: ["push", "in_app"], icon: DollarSign, color: "text-amber-400" },
            { name: "Maintenance", channels: ["push", "email", "in_app"], icon: Shield, color: "text-red-400" },
            { name: "New Release", channels: ["push", "in_app"], icon: Gamepad2, color: "text-violet-400" },
            { name: "Tournament Reminder", channels: ["push"], icon: Bell, color: "text-primary" },
            { name: "Subscription Renewal", channels: ["email", "push"], icon: Crown, color: "text-yellow-400" },
            { name: "Security Alert", channels: ["email", "push", "sms"], icon: AlertTriangle, color: "text-orange-400" },
          ].map(t => (
            <div key={t.name} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors cursor-pointer">
              <t.icon className={cn("w-5 h-5 mb-2", t.color)} />
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Channels: {t.channels.join(", ")}</p>
              <button className="mt-3 w-full py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold">Use Template</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
