import { useState, useEffect, useCallback } from "react";
import { getUserId } from "./use-auth";

const BASE = "/api/game-progression";

async function f<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "content-type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error(`API ${url} failed: ${res.status}${body ? ` — ${body}` : ""}`);
  }
  return res.json();
}

export function useGameProgression() {
  const userId = getUserId();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [favs, rats, recent] = await Promise.all([
        f<string[]>(`${BASE}/favorites/${userId}`),
        f<Record<string, number>>(`${BASE}/ratings/${userId}`),
        f<any[]>(`${BASE}/recently-played/${userId}`),
      ]);
      setFavorites(favs);
      setRatings(rats);
      setRecentlyPlayed(recent);
    } catch (e) {
      console.error("Failed to load progression data:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleFavorite = useCallback(async (gameId: string) => {
    const res = await f<{ favorited: boolean }>(`${BASE}/favorites`, {
      method: "POST",
      body: JSON.stringify({ userId, gameId }),
    });
    if (res.favorited) setFavorites(prev => [...prev, gameId]);
    else setFavorites(prev => prev.filter(g => g !== gameId));
  }, [userId]);

  const isFavorited = useCallback((gameId: string) => favorites.includes(gameId), [favorites]);

  const setRating = useCallback(async (gameId: string, rating: number) => {
    await f(`${BASE}/ratings`, {
      method: "POST",
      body: JSON.stringify({ userId, gameId, rating }),
    });
    setRatings(prev => ({ ...prev, [gameId]: rating }));
  }, [userId]);

  const getRating = useCallback((gameId: string) => ratings[gameId] ?? 0, [ratings]);

  const recordPlay = useCallback(async (gameId: string, score?: number) => {
    await f(`${BASE}/recently-played`, {
      method: "POST",
      body: JSON.stringify({ userId, gameId, score }),
    });
    refresh();
  }, [userId, refresh]);

  const submitScore = useCallback(async (gameId: string, score: number, details?: string) => {
    return f<{ rank: number }>(`${BASE}/leaderboard`, {
      method: "POST",
      body: JSON.stringify({ userId, gameId, score, details }),
    });
  }, [userId]);

  const getLeaderboard = useCallback(async (gameId: string, limit = 50) => {
    return f<any[]>(`${BASE}/leaderboard/${gameId}?limit=${limit}`);
  }, []);

  return {
    favorites,
    recentlyPlayed,
    loading,
    refresh,
    toggleFavorite,
    isFavorited,
    setRating,
    getRating,
    recordPlay,
    submitScore,
    getLeaderboard,
    userId,
  };
}
