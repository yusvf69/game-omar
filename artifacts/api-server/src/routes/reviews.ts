import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, usersTable, gamesTable } from "@workspace/db";
import { eq, avg, desc, count } from "drizzle-orm";
import {
  ListGameReviewsParams,
  CreateReviewParams,
  CreateReviewBody,
  DeleteReviewParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/games/:id/reviews", async (req, res) => {
  const params = ListGameReviewsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db.select({
    review: reviewsTable,
    username: usersTable.username,
    avatarUrl: usersTable.avatarUrl,
  })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.gameId, params.data.id))
    .orderBy(desc(reviewsTable.createdAt));

  res.json(rows.map(r => ({
    ...r.review,
    username: r.username ?? "Unknown",
    avatarUrl: r.avatarUrl ?? null,
  })));
});

router.post("/games/:id/reviews", async (req, res) => {
  const params = CreateReviewParams.safeParse({ id: Number(req.params.id) });
  const body = CreateReviewBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    gameId: params.data.id,
    userId: body.data.userId,
    rating: body.data.rating,
    content: body.data.content,
  }).returning();

  // Update game rating
  const avgResult = await db.select({ avg: avg(reviewsTable.rating) })
    .from(reviewsTable)
    .where(eq(reviewsTable.gameId, params.data.id));
  const countResult = await db.select({ count: count(reviewsTable.id) })
    .from(reviewsTable)
    .where(eq(reviewsTable.gameId, params.data.id));
  if (avgResult[0]) {
    const newRating = Number(avgResult[0].avg ?? 0);
    const reviewCount = Number(countResult[0]?.count ?? 0);
    await db.update(gamesTable)
      .set({ rating: newRating.toFixed(2), reviewCount })
      .where(eq(gamesTable.id, params.data.id));
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, body.data.userId));
  res.status(201).json({
    ...review,
    username: user?.username ?? "Unknown",
    avatarUrl: user?.avatarUrl ?? null,
  });
});

router.delete("/reviews/:id", async (req, res) => {
  const params = DeleteReviewParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(reviewsTable).where(eq(reviewsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
