import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { getUserId } from "@/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  xp: number;
  subscriptionPlan: string | null;
  rank: number;
}

interface Tournament {
  id: number;
  name: string;
  status: string;
}

interface Participant {
  id: number;
  userId: number;
  rank: number | null;
  score: number | null;
  username: string;
  avatarUrl: string | null;
  level: number;
}

const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-700"];
const RANK_ICONS = [Crown, Medal, Medal];

const TIER_BADGES: Record<string, string> = {
  vip: "bg-gradient-to-r from-purple-600 to-pink-500",
  premium: "bg-gradient-to-r from-blue-600 to-cyan-500",
  basic: "bg-gradient-to-r from-gray-500 to-gray-400",
};

export default function LeaderboardPage() {
  const userId = getUserId();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leaderboard").then(r => r.json()),
      fetch("/api/tournaments").then(r => r.json()),
    ]).then(([lb, tours]) => {
      setLeaderboard(lb);
      setTournaments(tours.filter((t: Tournament) => t.status === "completed" || t.status === "in_progress"));
      if (tours.length > 0) setSelectedTournament(tours[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const fetchParticipants = useCallback(async (id: number) => {
    const res = await fetch(`/api/tournaments/${id}`);
    const data = await res.json();
    const sorted = (data.participants || []).sort((a: Participant, b: Participant) => {
      if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
      if (a.score !== null && b.score !== null) return b.score - a.score;
      return 0;
    });
    setParticipants(sorted);
  }, []);

  useEffect(() => {
    if (selectedTournament) fetchParticipants(selectedTournament);
  }, [selectedTournament, fetchParticipants]);

  const filtered = leaderboard.filter(e =>
    !search || e.username.toLowerCase().includes(search.toLowerCase()) || e.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Trophy className="w-7 h-7 text-yellow-500" /> Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Top players ranked by XP and tournament performance</p>
      </div>

      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global"><TrendingUp className="w-4 h-4 mr-1" /> Global</TabsTrigger>
          <TabsTrigger value="tournament"><Users className="w-4 h-4 mr-1" /> Tournament</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((entry, i) => {
              const RankIcon = RANK_ICONS[i] || null;
              return (
                <Link
                  key={entry.id}
                  href={`/profile/${entry.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all",
                    entry.id === userId
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card/40 border-white/5 hover:bg-card/60"
                  )}
                >
                  <div className="w-8 text-center flex-shrink-0">
                    {entry.rank <= 3 ? (
                      <div className={cn("flex items-center justify-center", RANK_COLORS[entry.rank - 1])}>
                        {entry.rank === 1 ? <Crown className="w-6 h-6" /> : <Medal className="w-5 h-5" />}
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{entry.rank}</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                    <img src={entry.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.username}`} alt="" className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm truncate">
                        {entry.displayName || entry.username}
                      </span>
                      {entry.subscriptionPlan && entry.subscriptionPlan !== "free" && (
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded text-white", TIER_BADGES[entry.subscriptionPlan] || "bg-white/10")}>
                          {entry.subscriptionPlan.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{entry.username}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">{entry.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tournament" className="mt-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {tournaments.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTournament(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  selectedTournament === t.id
                    ? "bg-primary text-white"
                    : "bg-card border border-white/10 text-muted-foreground hover:text-white"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {participants.length === 0 ? (
              <Card className="bg-card/50 border-white/10 p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No participants yet</p>
              </Card>
            ) : (
              participants.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/profile/${p.userId}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-white/5 hover:bg-card/60 transition-all"
                >
                  <div className="w-8 text-center flex-shrink-0">
                    {p.rank && p.rank <= 3 ? (
                      <div className={cn("flex items-center justify-center", RANK_COLORS[p.rank - 1])}>
                        {p.rank === 1 ? <Crown className="w-5 h-5" /> : <Medal className="w-4 h-4" />}
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{p.rank || i + 1}</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                    <img src={p.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${p.username}`} alt="" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{p.username}</p>
                    <p className="text-xs text-muted-foreground">Level {p.level}</p>
                  </div>
                  {p.score !== null && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{p.score.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
