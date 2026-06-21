import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, X, Clock, TrendingUp, Star, Users, Gamepad2, ChevronRight, Flame } from "lucide-react";
import { useListGames } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const TRENDING_SEARCHES = [
  "fps games", "offline rpg", "multiplayer racing", "open world", "battle royale", "strategy games"
];

const RECENT_SEARCHES = [
  "Dragon's Lair", "Cyber Arena", "space shooter"
];

const CATEGORIES_POPULAR = [
  { name: "Action", count: 4, gradient: "from-red-600 to-orange-500" },
  { name: "RPG", count: 3, gradient: "from-purple-600 to-pink-500" },
  { name: "Racing", count: 2, gradient: "from-blue-600 to-cyan-500" },
  { name: "Strategy", count: 2, gradient: "from-green-600 to-teal-500" },
  { name: "Simulation", count: 1, gradient: "from-yellow-500 to-orange-400" },
  { name: "FPS", count: 2, gradient: "from-gray-600 to-gray-500" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults = [] } = useListGames({
    search: debouncedQuery || undefined,
    limit: 12,
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q && !recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev.slice(0, 4)]);
    }
  };

  const clearQuery = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  const hasResults = debouncedQuery && searchResults.length > 0;
  const noResults = debouncedQuery && searchResults.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search games, genres, developers..."
                className="w-full pl-12 pr-12 py-4 bg-card border border-card-border rounded-2xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {query && (
                <button
                  onClick={clearQuery}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">

        {/* Empty state — no query */}
        {!debouncedQuery && (
          <div className="space-y-10">

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" /> Recent Searches
                  </h2>
                  <button onClick={() => setRecentSearches([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(term => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-xl text-sm text-foreground hover:border-primary/40 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Searches */}
            <section>
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-orange-400" /> Trending Now
              </h2>
              <div className="space-y-2">
                {TRENDING_SEARCHES.map((term, i) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="w-full flex items-center gap-4 px-4 py-3 bg-card border border-card-border rounded-xl hover:border-primary/40 transition-all text-left"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className="flex-1 text-sm font-semibold text-foreground capitalize">{term}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>

            {/* Browse by Category */}
            <section>
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                <Gamepad2 className="w-4 h-4 text-primary" /> Browse Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES_POPULAR.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => handleSearch(cat.name)}
                    className={cn("relative rounded-2xl overflow-hidden h-20 cursor-pointer hover:scale-[1.02] transition-all bg-gradient-to-br", cat.gradient)}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative p-4 text-left">
                      <p className="font-bold text-white">{cat.name}</p>
                      <p className="text-white/70 text-xs">{cat.count} games</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">
                {searchResults.length} results for "<span className="text-primary">{debouncedQuery}</span>"
              </h2>
            </div>

            {/* Games */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map(game => (
                <Link key={game.id} href={`/games/${game.id}`}>
                  <div className="flex items-center gap-4 bg-card border border-card-border rounded-2xl p-3 hover:border-primary/30 hover:scale-[1.01] transition-all cursor-pointer">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{game.title}</p>
                      <p className="text-xs text-muted-foreground">{game.developer || "Unknown"} · {game.category}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400" />{Number(game.rating).toFixed(1)}
                        </span>
                        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded",
                          game.subscriptionTier === "free" ? "bg-gray-500/20 text-gray-300" :
                          game.subscriptionTier === "basic" ? "bg-blue-500/20 text-blue-300" :
                          game.subscriptionTier === "premium" ? "bg-purple-500/20 text-purple-300" : "bg-yellow-500/20 text-yellow-300"
                        )}>{game.subscriptionTier}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/30 transition-colors flex-shrink-0">
                      {Number(game.price) === 0 ? "Free" : `$${Number(game.price).toFixed(2)}`}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {noResults && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground">No games found</h2>
            <p className="text-muted-foreground mt-2">Try different keywords or browse categories</p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={clearQuery} className="px-5 py-2.5 bg-card border border-card-border text-foreground rounded-xl text-sm font-semibold hover:border-primary/30 transition-colors">
                Clear Search
              </button>
              <Link href="/games">
                <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Browse Games
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
