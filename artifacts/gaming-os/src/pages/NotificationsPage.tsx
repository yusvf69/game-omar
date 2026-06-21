import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { getUserId } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Trophy,
  UserPlus,
  Swords,
  Star,
  ShoppingCart,
  Megaphone,
  ChevronRight,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  achievement: Trophy,
  friend_request: UserPlus,
  tournament: Swords,
  review: Star,
  marketplace: ShoppingCart,
  system: Megaphone,
};

const TYPE_COLORS: Record<string, string> = {
  achievement: "text-yellow-500 bg-yellow-500/10",
  friend_request: "text-blue-500 bg-blue-500/10",
  tournament: "text-purple-500 bg-purple-500/10",
  review: "text-pink-500 bg-pink-500/10",
  marketplace: "text-emerald-500 bg-emerald-500/10",
  system: "text-muted-foreground bg-white/5",
};

export default function NotificationsPage() {
  const userId = getUserId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications/${userId}`);
      const data = await res.json();
      setNotifications(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markRead(id: number) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  async function markAllRead() {
    await fetch(`/api/notifications/${userId}/read-all`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unread = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "No unread notifications"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="bg-card/50 border-white/10 p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No notifications yet</h3>
          <p className="text-muted-foreground text-sm">You're all caught up! Notifications will appear here when something happens.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            const color = TYPE_COLORS[n.type] || TYPE_COLORS.system;
            return (
              <div
                key={n.id}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? "bg-card/30 border-white/5"
                    : "bg-card/60 border-primary/20"
                }`}
                onClick={() => { if (!n.read) markRead(n.id); }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-semibold text-sm ${n.read ? "text-muted-foreground" : "text-white"}`}>
                      {n.title}
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {n.link && (
                  <Link href={n.link} className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
