import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const guildsTable = pgTable("guilds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  tag: text("tag").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  ownerId: integer("owner_id").notNull(),
  memberCount: integer("member_count").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guildMembersTable = pgTable("guild_members", {
  id: serial("id").primaryKey(),
  guildId: integer("guild_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGuildSchema = createInsertSchema(guildsTable).omit({ id: true, createdAt: true });
export const insertGuildMemberSchema = createInsertSchema(guildMembersTable).omit({ id: true, joinedAt: true });
export type Guild = typeof guildsTable.$inferSelect;
export type GuildMember = typeof guildMembersTable.$inferSelect;
