import { pgTable, text, integer, timestamp, primaryKey, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const gameFavoritesTable = pgTable("game_favorites", {
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  gameId: text("game_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.gameId] }),
]);

export const gameRatingsTable = pgTable("game_ratings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  gameId: text("game_id").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.userId, t.gameId),
]);

export const gameLeaderboardTable = pgTable("game_leaderboard", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  gameId: text("game_id").notNull(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const recentlyPlayedTable = pgTable("recently_played", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  gameId: text("game_id").notNull(),
  playCount: integer("play_count").notNull().default(1),
  maxScore: integer("max_score").default(0),
  lastPlayedAt: timestamp("last_played_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.userId, t.gameId),
]);
