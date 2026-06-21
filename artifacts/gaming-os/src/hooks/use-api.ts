import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function getUserId(): number {
  try {
    const stored = localStorage.getItem("gamingos_user");
    if (stored) return JSON.parse(stored).id;
  } catch {}
  return 8;
}

export const DEMO_USER_ID = 8;

async function get<T>(url: string): Promise<T> {
  const res = await fetch(`/api${url}`);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${url}`, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${url}`, {
    method: "PATCH",
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.status}`);
  return res.json();
}

async function del<T>(url: string): Promise<T> {
  const res = await fetch(`/api${url}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
  return res.json();
}

export function useMarketplaceItems() {
  return useQuery({
    queryKey: ["marketplace", "items"],
    queryFn: () => get<Array<{ id: number; name: string; description: string; type: string; rarity: string; price: number; imageUrl: string | null; gameId: number | null; isAvailable: boolean }>>("/marketplace/items"),
  });
}

export function useUserItems(userId: number) {
  return useQuery({
    queryKey: ["marketplace", "user-items", userId],
    queryFn: () => get<Array<{ id: number; userId: number; itemId: number }>>(`/marketplace/user/${userId}/items`),
  });
}

export function usePurchaseItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, itemId }: { userId: number; itemId: number }) =>
      post("/marketplace/purchase", { userId, itemId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["marketplace"] }); },
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: () => get<Array<{ id: number; name: string; description: string; gameId: number | null; gameName: string | null; type: string; status: string; prizePool: number; maxParticipants: number; currentParticipants: number; startDate: string; endDate: string; imageUrl: string | null }>>("/tournaments"),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["tournaments", "leaderboard"],
    queryFn: () => get<Array<{ id: number; username: string; avatarUrl: string | null; level: number; xp: number; rank: number }>>("/leaderboard"),
  });
}

export function useJoinTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, userId }: { tournamentId: number; userId: number }) =>
      post(`/tournaments/${tournamentId}/join`, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tournaments"] }); },
  });
}

export function useFriends(userId: number) {
  return useQuery({
    queryKey: ["friends", userId],
    queryFn: () => get<Array<{ id: number; username: string; displayName: string | null; avatarUrl: string | null; level: number; xp: number; subscriptionPlan: string | null; status: string; currentGame: string | null }>>(`/social/friends/${userId}`),
  });
}

export function useSocialEvents() {
  return useQuery({
    queryKey: ["social", "events"],
    queryFn: () => get<Array<{ id: number; title: string; description: string; type: string; startsAt: string; endsAt: string; imageUrl: string | null; isLive: string }>>("/social/events"),
  });
}

export function useMessages(userId: number, peerId: number | null) {
  return useQuery({
    queryKey: ["messages", userId, peerId],
    queryFn: () => get<Array<{ id: number; fromUserId: number; toUserId: number; content: string; createdAt: string }>>(`/social/messages/${userId}/${peerId}`),
    enabled: !!peerId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fromUserId, toUserId, content }: { fromUserId: number; toUserId: number; content: string }) =>
      post("/social/messages", { fromUserId, toUserId, content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); },
  });
}

export function useAddFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId1, userId2 }: { userId1: number; userId2: number }) =>
      post("/social/friends", { userId1, userId2 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["friends"] }); },
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId1, userId2 }: { userId1: number; userId2: number }) =>
      del(`/social/friends/${userId1}/${userId2}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["friends"] }); },
  });
}

/* ───── Voice ───── */

export function useVoiceRooms() {
  return useQuery({
    queryKey: ["voice", "rooms"],
    queryFn: () => get<Array<{ id: number; name: string; gameName: string | null; hostId: number; isPrivate: boolean; isLocked: boolean; maxMembers: number; members: Array<{ id: number; userId: number; isMuted: boolean; isDeafened: boolean; username: string; avatarUrl: string | null; level: number }>; memberCount: number }>>("/voice/rooms"),
  });
}

export function useCreateVoiceRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, gameName, hostId }: { name: string; gameName?: string; hostId: number }) =>
      post("/voice/rooms", { name, gameName, hostId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["voice"] }); },
  });
}

export function useJoinVoiceRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: number }) =>
      post(`/voice/rooms/${roomId}/join`, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["voice"] }); },
  });
}

export function useLeaveVoiceRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: number }) =>
      post(`/voice/rooms/${roomId}/leave`, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["voice"] }); },
  });
}

export function useToggleMute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: number }) =>
      patch(`/voice/rooms/${roomId}/toggle-mute`, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["voice"] }); },
  });
}

/* ───── Developer ───── */

export function useDeveloperStats() {
  return useQuery({
    queryKey: ["developer", "stats"],
    queryFn: () => get<{ totalGames: number; totalDownloads: number; totalReviews: number; avgRating: number; estimatedRevenue: number; games: Array<{ id: number; title: string; category: string; price: number; rating: number; downloads: number; coverImage: string; status: string }> }>("/developer/stats"),
  });
}
