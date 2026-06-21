import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable, reviewsTable, usersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

router.get("/developer/stats", async (req, res) => {
  const developer = (req.query.developer as string) || "StarForge Studios";
  const games = await db.select().from(gamesTable).where(eq(gamesTable.developer, developer));
  const totalDownloads = games.reduce((sum, g) => sum + g.downloads, 0);
  const totalReviews = games.reduce((sum, g) => sum + g.reviewCount, 0);
  const avgRating = games.length > 0 ? games.reduce((sum, g) => sum + Number(g.rating), 0) / games.length : 0;
  const estimatedRevenue = games.reduce((sum, g) => sum + (Number(g.price) * g.downloads * 0.0001), 0);
  res.json({
    totalGames: games.length,
    totalDownloads,
    totalReviews,
    avgRating: Math.round(avgRating * 10) / 10,
    estimatedRevenue: Math.round(estimatedRevenue),
    games: games.map(g => ({ ...g, price: Number(g.price), rating: Number(g.rating) })),
  });
});

router.get("/developer/games", async (req, res) => {
  const developer = (req.query.developer as string) || "StarForge Studios";
  const games = await db.select().from(gamesTable).where(eq(gamesTable.developer, developer));
  res.json(games.map(g => ({ ...g, price: Number(g.price), rating: Number(g.rating) })));
});

export default router;
