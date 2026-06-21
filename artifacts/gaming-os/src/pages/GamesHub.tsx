import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Star, Clock, Grid3X3, ChevronDown } from "lucide-react";
import { GAMES, CATEGORIES, searchGames } from "@/data/games";
import { useGameProgression } from "@/hooks/use-game-progression";

const CATEGORY_ICONS: Record<string, string> = {
  Puzzle: "🧩",
  Arcade: "🕹️",
  Racing: "🏎️",
  Action: "⚔️",
  Multiplayer: "🌍",
  Strategy: "🧠",
  Retro: "👾",
};

export default function GamesHub() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const prog = useGameProgression();

  const displayed = useMemo(() => {
    let filtered = search ? searchGames(search) : GAMES;
    if (category) filtered = filtered.filter(g => g.category === category);
    return filtered;
  }, [search, category]);

  const stats = useMemo(() => ({
    total: GAMES.length,
    categories: CATEGORIES.length,
    favorites: prog.favorites.length,
    recentlyPlayed: prog.recentlyPlayed.length,
  }), [prog.favorites.length, prog.recentlyPlayed.length]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Game Hub</h1>
            <p className="text-muted-foreground mt-1">{stats.total} free HTML5 games to play</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              <span>{stats.favorites} favorites</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{stats.recentlyPlayed} played</span>
            </div>
            <button onClick={() => setView(v => v === "grid" ? "list" : "grid")} className="p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground hover:border-primary min-w-[160px]"
            >
              <span>{CATEGORY_ICONS[category] ?? "🎮"}</span>
              <span className="flex-1 text-left">{category || "All Categories"}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {showCategoryDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                <div className="absolute top-full right-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-xl z-20 py-1">
                  <button
                    onClick={() => { setCategory(""); setShowCategoryDropdown(false); }}
                    className="w-full px-4 py-2.5 text-left text-foreground hover:bg-muted flex items-center gap-3"
                  >
                    <span>🎮</span> All Games
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setShowCategoryDropdown(false); }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 ${category === cat ? "bg-primary/10 text-primary" : "text-foreground"}`}
                    >
                      <span>{CATEGORY_ICONS[cat] ?? "🎮"}</span> {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {displayed.length} of {GAMES.length} games</span>
          {category && <button onClick={() => setCategory("")} className="text-primary hover:underline ml-2">Clear filter</button>}
        </div>

        {prog.recentlyPlayed.length > 0 && !search && !category && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Recently Played
            </h2>
            <div className={view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              : "flex flex-col gap-2"
            }>
              {prog.recentlyPlayed.slice(0, 6).map(rp => {
                const game = GAMES.find(g => g.id === rp.gameId);
                if (!game) return null;
                return (
                  <GameCard key={rp.gameId} game={game} view={view} isFavorited={prog.isFavorited(game.id)} />
                );
              })}
            </div>
          </div>
        )}

        <div
          className={view === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            : "flex flex-col gap-2"
          }
        >
          {displayed.map(game => (
            <GameCard key={game.id} game={game} view={view} isFavorited={prog.isFavorited(game.id)} />
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No games found</p>
            <p className="text-sm text-muted-foreground mt-2">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, view, isFavorited }: { game: any; view: string; isFavorited: boolean }) {
  if (view === "list") {
    return (
      <Link href={`/games/${game.id}`} className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
          {game.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium truncate">{game.name}</p>
          <p className="text-xs text-muted-foreground">{game.category}</p>
        </div>
        {isFavorited && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />}
        <span className="text-xs text-muted-foreground shrink-0">Play →</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/games/${game.id}`}
      className="block rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-primary transition-colors group"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-card flex items-center justify-center">
        <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
          {game.name.charAt(0)}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-sm font-medium">Play Now</span>
        </div>
        {isFavorited && (
          <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-400 fill-yellow-400" />
        )}
      </div>
      <div className="p-3">
        <p className="text-foreground font-medium text-sm truncate">{game.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{game.category}</p>
      </div>
    </Link>
  );
}
