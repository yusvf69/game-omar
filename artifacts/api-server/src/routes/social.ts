import { Router } from "express";
import { db } from "@workspace/db";
import { friendshipsTable, messagesTable, eventsTable, usersTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";

const router = Router();

router.get("/social/friends/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const friendships = await db.select().from(friendshipsTable)
    .where(or(eq(friendshipsTable.userId1, userId), eq(friendshipsTable.userId2, userId)));
  const friendIds = friendships.map(f => f.userId1 === userId ? f.userId2 : f.userId1);
  if (friendIds.length === 0) { res.json([]); return; }
  const friends = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    displayName: usersTable.displayName,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
    xp: usersTable.xp,
    subscriptionPlan: usersTable.subscriptionPlan,
    lastLoginAt: usersTable.lastLoginAt,
  }).from(usersTable);
  const friendData = friends.filter(u => friendIds.includes(u.id));
  res.json(friendData.map(f => ({
    ...f,
    status: Math.random() > 0.5 ? "online" : "offline",
    currentGame: null,
  })));
});

router.post("/social/friends", async (req, res) => {
  const { userId1, userId2 } = req.body;
  if (!userId1 || !userId2) { res.status(400).json({ error: "userId1 and userId2 required" }); return; }
  const [existing] = await db.select().from(friendshipsTable).where(
    or(
      and(eq(friendshipsTable.userId1, userId1), eq(friendshipsTable.userId2, userId2)),
      and(eq(friendshipsTable.userId1, userId2), eq(friendshipsTable.userId2, userId1))
    )
  );
  if (existing) { res.status(409).json({ error: "Already friends or pending" }); return; }
  const [f] = await db.insert(friendshipsTable).values({ userId1, userId2, status: "accepted" }).returning();
  res.status(201).json(f);
});

router.delete("/social/friends/:userId1/:userId2", async (req, res) => {
  const userId1 = parseInt(req.params.userId1);
  const userId2 = parseInt(req.params.userId2);
  await db.delete(friendshipsTable).where(
    or(
      and(eq(friendshipsTable.userId1, userId1), eq(friendshipsTable.userId2, userId2)),
      and(eq(friendshipsTable.userId1, userId2), eq(friendshipsTable.userId2, userId1))
    )
  );
  res.json({ success: true });
});

router.get("/social/events", async (req, res) => {
  const events = await db.select().from(eventsTable).orderBy(desc(eventsTable.startsAt));
  res.json(events);
});

router.get("/social/messages/:userId/:peerId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const peerId = parseInt(req.params.peerId);
  const messages = await db.select().from(messagesTable)
    .where(
      or(
        and(eq(messagesTable.fromUserId, userId), eq(messagesTable.toUserId, peerId)),
        and(eq(messagesTable.fromUserId, peerId), eq(messagesTable.toUserId, userId))
      )
    ).orderBy(desc(messagesTable.createdAt)).limit(50);
  res.json(messages.reverse());
});

router.get("/social/conversations/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const msgs = await db.select().from(messagesTable)
    .where(or(eq(messagesTable.fromUserId, userId), eq(messagesTable.toUserId, userId)))
    .orderBy(desc(messagesTable.createdAt));

  const peerMap = new Map<number, { peerId: number; lastMessage: string; lastTime: string; unread: number }>();
  for (const m of msgs) {
    const peer = m.fromUserId === userId ? m.toUserId : m.fromUserId;
    if (!peerMap.has(peer)) {
      peerMap.set(peer, {
        peerId: peer,
        lastMessage: m.content,
        lastTime: m.createdAt.toISOString(),
        unread: m.fromUserId !== userId && m.toUserId === userId ? 1 : 0,
      });
    } else {
      const entry = peerMap.get(peer)!;
      if (m.fromUserId !== userId && m.toUserId === userId) entry.unread += 1;
    }
  }

  const allUsers = await db.select({ id: usersTable.id, username: usersTable.username, displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl, level: usersTable.level })
    .from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const result = [...peerMap.values()].map(c => ({
    ...c,
    user: userMap.get(c.peerId) ?? null,
  })).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

  res.json(result);
});

router.post("/social/messages", async (req, res) => {
  const { fromUserId, toUserId, content } = req.body;
  if (!fromUserId || !toUserId || !content) { res.status(400).json({ error: "fromUserId, toUserId, content required" }); return; }
  const [m] = await db.insert(messagesTable).values({ fromUserId, toUserId, content }).returning();
  res.status(201).json(m);
});

export default router;
