import { useState } from "react";
import { useListSubscriptions, useUpdateSubscription, getListSubscriptionsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-green-900/30 text-green-400",
  cancelled: "bg-red-900/30 text-red-400",
  expired: "bg-gray-800 text-gray-400",
  trial: "bg-blue-900/30 text-blue-400",
};

const PLAN_CLASSES: Record<string, string> = {
  free: "text-gray-400",
  basic: "text-blue-400",
  premium: "text-violet-400",
  vip: "text-amber-400",
};

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

  const handleCancel = (id: number) => {
    updateSub.mutate({ id, data: { status: "cancelled" } }, {
      onSuccess: () => {
        toast({ title: "Subscription cancelled" });
        qc.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() });
      },
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Subscription Management</h1>
        <p className="text-muted-foreground text-sm mt-1">{subscriptions.length} subscriptions</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Plan:</span>
          {["", "free", "basic", "premium", "vip"].map(p => (
            <button key={p} data-testid={`filter-plan-${p || "all"}`} onClick={() => setPlanFilter(p)}
              className={cn("px-3 py-1 rounded-lg text-xs font-medium capitalize border transition-colors",
                planFilter === p ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}>
              {p === "" ? "All" : p}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Status:</span>
          {["", "active", "cancelled", "expired", "trial"].map(s => (
            <button key={s} data-testid={`filter-sub-status-${s || "all"}`} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1 rounded-lg text-xs font-medium capitalize border transition-colors",
                statusFilter === s ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}>
              {s === "" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">User</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Billing</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Price</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Start Date</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              ))
              : subscriptions.map(sub => (
                <tr key={sub.id} data-testid={`sub-row-${sub.id}`} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{sub.username ?? `User #${sub.userId}`}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold capitalize text-xs", PLAN_CLASSES[sub.plan])}>{sub.plan}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{sub.billingCycle}</td>
                  <td className="px-4 py-3 font-medium">${Number(sub.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_CLASSES[sub.status])}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{sub.startDate}</td>
                  <td className="px-4 py-3">
                    {sub.status === "active" && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive"
                        data-testid={`button-cancel-sub-${sub.id}`} onClick={() => handleCancel(sub.id)}>
                        Cancel
                      </Button>
                    )}
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
