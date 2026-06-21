import { Router } from "express";
import { db } from "@workspace/db";
import { guildsTable, guildMembersTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/guilds", async (_req, res) => {
  const guilds = await db.select().from(guildsTable).orderBy(desc(guildsTable.xp));
  res.json(guilds);
});

router.get("/guilds/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [guild] = await db.select().from(guildsTable).where(eq(guildsTable.id, id));
  if (!guild) { res.status(404).json({ error: "Not found" }); return; }
  const members = await db.select({
    id: guildMembersTable.id,
    userId: guildMembersTable.userId,
    role: guildMembersTable.role,
    joinedAt: guildMembersTable.joinedAt,
    username: usersTable.username,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
  }).from(guildMembersTable)
    .leftJoin(usersTable, eq(guildMembersTable.userId, usersTable.id))
    .where(eq(guildMembersTable.guildId, id));
  res.json({ ...guild, members });
});

router.post("/guilds", async (req, res) => {
  const { name, tag, description, logoUrl, ownerId } = req.body;
  if (!name || !tag || !ownerId) { res.status(400).json({ error: "name, tag, ownerId required" }); return; }
  const [existing] = await db.select().from(guildsTable).where(eq(guildsTable.name, name));
  if (existing) { res.status(409).json({ error: "Guild name already taken" }); return; }
  const [guild] = await db.insert(guildsTable).values({ name, tag, description, logoUrl, ownerId }).returning();
  await db.insert(guildMembersTable).values({ guildId: guild.id, userId: ownerId, role: "owner" });
  res.status(201).json(guild);
});

router.post("/guilds/:id/join", async (req, res) => {
  const guildId = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const [existing] = await db.select().from(guildMembersTable)
    .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)));
  if (existing) { res.status(409).json({ error: "Already a member" }); return; }
  const [member] = await db.insert(guildMembersTable).values({ guildId, userId }).returning();
  const count = await db.select().from(guildMembersTable).where(eq(guildMembersTable.guildId, guildId));
  await db.update(guildsTable).set({ memberCount: count.length }).where(eq(guildsTable.id, guildId));
  res.status(201).json(member);
});

router.post("/guilds/:id/leave", async (req, res) => {
  const guildId = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  await db.delete(guildMembersTable)
    .where(and(eq(guildMembersTable.guildId, guildId), eq(guildMembersTable.userId, userId)));
  const remaining = await db.select().from(guildMembersTable).where(eq(guildMembersTable.guildId, guildId));
  if (remaining.length === 0) {
    await db.delete(guildsTable).where(eq(guildsTable.id, guildId));
  } else {
    await db.update(guildsTable).set({ memberCount: remaining.length }).where(eq(guildsTable.id, guildId));
  }
  res.json({ success: true });
});

router.get("/users/:id/guilds", async (req, res) => {
  const userId = parseInt(req.params.id);
  const memberships = await db.select().from(guildMembersTable).where(eq(guildMembersTable.userId, userId));
  if (memberships.length === 0) { res.json([]); return; }
  const guildIds = memberships.map(m => m.guildId);
  const guilds = await db.select().from(guildsTable);
  res.json(guilds.filter(g => guildIds.includes(g.id)).map(g => ({
    ...g,
    role: memberships.find(m => m.guildId === g.id)?.role,
  })));
});

export default router;
