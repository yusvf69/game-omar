import { useParams } from "wouter";
import { useGetUser, useGetUserStats, useGetUserAchievements } from "@workspace/api-client-react";
import { Star, Trophy, Heart, Clock, Gamepad2, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const rarityColors: Record<string, string> = {
  common: "text-gray-400 bg-gray-800",
  rare: "text-blue-400 bg-blue-900/40",
  epic: "text-violet-400 bg-violet-900/40",
  legendary: "text-orange-400 bg-orange-900/40",
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const { data: user, isLoading: userLoading } = useGetUser(userId, { query: { enabled: !!userId, queryKey: ["user", userId] } });
  const { data: stats } = useGetUserStats(userId, { query: { enabled: !!userId, queryKey: ["userStats", userId] } });
  const { data: achievements = [] } = useGetUserAchievements(userId, { query: { enabled: !!userId, queryKey: ["userAchievements", userId] } });

  if (userLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) return <div className="p-8 text-center text-muted-foreground py-24">User not found.</div>;

  const xpProgress = stats ? Math.min(100, (stats.xp / ((stats.xp + (stats.xpToNextLevel ?? 0)) || 1)) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold font-display flex-shrink-0">
            {user.username[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 data-testid="text-username" className="text-2xl font-bold font-display text-foreground">
                {user.displayName ?? user.username}
              </h1>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                user.role === "admin" ? "bg-amber-900/40 text-amber-400" : "bg-muted text-muted-foreground"
              )}>
                {user.role}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">@{user.username}</p>
            {user.bio && <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              {user.country && <span>{user.country}</span>}
              {user.subscriptionPlan && (
                <span className={cn(
                  "font-semibold",
                  user.subscriptionPlan === "vip" ? "text-amber-400" :
                  user.subscriptionPlan === "premium" ? "text-violet-400" :
                  user.subscriptionPlan === "basic" ? "text-blue-400" : "text-gray-400"
                )}>
                  {user.subscriptionPlan?.toUpperCase()} Member
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground font-display">Lv.{user.level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>

        {/* XP Progress */}
        {stats && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{stats.xp} XP</span>
              <span>{stats.xpToNextLevel} XP to next level</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Clock, label: "Playtime", value: `${Math.round(stats.totalPlaytime / 60)}h` },
            { icon: Gamepad2, label: "Games", value: stats.gamesOwned },
            { icon: Trophy, label: "Achievements", value: stats.achievementsUnlocked },
            { icon: BookOpen, label: "Reviews", value: stats.reviewsWritten },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p data-testid={`stat-${stat.label.toLowerCase()}`} className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-display mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map(a => (
              <div key={a.id} data-testid={`achievement-${a.id}`} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", rarityColors[a.rarity])}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                </div>
                <span className="text-xs font-semibold text-primary">+{a.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
