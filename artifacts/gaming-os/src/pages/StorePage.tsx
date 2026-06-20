import { useListFeaturedGames, useListTrendingGames, useListNewReleases, useListCategories, useGetStoreSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Users, Gamepad2, Star, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import GameCard from "@/components/GameCard";

export default function StorePage() {
  const { data: featured = [], isLoading: featuredLoading } = useListFeaturedGames();
  const { data: trending = [], isLoading: trendingLoading } = useListTrendingGames();
  const { data: newReleases = [] } = useListNewReleases();
  const { data: categories = [] } = useListCategories();
  const { data: summary } = useGetStoreSummary();

  const hero = featured[0];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {featuredLoading ? (
        <div className="relative h-[420px] bg-card animate-pulse" />
      ) : hero ? (
        <div className="relative h-[420px] overflow-hidden">
          <img
            src={hero.coverImage}
            alt={hero.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${hero.id}/1200/420`; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-10">
            <div className="max-w-xl">
              <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                Featured
              </span>
              <h1 className="text-4xl font-bold text-white mb-2 font-display">{hero.title}</h1>
              <p className="text-gray-300 text-sm mb-5 line-clamp-2">{hero.description}</p>
              <div className="flex items-center gap-3">
                <Link href={`/games/${hero.id}`} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  <Zap className="w-4 h-4" /> Play Now
                </Link>
                <Link href="/games" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-medium px-5 py-2.5 rounded-lg transition-colors">
                  Browse Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="p-8 space-y-10">
        {/* Stats Bar */}
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Gamepad2, label: "Games", value: summary.totalGames },
              { icon: Users, label: "Players", value: `${summary.totalUsers}+` },
              { icon: Star, label: "Avg Rating", value: Number(summary.averageRating).toFixed(1) },
              { icon: Zap, label: "Subscribers", value: summary.activeSubscribers },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p data-testid={`stat-${stat.label.toLowerCase()}`} className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Games */}
        {featured.length > 1 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground font-display">Featured Games</h2>
              <Link href="/games?sort=top_rated" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(1).map(game => <GameCard key={game.id} game={game} />)}
            </div>
          </section>
        )}

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground font-display">Trending Now</h2>
            <Link href="/games?sort=trending" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {trendingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[16/10] rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          )}
        </section>

        {/* New Releases */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground font-display">New Releases</h2>
            <Link href="/games?sort=newest" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newReleases.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground font-display mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.name}
                  href={`/games?category=${encodeURIComponent(cat.name)}`}
                  data-testid={`category-${cat.slug}`}
                  className="flex items-center justify-between bg-card border border-border hover:border-primary/40 rounded-xl px-4 py-3 transition-colors group"
                >
                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
