import { useState } from "react";
import { ShoppingBag, Package, Palette, Zap, Gift, Crown, Check, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketplaceItems, useUserItems, usePurchaseItem, DEMO_USER_ID } from "@/hooks/use-api";

const CATEGORIES = [
  { id: "__all__", label: "All Items", icon: Package },
  { id: "skin", label: "Skins", icon: Palette },
  { id: "currency", label: "Currency", icon: Zap },
  { id: "bundle", label: "Bundles", icon: Gift },
  { id: "cosmetic", label: "Cosmetics", icon: Crown },
];

const RARITY_COLORS: Record<string, { text: string; bg: string; border: string; label: string }> = {
  common: { text: "text-gray-300", bg: "bg-gray-500/20", border: "border-gray-500/30", label: "Common" },
  rare: { text: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/30", label: "Rare" },
  epic: { text: "text-purple-300", bg: "bg-purple-500/20", border: "border-purple-500/30", label: "Epic" },
  legendary: { text: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Legendary" },
};

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("__all__");
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading: itemsLoading } = useMarketplaceItems();
  const { data: owned = [] } = useUserItems(DEMO_USER_ID);
  const purchaseItem = usePurchaseItem();

  const ownedItemIds = new Set(owned.map(o => o.itemId));

  const filtered = items.filter(item => {
    if (activeCategory !== "__all__" && item.type !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const currencyItems = filtered.filter(i => i.type === "currency");
  const nonCurrencyItems = filtered.filter(i => i.type !== "currency");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" /> Marketplace
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Skins, bundles, currency & exclusive items</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-yellow-300">2,500 GOS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto space-y-10">

        {/* Filter Bar */}
        <section>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      activeCategory === cat.id
                        ? "bg-primary text-white"
                        : "bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-9 pr-4 py-2 bg-card border border-card-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-64"
              />
            </div>
          </div>
        </section>

        {itemsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">{filtered.length} Items</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {nonCurrencyItems.map(item => {
                  const rarity = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
                  const isOwned = ownedItemIds.has(item.id);
                  return (
                    <div key={item.id} className={cn("group bg-card border rounded-2xl overflow-hidden hover:scale-[1.03] transition-all cursor-pointer", rarity.border, "hover:border-primary/40")}>
                      <div className="relative aspect-square">
                        <img src={item.imageUrl ?? "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80"} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className={cn("absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full", rarity.bg, rarity.text)}>
                          {rarity.label}
                        </div>
                        {isOwned && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1">
                              <Check className="w-6 h-6 text-green-400" />
                              <span className="text-xs text-green-400 font-bold">Owned</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-xs text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description.slice(0, 50)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-sm text-foreground">${item.price}</span>
                          {!isOwned ? (
                            <button
                              onClick={() => purchaseItem.mutate({ userId: DEMO_USER_ID, itemId: item.id })}
                              disabled={purchaseItem.isPending}
                              className="text-xs px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                              {purchaseItem.isPending ? "..." : "Buy"}
                            </button>
                          ) : (
                            <span className="text-xs text-green-400 flex items-center gap-0.5 font-semibold">
                              <Check className="w-3 h-3" /> Owned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Currency Packs */}
            {currencyItems.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> GOS Coins
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currencyItems.map((pack, i) => (
                    <div key={pack.id} className={cn(
                      "relative rounded-2xl p-5 border cursor-pointer hover:scale-[1.02] transition-all text-center",
                      i === currencyItems.length - 1 ? "bg-primary/10 border-primary/40" : "bg-card border-card-border"
                    )}>
                      {i === currencyItems.length - 1 && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-primary text-white px-3 py-0.5 rounded-full font-bold">Best Value</span>}
                      <Zap className={cn("w-8 h-8 mx-auto mb-2", i === currencyItems.length - 1 ? "text-primary" : "text-yellow-400")} />
                      <p className="text-2xl font-bold text-foreground">{pack.name}</p>
                      <p className="text-xs text-muted-foreground">{pack.description}</p>
                      <button
                        onClick={() => purchaseItem.mutate({ userId: DEMO_USER_ID, itemId: pack.id })}
                        disabled={purchaseItem.isPending}
                        className={cn(
                          "mt-4 w-full py-2 rounded-xl font-bold text-sm transition-colors",
                          i === currencyItems.length - 1 ? "bg-primary text-white hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        ${pack.price}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </div>
  );
}
