import { useState, useRef, useEffect } from "react";
import { Headphones, Mic, MicOff, Volume2, Plus, Users, Loader2, LogIn, LogOut, Gamepad2, Lock, Radio, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRooms, useCreateVoiceRoom, useJoinVoiceRoom, useLeaveVoiceRoom, useToggleMute, getUserId } from "@/hooks/use-api";
import { useVoiceChat } from "@/hooks/use-voice-chat";

export default function VoicePage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomGame, setNewRoomGame] = useState("");
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [webrtcJoined, setWebrtcJoined] = useState(false);
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map());

  const userId = getUserId();
  const { data: rooms = [], isLoading, refetch: refetchRooms } = useVoiceRooms();
  const createRoom = useCreateVoiceRoom();
  const joinRoomApi = useJoinVoiceRoom();
  const leaveRoomApi = useLeaveVoiceRoom();
  const toggleMuteApi = useToggleMute();

  const currentRoom = rooms.find(r => r.members.some(m => m.userId === userId));

  const { peers, isMuted, isConnected, toggleMute, leave } = useVoiceChat({
    roomId: activeRoomId,
    userId,
    username: `User ${userId}`,
  });

  useEffect(() => {
    if (currentRoom && !webrtcJoined) {
      setActiveRoomId(currentRoom.id);
      setWebrtcJoined(true);
    } else if (!currentRoom) {
      setActiveRoomId(null);
      setWebrtcJoined(false);
    }
  }, [currentRoom?.id]);

  useEffect(() => {
    for (const peer of peers) {
      if (peer.stream && !audioRefs.current.has(peer.userId)) {
        const audio = new Audio();
        audio.srcObject = peer.stream;
        audio.autoplay = true;
        audioRefs.current.set(peer.userId, audio);
      }
    }
    return () => {
      audioRefs.current.forEach((a) => a.pause());
      audioRefs.current.clear();
    };
  }, [peers]);

  function handleCreate() {
    if (!newRoomName.trim()) return;
    createRoom.mutate({ name: newRoomName, gameName: newRoomGame || undefined, hostId: userId });
    setNewRoomName(""); setNewRoomGame(""); setShowCreate(false);
  }

  async function handleJoin(roomId: number) {
    await joinRoomApi.mutateAsync({ roomId, userId });
    setActiveRoomId(roomId);
    setWebrtcJoined(true);
    refetchRooms();
  }

  async function handleLeave(roomId: number) {
    leave();
    await leaveRoomApi.mutateAsync({ roomId, userId });
    setWebrtcJoined(false);
    setActiveRoomId(null);
    refetchRooms();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Headphones className="w-8 h-8 text-primary" /> Voice
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Real-time voice chat with WebRTC</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-all">
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>
        {isConnected && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-green-400"><Wifi className="w-3 h-3" /> WebRTC Connected</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{peers.length} peer{peers.length !== 1 ? "s" : ""} connected</span>
          </div>
        )}
      </div>

      <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
        {showCreate && (
          <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 max-w-lg">
            <h3 className="font-bold text-foreground mb-4">Create Voice Room</h3>
            <div className="space-y-3">
              <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="Room name..." className="w-full bg-secondary border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              <input value={newRoomGame} onChange={e => setNewRoomGame(e.target.value)} placeholder="Game (optional)" className="w-full bg-secondary border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
              <button onClick={handleCreate} disabled={createRoom.isPending || !newRoomName.trim()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {createRoom.isPending ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <Headphones className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">No voice rooms yet</p>
                <p className="text-sm mt-1">Create one to start talking with friends!</p>
              </div>
            )}
            {rooms.map(room => {
              const isInRoom = room.id === currentRoom?.id;
              return (
                <div key={room.id} className={cn("bg-card border rounded-2xl overflow-hidden transition-all", isInRoom ? "border-primary/40 ring-1 ring-primary/20" : "border-card-border")}>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-primary" />
                        {room.name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />{room.memberCount}/{room.maxMembers}
                      </span>
                    </div>
                    {room.gameName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Gamepad2 className="w-3 h-3" />{room.gameName}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {room.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                              <img src={member.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.username}`} alt="" className="w-full h-full" />
                            </div>
                            <span className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background",
                              member.isMuted ? "bg-red-500" : "bg-green-400"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{member.username}</p>
                            <p className="text-xs text-muted-foreground">Level {member.level}</p>
                          </div>
                          {member.userId === userId && (
                            <button onClick={() => toggleMuteApi.mutate({ roomId: room.id, userId })}
                              className={cn("p-1.5 rounded-lg transition-colors", member.isMuted ? "text-red-400 bg-red-500/10" : "text-muted-foreground hover:text-foreground bg-secondary")}>
                              {member.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <span className={cn("w-1.5 h-1.5 rounded-full", member.isMuted ? "bg-red-500" : "bg-green-400 animate-pulse")} />
                        </div>
                      ))}
                    </div>

                    {isInRoom && (
                      <div className="mb-4 space-y-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                          <Radio className="w-3 h-3 text-primary" />
                          <span>WebRTC Audio Streams</span>
                          {isConnected && <Wifi className="w-3 h-3 text-green-400" />}
                        </div>
                        {peers.map(p => (
                          <div key={p.userId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-green-300">Peer #{p.userId}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">connected</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {isInRoom ? (
                      <div className="flex gap-2">
                        <button onClick={toggleMute}
                          className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5",
                            isMuted ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-secondary text-foreground hover:bg-secondary/80")}>
                          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          {isMuted ? "Unmute" : "Mute"}
                        </button>
                        <button onClick={() => handleLeave(room.id)}
                          className="flex-1 py-2 bg-red-500/20 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5">
                          <LogOut className="w-3.5 h-3.5" /> Leave
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleJoin(room.id)} disabled={joinRoomApi.isPending}
                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                        <LogIn className="w-3.5 h-3.5" /> Join Room
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
