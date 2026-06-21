import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable, usersTable } from "@workspace/db";
import { ilike, or, desc } from "drizzle-orm";

const router = Router();

router.get("/search", async (req, res) => {
  const q = (req.query.q as string || "").trim();
  if (!q) { res.json({ games: [], users: [], categories: [] }); return; }

  const games = await db.select().from(gamesTable)
    .where(or(
      ilike(gamesTable.title, `%${q}%`),
      ilike(gamesTable.description, `%${q}%`),
      ilike(gamesTable.category, `%${q}%`),
      ilike(gamesTable.developer, `%${q}%`)
    )).orderBy(desc(gamesTable.rating)).limit(8);

  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    displayName: usersTable.displayName,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
  }).from(usersTable)
    .where(or(ilike(usersTable.username, `%${q}%`), ilike(usersTable.displayName, `%${q}%`)))
    .limit(4);

  const allGames = await db.select({ category: gamesTable.category }).from(gamesTable);
  const catSet = new Set(allGames.map(g => g.category));
  const categories = Array.from(catSet).filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 4);

  res.json({
    games: games.map(g => ({ ...g, price: Number(g.price), rating: Number(g.rating) })),
    users,
    categories,
  });
});

export default router;
