import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, reviewsTable, wishlistTable, userAchievementsTable } from "@workspace/db";
import { eq, ilike, or, desc } from "drizzle-orm";
import {
  ListUsersQueryParams,
  CreateUserBody,
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  DeleteUserParams,
  GetUserStatsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/users", async (req, res) => {
  const query = ListUsersQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: "Invalid query" }); return; }
  const { search, status, limit = 50, offset = 0 } = query.data;

  let rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  if (search) {
    rows = rows.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (status) rows = rows.filter(u => u.status === status);
  const sliced = rows.slice(offset, offset + limit);
  res.json(sliced.map(toUser));
});

router.post("/users", async (req, res) => {
  const body = CreateUserBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [user] = await db.insert(usersTable).values(body.data).returning();
  res.status(201).json(toUser(user));
});

router.get("/users/:id", async (req, res) => {
  const params = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toUser(user));
});

router.patch("/users/:id", async (req, res) => {
  const params = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateUserBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [user] = await db.update(usersTable).set(body.data).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toUser(user));
});

router.delete("/users/:id", async (req, res) => {
  const params = DeleteUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, params.data.id));
  res.status(204).send();
});

router.get("/users/:id/stats", async (req, res) => {
  const params = GetUserStatsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const userId = params.data.id;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.userId, userId));
  const wishlist = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
  const achievements = await db.select().from(userAchievementsTable).where(eq(userAchievementsTable.userId, userId));

  const xpToNextLevel = (user.level * 1000) - user.xp;

  res.json({
    userId,
    totalPlaytime: user.xp * 2,
    gamesOwned: wishlist.length,
    achievementsUnlocked: achievements.length,
    reviewsWritten: reviews.length,
    level: user.level,
    xp: user.xp,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    wishlistCount: wishlist.length,
  });
});

function toUser(u: typeof usersTable.$inferSelect) {
  const { password, ...rest } = u;
  return { ...rest, lastLoginAt: u.lastLoginAt?.toISOString() ?? null };
}

export default router;
