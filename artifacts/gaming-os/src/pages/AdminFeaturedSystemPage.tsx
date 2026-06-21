import { useState } from "react";
import { Star, Crown, TrendingUp, Award, Calendar, Globe, Filter, Save, Clock, Users, Gamepad2, DollarSign, CheckCircle2, X, Edit3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionType = "today_hero" | "featured" | "trending" | "editors_choice";

const MOCK_GAMES = [
  { id: 1, title: "Cyber Arena", cover: "https://picsum.photos/seed/1/80/56", rating: 4.8, downloads: 12400, tier: "free" },
  { id: 2, title: "Dragon's Lair: Reborn", cover: "https://picsum.photos/seed/2/80/56", rating: 4.9, downloads: 8900, tier: "premium" },
  { id: 3, title: "Nebula Assault", cover: "https://picsum.photos/seed/3/80/56", rating: 4.7, downloads: 6700, tier: "basic" },
  { id: 4, title: "Speed Storm", cover: "https://picsum.photos/seed/4/80/56", rating: 4.5, downloads: 5200, tier: "free" },
  { id: 5, title: "Mech Warfare Elite", cover: "https://picsum.photos/seed/5/80/56", rating: 4.6, downloads: 4300, tier: "vip" },
  { id: 6, title: "Quantum Drift", cover: "https://picsum.photos/seed/6/80/56", rating: 4.3, downloads: 2100, tier: "premium" },
];

const COUNTRIES = ["Global", "US", "EU", "Asia", "Middle East", "Africa", "Latin America"];
const TIERS = ["Free", "Basic", "Premium", "VIP"];

export default function AdminFeaturedSystemPage() {
  const [activeSection, setActiveSection] = useState<SectionType>("today_hero");
  const [featuredGames, setFeaturedGames] = useState<Record<SectionType, number[]>>({
    today_hero: [1],
    featured: [2, 3],
    trending: [4, 5],
    editors_choice: [6],
  });

  const toggleGame = (gameId: number) => {
    setFeaturedGames(prev => {
      const current = [...prev[activeSection]];
      const idx = current.indexOf(gameId);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(gameId);
      return { ...prev, [activeSection]: current };
    });
  };

  const sections: { key: SectionType; label: string; icon: any; color: string; desc: string }[] = [
    { key: "today_hero", label: "Today Hero", icon: Star, color: "text-yellow-400", desc: "Main spotlight game on the Today tab" },
    { key: "featured", label: "Featured Games", icon: Crown, color: "text-violet-400", desc: "Games shown in the Featured row" },
    { key: "trending", label: "Trending Games", icon: TrendingUp, color: "text-emerald-400", desc: "Games in the Trending section" },
    { key: "editors_choice", label: "Editor's Choice", icon: Award, color: "text-amber-400", desc: "Curated picks by the editorial team" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Store Featured System</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage Today Hero, Featured, Trending & Editor's Choice sections</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors">
          <Save className="w-3.5 h-3.5" /> Publish Changes
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-0.5 w-fit flex-wrap">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              activeSection === s.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Game picker */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Select Games for {sections.find(s => s.key === activeSection)?.label}</h2>
            <span className="text-xs text-muted-foreground">{featuredGames[activeSection].length} selected</span>
          </div>
          <div className="space-y-1.5">
            {MOCK_GAMES.map(game => {
              const selected = featuredGames[activeSection].includes(game.id);
              return (
                <div key={game.id} onClick={() => toggleGame(game.id)}
                  className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selected ? "bg-primary/10 border-primary/40" : "bg-background border-border hover:border-primary/20")}>
                  <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                    selected ? "bg-primary border-primary" : "border-muted-foreground")}>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{game.title}</p>
                    <p className="text-xs text-muted-foreground">{(game.downloads / 1000).toFixed(0)}K downloads · {game.rating} rating</p>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold capitalize",
                    game.tier === "vip" ? "text-amber-400 bg-amber-500/20" :
                    game.tier === "premium" ? "text-violet-400 bg-violet-500/20" :
                    game.tier === "basic" ? "text-blue-400 bg-blue-500/20" : "text-gray-400 bg-gray-500/20")}>
                    {game.tier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduling & targeting */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Schedule
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                <input type="date" defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                <input type="date" defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Priority</label>
                <input type="range" min="0" max="100" defaultValue={50} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Targeting
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Target Country</label>
                <div className="flex flex-wrap gap-1.5">
                  {COUNTRIES.map(c => (
                    <button key={c} className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] text-foreground hover:border-primary/30">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Target Subscription Tier</label>
                <div className="flex gap-1.5">
                  {TIERS.map(t => (
                    <button key={t} className="px-3 py-1.5 bg-background border border-border rounded-lg text-[10px] text-foreground hover:border-primary/30">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Preview
            </h2>
            <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl p-4 text-center border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">{sections.find(s => s.key === activeSection)?.label}</p>
              <p className="text-sm font-bold text-foreground">
                {featuredGames[activeSection].length > 0
                  ? MOCK_GAMES.filter(g => featuredGames[activeSection].includes(g.id)).map(g => g.title).join(", ")
                  : "No games selected"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{featuredGames[activeSection].length} game(s) · Priority 50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
