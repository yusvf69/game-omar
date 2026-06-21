import { Router } from "express";
import { db } from "@workspace/db";
import { partiesTable, partyMembersTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/parties", async (_req, res) => {
  const parties = await db.select().from(partiesTable).orderBy(desc(partiesTable.createdAt));
  const allUsers = await db.select({ id: usersTable.id, username: usersTable.username, avatarUrl: usersTable.avatarUrl, level: usersTable.level }).from(usersTable);
  const result = await Promise.all(parties.map(async p => {
    const members = await db.select({
      id: partyMembersTable.id,
      userId: partyMembersTable.userId,
      isReady: partyMembersTable.isReady,
      username: usersTable.username,
      avatarUrl: usersTable.avatarUrl,
      level: usersTable.level,
    }).from(partyMembersTable)
      .leftJoin(usersTable, eq(partyMembersTable.userId, usersTable.id))
      .where(eq(partyMembersTable.partyId, p.id));
    return { ...p, members, memberCount: members.length };
  }));
  res.json(result);
});

router.post("/parties", async (req, res) => {
  const { name, gameName, leaderId, maxMembers } = req.body;
  if (!name || !leaderId) { res.status(400).json({ error: "name and leaderId required" }); return; }
  const [party] = await db.insert(partiesTable).values({ name, gameName, leaderId, maxMembers: maxMembers ?? 4 }).returning();
  await db.insert(partyMembersTable).values({ partyId: party.id, userId: leaderId, isReady: true });
  res.status(201).json(party);
});

router.post("/parties/:id/join", async (req, res) => {
  const partyId = parseInt(req.params.id);
  const { userId } = req.body;
  const [party] = await db.select().from(partiesTable).where(eq(partiesTable.id, partyId));
  if (!party) { res.status(404).json({ error: "Party not found" }); return; }
  if (party.isLocked) { res.status(403).json({ error: "Party is locked" }); return; }
  const members = await db.select().from(partyMembersTable).where(eq(partyMembersTable.partyId, partyId));
  if (members.length >= party.maxMembers) { res.status(403).json({ error: "Party is full" }); return; }
  const [existing] = await db.select().from(partyMembersTable)
    .where(and(eq(partyMembersTable.partyId, partyId), eq(partyMembersTable.userId, userId)));
  if (existing) { res.status(409).json({ error: "Already in party" }); return; }
  const [m] = await db.insert(partyMembersTable).values({ partyId, userId }).returning();
  res.status(201).json(m);
});

router.post("/parties/:id/leave", async (req, res) => {
  const partyId = parseInt(req.params.id);
  const { userId } = req.body;
  await db.delete(partyMembersTable)
    .where(and(eq(partyMembersTable.partyId, partyId), eq(partyMembersTable.userId, userId)));
  const remaining = await db.select().from(partyMembersTable).where(eq(partyMembersTable.partyId, partyId));
  if (remaining.length === 0) {
    await db.delete(partiesTable).where(eq(partiesTable.id, partyId));
  }
  res.json({ success: true });
});

router.post("/parties/:id/toggle-ready", async (req, res) => {
  const partyId = parseInt(req.params.id);
  const { userId } = req.body;
  const [member] = await db.select().from(partyMembersTable)
    .where(and(eq(partyMembersTable.partyId, partyId), eq(partyMembersTable.userId, userId)));
  if (!member) { res.status(404).json({ error: "Not in party" }); return; }
  const [updated] = await db.update(partyMembersTable)
    .set({ isReady: !member.isReady })
    .where(eq(partyMembersTable.id, member.id))
    .returning();
  res.json(updated);
});

router.post("/parties/:id/kick", async (req, res) => {
  const partyId = parseInt(req.params.id);
  const { leaderId, targetUserId } = req.body;
  const [party] = await db.select().from(partiesTable).where(eq(partiesTable.id, partyId));
  if (!party || party.leaderId !== leaderId) { res.status(403).json({ error: "Only leader can kick" }); return; }
  await db.delete(partyMembersTable)
    .where(and(eq(partyMembersTable.partyId, partyId), eq(partyMembersTable.userId, targetUserId)));
  res.json({ success: true });
});

router.get("/users/:id/party", async (req, res) => {
  const userId = parseInt(req.params.id);
  const [membership] = await db.select().from(partyMembersTable).where(eq(partyMembersTable.userId, userId));
  if (!membership) { res.json(null); return; }
  const [party] = await db.select().from(partiesTable).where(eq(partiesTable.id, membership.partyId));
  if (!party) { res.json(null); return; }
  const members = await db.select({
    id: partyMembersTable.id,
    userId: partyMembersTable.userId,
    isReady: partyMembersTable.isReady,
    username: usersTable.username,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
  }).from(partyMembersTable)
    .leftJoin(usersTable, eq(partyMembersTable.userId, usersTable.id))
    .where(eq(partyMembersTable.partyId, party.id));
  res.json({ ...party, members, memberCount: members.length });
});

export default router;
