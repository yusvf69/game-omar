import { useState } from "react";
import { useListGames, useListCategories } from "@workspace/api-client-react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import GameCard from "@/components/GameCard";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "top_rated" },
  { label: "Trending", value: "trending" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const TIER_OPTIONS = [
  { label: "All Tiers", value: "" },
  { label: "Free", value: "free" },
  { label: "Basic", value: "basic" },
  { label: "Premium", value: "premium" },
  { label: "VIP", value: "vip" },
];

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("__all__");
  const [tier, setTier] = useState("__all__");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: categories = [] } = useListCategories();
  const { data: games = [], isLoading } = useListGames({
    search: debouncedSearch || undefined,
    sort: (sort as "newest" | "top_rated" | "trending" | "price_asc" | "price_desc") || undefined,
    category: category !== "__all__" ? category : undefined,
    subscription_tier: tier !== "__all__" ? tier : undefined,
    limit: 48,
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const hasFilters = category !== "__all__" || tier !== "__all__" || !!debouncedSearch;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Game Library</h1>
          <p className="text-muted-foreground text-sm mt-1">{games.length} games available</p>
        </div>
        {hasFilters && (
          <button
            data-testid="button-clear-filters"
            onClick={() => { setSearch(""); setDebouncedSearch(""); setCategory("__all__"); setTier("__all__"); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            placeholder="Search games..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger data-testid="select-sort" className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-testid="select-category" className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.name} value={cat.name}>{cat.name} ({cat.count})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger data-testid="select-tier" className="w-[140px] bg-card border-border">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[16/10] rounded-xl" />)}
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <SlidersHorizontal className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No games match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map(game => <GameCard key={game.id} game={game} />)}
        </div>
      )}
    </div>
  );
}
