import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetUser, useGetUserStats, useGetUserAchievements, useGetWishlist } from "@workspace/api-client-react";
import { Star, Trophy, Heart, Clock, Gamepad2, BookOpen, Settings, Activity, Users, Zap, Crown, Shield, Bell, Edit3, MapPin, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { cn } from "@/lib/utils";

const DEMO_USER_ID = 8;

const RARITY_STYLES: Record<string, { text: string; bg: string }> = {
  common: { text: "text-gray-300", bg: "bg-gray-500/20" },
  rare: { text: "text-blue-300", bg: "bg-blue-500/20" },
  epic: { text: "text-purple-300", bg: "bg-purple-500/20" },
  legendary: { text: "text-yellow-300", bg: "bg-yellow-500/20" },
};

const TIER_STYLES: Record<string, { text: string; bg: string; label: string; icon: React.ElementType }> = {
  free: { text: "text-gray-300", bg: "bg-gray-500/20", label: "Free", icon: Shield },
  basic: { text: "text-blue-300", bg: "bg-blue-500/20", label: "Basic", icon: Zap },
  premium: { text: "text-purple-300", bg: "bg-purple-500/20", label: "Premium", icon: Star },
  vip: { text: "text-yellow-300", bg: "bg-yellow-500/20", label: "VIP", icon: Crown },
};

const ACTIVITY = [
  { action: "Unlocked achievement", detail: "First Blood", game: "CyberCity 2087", time: "2h ago", icon: "🏆" },
  { action: "Completed", detail: "Main Story", game: "Dragon's Lair: Reborn", time: "1d ago", icon: "⚔️" },
  { action: "Reached Level", detail: "Level 42", game: "Platform", time: "2d ago", icon: "⚡" },
  { action: "Added to wishlist", detail: "Phantom Protocol", game: "Platform", time: "3d ago", icon: "❤️" },
  { action: "Posted review", detail: "5 stars", game: "Nebula Assault", time: "5d ago", icon: "⭐" },
  { action: "Won tournament", detail: "Daily Cup", game: "Mech Warfare Elite", time: "1w ago", icon: "🏅" },
];

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [activeTab, setActiveTab] = useState<"overview" | "library" | "achievements" | "activity" | "settings">("overview");
  const isOwnProfile = userId === DEMO_USER_ID;

  const { data: user, isLoading: userLoading } = useGetUser(userId, { query: { enabled: !!userId, queryKey: ["user", userId] } });
  const { data: stats } = useGetUserStats(userId, { query: { enabled: !!userId, queryKey: ["userStats", userId] } });
  const { data: achievements = [] } = useGetUserAchievements(userId, { query: { enabled: !!userId, queryKey: ["userAchievements", userId] } });
  const { data: wishlist = [] } = useGetWishlist(userId, { query: { enabled: !!userId, queryKey: ["wishlist", userId] } });

  if (userLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="p-8 text-center text-muted-foreground py-32 text-lg">User not found.</div>;

  const xpProgress = stats ? Math.min(100, (stats.xp / ((stats.xp + (stats.xpToNextLevel ?? 1000)) || 1)) * 100) : 0;
  const tier = TIER_STYLES[user.subscriptionPlan ?? "free"] ?? TIER_STYLES.free;
  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo */}
      <div className="relative h-52 bg-gradient-to-br from-[#0a0a1a] via-[#0d1b3e] to-[#1a0533] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        {isOwnProfile && (
          <button className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-xl transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 md:px-8 -mt-16 relative z-10 max-w-screen-xl mx-auto">
        <div className="bg-card border border-card-border rounded-3xl p-6 mb-2">
          <div className="flex flex-col md:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                {user.username[0]?.toUpperCase()}
              </div>
              {user.status === "active" && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-card" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 data-testid="text-username" className="text-2xl font-bold text-foreground">
                      {user.displayName ?? user.username}
                    </h1>
                    <span className={cn("flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full", tier.bg, tier.text)}>
                      <TierIcon className="w-3 h-3" /> {tier.label}
                    </span>
                    {user.role !== "user" && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5">@{user.username}</p>
                  {user.bio && <p className="text-sm text-muted-foreground mt-2 max-w-md">{user.bio}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    {user.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.country}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-4xl font-bold text-foreground">Lv.{user.level}</div>
                  <p className="text-xs text-muted-foreground">{(user.xp || 0).toLocaleString()} XP</p>
                </div>
              </div>

              {/* XP Bar */}
              {stats && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="font-medium text-primary">{stats.xp.toLocaleString()} XP</span>
                    <span>{(stats.xpToNextLevel ?? 0).toLocaleString()} to next level</span>
                  </div>
                  <Progress value={xpProgress} className="h-2.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { icon: Clock, label: "Playtime", value: `${Math.round(stats.totalPlaytime / 60)}h`, color: "text-blue-400" },
              { icon: Gamepad2, label: "Games", value: stats.gamesOwned, color: "text-green-400" },
              { icon: Trophy, label: "Achievements", value: stats.achievementsUnlocked, color: "text-yellow-400" },
              { icon: BookOpen, label: "Reviews", value: stats.reviewsWritten, color: "text-purple-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-card-border rounded-2xl p-4 text-center">
                <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                <p data-testid={`stat-${stat.label.toLowerCase()}`} className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-card-border rounded-xl p-1 mb-6 w-fit">
          {(["overview", "library", "achievements", "activity", "settings"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                activeTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Achievements */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-foreground mb-4 text-lg">Recent Achievements</h3>
              <div className="space-y-3">
                {achievements.slice(0, 6).map(a => {
                  const rarity = RARITY_STYLES[a.rarity] ?? RARITY_STYLES.common;
                  return (
                    <div key={a.id} data-testid={`achievement-${a.id}`} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl", rarity.bg)}>
                        🏆
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{a.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                        <span className={cn("text-xs font-bold", rarity.text)}>{a.rarity}</span>
                      </div>
                      <span className="text-sm font-bold text-primary flex items-center gap-1 flex-shrink-0">
                        <Zap className="w-3.5 h-3.5" />+{a.xpReward}
                      </span>
                    </div>
                  );
                })}
                {achievements.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-card border border-card-border rounded-2xl">
                    <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No achievements yet</p>
                  </div>
                )}
              </div>
              {achievements.length > 6 && (
                <button onClick={() => setActiveTab("achievements")} className="mt-3 text-sm text-primary hover:underline">
                  View all {achievements.length} achievements →
                </button>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              {/* Subscription Info */}
              <div className={cn("rounded-2xl p-5 border", tier.bg, "border-current/20")}>
                <div className="flex items-center gap-2 mb-2">
                  <TierIcon className={cn("w-5 h-5", tier.text)} />
                  <p className={cn("font-bold", tier.text)}>{tier.label} Member</p>
                </div>
                <p className="text-xs text-muted-foreground">Access to all {user.subscriptionPlan === "free" ? "free" : user.subscriptionPlan === "basic" ? "basic & free" : "premium & below"} games</p>
                {isOwnProfile && (
                  <Link href="/store/subscriptions">
                    <button className={cn("mt-3 w-full py-2 rounded-xl text-xs font-bold transition-colors", tier.bg, tier.text, "border border-current/30 hover:opacity-80")}>
                      Upgrade Plan
                    </button>
                  </Link>
                )}
              </div>

              {/* Wishlist */}
              {wishlist.length > 0 && (
                <div className="bg-card border border-card-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" /> Wishlist
                    </h4>
                    <Link href="/wishlist">
                      <span className="text-xs text-primary hover:underline">{wishlist.length} games</span>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {wishlist.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                          {item.coverImage && <img src={item.coverImage} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-xs text-foreground truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground text-lg">All Achievements ({achievements.length})</h3>
              <div className="flex gap-2">
                {["common", "rare", "epic", "legendary"].map(r => (
                  <span key={r} className={cn("text-xs px-2.5 py-1 rounded-full font-semibold capitalize", RARITY_STYLES[r]?.bg, RARITY_STYLES[r]?.text)}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map(a => {
                const rarity = RARITY_STYLES[a.rarity] ?? RARITY_STYLES.common;
                return (
                  <div key={a.id} data-testid={`achievement-${a.id}`} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl", rarity.bg)}>🏆</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                      <span className={cn("text-xs font-bold capitalize", rarity.text)}>{a.rarity}</span>
                    </div>
                    <span className="text-sm font-bold text-primary flex-shrink-0">+{a.xpReward}</span>
                  </div>
                );
              })}
              {achievements.length === 0 && (
                <div className="col-span-2 text-center py-16 text-muted-foreground bg-card border border-card-border rounded-2xl">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No achievements unlocked yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div>
            <h3 className="font-bold text-foreground text-lg mb-4">Game Library</h3>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {wishlist.map(item => (
                  <Link key={item.id} href={`/games/${item.id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative rounded-2xl overflow-hidden aspect-square mb-3">
                        {item.coverImage && (
                          <img src={item.coverImage} alt={item.title ?? ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground bg-card border border-card-border rounded-2xl">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No games in library yet</p>
                <Link href="/games">
                  <button className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                    Browse Games
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="max-w-2xl">
            <h3 className="font-bold text-foreground text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="bg-card border border-card-border rounded-2xl p-4 flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">{item.action} </span>
                      <span className="font-bold">{item.detail}</span>
                      {item.game !== "Platform" && <span className="text-muted-foreground"> in {item.game}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && isOwnProfile && (
          <div className="max-w-lg space-y-4">
            {[
              { label: "Edit Profile", desc: "Change display name, bio, avatar, country", icon: Edit3 },
              { label: "Subscription", desc: "Manage your plan and billing", icon: Crown },
              { label: "Notifications", desc: "Manage email and push notifications", icon: Bell },
              { label: "Privacy", desc: "Control who can see your profile and activity", icon: Shield },
              { label: "Account Security", desc: "Password, 2FA, connected accounts", icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-card border border-card-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "settings" && !isOwnProfile && (
          <div className="text-center py-16 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Settings are only visible to the profile owner.</p>
          </div>
        )}

        <div className="pb-12" />
      </div>
    </div>
  );
}
