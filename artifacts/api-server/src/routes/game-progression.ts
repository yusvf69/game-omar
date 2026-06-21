import { Router } from "express";
import { db } from "@workspace/db";
import { gameFavoritesTable, gameRatingsTable, gameLeaderboardTable, recentlyPlayedTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/game-progression/favorites/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) { res.status(400).json({ error: "Invalid userId" }); return; }
  const rows = await db.select({ gameId: gameFavoritesTable.gameId }).from(gameFavoritesTable).where(eq(gameFavoritesTable.userId, userId));
  res.json(rows.map(r => r.gameId));
});

router.post("/game-progression/favorites", async (req, res) => {
  const { userId, gameId } = req.body;
  if (!userId || !gameId) { res.status(400).json({ error: "Missing userId or gameId" }); return; }
  const existing = await db.select().from(gameFavoritesTable).where(and(eq(gameFavoritesTable.userId, userId), eq(gameFavoritesTable.gameId, gameId)));
  if (existing.length > 0) {
    await db.delete(gameFavoritesTable).where(and(eq(gameFavoritesTable.userId, userId), eq(gameFavoritesTable.gameId, gameId)));
    res.json({ favorited: false });
  } else {
    await db.insert(gameFavoritesTable).values({ userId, gameId });
    res.json({ favorited: true });
  }
});

router.get("/game-progression/ratings/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) { res.status(400).json({ error: "Invalid userId" }); return; }
  const rows = await db.select({ gameId: gameRatingsTable.gameId, rating: gameRatingsTable.rating }).from(gameRatingsTable).where(eq(gameRatingsTable.userId, userId));
  const map: Record<string, number> = {};
  rows.forEach(r => { map[r.gameId] = r.rating; });
  res.json(map);
});

router.post("/game-progression/ratings", async (req, res) => {
  const { userId, gameId, rating } = req.body;
  if (!userId || !gameId || !rating) { res.status(400).json({ error: "Missing fields" }); return; }
  if (rating < 1 || rating > 5) { res.status(400).json({ error: "Rating must be 1-5" }); return; }
  await db.insert(gameRatingsTable).values({ userId, gameId, rating }).onConflictDoUpdate({ target: [gameRatingsTable.userId, gameRatingsTable.gameId], set: { rating } });
  res.json({ rating });
});

router.get("/game-progression/leaderboard/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const rows = await db.select({
    userId: gameLeaderboardTable.userId,
    score: gameLeaderboardTable.score,
    details: gameLeaderboardTable.details,
    createdAt: gameLeaderboardTable.createdAt,
  }).from(gameLeaderboardTable).where(eq(gameLeaderboardTable.gameId, gameId)).orderBy(desc(gameLeaderboardTable.score)).limit(limit);
  res.json(rows);
});

router.post("/game-progression/leaderboard", async (req, res) => {
  const { gameId, userId, score, details } = req.body;
  if (!gameId || !userId || score === undefined) { res.status(400).json({ error: "Missing fields" }); return; }
  await db.insert(gameLeaderboardTable).values({ gameId, userId, score, details });
  const rank = await db.select({ count: sql<number>`count(*)` }).from(gameLeaderboardTable).where(and(eq(gameLeaderboardTable.gameId, gameId), sql`score > ${score}`));
  res.json({ rank: Number(rank[0]?.count ?? 0) + 1 });
});

router.get("/game-progression/recently-played/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) { res.status(400).json({ error: "Invalid userId" }); return; }
  const rows = await db.select().from(recentlyPlayedTable).where(eq(recentlyPlayedTable.userId, userId)).orderBy(desc(recentlyPlayedTable.lastPlayedAt)).limit(20);
  res.json(rows);
});

router.post("/game-progression/recently-played", async (req, res) => {
  const { userId, gameId, score } = req.body;
  if (!userId || !gameId) { res.status(400).json({ error: "Missing fields" }); return; }
  const existing = await db.select().from(recentlyPlayedTable).where(and(eq(recentlyPlayedTable.userId, userId), eq(recentlyPlayedTable.gameId, gameId)));
  if (existing.length > 0) {
    const update: any = { playCount: existing[0].playCount + 1, lastPlayedAt: new Date() };
    if (score !== undefined && score > (existing[0].maxScore ?? 0)) update.maxScore = score;
    await db.update(recentlyPlayedTable).set(update).where(and(eq(recentlyPlayedTable.userId, userId), eq(recentlyPlayedTable.gameId, gameId)));
  } else {
    await db.insert(recentlyPlayedTable).values({ userId, gameId, playCount: 1, maxScore: score ?? 0 });
  }
  res.json({ ok: true });
});

export default router;
