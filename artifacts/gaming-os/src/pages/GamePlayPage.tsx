import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Star, Heart, Download, ArrowLeft, Clock, Trophy, Share2, ExternalLink } from "lucide-react";
import { GAMES, CATEGORIES } from "@/data/games";
import { useGameProgression } from "@/hooks/use-game-progression";

export default function GamePlayPage() {
  const { id } = useParams<{ id: string }>();
  const game = GAMES.find(g => g.id === id);
  const prog = useGameProgression();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (game) prog.recordPlay(game.id);
  }, [game?.id]);

  useEffect(() => {
    if (showLeaderboard && game) {
      prog.getLeaderboard(game.id).then(setLeaderboard).catch(() => {});
    }
  }, [showLeaderboard, game?.id]);

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Game not found</h1>
          <Link href="/games" className="text-primary hover:underline mt-4 inline-block">← Back to games</Link>
        </div>
      </div>
    );
  }

  const categoryGames = GAMES.filter(g => g.category === game.category && g.id !== game.id).slice(0, 6);

  const relatedGames = CATEGORIES.filter(c => c !== game.category).length > 0
    ? GAMES.filter(g => g.category !== game.category && g.id !== game.id).slice(0, 4)
    : [];

  const rating = prog.getRating(game.id);
  const isFav = prog.isFavorited(game.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/games" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">{game.name}</h1>
                <p className="text-sm text-muted-foreground">{game.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => prog.setRating(game.id, star)}
                    className={`transition-colors ${star <= rating ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400/50"}`}
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? "fill-yellow-400" : ""}`} />
                  </button>
                ))}
              </div>
              <button
                onClick={() => prog.toggleFavorite(game.id)}
                className={`p-2 rounded-lg transition-colors ${isFav ? "text-red-400 bg-red-500/10" : "text-muted-foreground hover:text-red-400 hover:bg-red-500/10"}`}
              >
                <Heart className={`w-5 h-5 ${isFav ? "fill-red-400" : ""}`} />
              </button>
              <a
                href={game.download}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Download ZIP"
              >
                <Download className="w-5 h-5" />
              </a>
              <a
                href={game.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="View on GitHub"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="relative w-full" style={{ height: "75vh", minHeight: "500px" }}>
                <iframe
                  src={game.url}
                  className="absolute inset-0 w-full h-full border-0"
                  title={game.name}
                  allow="fullscreen"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground">{game.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="text-foreground">{rating > 0 ? `${rating}/5` : "Not rated"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Favorite</span>
                  <span className={isFav ? "text-red-400" : "text-muted-foreground"}>{isFav ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Score</h3>
                <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="text-xs text-primary hover:underline">
                  {showLeaderboard ? "Hide" : "Leaderboard"}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  placeholder="Enter score"
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => { prog.submitScore(game.id, score); setShowLeaderboard(true); }}
                  className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  Submit
                </button>
              </div>
            </div>

            {showLeaderboard && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No scores yet</p>
                ) : (
                  <div className="space-y-1">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 text-center font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {i + 1}
                          </span>
                          <span className="text-foreground">Player {entry.userId}</span>
                        </div>
                        <span className="text-foreground font-medium">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <a
                  href={game.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Source
                </a>
                <a
                  href={game.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Download className="w-3.5 h-3.5" /> Download ZIP
                </a>
              </div>
            </div>
          </div>
        </div>

        {categoryGames.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">More {game.category} Games</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categoryGames.map(g => (
                <Link key={g.id} href={`/games/${g.id}`} className="block p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors">
                  <p className="text-foreground font-medium text-sm truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
