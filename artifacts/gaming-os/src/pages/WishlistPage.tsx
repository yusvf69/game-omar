import { useGetWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEMO_USER_ID = 1;

const tierColors: Record<string, string> = {
  free: "text-gray-400",
  basic: "text-blue-400",
  premium: "text-violet-400",
  vip: "text-amber-400",
};

export default function WishlistPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: games = [], isLoading } = useGetWishlist(DEMO_USER_ID, { query: { queryKey: getGetWishlistQueryKey(DEMO_USER_ID) } });
  const remove = useRemoveFromWishlist();

  const handleRemove = (gameId: number) => {
    remove.mutate({ userId: DEMO_USER_ID, gameId }, {
      onSuccess: () => {
        toast({ title: "Removed from wishlist" });
        qc.invalidateQueries({ queryKey: getGetWishlistQueryKey(DEMO_USER_ID) });
      },
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold font-display text-foreground">My Wishlist</h1>
        {games.length > 0 && (
          <span className="bg-primary/15 text-primary text-sm font-semibold px-2.5 py-0.5 rounded-full">{games.length}</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="w-14 h-14 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm mb-5">Save games you want to play later.</p>
          <Link href="/games" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Games <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map(game => (
            <div
              key={game.id}
              data-testid={`wishlist-game-${game.id}`}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/160/112`; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{game.title}</p>
                <p className="text-xs text-muted-foreground">{game.category}</p>
                <span className={cn("text-xs font-semibold", tierColors[game.subscriptionTier])}>
                  {game.subscriptionTier.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground">
                  {Number(game.price) === 0 ? "Free" : `$${Number(game.price).toFixed(2)}`}
                </span>
                <Link href={`/games/${game.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
                <Button
                  data-testid={`button-remove-${game.id}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(game.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
