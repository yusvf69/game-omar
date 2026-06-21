import { useState, useEffect, useRef, useCallback } from "react";
import { getUserId } from "@/hooks/use-api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  ChevronLeft,
  Users,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  peerId: number;
  lastMessage: string;
  lastTime: string;
  unread: number;
  user: { id: number; username: string; displayName: string | null; avatarUrl: string | null; level: number } | null;
}

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const userId = getUserId();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePeer, setActivePeer] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/social/conversations/${userId}`);
      setConversations(await res.json());
    } catch {}
  }, [userId]);

  const fetchMessages = useCallback(async (peerId: number) => {
    try {
      const res = await fetch(`/api/social/messages/${userId}/${peerId}`);
      const msgs = await res.json();
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchConversations();
    const iv = setInterval(fetchConversations, 10000);
    return () => clearInterval(iv);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activePeer) return;
    fetchMessages(activePeer);
    pollingRef.current = setInterval(() => fetchMessages(activePeer), 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [activePeer, fetchMessages]);

  async function handleSend() {
    if (!text.trim() || !activePeer) return;
    try {
      await fetch("/api/social/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: userId, toUserId: activePeer, content: text }),
      });
      setText("");
      fetchMessages(activePeer);
      fetchConversations();
    } catch {}
  }

  const filtered = conversations.filter(c =>
    !search || c.user?.username.toLowerCase().includes(search.toLowerCase())
  );

  const activeUser = conversations.find(c => c.peerId === activePeer)?.user;

  return (
    <div className="flex h-[calc(100vh-2rem)] max-w-5xl mx-auto gap-0 rounded-2xl overflow-hidden border border-white/10 bg-card/30">
      {/* Conversations list */}
      <div className={cn("w-80 border-r border-white/10 flex flex-col", activePeer && "hidden md:flex")}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5" /> Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              {search ? "No conversations found" : "No messages yet"}
            </div>
          ) : (
            filtered.map(c => (
              <button
                key={c.peerId}
                onClick={() => setActivePeer(c.peerId)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 border-b border-white/5 transition-all text-left",
                  activePeer === c.peerId ? "bg-primary/10" : "hover:bg-white/5"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                  <img src={c.user?.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${c.user?.username}`} alt="" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">{c.user?.displayName || c.user?.username}</p>
                    <p className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(c.lastTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Message thread */}
      <div className={cn("flex-1 flex flex-col", !activePeer && "hidden md:flex")}>
        {activePeer && activeUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <button onClick={() => setActivePeer(null)} className="md:hidden p-1 text-muted-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden">
                <img src={activeUser.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeUser.username}`} alt="" className="w-full h-full" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{activeUser.displayName || activeUser.username}</p>
                <p className="text-xs text-muted-foreground">Level {activeUser.level}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-12">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map(m => {
                  const isMe = m.fromUserId === userId;
                  return (
                    <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                        isMe ? "bg-primary text-white" : "bg-white/10 text-white"
                      )}>
                        <p>{m.content}</p>
                        <p className={cn("text-[10px] mt-1", isMe ? "text-white/60" : "text-white/40")}>
                          {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10 flex gap-2">
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                className="bg-white/5 border-white/10"
              />
              <Button onClick={handleSend} disabled={!text.trim()} size="icon" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
