import { useState } from "react";
import { useListGames, useDeleteGame, useCreateGame, useUpdateGame, getListGamesQueryKey } from "@workspace/api-client-react";
import { Pencil, Trash2, Plus, Star, Download, Check, X } from "lucide-react";
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
};

export default function AdminGamesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editGame, setEditGame] = useState<ListGamesResponseItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", price: "0", coverImage: "", subscriptionTier: "free", status: "active", developer: "" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: games = [], isLoading } = useListGames({ limit: 100 });
  const deleteGame = useDeleteGame();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();

  const filtered = games.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));

  const invalidate = () => qc.invalidateQueries({ queryKey: getListGamesQueryKey() });

  const handleDelete = (id: number) => {
    deleteGame.mutate({ id }, {
      onSuccess: () => { toast({ title: "Game deleted" }); invalidate(); },
    });
  };

  const openAdd = () => {
    setForm({ title: "", description: "", category: "Action", price: "0", coverImage: "", subscriptionTier: "free", status: "active", developer: "" });
    setEditGame(null);
    setAddOpen(true);
  };

  const openEdit = (g: ListGamesResponseItem) => {
    setForm({
      title: g.title, description: g.description, category: g.category,
      price: String(g.price), coverImage: g.coverImage, subscriptionTier: g.subscriptionTier,
      status: g.status, developer: g.developer ?? "",
    });
    setEditGame(g);
    setAddOpen(true);
  };

  const handleSave = () => {
    const tier = form.subscriptionTier as "free" | "basic" | "premium" | "vip";
    const status = form.status as "active" | "coming_soon" | "removed";
    const base = { title: form.title, description: form.description, category: form.category, price: Number(form.price), coverImage: form.coverImage, developer: form.developer, subscriptionTier: tier, status };
    if (editGame) {
      updateGame.mutate({ id: editGame.id, data: base }, {
        onSuccess: () => { toast({ title: "Game updated" }); setAddOpen(false); invalidate(); },
      });
    } else {
      createGame.mutate({ data: { ...base, releaseDate: new Date().toISOString().split("T")[0] } }, {
        onSuccess: () => { toast({ title: "Game created" }); setAddOpen(false); invalidate(); },
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Game Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{games.length} games in catalog</p>
        </div>
        <Button data-testid="button-add-game" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Game
        </Button>
      </div>

      <div className="mb-4">
        <Input
          data-testid="input-game-search"
          placeholder="Search games..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm bg-card border-border"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Game</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tier</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Rating</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
              : filtered.map(game => (
                <tr key={game.id} data-testid={`game-row-${game.id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded overflow-hidden flex-shrink-0">
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/80/56`; }} />
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[180px]">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{game.category}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-semibold capitalize",
                      game.subscriptionTier === "vip" ? "text-amber-400" :
                      game.subscriptionTier === "premium" ? "text-violet-400" :
                      game.subscriptionTier === "basic" ? "text-blue-400" : "text-gray-400"
                    )}>{game.subscriptionTier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{Number(game.rating).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[game.status])}>
                      {game.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(game)} data-testid={`button-edit-game-${game.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive"
                        data-testid={`button-delete-game-${game.id}`} onClick={() => handleDelete(game.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editGame ? "Edit Game" : "Add Game"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
                    <SelectItem value="removed">Removed</SelectItem>
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
