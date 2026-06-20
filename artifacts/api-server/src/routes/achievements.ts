import { Router } from "express";
import { db } from "@workspace/db";
import { achievementsTable, userAchievementsTable, gamesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListAchievementsQueryParams,
  CreateAchievementBody,
  GetUserAchievementsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/achievements", async (req, res) => {
  const query = ListAchievementsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: "Invalid query" }); return; }

  const rows = await db.select({
    achievement: achievementsTable,
    gameName: gamesTable.title,
  })
    .from(achievementsTable)
    .leftJoin(gamesTable, eq(achievementsTable.gameId, gamesTable.id))
    .orderBy(desc(achievementsTable.id));

  let filtered = rows;
  if (query.data.gameId) filtered = filtered.filter(r => r.achievement.gameId === query.data.gameId);

  res.json(filtered.map(r => ({
    ...r.achievement,
    gameName: r.gameName ?? null,
    unlockedAt: null,
  })));
});

router.post("/achievements", async (req, res) => {
  const body = CreateAchievementBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [achievement] = await db.insert(achievementsTable).values(body.data).returning();
  res.status(201).json({ ...achievement, gameName: null, unlockedAt: null });
});

router.get("/users/:id/achievements", async (req, res) => {
  const params = GetUserAchievementsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db.select({
    achievement: achievementsTable,
    gameName: gamesTable.title,
    unlockedAt: userAchievementsTable.unlockedAt,
  })
    .from(userAchievementsTable)
    .innerJoin(achievementsTable, eq(userAchievementsTable.achievementId, achievementsTable.id))
    .leftJoin(gamesTable, eq(achievementsTable.gameId, gamesTable.id))
    .where(eq(userAchievementsTable.userId, params.data.id));

  res.json(rows.map(r => ({
    ...r.achievement,
    gameName: r.gameName ?? null,
    unlockedAt: r.unlockedAt?.toISOString() ?? null,
  })));
});

export default router;
