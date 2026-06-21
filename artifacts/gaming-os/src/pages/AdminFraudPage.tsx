import { useState } from "react";
import { AlertTriangle, Users, CreditCard, Shield, Eye, EyeOff, Search, ArrowUpRight, ArrowDownRight, TrendingUp, Ban, Clock, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

const FRAUD_ALERTS = [
  { id: 1, user: "SuspiciousAcc_99", type: "Multiple Accounts", risk: 92, evidence: "3 accounts from same IP", status: "unreviewed", time: "2m ago" },
  { id: 2, user: "RefundAbuser_X", type: "Refund Abuse", risk: 85, evidence: "7 refunds in 30 days", status: "unreviewed", time: "15m ago" },
  { id: 3, user: "CardTest_01", type: "Card Testing", risk: 78, evidence: "Failed transactions on 5 cards", status: "investigating", time: "1h ago" },
  { id: 4, user: "FakeDev_Studio", type: "Chargeback Fraud", risk: 65, evidence: "Chargeback rate 40%", status: "investigating", time: "2h ago" },
  { id: 5, user: "CloneAcc_88", type: "Account Cloning", risk: 55, evidence: "Suspicious login pattern", status: "resolved", time: "1d ago" },
];

export default function AdminFraudPage() {
  const [filter, setFilter] = useState<"all" | "unreviewed" | "investigating">("unreviewed");

  const alerts = filter === "all" ? FRAUD_ALERTS : FRAUD_ALERTS.filter(a => a.status === filter);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fraud Detection Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-powered fraud monitoring & risk scoring</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-semibold text-red-400">{FRAUD_ALERTS.filter(a => a.status === "unreviewed").length} critical alerts</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Risk Score Avg", value: "74", trend: "+12%", up: true, icon: TrendingUp, color: "text-red-400" },
          { label: "Alerts Today", value: "23", trend: "+8", up: true, icon: AlertTriangle, color: "text-orange-400" },
          { label: "Accounts Flagged", value: "156", trend: "-5%", up: false, icon: Users, color: "text-yellow-400" },
          { label: "Blocked Transactions", value: "$4,280", trend: "+$920", up: true, icon: CreditCard, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <div className={cn("flex items-center gap-1 mt-1", s.up ? "text-red-400" : "text-emerald-400")}>
              {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-xs font-medium">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-secondary rounded-xl p-0.5 w-fit">
        {[
          { key: "unreviewed" as const, label: "Unreviewed", count: FRAUD_ALERTS.filter(a => a.status === "unreviewed").length },
          { key: "investigating" as const, label: "Investigating", count: FRAUD_ALERTS.filter(a => a.status === "investigating").length },
          { key: "all" as const, label: "All Alerts", count: FRAUD_ALERTS.length },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === t.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            {t.label} <span className="opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.id} className={cn("flex items-start gap-3 p-3 rounded-xl border",
              a.risk >= 80 ? "bg-red-500/5 border-red-500/20" : a.risk >= 60 ? "bg-orange-500/5 border-orange-500/20" : "bg-background border-border")}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                a.risk >= 80 ? "bg-red-500/20" : a.risk >= 60 ? "bg-orange-500/20" : "bg-yellow-500/20")}>
                <Fingerprint className={cn("w-4 h-4", a.risk >= 80 ? "text-red-400" : a.risk >= 60 ? "text-orange-400" : "text-yellow-400")} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{a.user}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold",
                    a.risk >= 80 ? "bg-red-500/20 text-red-400" : a.risk >= 60 ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400")}>
                    Risk: {a.risk}/100
                  </span>
                  <span className={cn("text-[10px] capitalize", a.status === "unreviewed" ? "text-yellow-400" : a.status === "investigating" ? "text-blue-400" : "text-emerald-400")}>
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.type} · {a.evidence}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
              </div>
              <div className="flex gap-1.5">
                <button className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"><Eye className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"><Ban className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><EyeOff className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detection Rules */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Detection Rules</h2>
        <div className="space-y-2">
          {[
            { rule: "Multiple accounts from same IP", threshold: "3+ accounts", active: true },
            { rule: "Refund frequency", threshold: "5+ in 30 days", active: true },
            { rule: "Card testing pattern", threshold: "3+ failed attempts", active: true },
            { rule: "Chargeback ratio", threshold: "> 20%", active: true },
            { rule: "Rapid login from multiple regions", threshold: "2+ countries in 1h", active: false },
          ].map(r => (
            <div key={r.rule} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-xs text-foreground">{r.rule}</p>
                <p className="text-[10px] text-muted-foreground">Threshold: {r.threshold}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs", r.active ? "text-emerald-400" : "text-muted-foreground")}>{r.active ? "Active" : "Disabled"}</span>
                <button className={cn("w-8 h-4 rounded-full transition-colors", r.active ? "bg-primary" : "bg-secondary")}>
                  <div className={cn("w-3 h-3 rounded-full bg-white transition-transform", r.active ? "translate-x-4" : "translate-x-0.5")} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
