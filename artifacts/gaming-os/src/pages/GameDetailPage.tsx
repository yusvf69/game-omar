import { useParams, Link } from "wouter";
import { useGetGame, useListGameReviews, useAddToWishlist, useCreateReview, useListGames, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { Star, Download, Heart, ArrowLeft, Trophy, Calendar, Play, Share2, ChevronLeft, ChevronRight, Users, Zap, Shield, Wifi, Monitor, Clock, Tag, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const DEMO_USER_ID = 8;

const TIER_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  free: { text: "text-gray-300", bg: "bg-gray-500/20", border: "border-gray-500/40" },
  basic: { text: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/40" },
  premium: { text: "text-purple-300", bg: "bg-purple-500/20", border: "border-purple-500/40" },
  vip: { text: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/40" },
};

const FEATURE_ICONS = [
  { icon: Users, label: "Multiplayer" },
  { icon: Wifi, label: "Online" },
  { icon: Trophy, label: "Achievements" },
  { icon: Shield, label: "Anti-cheat" },
  { icon: Monitor, label: "4K Support" },
  { icon: Zap, label: "60 FPS" },
];

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(r => (
        <button
          key={r}
          data-testid={`star-${r}`}
          onClick={() => onChange(r)}
          onMouseEnter={() => setHover(r)}
          onMouseLeave={() => setHover(0)}
        >
          <Star className={cn("w-6 h-6 transition-colors", r <= (hover || value) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: { rating: number }[] }) {
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: total ? (reviews.filter(r => r.rating === star).length / total) * 100 : 0,
  }));
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 mb-6">
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-5xl font-bold text-foreground">{avg.toFixed(1)}</p>
          <div className="flex gap-0.5 justify-center mt-1.5">
            {[1,2,3,4,5].map(i => <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{total} ratings</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {counts.map(({ star, pct, count }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3">{star}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const gameId = Number(params.id);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [screenIdx, setScreenIdx] = useState(0);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: game, isLoading } = useGetGame(gameId, { query: { enabled: !!gameId, queryKey: ["game", gameId] } });
  const { data: reviews = [] } = useListGameReviews(gameId, { query: { enabled: !!gameId, queryKey: ["reviews", gameId] } });
  const { data: related = [] } = useListGames({ category: game?.category, limit: 6 });
  const addToWishlist = useAddToWishlist();
  const createReview = useCreateReview();

  const handleWishlist = () => {
    addToWishlist.mutate({ id: DEMO_USER_ID, data: { gameId } }, {
      onSuccess: () => {
        toast({ title: "Added to wishlist ❤️" });
        qc.invalidateQueries({ queryKey: getGetWishlistQueryKey(DEMO_USER_ID) });
      },
    });
  };

  const handleReview = () => {
    if (!reviewContent.trim()) return;
    createReview.mutate({ id: gameId, data: { userId: DEMO_USER_ID, rating: reviewRating, content: reviewContent } }, {
      onSuccess: () => {
        toast({ title: "Review submitted! 🎉" });
        setReviewContent("");
        setReviewRating(5);
        qc.invalidateQueries({ queryKey: ["reviews", gameId] });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-[420px] w-full rounded-3xl" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-8 text-center py-32">
        <p className="text-muted-foreground text-lg">Game not found.</p>
        <Link href="/games" className="text-primary mt-3 inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to games
        </Link>
      </div>
    );
  }

  const tier = TIER_STYLES[game.subscriptionTier] ?? TIER_STYLES.free;
  const relatedGames = related.filter(g => g.id !== game.id).slice(0, 5);
  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : [game.coverImage, game.coverImage, game.coverImage];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-[250px] md:h-[420px] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/1400/420`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="absolute top-6 left-6 flex items-center gap-3">
          <Link href="/games" data-testid="link-back">
            <button className="flex items-center gap-2 text-white/80 hover:text-white bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Games
            </button>
          </Link>
        </div>

        <div className="absolute top-6 right-6">
          <button className="flex items-center gap-2 text-white/80 hover:text-white bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-sm transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 -mt-24 relative z-10 pb-16 max-w-screen-xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full border", tier.text, tier.bg, tier.border)}>
                {game.subscriptionTier.toUpperCase()} PLAN
              </span>
              <span className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full">{game.category}</span>
              {game.isTrending && (
                <span className="text-xs bg-orange-500/20 border border-orange-500/40 text-orange-300 px-3 py-1.5 rounded-full flex items-center gap-1">
                  🔥 Trending
                </span>
              )}
              {game.status === "coming_soon" && (
                <span className="text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-full">Coming Soon</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3 leading-tight">{game.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-5">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(Number(game.rating)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />)}
                </div>
                <span data-testid="text-rating" className="text-foreground font-bold">{Number(game.rating).toFixed(1)}</span>
                <span>({game.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>{(game.downloads / 1000).toFixed(0)}K downloads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{game.releaseDate}</span>
              </div>
              {game.developer && (
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium">{game.developer}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-base mb-6">{game.description}</p>

            {/* Tags */}
            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {game.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-lg hover:text-foreground cursor-pointer transition-colors">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Features Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4">Features</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {FEATURE_ICONS.map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-card border border-card-border rounded-2xl p-4 text-center hover:border-primary/30 transition-colors">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshots Carousel */}
            {screenshots.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Screenshots</h2>
                <div className="relative rounded-2xl overflow-hidden h-64">
                  <img
                    src={screenshots[screenIdx]}
                    alt={`Screenshot ${screenIdx + 1}`}
                    className="w-full h-full object-cover transition-all duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id * 10 + screenIdx}/800/400`; }}
                  />
                  {screenshots.length > 1 && (
                    <>
                      <button
                        onClick={() => setScreenIdx(i => (i - 1 + screenshots.length) % screenshots.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setScreenIdx(i => (i + 1) % screenshots.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {screenshots.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setScreenIdx(i)}
                        className={cn("h-1.5 rounded-full transition-all", i === screenIdx ? "w-5 bg-white" : "w-1.5 bg-white/40")}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {screenshots.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setScreenIdx(i)}
                      className={cn("flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all", i === screenIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}
                    >
                      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id * 10 + i}/160/112`; }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* What's New */}
            <div className="bg-card border border-card-border rounded-2xl p-5 mb-8">
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" /> What's New
              </h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• New Season 2 content with 3 new maps and 12 new weapons</p>
                <p>• Performance improvements — 40% faster load times</p>
                <p>• New ranked mode with reward track</p>
                <p>• Bug fixes and stability improvements</p>
              </div>
            </div>

            {/* Requirements */}
            {game.requirements && (
              <div className="bg-card border border-card-border rounded-2xl p-5 mb-8">
                <h2 className="font-bold text-foreground flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-primary" /> System Requirements
                </h2>
                <p className="text-sm text-muted-foreground">{game.requirements}</p>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Player Reviews</h2>
                <span className="text-sm text-muted-foreground">{reviews.length} total</span>
              </div>

              {/* Rating Breakdown */}
              {reviews.length > 0 && <RatingBreakdown reviews={reviews} />}

              {/* Write review */}
              <div className="bg-card border border-card-border rounded-2xl p-5 mb-5">
                <p className="font-semibold text-foreground mb-4">Write a Review</p>
                <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                <Textarea
                  data-testid="input-review"
                  placeholder="Share your experience with other players..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="mt-3 mb-4 bg-background border-border resize-none h-24 rounded-xl"
                />
                <Button
                  data-testid="button-submit-review"
                  onClick={handleReview}
                  disabled={!reviewContent.trim() || createReview.isPending}
                  className="rounded-xl"
                >
                  Submit Review
                </Button>
              </div>

              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} data-testid={`review-${review.id}`} className="bg-card border border-card-border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {review.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{review.username}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:w-80 space-y-4 xl:mt-20 flex-shrink-0">
            {/* Purchase Card */}
            <div className="bg-card border border-card-border rounded-2xl p-6 sticky top-24">
              <div className="mb-5">
                <p className="text-4xl font-bold text-foreground mb-1">
                  {Number(game.price) === 0 ? "Free" : `$${Number(game.price).toFixed(2)}`}
                </p>
                <p className="text-xs text-muted-foreground">Included with {game.subscriptionTier}+ plan</p>
              </div>

              <div className="space-y-3">
                <Button data-testid="button-play" className="w-full h-12 text-base rounded-xl glow-primary flex items-center gap-2">
                  <Play className="w-4 h-4 fill-white" /> Play Now
                </Button>
                <Button
                  data-testid="button-wishlist"
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  onClick={handleWishlist}
                  disabled={addToWishlist.isPending}
                >
                  <Heart className="w-4 h-4 mr-2" /> Add to Wishlist
                </Button>
              </div>

              <div className="mt-5 pt-5 border-t border-border/50 space-y-2.5 text-sm">
                {[
                  { label: "Developer", value: game.developer || "Unknown" },
                  { label: "Publisher", value: game.publisher || game.developer || "Unknown" },
                  { label: "Category", value: game.category },
                  { label: "Release Date", value: game.releaseDate },
                  { label: "Downloads", value: `${(game.downloads / 1000).toFixed(0)}K` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground">More {game.category} Games</h2>
              <Link href={`/games?category=${game.category}`}>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  See all <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedGames.map(g => (
                <Link key={g.id} href={`/games/${g.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative rounded-2xl overflow-hidden aspect-square mb-3">
                      <img src={g.coverImage} alt={g.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${g.id}/400/400`; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-semibold text-sm text-foreground truncate">{g.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground">{g.developer || "Unknown"}</p>
                      <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400" />{Number(g.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
