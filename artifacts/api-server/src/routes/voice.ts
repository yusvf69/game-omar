import { Router } from "express";
import { db } from "@workspace/db";
import { voiceRoomsTable, voiceRoomMembersTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/voice/rooms", async (_req, res) => {
  const rooms = await db.select().from(voiceRoomsTable).orderBy(desc(voiceRoomsTable.createdAt));
  const roomsWithMembers = await Promise.all(rooms.map(async (room) => {
    const members = await db.select({
      id: voiceRoomMembersTable.id,
      userId: voiceRoomMembersTable.userId,
      isMuted: voiceRoomMembersTable.isMuted,
      isDeafened: voiceRoomMembersTable.isDeafened,
      username: usersTable.username,
      avatarUrl: usersTable.avatarUrl,
      level: usersTable.level,
    }).from(voiceRoomMembersTable)
      .leftJoin(usersTable, eq(voiceRoomMembersTable.userId, usersTable.id))
      .where(eq(voiceRoomMembersTable.roomId, room.id));
    return { ...room, members, memberCount: members.length };
  }));
  res.json(roomsWithMembers);
});

router.get("/voice/rooms/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [room] = await db.select().from(voiceRoomsTable).where(eq(voiceRoomsTable.id, id));
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  const members = await db.select({
    id: voiceRoomMembersTable.id,
    userId: voiceRoomMembersTable.userId,
    isMuted: voiceRoomMembersTable.isMuted,
    isDeafened: voiceRoomMembersTable.isDeafened,
    username: usersTable.username,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
  }).from(voiceRoomMembersTable)
    .leftJoin(usersTable, eq(voiceRoomMembersTable.userId, usersTable.id))
    .where(eq(voiceRoomMembersTable.roomId, id));
  res.json({ ...room, members, memberCount: members.length });
});

router.post("/voice/rooms", async (req, res) => {
  const { name, gameName, hostId, maxMembers } = req.body;
  if (!name || !hostId) { res.status(400).json({ error: "name and hostId required" }); return; }
  const [room] = await db.insert(voiceRoomsTable).values({ name, gameName, hostId, maxMembers: maxMembers ?? 10 }).returning();
  await db.insert(voiceRoomMembersTable).values({ roomId: room.id, userId: hostId });
  res.status(201).json(room);
});

router.post("/voice/rooms/:id/join", async (req, res) => {
  const roomId = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const [room] = await db.select().from(voiceRoomsTable).where(eq(voiceRoomsTable.id, roomId));
  if (!room) { res.status(404).json({ error: "Room not found" }); return; }
  if (room.isLocked) { res.status(403).json({ error: "Room is locked" }); return; }
  const members = await db.select().from(voiceRoomMembersTable).where(eq(voiceRoomMembersTable.roomId, roomId));
  if (members.length >= room.maxMembers) { res.status(403).json({ error: "Room is full" }); return; }
  const [existing] = await db.select().from(voiceRoomMembersTable)
    .where(and(eq(voiceRoomMembersTable.roomId, roomId), eq(voiceRoomMembersTable.userId, userId)));
  if (existing) { res.status(409).json({ error: "Already in room" }); return; }
  const [member] = await db.insert(voiceRoomMembersTable).values({ roomId, userId }).returning();
  res.status(201).json(member);
});

router.post("/voice/rooms/:id/leave", async (req, res) => {
  const roomId = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  await db.delete(voiceRoomMembersTable)
    .where(and(eq(voiceRoomMembersTable.roomId, roomId), eq(voiceRoomMembersTable.userId, userId)));
  const remaining = await db.select().from(voiceRoomMembersTable).where(eq(voiceRoomMembersTable.roomId, roomId));
  if (remaining.length === 0) {
    await db.delete(voiceRoomsTable).where(eq(voiceRoomsTable.id, roomId));
  }
  res.json({ success: true });
});

router.patch("/voice/rooms/:id/toggle-mute", async (req, res) => {
  const roomId = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const [member] = await db.select().from(voiceRoomMembersTable)
    .where(and(eq(voiceRoomMembersTable.roomId, roomId), eq(voiceRoomMembersTable.userId, userId)));
  if (!member) { res.status(404).json({ error: "Not in room" }); return; }
  const [updated] = await db.update(voiceRoomMembersTable)
    .set({ isMuted: !member.isMuted })
    .where(eq(voiceRoomMembersTable.id, member.id))
    .returning();
  res.json(updated);
});

export default router;
