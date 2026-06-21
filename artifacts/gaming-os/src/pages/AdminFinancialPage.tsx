import { useState } from "react";
import { DollarSign, TrendingUp, CreditCard, Users, ArrowUpRight, ArrowDownRight, BarChart3, Wallet, Download, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const REVENUE_DATA = [
  { month: "Jan", revenue: 12400, subs: 320, marketplace: 1800 },
  { month: "Feb", revenue: 14800, subs: 380, marketplace: 2100 },
  { month: "Mar", revenue: 16200, subs: 410, marketplace: 2400 },
  { month: "Apr", revenue: 18100, subs: 460, marketplace: 2800 },
  { month: "May", revenue: 22400, subs: 520, marketplace: 3400 },
  { month: "Jun", revenue: 24800, subs: 580, marketplace: 3900 },
];

const TOP_PAYERS = [
  { rank: 1, name: "NebulaCrusher", amount: 159.99, plan: "VIP", transactions: 12 },
  { rank: 2, name: "ShadowStrike", amount: 89.99, plan: "Premium", transactions: 8 },
  { rank: 3, name: "PixelHunter42", amount: 74.99, plan: "Premium", transactions: 6 },
  { rank: 4, name: "CyberWolf", amount: 49.99, plan: "Basic", transactions: 4 },
  { rank: 5, name: "PhoenixRider", amount: 44.99, plan: "Basic", transactions: 3 },
];

export default function AdminFinancialPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Command Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Revenue analytics & payment insights</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-0.5">
          {(["daily", "weekly", "monthly"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                period === p ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: "$124,800", trend: "+18.7%", up: true, icon: DollarSign, color: "text-emerald-400" },
          { label: "MRR", value: "$24,800", trend: "+14.2%", up: true, icon: TrendingUp, color: "text-blue-400" },
          { label: "Sub Revenue", value: "$18,400", trend: "+12.1%", up: true, icon: CreditCard, color: "text-purple-400" },
          { label: "Marketplace", value: "$6,400", trend: "+24.3%", up: true, icon: Wallet, color: "text-amber-400" },
        ].map(card => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <div className={cn("flex items-center gap-1 mt-1", card.up ? "text-emerald-400" : "text-red-400")}>
              {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-xs font-medium">{card.trend}</span>
              <span className="text-[10px] text-muted-foreground">vs last {period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Revenue Breakdown</h2>
        <div className="space-y-2">
          {REVENUE_DATA.map(d => (
            <div key={d.month} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8">{d.month}</span>
              <div className="flex-1 flex gap-0.5 h-6">
                <div className="h-full bg-primary rounded-l" style={{ width: `${(d.subs / 600) * 100}%` }} title={`Subscriptions: $${d.subs}`} />
                <div className="h-full bg-amber-400 rounded-r" style={{ width: `${(d.marketplace / 600) * 100}%` }} title={`Marketplace: $${d.marketplace}`} />
              </div>
              <span className="text-xs font-semibold text-foreground w-16 text-right">${(d.subs + d.marketplace).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-primary" /> Subscriptions</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-400" /> Marketplace</div>
        </div>
      </div>

      {/* Top Paying Users + Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Top Paying Users</h2>
          <div className="space-y-2">
            {TOP_PAYERS.map(p => (
              <div key={p.rank} className="flex items-center gap-3">
                <span className={cn("text-xs font-bold w-5", p.rank <= 3 ? "text-yellow-400" : "text-muted-foreground")}>#{p.rank}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {p.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.transactions} transactions</p>
                </div>
                <span className={cn("text-xs font-bold", p.plan === "VIP" ? "text-yellow-400" : p.plan === "Premium" ? "text-purple-400" : "text-blue-400")}>
                  ${p.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Payouts to Developers</h2>
          <div className="text-center py-6">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">$18,420</p>
            <p className="text-xs text-muted-foreground mt-1">Pending payouts this month</p>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Process Payouts</button>
          </div>
          <div className="space-y-1.5 mt-4">
            {[{ name: "Quantum Games", amount: 4200 }, { name: "Digital Forge", amount: 3100 }, { name: "Indie Studio 42", amount: 2400 }].map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{p.name}</span>
                <span className="font-semibold">${p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refunds */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Refunds</h2>
          <span className="text-xs text-red-400 font-medium">$1,240 total refunds this month</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2">User</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Reason</th><th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { user: "PlayerOne", amount: "$19.99", reason: "Game not working", status: "Approved" },
              { user: "GamerX", amount: "$4.99", reason: "Accidental purchase", status: "Pending" },
              { user: "SpeedDemon", amount: "$49.99", reason: "Subscription cancel", status: "Processing" },
            ].map(r => (
              <tr key={r.user} className="border-b border-border/50">
                <td className="py-2 text-foreground">{r.user}</td>
                <td className="py-2">{r.amount}</td>
                <td className="py-2 text-muted-foreground">{r.reason}</td>
                <td className={cn("py-2 text-right font-medium", r.status === "Approved" ? "text-emerald-400" : r.status === "Pending" ? "text-yellow-400" : "text-blue-400")}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
