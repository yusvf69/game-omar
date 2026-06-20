import { useState } from "react";
import { useListUsers, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { Shield, ShieldOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-green-900/30 text-green-400",
  banned: "bg-red-900/30 text-red-400",
  suspended: "bg-amber-900/30 text-amber-400",
};

const ROLE_CLASSES: Record<string, string> = {
  admin: "text-amber-400",
  moderator: "text-violet-400",
  user: "text-muted-foreground",
};

const TIER_CLASSES: Record<string, string> = {
  free: "text-gray-400",
  basic: "text-blue-400",
  premium: "text-violet-400",
  vip: "text-amber-400",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useListUsers({ search: search || undefined, status: statusFilter || undefined, limit: 100 });
  const updateUser = useUpdateUser();

  const handleToggleBan = (id: number, current: string) => {
    const newStatus = current === "banned" ? "active" : "banned";
    updateUser.mutate({ id, data: { status: newStatus as "active" | "banned" | "suspended" } }, {
      onSuccess: () => {
        toast({ title: newStatus === "banned" ? "User banned" : "User unbanned" });
        qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} users</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-user-search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
        </div>
        <div className="flex gap-2">
          {["", "active", "banned", "suspended"].map(s => (
            <button key={s} data-testid={`filter-status-${s || "all"}`} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize border",
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
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Role</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Joined</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              ))
              : users.map(user => (
                <tr key={user.id} data-testid={`user-row-${user.id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {user.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-semibold capitalize", ROLE_CLASSES[user.role])}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-semibold capitalize", TIER_CLASSES[user.subscriptionPlan ?? "free"])}>
                      {user.subscriptionPlan ?? "free"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_CLASSES[user.status])}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      data-testid={`button-ban-${user.id}`}
                      onClick={() => handleToggleBan(user.id, user.status)}
                      className={cn(user.status === "banned" ? "text-green-400 hover:text-green-300" : "text-muted-foreground hover:text-destructive")}
                    >
                      {user.status === "banned" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </Button>
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
