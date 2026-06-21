import { Router } from "express";
import { db } from "@workspace/db";
import { marketplaceItemsTable, userMarketplaceItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/marketplace/items", async (req, res) => {
  const { type, rarity } = req.query as Record<string, string>;
  let query = db.select().from(marketplaceItemsTable).where(eq(marketplaceItemsTable.isAvailable, true));
  const items = await db.select().from(marketplaceItemsTable)
    .where(eq(marketplaceItemsTable.isAvailable, true));
  const filtered = items.filter(i => {
    if (type && type !== "__all__" && i.type !== type) return false;
    if (rarity && rarity !== "__all__" && i.rarity !== rarity) return false;
    return true;
  });
  res.json(filtered.map(i => ({ ...i, price: Number(i.price) })));
});

router.get("/marketplace/items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [item] = await db.select().from(marketplaceItemsTable).where(eq(marketplaceItemsTable.id, id));
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  res.json({ ...item, price: Number(item.price) });
});

router.post("/marketplace/purchase", async (req, res) => {
  const { userId, itemId } = req.body;
  if (!userId || !itemId) { res.status(400).json({ error: "userId and itemId required" }); return; }
  const [existing] = await db.select().from(userMarketplaceItemsTable)
    .where(and(eq(userMarketplaceItemsTable.userId, userId), eq(userMarketplaceItemsTable.itemId, itemId)));
  if (existing) { res.status(409).json({ error: "Already owned" }); return; }
  const [purchase] = await db.insert(userMarketplaceItemsTable).values({ userId, itemId }).returning();
  res.status(201).json(purchase);
});

router.get("/marketplace/user/:userId/items", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const owned = await db.select().from(userMarketplaceItemsTable)
    .where(eq(userMarketplaceItemsTable.userId, userId));
  res.json(owned);
});

export default router;
