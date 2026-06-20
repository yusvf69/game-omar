import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable } from "@workspace/db";
import { eq, ilike, or, desc, asc, and } from "drizzle-orm";
import {
  ListGamesQueryParams,
  CreateGameBody,
  GetGameParams,
  UpdateGameParams,
  UpdateGameBody,
  DeleteGameParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/games", async (req, res) => {
  const query = ListGamesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, search, sort, subscription_tier, limit = 50, offset = 0 } = query.data;

  let conditions: ReturnType<typeof eq>[] = [];
  if (category) conditions.push(eq(gamesTable.category, category));
  if (subscription_tier) conditions.push(eq(gamesTable.subscriptionTier, subscription_tier));
  if (search) {
    conditions.push(
      or(
        ilike(gamesTable.title, `%${search}%`),
        ilike(gamesTable.description, `%${search}%`)
      ) as ReturnType<typeof eq>
    );
  }

  let orderBy;
  if (sort === "top_rated") orderBy = desc(gamesTable.rating);
  else if (sort === "trending") orderBy = desc(gamesTable.downloads);
  else if (sort === "price_asc") orderBy = asc(gamesTable.price);
  else if (sort === "price_desc") orderBy = desc(gamesTable.price);
  else orderBy = desc(gamesTable.createdAt);

  const games = await db
    .select()
    .from(gamesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  res.json(games.map(toGame));
});

router.post("/games", async (req, res) => {
  const body = CreateGameBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.issues });
    return;
  }
  const [game] = await db.insert(gamesTable).values({
    ...body.data,
    releaseDate: body.data.releaseDate ?? new Date().toISOString().split("T")[0],
  }).returning();
  res.status(201).json(toGame(game));
});

router.get("/games/featured", async (_req, res) => {
  const games = await db.select().from(gamesTable).where(eq(gamesTable.isFeatured, true)).limit(6);
  res.json(games.map(toGame));
});

router.get("/games/trending", async (_req, res) => {
  const games = await db.select().from(gamesTable).where(eq(gamesTable.isTrending, true)).orderBy(desc(gamesTable.downloads)).limit(8);
  res.json(games.map(toGame));
});

router.get("/games/new-releases", async (_req, res) => {
  const games = await db.select().from(gamesTable).orderBy(desc(gamesTable.releaseDate)).limit(8);
  res.json(games.map(toGame));
});

router.get("/games/categories", async (_req, res) => {
  const games = await db.select({ category: gamesTable.category }).from(gamesTable);
  const counts = games.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1;
    return acc;
  }, {});
  const categories = Object.entries(counts).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    count,
    iconUrl: null,
  }));
  res.json(categories);
});

router.get("/games/:id", async (req, res) => {
  const params = GetGameParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
  if (!game) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toGame(game));
});

router.patch("/games/:id", async (req, res) => {
  const params = UpdateGameParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateGameBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [game] = await db.update(gamesTable).set(body.data).where(eq(gamesTable.id, params.data.id)).returning();
  if (!game) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toGame(game));
});

router.delete("/games/:id", async (req, res) => {
  const params = DeleteGameParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(gamesTable).where(eq(gamesTable.id, params.data.id));
  res.status(204).send();
});

function toGame(g: typeof gamesTable.$inferSelect) {
  return {
    ...g,
    price: Number(g.price),
    rating: Number(g.rating),
  };
}

export default router;
