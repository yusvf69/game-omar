import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const marketplaceItemsTable = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("skin"),
  rarity: text("rarity").notNull().default("common"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  imageUrl: text("image_url"),
  gameId: integer("game_id"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userMarketplaceItemsTable = pgTable("user_marketplace_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItemsTable).omit({ id: true, createdAt: true });
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItemsTable.$inferSelect;
