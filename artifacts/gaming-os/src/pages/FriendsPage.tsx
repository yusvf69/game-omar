import { useState } from "react";
import { Users, MessageCircle, UserPlus, Search, Gamepad2, Clock, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFriends, useSocialEvents, useMessages, useSendMessage, useAddFriend, useRemoveFriend, DEMO_USER_ID } from "@/hooks/use-api";

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  online: { dot: "bg-green-400", label: "Online" },
  offline: { dot: "bg-gray-500", label: "Offline" },
  in_game: { dot: "bg-blue-400 animate-pulse", label: "In Game" },
};

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"friends" | "activity" | "messages" | "discover">("friends");
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const { data: friends = [], isLoading: friendsLoading } = useFriends(DEMO_USER_ID);
  const { data: events = [] } = useSocialEvents();
  const { data: messages = [] } = useMessages(DEMO_USER_ID, activeChatId);
  const sendMessage = useSendMessage();
  const addFriend = useAddFriend();

  const filteredFriends = friends.filter(f =>
    !search || f.username.toLowerCase().includes(search.toLowerCase()) || (f.displayName?.toLowerCase().includes(search.toLowerCase()))
  );

  const onlineFriends = filteredFriends.filter(f => f.status !== "offline");
  const offlineFriends = filteredFriends.filter(f => f.status === "offline");

  const chatPeers = friends.map(f => ({
    id: f.id,
    username: f.username,
    avatarUrl: f.avatarUrl,
    lastMessage: `${f.username} is ${f.status === "online" ? "online" : "offline"}`,
    unread: 0,
  }));

  const activePeer = chatPeers.find(p => p.id === activeChatId);

  function handleSend() {
    if (!messageText.trim() || !activeChatId) return;
    sendMessage.mutate({ fromUserId: DEMO_USER_ID, toUserId: activeChatId, content: messageText });
    setMessageText("");
  }

  const activityFeed = events.slice(0, 10).map(e => ({
    id: e.id,
    user: `System`,
    action: e.type.replace(/_/g, " "),
    detail: e.title,
    time: new Date(e.startsAt).toLocaleDateString(),
    imageUrl: e.imageUrl,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" /> Friends
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{friends.length} friends · {onlineFriends.length} online</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-card rounded-xl p-1 w-fit">
          {(["friends", "activity", "messages", "discover"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all relative",
                activeTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              {tab === "messages" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">0</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-screen-xl mx-auto">

        {activeTab === "friends" && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full max-w-sm pl-9 pr-4 py-2.5 bg-card border border-card-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {friendsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {onlineFriends.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Online — {onlineFriends.length}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {onlineFriends.map(friend => {
                        const status = STATUS_CONFIG[friend.status] ?? STATUS_CONFIG.offline;
                        return (
                          <div key={friend.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
                                <img src={friend.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${friend.username}`} alt={friend.username} className="w-full h-full" />
                              </div>
                              <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", status.dot)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-foreground truncate">{friend.username}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {friend.currentGame ? (
                                  <><Gamepad2 className="w-3 h-3 text-blue-400" /><span className="text-blue-400">{friend.currentGame}</span></>
                                ) : (
                                  <>Level {friend.level}</>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => { setActiveTab("messages"); setActiveChatId(friend.id); }}
                                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary transition-colors text-muted-foreground">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {offlineFriends.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Offline — {offlineFriends.length}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {offlineFriends.map(friend => (
                        <div key={friend.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4 opacity-60 hover:opacity-90 transition-all">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden grayscale">
                              <img src={friend.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${friend.username}`} alt={friend.username} className="w-full h-full" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background bg-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground truncate">{friend.username}</p>
                            <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Live Events & Activity</h3>
            {activityFeed.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity.</p>
            ) : (
              activityFeed.map(item => (
                <div key={item.id} className="flex items-start gap-4 bg-card border border-card-border rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <Bell className="w-5 h-5 m-2.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{item.user}</span>
                      {" "}<span className="text-muted-foreground capitalize">{item.action}</span>
                      {" "}<span className="font-semibold text-primary">{item.detail}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{item.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="flex gap-5 max-w-3xl">
            <div className="w-72 flex-shrink-0 space-y-2">
              {chatPeers.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveChatId(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all",
                    activeChatId === conv.id ? "bg-primary/20 border border-primary/40" : "bg-card border border-card-border hover:border-primary/30"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                    <img src={conv.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${conv.username}`} alt={conv.username} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-foreground">{conv.username}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
            {activeChatId && activePeer ? (
              <div className="flex-1 bg-card border border-card-border rounded-2xl flex flex-col">
                <div className="p-4 border-b border-border/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden">
                    <img src={activePeer.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${activePeer.username}`} alt="" className="w-full h-full" />
                  </div>
                  <p className="font-bold text-foreground">{activePeer.username}</p>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto max-h-96 justify-end">
                  {messages.map(msg => (
                    <div key={msg.id} className={cn("flex", msg.fromUserId === DEMO_USER_ID ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-xs",
                        msg.fromUserId === DEMO_USER_ID ? "bg-primary rounded-tr-sm" : "bg-secondary rounded-tl-sm"
                      )}>
                        <p className={cn("text-sm", msg.fromUserId === DEMO_USER_ID ? "text-white" : "text-foreground")}>{msg.content}</p>
                        <p className={cn("text-xs mt-1", msg.fromUserId === DEMO_USER_ID ? "text-white/60" : "text-muted-foreground")}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border/50 flex gap-2">
                  <input
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sendMessage.isPending || !messageText.trim()}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-card border border-card-border rounded-2xl flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "discover" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">People You May Know</h3>
            {friends.length === 0 ? (
              <p className="text-muted-foreground text-sm">No suggestions yet. Add some games to your library!</p>
            ) : (
              <p className="text-muted-foreground text-sm">Connect with more players to build your network.</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => addFriend.mutate({ userId1: DEMO_USER_ID, userId2: 1 })}
                disabled={addFriend.isPending}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Add ShadowBlade
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
