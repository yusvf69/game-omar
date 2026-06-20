import { useState } from "react";
import { useListAchievements, useListCategories } from "@workspace/api-client-react";
import { Trophy, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

const rarityConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  common: { label: "Common", bg: "bg-gray-800", text: "text-gray-400", border: "border-gray-700" },
  rare: { label: "Rare", bg: "bg-blue-900/40", text: "text-blue-400", border: "border-blue-700/50" },
  epic: { label: "Epic", bg: "bg-violet-900/40", text: "text-violet-400", border: "border-violet-700/50" },
  legendary: { label: "Legendary", bg: "bg-orange-900/40", text: "text-orange-400", border: "border-orange-700/50" },
};

const RARITY_FILTERS = ["all", "legendary", "epic", "rare", "common"] as const;

export default function AchievementsPage() {
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const { data: achievements = [], isLoading } = useListAchievements();

  const filtered = achievements
    .filter(a => rarityFilter === "all" || a.rarity === rarityFilter)
    .sort((a, b) => (rarityOrder[a.rarity as keyof typeof rarityOrder] ?? 3) - (rarityOrder[b.rarity as keyof typeof rarityOrder] ?? 3));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Achievements</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} achievements found</p>
        </div>
      </div>

      {/* Rarity filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {RARITY_FILTERS.map(r => (
          <button
            key={r}
            data-testid={`filter-rarity-${r}`}
            onClick={() => setRarityFilter(r)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize border",
              r === rarityFilter
                ? r === "all"
                  ? "bg-primary text-white border-primary"
                  : cn(rarityConfig[r]?.bg, rarityConfig[r]?.text, rarityConfig[r]?.border)
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {r === "all" ? "All" : rarityConfig[r]?.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No achievements found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            const cfg = rarityConfig[a.rarity] ?? rarityConfig.common;
            return (
              <div
                key={a.id}
                data-testid={`achievement-card-${a.id}`}
                className={cn("bg-card border rounded-xl p-4 flex items-start gap-4 transition-all hover:scale-[1.01]", cfg.border)}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                  <Trophy className={cn("w-6 h-6", cfg.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{a.name}</p>
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full capitalize", cfg.bg, cfg.text)}>
                      {a.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
                  <div className="flex items-center justify-between">
                    {a.gameName && <span className="text-xs text-muted-foreground">{a.gameName}</span>}
                    <span className={cn("text-xs font-bold ml-auto", cfg.text)}>+{a.xpReward} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
