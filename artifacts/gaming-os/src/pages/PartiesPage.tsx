import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Gamepad2,
  Plus,
  LogOut,
  CheckCircle2,
  Circle,
  Crown,
  UserX,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Party {
  id: number;
  name: string;
  gameName: string | null;
  leaderId: number;
  maxMembers: number;
  isLocked: boolean;
  members: Array<{
    id: number;
    userId: number;
    isReady: boolean;
    username: string;
    avatarUrl: string | null;
    level: number;
  }>;
  memberCount: number;
}

export default function PartiesPage() {
  const { user } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [myParty, setMyParty] = useState<Party | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, my] = await Promise.all([
        fetch("/api/parties").then(r => r.json()),
        user ? fetch(`/api/users/${user.id}/party`).then(r => r.json()) : Promise.resolve(null),
      ]);
      setParties(p);
      setMyParty(my);
    } catch {} finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  async function createParty() {
    await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gameName: gameName || undefined, leaderId: user!.id }),
    });
    setShowCreate(false);
    setName(""); setGameName("");
    load();
  }

  async function joinParty(id: number) {
    await fetch(`/api/parties/${id}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user!.id }),
    });
    load();
  }

  async function leaveParty(id: number) {
    await fetch(`/api/parties/${id}/leave`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user!.id }),
    });
    setMyParty(null);
    load();
  }

  async function toggleReady(id: number) {
    await fetch(`/api/parties/${id}/toggle-ready`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user!.id }),
    });
    load();
  }

  async function kickMember(partyId: number, targetUserId: number) {
    await fetch(`/api/parties/${partyId}/kick`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaderId: user!.id, targetUserId }),
    });
    load();
  }

  const activeParty = parties.find(p => p.members.some(m => m.userId === user?.id));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" /> Parties
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create or join a party to play together</p>
        </div>
        {!activeParty && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-4 h-4 mr-1" /> Create Party
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="bg-card/80 border-white/10 p-4 space-y-3 max-w-sm">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Party name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={gameName} onChange={e => setGameName(e.target.value)} placeholder="Game name (optional)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex gap-2">
            <Button size="sm" onClick={createParty} className="flex-1">Create</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {parties.map(party => {
          const isMember = party.members.some(m => m.userId === user?.id);
          const allReady = party.members.length > 1 && party.members.every(m => m.isReady);
          return (
            <Card key={party.id} className={cn("bg-card/50 border p-5", isMember ? "border-primary/30" : "border-white/10")}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{party.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {party.memberCount}/{party.maxMembers}
                    </Badge>
                    {party.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  {party.gameName && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5" /> {party.gameName}
                    </p>
                  )}
                </div>
                {allReady && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> All Ready
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {party.members.map(m => {
                  const isLeader = m.userId === party.leaderId;
                  const isMe = m.userId === user?.id;
                  return (
                    <div key={m.id} className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border",
                      m.isReady ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/10"
                    )}>
                      <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden">
                        <img src={m.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.username}`} alt="" className="w-full h-full" />
                      </div>
                      <span className="text-sm text-white">{m.username}</span>
                      {isLeader && <Crown className="w-3 h-3 text-yellow-500" />}
                      {m.isReady ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Circle className="w-3 h-3 text-muted-foreground" />}
                      {isLeader && isMe && !isMember && (
                        <button onClick={() => kickMember(party.id, m.userId)} className="text-muted-foreground hover:text-red-400">
                          <UserX className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                {isMember ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => toggleReady(party.id)}>
                      {party.members.find(m => m.userId === user?.id)?.isReady ? "Not Ready" : "Ready"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => leaveParty(party.id)} className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                      <LogOut className="w-3 h-3 mr-1" /> Leave
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => joinParty(party.id)} disabled={party.memberCount >= party.maxMembers}>
                    <Plus className="w-3 h-3 mr-1" /> Join
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {parties.length === 0 && (
          <Card className="bg-card/50 border-white/10 p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No parties yet</h3>
            <p className="text-muted-foreground text-sm">Create a party to play games with friends!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
