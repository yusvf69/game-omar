import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Shield,
  Users,
  Trophy,
  Plus,
  LogOut,
  Crown,
  Star,
  Swords,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Guild {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: number;
  memberCount: number;
  xp: number;
  level: number;
}

interface GuildDetail extends Guild {
  members: Array<{
    id: number;
    userId: number;
    role: string;
    username: string;
    avatarUrl: string | null;
    level: number;
  }>;
}

const ROLE_BADGES: Record<string, string> = {
  owner: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  co_leader: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  member: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  co_leader: Star,
  member: Users,
};

export default function GuildsPage() {
  const { user } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selected, setSelected] = useState<GuildDetail | null>(null);
  const [myGuildIds, setMyGuildIds] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [g, my] = await Promise.all([
      fetch("/api/guilds").then(r => r.json()),
      user ? fetch(`/api/users/${user.id}/guilds`).then(r => r.json()) : Promise.resolve([]),
    ]);
    setGuilds(g);
    setMyGuildIds(my.map((x: any) => x.id));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    if (selected) {
      fetch(`/api/guilds/${selected.id}`).then(r => r.json()).then(setSelected);
    }
  }, [guilds]);

  async function joinGuild(guildId: number) {
    await fetch(`/api/guilds/${guildId}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user!.id }),
    });
    load();
  }

  async function leaveGuild(guildId: number) {
    await fetch(`/api/guilds/${guildId}/leave`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user!.id }),
    });
    setSelected(null);
    load();
  }

  async function createGuild() {
    await fetch("/api/guilds", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tag, description, ownerId: user!.id }),
    });
    setShowCreate(false);
    setName(""); setTag(""); setDescription("");
    load();
  }

  function selectGuild(id: number) {
    fetch(`/api/guilds/${id}`).then(r => r.json()).then(setSelected);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="flex gap-6 max-w-5xl mx-auto">
      {/* Guild list */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" /> Guilds
          </h1>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showCreate && (
          <Card className="bg-card/80 border-white/10 p-4 space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Guild name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag (e.g. SW)" maxLength={5} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <Button size="sm" onClick={createGuild} className="w-full">Create Guild</Button>
          </Card>
        )}

        <div className="space-y-2">
          {guilds.map(g => {
            const isMember = myGuildIds.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => selectGuild(g.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                  selected?.id === g.id ? "bg-primary/10 border-primary/30" : "bg-card/40 border-white/5 hover:bg-card/60"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{g.name}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{g.tag}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Users className="w-3 h-3 inline mr-0.5" />{g.memberCount} · Level {g.level}
                  </p>
                </div>
                {isMember && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guild detail */}
      <div className="flex-1">
        {selected ? (
          <Card className="bg-card/60 border-white/10 p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <Badge variant="outline" className="text-xs">{selected.tag}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description || "No description"}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{selected.xp.toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground">Level {selected.level}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" /> {selected.memberCount} members
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="w-4 h-4" /> Level {selected.level}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Members</p>
              {selected.members.map(m => {
                const RoleIcon = ROLE_ICONS[m.role] || Users;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden">
                      <img src={m.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.username}`} alt="" className="w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{m.username}</p>
                      <p className="text-xs text-muted-foreground">Level {m.level}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize", ROLE_BADGES[m.role] || ROLE_BADGES.member)}>
                      <RoleIcon className="w-3 h-3 inline mr-0.5" />
                      {m.role === "co_leader" ? "Co-Leader" : m.role}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              {myGuildIds.includes(selected.id) ? (
                <Button variant="destructive" size="sm" onClick={() => leaveGuild(selected.id)} className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                  <LogOut className="w-4 h-4 mr-1" /> Leave Guild
                </Button>
              ) : (
                <Button size="sm" onClick={() => joinGuild(selected.id)}>
                  <Plus className="w-4 h-4 mr-1" /> Join Guild
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
            <div>
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a guild to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
