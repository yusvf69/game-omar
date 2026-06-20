import { Link } from "wouter";
import { Star, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListGamesQueryResult } from "@workspace/api-client-react";
type ListGamesResponseItem = ListGamesQueryResult[number];

const tierLabels: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  vip: "VIP",
};

const tierClasses: Record<string, string> = {
  free: "text-gray-400 border-gray-600",
  basic: "text-blue-400 border-blue-600",
  premium: "text-violet-400 border-violet-600",
  vip: "text-amber-400 border-amber-600",
};

interface GameCardProps {
  game: ListGamesResponseItem;
  className?: string;
}

export default function GameCard({ game, className }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.id}`}
      data-testid={`card-game-${game.id}`}
      className={cn(
        "block rounded-xl overflow-hidden border border-border bg-card cursor-pointer game-card-hover",
        className
      )}
    >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/400/250`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {game.isTrending && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Trending
            </span>
          )}
          {game.isFeatured && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-semibold text-sm truncate">{game.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs border px-1.5 py-0.5 rounded-full", tierClasses[game.subscriptionTier])}>
                {tierLabels[game.subscriptionTier]}
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                <span className="text-xs text-white">{Number(game.rating).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{game.category}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Download className="w-3 h-3" />
            <span className="text-xs">{(game.downloads / 1000).toFixed(0)}K</span>
          </div>
        </div>
    </Link>
  );
}
