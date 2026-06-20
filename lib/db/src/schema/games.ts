import { pgTable, text, serial, timestamp, integer, numeric, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  coverImage: text("cover_image").notNull(),
  trailerUrl: text("trailer_url"),
  screenshots: text("screenshots").array().notNull().default([]),
  developer: text("developer"),
  publisher: text("publisher"),
  status: text("status").notNull().default("active"),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  releaseDate: date("release_date", { mode: "string" }).notNull(),
  tags: text("tags").array().notNull().default([]),
  requirements: text("requirements"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(gamesTable).omit({ id: true, createdAt: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof gamesTable.$inferSelect;
