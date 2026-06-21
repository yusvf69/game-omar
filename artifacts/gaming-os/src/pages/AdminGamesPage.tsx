import { useState } from "react";
import { useListGames, useDeleteGame, useCreateGame, useUpdateGame, getListGamesQueryKey } from "@workspace/api-client-react";
import { Pencil, Trash2, Plus, Star, Download, Check, X, Globe, Lock, Snowflake, Ban, Eye, EyeOff, AlertTriangle, Search, Filter, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ListGamesQueryResult } from "@workspace/api-client-react";
type ListGamesResponseItem = ListGamesQueryResult[number];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-900/30 text-green-400",
  coming_soon: "bg-blue-900/30 text-blue-400",
  removed: "bg-red-900/30 text-red-400",
  frozen: "bg-cyan-900/30 text-cyan-400",
  locked: "bg-orange-900/30 text-orange-400",
};

const REGIONS = ["Global", "US", "EU", "Asia", "Middle East", "Africa", "Latin America"];
const AGE_RATINGS = ["3+", "7+", "12+", "16+", "18+"];

export default function AdminGamesPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editGame, setEditGame] = useState<ListGamesResponseItem | null>(null);
  const [selectedGame, setSelectedGame] = useState<ListGamesResponseItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", price: "0", coverImage: "", subscriptionTier: "free", status: "active", developer: "", region: "Global", ageRating: "12+" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: games = [], isLoading } = useListGames({ limit: 100 });
  const deleteGame = useDeleteGame();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();

  const filtered = games.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.developer?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListGamesQueryKey() });

  const handleDelete = (id: number) => {
    deleteGame.mutate({ id }, {
      onSuccess: () => { toast({ title: "Game deleted" }); invalidate(); },
    });
  };

  const openAdd = () => {
    setForm({ title: "", description: "", category: "Action", price: "0", coverImage: "", subscriptionTier: "free", status: "active", developer: "", region: "Global", ageRating: "12+" });
    setEditGame(null);
    setAddOpen(true);
  };

  const openEdit = (g: ListGamesResponseItem) => {
    setForm({
      title: g.title, description: g.description, category: g.category,
      price: String(g.price), coverImage: g.coverImage, subscriptionTier: g.subscriptionTier,
      status: g.status, developer: g.developer ?? "", region: (g as any).region || "Global", ageRating: (g as any).ageRating || "12+",
    });
    setEditGame(g);
    setAddOpen(true);
  };

  const openDetail = (g: ListGamesResponseItem) => {
    setSelectedGame(g);
    setDetailOpen(true);
  };

  const quickAction = (id: number, action: string, label: string) => {
    updateGame.mutate({ id, data: { status: action } as any }, {
      onSuccess: () => { toast({ title: label }); invalidate(); },
    });
  };

  const handleSave = () => {
    const tier = form.subscriptionTier as "free" | "basic" | "premium" | "vip";
    const status = form.status as "active" | "coming_soon" | "removed" | "frozen" | "locked";
    const base = {
      title: form.title, description: form.description, category: form.category, price: Number(form.price),
      coverImage: form.coverImage, developer: form.developer, subscriptionTier: tier, status,
      region: form.region, ageRating: form.ageRating,
    };
    if (editGame) {
      updateGame.mutate({ id: editGame.id, data: base as any }, {
        onSuccess: () => { toast({ title: "Game updated" }); setAddOpen(false); invalidate(); },
      });
    } else {
      createGame.mutate({ data: { ...base, releaseDate: new Date().toISOString().split("T")[0] } as any }, {
        onSuccess: () => { toast({ title: "Game created" }); setAddOpen(false); invalidate(); },
      });
    }
  };

  const actionButtons = [
    { key: "frozen", label: "Freeze", icon: Snowflake, color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30" },
    { key: "locked", label: "Lock", icon: Lock, color: "text-orange-400 bg-orange-500/20 border-orange-500/30" },
    { key: "removed", label: "Remove", icon: Ban, color: "text-red-400 bg-red-500/20 border-red-500/30" },
    { key: "active", label: "Restore", icon: RefreshCw, color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Super Game Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{games.length} games · Region lock · Freeze · Age restrict</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-secondary rounded-xl p-0.5">
            {["", "active", "frozen", "locked", "removed"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn("px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors capitalize",
                  filterStatus === s ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                {s === "" ? "All" : s}
              </button>
            ))}
          </div>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" /> Add Game</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by title or developer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border rounded-xl" />
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 gap-2">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4"><Skeleton className="h-12 w-full rounded-lg" /></div>
        )) : filtered.map(game => (
          <div key={game.id} data-testid={`game-row-${game.id}`}
            className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => openDetail(game)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/80/56`; }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{game.title}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium capitalize", STATUS_COLORS[game.status] || STATUS_COLORS.active)}>
                    {game.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{game.category} · {game.developer || "Unknown"} · {(game as any).ageRating || "12+"} · {(game as any).region || "Global"}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span>{Number(game.rating).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                {actionButtons.map(b => {
                  if (game.status === b.key && b.key !== "active") return null;
                  if (b.key === "active" && game.status === "active") return null;
                  if (b.key !== "active" && game.status === b.key) return null;
                  return (
                    <button key={b.key} onClick={() => quickAction(game.id, b.key, `${b.label}d: ${game.title}`)}
                      className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-colors hover:opacity-80", b.color)}>
                      <b.icon className="w-3 h-3" /> {b.label}
                    </button>
                  );
                })}
                <Button size="sm" variant="ghost" onClick={() => openEdit(game)} data-testid={`button-edit-game-${game.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive"
                  data-testid={`button-delete-game-${game.id}`} onClick={() => handleDelete(game.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          {selectedGame && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">{selectedGame.title} <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium capitalize", STATUS_COLORS[selectedGame.status] || STATUS_COLORS.active)}>{selectedGame.status}</span></DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Row label="Category" value={selectedGame.category} />
                    <Row label="Developer" value={selectedGame.developer || "—"} />
                    <Row label="Tier" value={selectedGame.subscriptionTier} />
                    <Row label="Rating" value={String(Number(selectedGame.rating).toFixed(1))} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Row label="Downloads" value={(selectedGame.downloads || 0).toLocaleString()} />
                    <Row label="Price" value={`$${Number(selectedGame.price).toFixed(2)}`} />
                    <Row label="Age Restriction" value={(selectedGame as any).ageRating || "12+"} />
                    <Row label="Region" value={(selectedGame as any).region || "Global"} />
                  </div>
                </div>
                <div className="p-3 bg-background border border-border rounded-xl">
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selectedGame.description}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {actionButtons.map(b => (
                    <button key={b.key} onClick={() => { quickAction(selectedGame.id, b.key, `${b.label}d: ${selectedGame.title}`); setDetailOpen(false); }}
                      className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-colors hover:opacity-80", b.color)}>
                      <b.icon className="w-3 h-3" /> {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editGame ? "Edit Game" : "Add Game"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Title</Label>
              <Input data-testid="input-game-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-background border-border mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-background border-border mt-1 resize-none h-20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-background border-border mt-1" />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-background border-border mt-1" />
              </div>
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="bg-background border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subscription Tier</Label>
                <Select value={form.subscriptionTier} onValueChange={v => setForm(f => ({ ...f, subscriptionTier: v }))}>
                  <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Region Restriction</Label>
                <Select value={form.region} onValueChange={v => setForm(f => ({ ...f, region: v }))}>
                  <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age Rating</Label>
                <Select value={form.ageRating} onValueChange={v => setForm(f => ({ ...f, ageRating: v }))}>
                  <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AGE_RATINGS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button data-testid="button-save-game" onClick={handleSave} disabled={createGame.isPending || updateGame.isPending}>
              {editGame ? "Save Changes" : "Create Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
