import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistTable, gamesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetWishlistParams,
  AddToWishlistParams,
  AddToWishlistBody,
  RemoveFromWishlistParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/users/:id/wishlist", async (req, res) => {
  const params = GetWishlistParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db.select({ game: gamesTable })
    .from(wishlistTable)
    .leftJoin(gamesTable, eq(wishlistTable.gameId, gamesTable.id))
    .where(eq(wishlistTable.userId, params.data.id));

  res.json(rows.filter(r => r.game).map(r => ({
    ...r.game!,
    price: Number(r.game!.price),
    rating: Number(r.game!.rating),
  })));
});

router.post("/users/:id/wishlist", async (req, res) => {
  const params = AddToWishlistParams.safeParse({ id: Number(req.params.id) });
  const body = AddToWishlistBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  await db.insert(wishlistTable).values({ userId: params.data.id, gameId: body.data.gameId }).onConflictDoNothing();
  res.status(201).json({ ok: true });
});

router.delete("/users/:userId/wishlist/:gameId", async (req, res) => {
  const params = RemoveFromWishlistParams.safeParse({
    userId: Number(req.params.userId),
    gameId: Number(req.params.gameId),
  });
  if (!params.success) { res.status(400).json({ error: "Invalid input" }); return; }
  await db.delete(wishlistTable).where(
    and(eq(wishlistTable.userId, params.data.userId), eq(wishlistTable.gameId, params.data.gameId))
  );
  res.status(204).send();
});

export default router;
