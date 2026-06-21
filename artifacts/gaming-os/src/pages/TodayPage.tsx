import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useListGames, useGetStoreSummary } from "@workspace/api-client-react";
import { ChevronRight, Zap, Star, Clock, Users, Flame, TrendingUp, Award, Play, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_USER_ID = 8;

function isOnboarded() {
  try {
    const stored = localStorage.getItem("gamingos_user");
    if (!stored) return true;
    const user = JSON.parse(stored);
    if (user.onboardingComplete === undefined) return true;
    return !!user.onboardingComplete;
  } catch {}
  return true;
}

const EDITORIAL_STORIES = [
  {
    id: 1,
    category: "EDITOR'S CHOICE",
    title: "Top 10 Multiplayer Games This Week",
    subtitle: "Competitive games rising in popularity across all platforms",
    gradient: "from-blue-600 to-cyan-500",
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 2,
    category: "GAME OF THE WEEK",
    title: "Dragon's Lair: Reborn — A New Era of RPG",
    subtitle: "The most anticipated RPG launch takes the platform by storm",
    gradient: "from-purple-600 to-pink-500",
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: 3,
    category: "TIPS & TRICKS",
    title: "How to Level Up Faster in GamingOS",
    subtitle: "Expert strategies to earn XP and unlock legendary achievements",
    gradient: "from-orange-500 to-red-500",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: 4,
    category: "NEW RELEASE",
    title: "Nebula Assault Season 2 Is Here",
    subtitle: "New maps, weapons, and battle pass rewards await you",
    gradient: "from-green-600 to-teal-500",
    icon: <Flame className="w-6 h-6" />,
  },
];

const LIVE_EVENTS = [
  { id: 1, label: "LIVE NOW", title: "Double XP Weekend", subtitle: "Ends in 2 days", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  { id: 2, label: "STARTING SOON", title: "Summer Championship", subtitle: "Starts in 6 hours", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { id: 3, label: "LIVE NOW", title: "New Season Drop", subtitle: "Limited rewards available", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function TodayPage() {
  const [, setLocation] = useLocation();
  const [heroIndex, setHeroIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOnboarded()) setLocation("/onboarding");
  }, [setLocation]);

  const { data: games = [] } = useListGames({ limit: 12, sort: "trending" });
  const { data: featured = [] } = useListGames({ limit: 5, sort: "top_rated" });
  const { data: newReleases = [] } = useListGames({ limit: 6, sort: "newest" });
  const { data: summary } = useGetStoreSummary();

  const heroGames = featured.slice(0, 4);

  useEffect(() => {
    if (heroGames.length === 0) return;
    timerRef.current = setInterval(() => {
      setHeroIndex(i => (i + 1) % heroGames.length);
    }, 8000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [heroGames.length]);

  const hero = heroGames[heroIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Today</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate()} · {getGreeting()}</p>
          </div>
          <div className="flex items-center gap-3">
            {summary && (
              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" />{summary.totalGames} games</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" />{summary.activeSubscribers} subscribers</span>
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">P</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 space-y-12 max-w-screen-2xl mx-auto">

        {/* Hero Carousel */}
        {hero && (
          <section>
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[260px] md:h-[480px] group cursor-pointer" onClick={() => window.location.href = `/games/${hero.id}`}>
              <img
                src={hero.coverImage}
                alt={hero.title}
                className="w-full h-full object-cover transition-transform duration-[12s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] md:text-xs font-semibold mb-2 md:mb-4 uppercase tracking-wider">
                  <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> Featured
                </span>
                <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-3 leading-tight">{hero.title}</h2>
                <p className="text-white/70 text-sm md:text-lg mb-4 md:mb-6 line-clamp-2">{hero.description}</p>
                <div className="flex items-center gap-3 md:gap-4">
                  <Link href={`/games/${hero.id}`}>
                    <button className="flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl md:rounded-2xl font-semibold text-sm md:text-base transition-all active:scale-95">
                      <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" /> Play Now
                    </button>
                  </Link>
                  <button className="flex items-center gap-2 px-3.5 py-2.5 md:px-5 md:py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl md:rounded-2xl font-semibold text-xs md:text-base backdrop-blur-sm transition-all">
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Wishlist
                  </button>
                  <div className="flex items-center gap-1 ml-1 md:ml-2 text-yellow-400 font-semibold text-sm md:text-base">
                    <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400" /> {Number(hero.rating).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="absolute bottom-4 md:bottom-8 right-4 md:right-10 flex gap-1.5 md:gap-2">
                {heroGames.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setHeroIndex(i); }}
                    className={cn("h-1.5 rounded-full transition-all duration-300", i === heroIndex ? "w-8 bg-white" : "w-1.5 bg-white/40")}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Live Events */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Events
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LIVE_EVENTS.map(ev => (
              <div key={ev.id} className={cn("rounded-2xl border p-5 cursor-pointer hover:scale-[1.02] transition-all", ev.bg)}>
                <span className={cn("text-xs font-bold tracking-widest uppercase", ev.color)}>{ev.label}</span>
                <p className="text-white font-bold text-lg mt-1">{ev.title}</p>
                <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />{ev.subtitle}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial Stories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">Stories</h2>
            <button className="text-sm text-primary flex items-center gap-1 hover:underline">See all <ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EDITORIAL_STORIES.map(story => (
              <div key={story.id} className="group rounded-2xl overflow-hidden bg-card border border-card-border hover:border-primary/30 transition-all cursor-pointer hover:scale-[1.01]">
                <div className={cn("h-36 bg-gradient-to-br flex items-center justify-center", story.gradient)}>
                  <div className="text-white/40 scale-[3] opacity-30">{story.icon}</div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold tracking-widest uppercase text-primary">{story.category}</span>
                  <h3 className="text-white font-bold text-lg mt-1 leading-snug">{story.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{story.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Most Played Right Now */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" /> Most Played Right Now
            </h2>
            <Link href="/games">
              <button className="text-sm text-primary flex items-center gap-1 hover:underline">See all <ChevronRight className="w-4 h-4" /></button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {games.slice(0, 8).map(game => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <div className="flex-shrink-0 w-52 group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden h-36 mb-3">
                    <img src={game.coverImage} alt={game.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                      <span className={cn("text-xs font-bold uppercase px-2 py-0.5 rounded-md",
                        game.subscriptionTier === "free" ? "bg-gray-500/80" :
                        game.subscriptionTier === "basic" ? "bg-blue-500/80" :
                        game.subscriptionTier === "premium" ? "bg-purple-500/80" : "bg-yellow-500/80"
                      )}>{game.subscriptionTier}</span>
                      <span className="text-xs text-yellow-400 flex items-center gap-0.5 font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400" />{Number(game.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{game.title}</p>
                  <p className="text-xs text-muted-foreground">{game.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Subscription Upsell */}
        <section>
          <div className="rounded-2xl md:rounded-3xl overflow-hidden relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10" />
            <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary">GAMING+ SUBSCRIPTION</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mt-2">Unlock 1000+ Games</h3>
                <p className="text-white/60 text-sm md:text-base mt-2 max-w-md">Get unlimited access to our full game library, 4K streaming, no ads, cloud saves, and exclusive VIP rewards.</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-bold text-white">$4.99</p>
                    <p className="text-xs text-white/50">Basic/mo</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">$9.99</p>
                    <p className="text-xs text-white/50">Premium/mo</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">$19.99</p>
                    <p className="text-xs text-white/50">VIP/mo</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/store/subscriptions">
                  <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-base transition-all whitespace-nowrap">
                    Get Gaming+
                  </button>
                </Link>
                <Link href="/store/subscriptions">
                  <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-sm transition-all whitespace-nowrap text-center">
                    Compare Plans
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* New Releases */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> New Releases
            </h2>
            <Link href="/games?sort=newest">
              <button className="text-sm text-primary flex items-center gap-1 hover:underline">See all <ChevronRight className="w-4 h-4" /></button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newReleases.map(game => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden aspect-square mb-3">
                    <img src={game.coverImage} alt={game.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{game.title}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground">{game.category}</p>
                    <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-yellow-400" />{Number(game.rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" /> Recommended For You
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.slice(4, 8).map(game => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <div className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer hover:scale-[1.02]">
                  <div className="relative h-40">
                    <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-sm text-foreground truncate">{game.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{game.developer || "Unknown Developer"}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-yellow-400 flex items-center gap-0.5 font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400" />{Number(game.rating).toFixed(1)}
                      </span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                        game.subscriptionTier === "free" ? "bg-gray-500/20 text-gray-300" :
                        game.subscriptionTier === "basic" ? "bg-blue-500/20 text-blue-300" :
                        game.subscriptionTier === "premium" ? "bg-purple-500/20 text-purple-300" : "bg-yellow-500/20 text-yellow-300"
                      )}>{game.subscriptionTier}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
