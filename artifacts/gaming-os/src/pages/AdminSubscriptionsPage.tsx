import { useState } from "react";
import { useListSubscriptions, useUpdateSubscription, getListSubscriptionsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, Zap, RefreshCw } from "lucide-react";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/20",
  expired: "bg-muted/50 text-muted-foreground border border-border",
  trial: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
};

const PLAN_CLASSES: Record<string, string> = {
  free: "text-muted-foreground",
  basic: "text-blue-400",
  premium: "text-violet-400",
  vip: "text-amber-400",
};

const PLAN_PRICES: Record<string, number> = { free: 0, basic: 4.99, premium: 9.99, vip: 19.99 };

export default function AdminSubscriptionsPage() {
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: subscriptions = [], isLoading } = useListSubscriptions({
    plan: planFilter || undefined,
    status: statusFilter || undefined,
  });
  const updateSub = useUpdateSubscription();

  const active = subscriptions.filter(s => s.status === "active");
  const mrr = active.reduce((sum, s) => sum + Number(s.price ?? PLAN_PRICES[s.plan] ?? 0), 0);
  const trialCount = subscriptions.filter(s => s.status === "trial").length;
  const cancelledCount = subscriptions.filter(s => s.status === "cancelled").length;

  const handleCancel = (id: number) => {
    updateSub.mutate({ id, data: { status: "cancelled" } }, {
      onSuccess: () => {
        toast({ title: "Subscription cancelled" });
        qc.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() });
      },
    });
  };

  const handleReactivate = (id: number) => {
    updateSub.mutate({ id, data: { status: "active" } }, {
      onSuccess: () => {
        toast({ title: "Subscription reactivated" });
        qc.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() });
      },
    });
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{subscriptions.length} total subscriptions</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${mrr.toFixed(0)}</p>
          <p className="text-xs text-emerald-400 mt-1">+18.2% vs last month</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground">Active Subs</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{active.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{trialCount} on trial</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">ARR</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${(mrr * 12).toFixed(0)}</p>
          <p className="text-xs text-blue-400 mt-1">Annualized</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-red-400" />
            <span className="text-xs text-muted-foreground">Churn</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{cancelledCount}</p>
          <p className="text-xs text-red-400 mt-1">Cancellations total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">Plan:</span>
          {["", "free", "basic", "premium", "vip"].map(p => (
            <button key={p} data-testid={`filter-plan-${p || "all"}`} onClick={() => setPlanFilter(p)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-colors",
                planFilter === p ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}>
              {p === "" ? "All" : p}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">Status:</span>
          {["", "active", "cancelled", "expired", "trial"].map(s => (
            <button key={s} data-testid={`filter-sub-status-${s || "all"}`} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-colors",
                statusFilter === s ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}>
              {s === "" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/40">
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Plan</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Billing</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Price / mo</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Start Date</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded-lg" /></td>)}
                </tr>
              ))
              : subscriptions.map(sub => (
                <tr key={sub.id} data-testid={`sub-row-${sub.id}`} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {(sub.username ?? `U${sub.userId}`)[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground">{sub.username ?? `User #${sub.userId}`}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("font-semibold capitalize text-xs", PLAN_CLASSES[sub.plan])}>{sub.plan}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground capitalize text-xs">{sub.billingCycle}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">${Number(sub.price).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", STATUS_CLASSES[sub.status])}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{sub.startDate}</td>
                  <td className="px-5 py-3.5">
                    {sub.status === "active" || sub.status === "trial" ? (
                      <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-destructive h-7"
                        data-testid={`button-cancel-sub-${sub.id}`} onClick={() => handleCancel(sub.id)}>
                        Cancel
                      </Button>
                    ) : sub.status === "cancelled" || sub.status === "expired" ? (
                      <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300 h-7"
                        onClick={() => handleReactivate(sub.id)}>
                        Reactivate
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
