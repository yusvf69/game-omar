import { useState } from "react";
import { Trophy, Users, Timer, Swords, Medal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTournaments, useLeaderboard, useJoinTournament, DEMO_USER_ID } from "@/hooks/use-api";

const RANK_TIERS = [
  { name: "Bronze", color: "text-amber-600", bg: "bg-amber-900/30", border: "border-amber-700/40", icon: "🥉" },
  { name: "Silver", color: "text-gray-300", bg: "bg-gray-700/30", border: "border-gray-600/40", icon: "🥈" },
  { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-700/40", icon: "🥇" },
  { name: "Platinum", color: "text-cyan-300", bg: "bg-cyan-900/30", border: "border-cyan-700/40", icon: "💎" },
  { name: "Diamond", color: "text-blue-300", bg: "bg-blue-900/30", border: "border-blue-700/40", icon: "💠" },
  { name: "Master", color: "text-purple-300", bg: "bg-purple-900/30", border: "border-purple-700/40", icon: "⚔️" },
  { name: "Grandmaster", color: "text-red-300", bg: "bg-red-900/30", border: "border-red-700/40", icon: "🔥" },
  { name: "Legend", color: "text-yellow-300", bg: "bg-yellow-900/20", border: "border-yellow-600/50", icon: "👑" },
];

const STATUS_COLORS: Record<string, string> = {
  live: "bg-green-500/20 text-green-300 border-green-500/40",
  upcoming: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  completed: "bg-gray-500/20 text-gray-300 border-gray-500/40",
};

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<"tournaments" | "leaderboard" | "ranks">("tournaments");
  const [filter, setFilter] = useState("all");

  const { data: tournaments = [], isLoading: tournLoading } = useTournaments();
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard();
  const joinTournament = useJoinTournament();

  const filtered = tournaments.filter(t => {
    if (filter === "live") return t.status === "live";
    if (filter === "upcoming") return t.status === "upcoming";
    return true;
  });

  const liveCount = tournaments.filter(t => t.status === "live").length;

  function getTier(xp: number) {
    if (xp >= 100000) return RANK_TIERS[7];
    if (xp >= 80000) return RANK_TIERS[6];
    if (xp >= 60000) return RANK_TIERS[5];
    if (xp >= 40000) return RANK_TIERS[4];
    if (xp >= 25000) return RANK_TIERS[3];
    if (xp >= 15000) return RANK_TIERS[2];
    if (xp >= 7000) return RANK_TIERS[1];
    return RANK_TIERS[0];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" /> Tournaments
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Compete, rank up, and earn exclusive rewards</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2">
            <Swords className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-300">{liveCount} Live</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-card rounded-xl p-1 w-fit">
          {(["tournaments", "leaderboard", "ranks"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                activeTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">

        {activeTab === "tournaments" && (
          <div className="space-y-8">
            {/* Season Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0533] to-[#0f1a33] border border-purple-500/20 p-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent" />
              <div className="relative flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-purple-400">Season 1 · Active</span>
                  <h2 className="text-3xl font-bold text-white mt-2">Summer Championship 2026</h2>
                  <p className="text-white/60 mt-1">Compete, rank up, and earn exclusive seasonal rewards.</p>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-300">$25,000</p>
                      <p className="text-xs text-white/40">Prize Pool</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{tournaments.reduce((s, t) => s + t.currentParticipants, 0)}</p>
                      <p className="text-xs text-white/40">Players</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-300">47d</p>
                      <p className="text-xs text-white/40">Remaining</p>
                    </div>
                  </div>
                </div>
                <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-base transition-all">
                  Join Season
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {["all", "live", "upcoming"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all",
                    filter === f ? "bg-primary text-white" : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "all" ? "All Tournaments" : f === "live" ? "🔴 Live" : "📅 Upcoming"}
                </button>
              ))}
            </div>

            {tournLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              /* Tournament Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(t => (
                  <div key={t.id} className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/30 hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="relative h-44">
                      <img src={t.imageUrl ?? "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80"} alt={t.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", STATUS_COLORS[t.status])}>
                          {t.status === "live" ? "LIVE" : t.status === "upcoming" ? "UPCOMING" : "COMPLETED"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Timer className="w-3 h-3" />{new Date(t.endDate) > new Date() ? `${Math.ceil((new Date(t.endDate).getTime() - Date.now()) / 86400000)}d` : "Ended"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground">{t.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{t.gameName ?? "Cross-Platform"}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" />${t.prizePool}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.currentParticipants}/{t.maxParticipants}</span>
                        </div>
                        <button
                          onClick={() => joinTournament.mutate({ tournamentId: t.id, userId: DEMO_USER_ID })}
                          disabled={joinTournament.isPending || t.status !== "live"}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            t.status === "live" ? "bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30" : "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
                          )}
                        >
                          {joinTournament.isPending ? "Joining..." : t.status === "live" ? "Join Now" : "Register"}
                        </button>
                      </div>
                      <div className="mt-3">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(t.currentParticipants / t.maxParticipants) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            {lbLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border/50">
                  <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Medal className="w-5 h-5 text-yellow-400" /> Global Leaderboard
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Top players this season</p>
                </div>
                <div className="divide-y divide-border/40">
                  {leaderboard.slice(0, 10).map((player, i) => {
                    const tier = getTier(player.xp);
                    return (
                      <div key={player.id} className={cn(
                        "flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors",
                        i < 3 ? "bg-secondary/20" : ""
                      )}>
                        <div className={cn("w-8 text-center font-bold text-lg",
                          i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${player.rank}`}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                          <img src={player.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${player.username}`} alt={player.username} className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground">{player.username}</p>
                          <p className="text-xs text-muted-foreground">Level {player.level}</p>
                        </div>
                        <div className={cn("hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", tier?.bg, tier?.border, "border", tier?.color)}>
                          <span>{tier?.icon}</span> {tier?.name}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-sm">{player.xp.toLocaleString()} XP</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "ranks" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {RANK_TIERS.map(tier => (
                <div key={tier.name} className={cn("rounded-2xl p-6 border text-center", tier.bg, tier.border)}>
                  <div className="text-5xl mb-3">{tier.icon}</div>
                  <h3 className={cn("text-xl font-bold", tier.color)}>{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mt-2">Divisions I, II, III</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground text-lg mb-4">How Ranking Works</h3>
              <div className="space-y-3">
                {[
                  { icon: "🏆", title: "Win Points", desc: "+25 to +40 points per win based on opponent rank" },
                  { icon: "💔", title: "Lose Points", desc: "-10 to -25 points per loss, less at lower ranks" },
                  { icon: "⚡", title: "Win Streak Bonus", desc: "+5 extra points per win when on a win streak" },
                  { icon: "🎯", title: "MVP Bonus", desc: "+10 extra points when voted MVP by your team" },
                  { icon: "📅", title: "Season Reset", desc: "Soft rank reset at season end — keep partial rank points" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
