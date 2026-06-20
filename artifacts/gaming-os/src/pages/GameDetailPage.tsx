import { useParams } from "wouter";
import { useGetGame, useListGameReviews, useAddToWishlist, useCreateReview, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { Star, Download, Heart, ArrowLeft, Trophy, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const DEMO_USER_ID = 1;

const tierColors: Record<string, string> = {
  free: "text-gray-400 bg-gray-800",
  basic: "text-blue-400 bg-blue-900/40",
  premium: "text-violet-400 bg-violet-900/40",
  vip: "text-amber-400 bg-amber-900/40",
};

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const gameId = Number(params.id);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: game, isLoading } = useGetGame(gameId, { query: { enabled: !!gameId, queryKey: ["game", gameId] } });
  const { data: reviews = [] } = useListGameReviews(gameId, { query: { enabled: !!gameId, queryKey: ["reviews", gameId] } });
  const addToWishlist = useAddToWishlist();
  const createReview = useCreateReview();

  const handleWishlist = () => {
    addToWishlist.mutate({ id: DEMO_USER_ID, data: { gameId } }, {
      onSuccess: () => {
        toast({ title: "Added to wishlist" });
        qc.invalidateQueries({ queryKey: getGetWishlistQueryKey(DEMO_USER_ID) });
      },
    });
  };

  const handleReview = () => {
    if (!reviewContent.trim()) return;
    createReview.mutate({ id: gameId, data: { userId: DEMO_USER_ID, rating: reviewRating, content: reviewContent } }, {
      onSuccess: () => {
        toast({ title: "Review submitted" });
        setReviewContent("");
        qc.invalidateQueries({ queryKey: ["reviews", gameId] });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-[320px] w-full rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-8 text-center py-24">
        <p className="text-muted-foreground">Game not found.</p>
        <Link href="/games" className="text-primary mt-2 inline-block">Back to games</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[320px] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/1200/320`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-6 left-6">
          <Link href="/games" data-testid="link-back" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/40 rounded-lg px-3 py-2 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="px-8 -mt-16 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", tierColors[game.subscriptionTier])}>
                {game.subscriptionTier.toUpperCase()}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{game.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground font-display mb-3">{game.title}</h1>
            <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span data-testid="text-rating" className="text-foreground font-semibold">{Number(game.rating).toFixed(1)}</span>
                <span>({game.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{(game.downloads / 1000).toFixed(0)}K downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{game.releaseDate}</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{game.description}</p>

            {game.developer && (
              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Developer</p>
                <p className="text-sm font-medium">{game.developer}</p>
              </div>
            )}

            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {game.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-lg">{tag}</span>
                ))}
              </div>
            )}

            {/* Reviews */}
            <div className="mt-8">
              <h2 className="text-lg font-bold font-display mb-4">Player Reviews</h2>

              {/* Write review */}
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <p className="text-sm font-medium mb-3">Write a Review</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} data-testid={`star-${r}`} onClick={() => setReviewRating(r)}>
                      <Star className={cn("w-5 h-5", r <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
                <Textarea
                  data-testid="input-review"
                  placeholder="Share your experience..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="mb-3 bg-background border-border resize-none h-24"
                />
                <Button
                  data-testid="button-submit-review"
                  onClick={handleReview}
                  disabled={!reviewContent.trim() || createReview.isPending}
                  size="sm"
                >
                  Submit Review
                </Button>
              </div>

              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} data-testid={`review-${review.id}`} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {review.username[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{review.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-4 mt-16">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4">
                <p className="text-3xl font-bold text-foreground">
                  {Number(game.price) === 0 ? "Free" : `$${Number(game.price).toFixed(2)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Included in {game.subscriptionTier} plan and above
                </p>
              </div>
              <div className="space-y-2">
                <Button data-testid="button-play" className="w-full glow-primary">
                  Play Now
                </Button>
                <Button
                  data-testid="button-wishlist"
                  variant="outline"
                  className="w-full"
                  onClick={handleWishlist}
                  disabled={addToWishlist.isPending}
                >
                  <Heart className="w-4 h-4 mr-2" /> Add to Wishlist
                </Button>
              </div>
            </div>

            {game.requirements && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Requirements</p>
                <p className="text-sm text-muted-foreground">{game.requirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
