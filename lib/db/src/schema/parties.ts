import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const partiesTable = pgTable("parties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameName: text("game_name"),
  leaderId: integer("leader_id").notNull(),
  maxMembers: integer("max_members").notNull().default(4),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const partyMembersTable = pgTable("party_members", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  userId: integer("user_id").notNull(),
  isReady: boolean("is_ready").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPartySchema = createInsertSchema(partiesTable).omit({ id: true, createdAt: true });
export const insertPartyMemberSchema = createInsertSchema(partyMembersTable).omit({ id: true, joinedAt: true });
export type Party = typeof partiesTable.$inferSelect;
export type PartyMember = typeof partyMembersTable.$inferSelect;
