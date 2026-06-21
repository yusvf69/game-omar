import { useState } from "react";
import { Shield, AlertTriangle, Users, MessageCircle, Flag, Ban, Eye, EyeOff, Search, CheckCircle2, XCircle, Clock, UserX, VolumeX, Swords, ShoppingBag, MessageSquare, Bot, Bug, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type BanType = "chat" | "voice" | "matchmaking" | "tournament" | "marketplace" | "full";

const MODERATION_QUEUE = [
  { id: 1, type: "chat", user: "ToxicPlayer99", reason: "Harassment", severity: "high", time: "2m ago", content: "Multiple offensive messages in chat" },
  { id: 2, type: "name", user: "NewUser42", reason: "Inappropriate username", severity: "medium", time: "8m ago", content: "Username contains profanity" },
  { id: 3, type: "game", user: "DevStudio", reason: "Malware suspicion", severity: "critical", time: "15m ago", content: "Submitted game triggers antivirus" },
  { id: 4, type: "chat", user: "SpamBot_001", reason: "Spam", severity: "high", time: "22m ago", content: "Sending repeated promotional links" },
  { id: 5, type: "marketplace", user: "TraderX", reason: "Scam listing", severity: "high", time: "35m ago", content: "Fake item listed for real currency" },
  { id: 6, type: "bot", user: "AutoFarmer_X99", reason: "Bot Activity", severity: "high", time: "3m ago", content: "Automated gameplay detected — 24h non-stop activity, scripted movements" },
  { id: 7, type: "cheat", user: "AimBotKing", reason: "Cheating", severity: "critical", time: "7m ago", content: "Aimbot/wallhack detected in Cyber Arena — 98% headshot rate" },
  { id: 8, type: "abuse", user: "AbusivePlayer", reason: "Abuse", severity: "medium", time: "12m ago", content: "Repeated verbal abuse and threats toward other players" },
];

const RECENT_ACTIONS = [
  { action: "Banned", user: "HackerMan", type: "Full Account", by: "Admin", time: "5m ago", duration: "Permanent" },
  { action: "Muted", user: "AngryGamer", type: "Chat", by: "AI", time: "12m ago", duration: "24h" },
  { action: "Suspended", user: "CheaterPro", type: "Matchmaking", by: "Admin", time: "1h ago", duration: "7d" },
];

const BAN_DURATIONS = ["1h", "24h", "7d", "30d", "Permanent"] as const;

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "bans" | "tickets" | "settings">("queue");
  const [selectedUser, setSelectedUser] = useState("");
  const [banType, setBanType] = useState<BanType>("full");
  const [banDuration, setBanDuration] = useState("24h");
  const [banReason, setBanReason] = useState("");
  const [shadowUser, setShadowUser] = useState("");
  const [ticketReply, setTicketReply] = useState<Record<number, string>>({});
  const [ticketAssignee, setTicketAssignee] = useState<Record<number, string>>({});
  const [ticketStatuses, setTicketStatuses] = useState<Record<number, string>>({
    1: "open", 2: "in_progress", 3: "open", 4: "resolved",
  });
  const [ticketExpanded, setTicketExpanded] = useState<number | null>(null);
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "resolved">("all");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moderation Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-powered moderation & enforcement tools</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-semibold text-red-400">{MODERATION_QUEUE.length} pending actions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-0.5 w-fit">
        {[
          { key: "queue" as const, label: "Mod Queue", icon: Flag },
          { key: "bans" as const, label: "Ban Control", icon: Ban },
          { key: "tickets" as const, label: "Support Tickets", icon: MessageCircle },
          { key: "settings" as const, label: "AI Settings", icon: Shield },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeTab === tab.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "queue" && (
        <>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">AI Moderation Queue</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> AI Auto-mod: Active
              </div>
            </div>
            <div className="space-y-2">
              {MODERATION_QUEUE.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                    item.severity === "critical" ? "bg-red-500/20 text-red-400" :
                    item.severity === "high" ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400")}>
                    {item.type === "chat" ? <MessageCircle className="w-4 h-4" /> :
                     item.type === "name" ? <Users className="w-4 h-4" /> :
                     item.type === "game" ? <Shield className="w-4 h-4" /> :
                     item.type === "bot" ? <Bot className="w-4 h-4" /> :
                     item.type === "cheat" ? <Bug className="w-4 h-4" /> :
                     item.type === "abuse" ? <AlertTriangle className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{item.user}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                        item.severity === "critical" ? "bg-red-500/20 text-red-400" :
                        item.severity === "high" ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400")}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.reason} · {item.time}</p>
                    <p className="text-xs text-foreground/70 mt-1 bg-secondary/50 p-2 rounded-lg">{item.content}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><CheckCircle2 className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"><XCircle className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Recent Enforcement Actions</h2>
            <div className="space-y-2">
              {RECENT_ACTIONS.map(a => (
                <div key={a.user} className="flex items-center gap-3 text-xs">
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400 font-semibold">{a.action}</span>
                  <span className="text-foreground">{a.user}</span>
                  <span className="text-muted-foreground">- {a.type}</span>
                  <span className="ml-auto text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "bans" && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Issue Ban</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Username or User ID</label>
                <input value={selectedUser} onChange={e => setSelectedUser(e.target.value)} placeholder="Search user..." className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ban Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([["chat", "Chat", MessageCircle], ["voice", "Voice", VolumeX], ["matchmaking", "MM", Swords], ["tournament", "Tourney", Trophy], ["marketplace", "Market", ShoppingBag], ["full", "Full", Ban]] as const).map(([key, label, Icon]) => (
                    <button key={key} onClick={() => setBanType(key)}
                      className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-colors",
                        banType === key ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-background border-border text-muted-foreground hover:text-foreground")}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Duration</label>
                <div className="flex gap-1.5 flex-wrap">
                  {BAN_DURATIONS.map(d => (
                    <button key={d} onClick={() => setBanDuration(d)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        banDuration === d ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-background border-border text-muted-foreground hover:text-foreground")}>
                      {d === "Permanent" ? "∞ Perm" : d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Reason</label>
                <textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Enter ban reason..." rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none" />
              </div>
              <button disabled={!selectedUser} className="w-full py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                <Ban className="w-3.5 h-3.5 inline mr-1" /> Issue {banDuration} Ban
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">Shadow Ban</h3>
            <p className="text-xs text-muted-foreground mb-3">User is silently restricted without knowing. Their content has reduced visibility.</p>
            <div className="flex gap-2">
              <input value={shadowUser} onChange={e => setShadowUser(e.target.value)} placeholder="Search user to shadow ban..." className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              <button disabled={!shadowUser} onClick={() => { setShadowUser(""); alert(`Shadow banned: ${shadowUser}`); }}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                Execute Shadow Ban
              </button>
            </div>
            <div className="mt-3 flex gap-2 text-[10px] text-muted-foreground">
              <span className="px-2 py-1 bg-background border border-border rounded-lg">Reduced post visibility</span>
              <span className="px-2 py-1 bg-background border border-border rounded-lg">Limited invites</span>
              <span className="px-2 py-1 bg-background border border-border rounded-lg">Isolated from normal users</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Support Tickets</h2>
            <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
              <button onClick={() => setTicketFilter("all")} className={cn("px-2 py-1 text-[10px] rounded font-medium", ticketFilter === "all" ? "bg-primary text-white" : "text-muted-foreground")}>All</button>
              <button onClick={() => setTicketFilter("open")} className={cn("px-2 py-1 text-[10px] rounded font-medium", ticketFilter === "open" ? "bg-primary text-white" : "text-muted-foreground")}>Open</button>
              <button onClick={() => setTicketFilter("resolved")} className={cn("px-2 py-1 text-[10px] rounded font-medium", ticketFilter === "resolved" ? "bg-primary text-white" : "text-muted-foreground")}>Resolved</button>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { id: 1, user: "DarkKnight", subject: "Refund request", category: "Billing", status: "open", priority: "high", time: "10m ago" },
              { id: 2, user: "StarGazer", subject: "Game not launching", category: "Bug", status: "in_progress", priority: "medium", time: "45m ago" },
              { id: 3, user: "RapidFire", subject: "Account hacked", category: "Account", status: "open", priority: "critical", time: "1h ago" },
              { id: 4, user: "IceDragon", subject: "Wrong charge", category: "Billing", status: "resolved", priority: "low", time: "2h ago" },
            ].filter(t => ticketFilter === "all" || t.status === ticketFilter).map(t => {
              const currentStatus = ticketStatuses[t.id] || t.status;
              return (
                <div key={t.id} className={cn("p-3 rounded-xl bg-background border border-border",
                  ticketExpanded === t.id && "ring-1 ring-primary/30")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                      currentStatus === "open" ? "bg-yellow-400" : currentStatus === "in_progress" ? "bg-blue-400" : "bg-emerald-400")} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.user} · {t.category} · {t.time}</p>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                      t.priority === "critical" ? "bg-red-500/20 text-red-400" :
                      t.priority === "high" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400")}>
                      {t.priority}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold capitalize",
                      currentStatus === "open" ? "bg-yellow-500/20 text-yellow-400" :
                      currentStatus === "in_progress" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400")}>
                      {currentStatus.replace("_", " ")}
                    </span>
                    <button onClick={() => setTicketExpanded(ticketExpanded === t.id ? null : t.id)}
                      className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
                      {ticketExpanded === t.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {ticketExpanded === t.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <div className="flex gap-1.5 flex-wrap">
                        <select value={ticketAssignee[t.id] || ""} onChange={e => setTicketAssignee(prev => ({ ...prev, [t.id]: e.target.value }))}
                          className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] text-foreground">
                          <option value="">Assign agent...</option>
                          <option value="Ahmed">Ahmed</option>
                          <option value="Sara">Sara</option>
                          <option value="Youssef">Youssef</option>
                        </select>
                        <button onClick={() => setTicketStatuses(prev => ({ ...prev, [t.id]: currentStatus === "open" ? "in_progress" : currentStatus === "in_progress" ? "resolved" : "open" }))}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold">
                          {currentStatus === "open" ? "Start Progress" : currentStatus === "in_progress" ? "Resolve" : "Reopen"}
                        </button>
                        <button className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-[10px] font-bold">Escalate</button>
                      </div>
                      {ticketAssignee[t.id] && (
                        <p className="text-[10px] text-emerald-400">Assigned to: {ticketAssignee[t.id]}</p>
                      )}
                      <div className="flex gap-2">
                        <input value={ticketReply[t.id] || ""} onChange={e => setTicketReply(prev => ({ ...prev, [t.id]: e.target.value }))}
                          placeholder="Type your reply..." className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                        <button onClick={() => { if (ticketReply[t.id]) { alert(`Reply sent to ${t.user}: ${ticketReply[t.id]}`); setTicketReply(prev => ({ ...prev, [t.id]: "" })); }}}
                          disabled={!ticketReply[t.id]}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold disabled:opacity-50">Send</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Chat Filtering</h3>
            <div className="space-y-2 text-xs">
              {["Toxicity Detection", "Spam Filter", "Link Blocking", "Language Filter"].map(f => (
                <label key={f} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{f}</span>
                  <input type="checkbox" defaultChecked className="accent-primary" />
                </label>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Auto Mod Actions</h3>
            <div className="space-y-2 text-xs">
              {["Auto-warn on first offense", "Auto-mute on spam", "Auto-suspend on toxicity", "Escalate to admin"].map(f => (
                <label key={f} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{f}</span>
                  <input type="checkbox" defaultChecked className="accent-primary" />
                </label>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">AI Sensitivity</h3>
            <div className="space-y-3 text-xs">
              <div><span className="text-muted-foreground block mb-1">Chat Moderation</span><input type="range" min="0" max="100" defaultValue={75} className="w-full accent-primary" /></div>
              <div><span className="text-muted-foreground block mb-1">Name Checking</span><input type="range" min="0" max="100" defaultValue={90} className="w-full accent-primary" /></div>
              <div><span className="text-muted-foreground block mb-1">Image Scanning</span><input type="range" min="0" max="100" defaultValue={60} className="w-full accent-primary" /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Trophy = Shield;
