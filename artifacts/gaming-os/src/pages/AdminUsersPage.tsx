import { useState } from "react";
import { useListUsers, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { Shield, ShieldOff, Search, ChevronDown, Crown, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  banned: "bg-red-500/15 text-red-400 border border-red-500/20",
  suspended: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

const ROLE_CLASSES: Record<string, string> = {
  admin: "text-amber-400",
  moderator: "text-violet-400",
  user: "text-muted-foreground",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: Crown,
  moderator: Gavel,
  user: Shield,
};

const TIER_CLASSES: Record<string, string> = {
  free: "text-muted-foreground",
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

  const invalidate = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const handleToggleBan = (id: number, current: string) => {
    const newStatus = current === "banned" ? "active" : "banned";
    updateUser.mutate({ id, data: { status: newStatus as "active" | "banned" | "suspended" } }, {
      onSuccess: () => {
        toast({ title: newStatus === "banned" ? "User banned" : "User unbanned" });
        invalidate();
      },
    });
  };

  const handleRoleChange = (id: number, role: "user" | "moderator" | "admin") => {
    updateUser.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: `Role updated to ${role}` });
        invalidate();
      },
    });
  };

  const handleSuspend = (id: number) => {
    updateUser.mutate({ id, data: { status: "suspended" } }, {
      onSuccess: () => {
        toast({ title: "User suspended" });
        invalidate();
      },
    });
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {users.filter(u => u.status === "active").length} active
          <span className="w-2 h-2 rounded-full bg-red-400 ml-2" />
          {users.filter(u => u.status === "banned").length} banned
          <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" />
          {users.filter(u => u.status === "suspended").length} suspended
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-user-search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border rounded-xl" />
        </div>
        <div className="flex gap-2">
          {["", "active", "banned", "suspended"].map(s => (
            <button key={s} data-testid={`filter-status-${s || "all"}`} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize border",
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
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Plan</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Joined</th>
              <th className="text-left px-5 py-3.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded-lg" /></td>)}
                </tr>
              ))
              : users.map(user => {
                const RoleIcon = ROLE_ICONS[user.role] ?? Shield;
                return (
                  <tr key={user.id} data-testid={`user-row-${user.id}`} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                          {user.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={cn("flex items-center gap-1.5 text-xs font-semibold capitalize", ROLE_CLASSES[user.role])}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-xs font-semibold capitalize", TIER_CLASSES[user.subscriptionPlan ?? "free"])}>
                        {user.subscriptionPlan ?? "free"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", STATUS_CLASSES[user.status])}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground">
                            Actions <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border rounded-xl">
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, "moderator")} className="text-violet-400 cursor-pointer">
                            <Gavel className="w-3.5 h-3.5 mr-2" /> Make Moderator
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")} className="text-amber-400 cursor-pointer">
                            <Crown className="w-3.5 h-3.5 mr-2" /> Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")} className="text-muted-foreground cursor-pointer">
                            <Shield className="w-3.5 h-3.5 mr-2" /> Reset to User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status !== "suspended" && (
                            <DropdownMenuItem onClick={() => handleSuspend(user.id)} className="text-amber-400 cursor-pointer">
                              <Shield className="w-3.5 h-3.5 mr-2" /> Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            data-testid={`button-ban-${user.id}`}
                            onClick={() => handleToggleBan(user.id, user.status)}
                            className={cn("cursor-pointer", user.status === "banned" ? "text-emerald-400" : "text-red-400")}
                          >
                            {user.status === "banned"
                              ? <><ShieldOff className="w-3.5 h-3.5 mr-2" /> Unban</>
                              : <><Shield className="w-3.5 h-3.5 mr-2" /> Ban User</>
                            }
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
