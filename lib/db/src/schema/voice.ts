import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const voiceRoomsTable = pgTable("voice_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameName: text("game_name"),
  hostId: integer("host_id").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  maxMembers: integer("max_members").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const voiceRoomMembersTable = pgTable("voice_room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  isMuted: boolean("is_muted").notNull().default(false),
  isDeafened: boolean("is_deafened").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVoiceRoomSchema = createInsertSchema(voiceRoomsTable).omit({ id: true, createdAt: true });
export const insertVoiceRoomMemberSchema = createInsertSchema(voiceRoomMembersTable).omit({ id: true, joinedAt: true });
export type VoiceRoom = typeof voiceRoomsTable.$inferSelect;
export type VoiceRoomMember = typeof voiceRoomMembersTable.$inferSelect;
