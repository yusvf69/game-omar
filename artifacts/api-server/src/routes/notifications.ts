import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/notifications/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const notifications = await db.select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(notifications);
});

router.get("/notifications/:userId/unread-count", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const rows = await db.select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  res.json({ count: rows.length });
});

router.patch("/notifications/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, id));
  res.json({ success: true });
});

router.patch("/notifications/:userId/read-all", async (req, res) => {
  const userId = parseInt(req.params.userId);
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.userId, userId));
  res.json({ success: true });
});

router.post("/notifications", async (req, res) => {
  const { userId, type, title, message, link } = req.body;
  if (!userId || !title || !message) {
    res.status(400).json({ error: "userId, title, and message required" });
    return;
  }
  const [notification] = await db.insert(notificationsTable)
    .values({ userId, type: type ?? "system", title, message, link })
    .returning();
  res.status(201).json(notification);
});

export default router;
