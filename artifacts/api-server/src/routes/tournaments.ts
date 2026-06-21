import { Router } from "express";
import { db } from "@workspace/db";
import { tournamentsTable, tournamentParticipantsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/tournaments", async (req, res) => {
  const tournaments = await db.select().from(tournamentsTable).orderBy(desc(tournamentsTable.startDate));
  res.json(tournaments.map(t => ({ ...t, prizePool: Number(t.prizePool) })));
});

router.get("/tournaments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [t] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, id));
  if (!t) { res.status(404).json({ error: "Tournament not found" }); return; }
  const participants = await db.select({
    id: tournamentParticipantsTable.id,
    userId: tournamentParticipantsTable.userId,
    rank: tournamentParticipantsTable.rank,
    score: tournamentParticipantsTable.score,
    username: usersTable.username,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
  }).from(tournamentParticipantsTable)
    .leftJoin(usersTable, eq(tournamentParticipantsTable.userId, usersTable.id))
    .where(eq(tournamentParticipantsTable.tournamentId, id));
  res.json({ ...t, prizePool: Number(t.prizePool), participants });
});

router.post("/tournaments/:id/join", async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const [p] = await db.insert(tournamentParticipantsTable).values({ tournamentId, userId }).returning();
  await db.update(tournamentsTable)
    .set({ currentParticipants: db.$count(tournamentParticipantsTable, eq(tournamentParticipantsTable.tournamentId, tournamentId)) as unknown as number })
    .where(eq(tournamentsTable.id, tournamentId));
  res.status(201).json(p);
});

router.get("/leaderboard", async (req, res) => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    displayName: usersTable.displayName,
    avatarUrl: usersTable.avatarUrl,
    level: usersTable.level,
    xp: usersTable.xp,
    subscriptionPlan: usersTable.subscriptionPlan,
  }).from(usersTable).orderBy(desc(usersTable.xp)).limit(50);
  res.json(users.map((u, i) => ({ ...u, rank: i + 1 })));
});

export default router;
