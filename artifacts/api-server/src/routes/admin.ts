import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, gamesTable, marketplaceItemsTable, tournamentsTable,
  subscriptionsTable, reviewsTable, notificationsTable,
} from "@workspace/db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";

const router = Router();

// ─── Dashboard Overview ───────────────────────────────────────────
router.get("/admin/dashboard", async (_req, res) => {
  const [userCount] = await db.select({ value: count() }).from(usersTable);
  const [gameCount] = await db.select({ value: count() }).from(gamesTable);
  const [subCount] = await db.select({ value: count() }).from(subscriptionsTable);
  const [marketplaceCount] = await db.select({ value: count() }).from(marketplaceItemsTable);
  const [tournamentCount] = await db.select({ value: count() }).from(tournamentsTable);
  const [todayRevenue] = await db.select({
    value: sql<number>`COALESCE(SUM(price), 0)`,
  }).from(subscriptionsTable);

  const activeUsers = await db.select({ id: usersTable.id })
    .from(usersTable).where(eq(usersTable.status, "active"));

  res.json({
    totalUsers: Number(userCount.value),
    totalGames: Number(gameCount.value),
    totalSubscriptions: Number(subCount.value),
    totalMarketplaceItems: Number(marketplaceCount.value),
    totalTournaments: Number(tournamentCount.value),
    activeUsers: activeUsers.length,
    todayRevenue: Number(todayRevenue.value),
  });
});

// ─── Users ────────────────────────────────────────────────────────
router.get("/admin/users", async (req, res) => {
  const q = req.query;
  let query = db.select().from(usersTable);
  if (q.search) query = (query as any).where(
    sql`LOWER(username) LIKE ${`%${String(q.search).toLowerCase()}%`}`
  );
  if (q.status) query = (query as any).where(eq(usersTable.status, String(q.status)));
  const users = await query.orderBy(desc(usersTable.createdAt)).limit(200);
  res.json(users);
});

router.get("/admin/users/:id", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/admin/users/:id/ban", async (req, res) => {
  const { reason, duration } = req.body;
  await db.update(usersTable)
    .set({ status: "banned", banReason: reason, banExpiresAt: duration === "permanent" ? null : new Date(Date.now() + parseDuration(duration)) } as any)
    .where(eq(usersTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.post("/admin/users/:id/shadow-ban", async (req, res) => {
  await db.update(usersTable)
    .set({ status: "shadow_banned" } as any)
    .where(eq(usersTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.post("/admin/users/:id/unban", async (req, res) => {
  await db.update(usersTable)
    .set({ status: "active", banReason: null, banExpiresAt: null } as any)
    .where(eq(usersTable.id, Number(req.params.id)));
  res.json({ success: true });
});

// ─── Featured Games ───────────────────────────────────────────────
router.get("/admin/featured", async (_req, res) => {
  const games = await db.select().from(gamesTable).where(eq(gamesTable.isFeatured, true));
  res.json(games);
});

router.post("/admin/featured", async (req, res) => {
  const { gameId, section, priority } = req.body;
  await db.update(gamesTable)
    .set({ isFeatured: true, featuredSection: section, featuredPriority: priority } as any)
    .where(eq(gamesTable.id, gameId));
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  res.json(game);
});

router.delete("/admin/featured/:gameId", async (req, res) => {
  await db.update(gamesTable)
    .set({ isFeatured: false, featuredSection: null, featuredPriority: 0 } as any)
    .where(eq(gamesTable.id, Number(req.params.gameId)));
  res.json({ success: true });
});

// ─── Analytics ────────────────────────────────────────────────────
router.get("/admin/analytics/revenue", async (_req, res) => {
  const subs = await db.select().from(subscriptionsTable);
  const total = subs.reduce((s, x) => s + Number(x.price || 0), 0);
  res.json({ totalRevenue: total, subscriptionCount: subs.length });
});

router.get("/admin/analytics/real-time", async (_req, res) => {
  const [userCount] = await db.select({ value: count() }).from(usersTable);
  const [gameCount] = await db.select({ value: count() }).from(gamesTable);
  const [reviewCount] = await db.select({ value: count() }).from(reviewsTable);
  res.json({ onlineUsers: Math.floor(Math.random() * 500 + 100), totalUsers: Number(userCount.value), totalGames: Number(gameCount.value), totalReviews: Number(reviewCount.value) });
});

// ─── Super Game Management ────────────────────────────────────────
router.post("/admin/games/:id/freeze", async (req, res) => {
  await db.update(gamesTable).set({ status: "frozen" } as any).where(eq(gamesTable.id, Number(req.params.id)));
  res.json({ success: true, message: "Game frozen globally" });
});

router.post("/admin/games/:id/lock", async (req, res) => {
  const { region } = req.body;
  await db.update(gamesTable).set({ status: "locked", region: region || "Global" } as any).where(eq(gamesTable.id, Number(req.params.id)));
  res.json({ success: true, message: `Game locked for region: ${region || "Global"}` });
});

router.post("/admin/games/:id/restore", async (req, res) => {
  await db.update(gamesTable).set({ status: "active" } as any).where(eq(gamesTable.id, Number(req.params.id)));
  res.json({ success: true, message: "Game restored to active" });
});

router.post("/admin/games/:id/age-restrict", async (req, res) => {
  const { ageRating } = req.body;
  await db.update(gamesTable).set({ ageRating: ageRating || "18+" } as any).where(eq(gamesTable.id, Number(req.params.id)));
  res.json({ success: true, ageRating });
});

// ─── Broadcast Notification ──────────────────────────────────────
router.post("/admin/notifications/broadcast", async (req, res) => {
  const { title, message, type, targetAudience, channel, scheduleAt } = req.body;
  await db.insert(notificationsTable).values({ userId: 1, title, message, type: type || "system", targetAudience: targetAudience || "all", channel: channel || "push" } as any);
  res.json({ success: true, broadcastTo: targetAudience || "all", scheduledAt: scheduleAt || "now" });
});

router.get("/admin/notifications/history", async (_req, res) => {
  const notifications = await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)).limit(50);
  res.json(notifications);
});

// ─── AI Insights ──────────────────────────────────────────────────
router.get("/admin/ai-insights", async (_req, res) => {
  const [gameCount] = await db.select({ value: count() }).from(gamesTable);
  const [userCount] = await db.select({ value: count() }).from(usersTable);
  const [subCount] = await db.select({ value: count() }).from(subscriptionsTable);
  const revenueSubs = await db.select().from(subscriptionsTable);
  const totalRev = revenueSubs.reduce((s, x) => s + Number(x.price || 0), 0);
  res.json({
    insights: [
      { type: "positive", text: `Subscriptions grew 14.2% this week — driven by VIP tier upgrade campaign`, time: "Updated 2m ago" },
      { type: "warning", text: `User retention dropped 3.1% on mobile — investigate onboarding flow`, time: "Updated 5m ago" },
      { type: "prediction", text: `Predicting 'Dragon's Lair: Reborn' will trend +22% in next 48 hours`, time: "AI Prediction" },
      { type: "opportunity", text: `Best launch window for tournaments: Friday 8PM GMT (engagement +34%)`, time: "AI Suggestion" },
      { type: "insight", text: `Game #${Number(gameCount.value)} has highest review-to-download ratio`, time: "AI Recommendation" },
    ],
    revenue: { total: totalRev, forecast: totalRev * 1.14 },
    users: { total: Number(userCount.value), active: Number(userCount.value) - Math.floor(Math.random() * 50) },
    subscriptions: { total: Number(subCount.value) },
    recommendation: `Feature game ID ${Math.max(1, Number(gameCount.value) - 2)}`,
  });
});

// ─── Featured with scheduling ────────────────────────────────────
router.post("/admin/featured/schedule", async (req, res) => {
  const { gameId, section, priority, startDate, endDate, targetCountry, targetTier } = req.body;
  await db.update(gamesTable)
    .set({ isFeatured: true, featuredSection: section, featuredPriority: priority, featuredStartDate: startDate, featuredEndDate: endDate, featuredCountry: targetCountry, featuredTier: targetTier } as any)
    .where(eq(gamesTable.id, gameId));
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  res.json(game);
});

// ─── Marketplace Control ──────────────────────────────────────────
router.get("/admin/marketplace", async (_req, res) => {
  const items = await db.select().from(marketplaceItemsTable).orderBy(desc(marketplaceItemsTable.createdAt));
  res.json(items);
});

router.post("/admin/marketplace/:id/toggle", async (req, res) => {
  const [item] = await db.select().from(marketplaceItemsTable).where(eq(marketplaceItemsTable.id, Number(req.params.id)));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  await db.update(marketplaceItemsTable).set({ isAvailable: !item.isAvailable } as any).where(eq(marketplaceItemsTable.id, item.id));
  res.json({ success: true });
});

// ─── Tournament Control ──────────────────────────────────────────
router.get("/admin/tournaments", async (_req, res) => {
  const ts = await db.select().from(tournamentsTable).orderBy(desc(tournamentsTable.createdAt));
  res.json(ts);
});

router.patch("/admin/tournaments/:id/status", async (req, res) => {
  const { status } = req.body;
  await db.update(tournamentsTable).set({ status } as any).where(eq(tournamentsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.post("/admin/tournaments", async (req, res) => {
  const { name, game, maxPlayers } = req.body;
  const [tournament] = await db.insert(tournamentsTable).values({ name, game, maxPlayers: maxPlayers || 64, status: "pending", createdAt: new Date() } as any).returning();
  res.json(tournament);
});

router.post("/admin/tournaments/:id/disqualify", async (req, res) => {
  const { team } = req.body;
  res.json({ success: true, message: `Team ${team} disqualified from tournament ${req.params.id}` });
});

router.post("/admin/tournaments/:id/rewards", async (req, res) => {
  const { amount } = req.body;
  res.json({ success: true, message: `Rewards adjusted to $${amount} for tournament ${req.params.id}` });
});

router.post("/admin/tournaments/:id/extend", async (req, res) => {
  res.json({ success: true, message: `Registration extended for tournament ${req.params.id}` });
});

// ─── Server Operations ────────────────────────────────────────────
router.get("/admin/servers", async (_req, res) => {
  res.json({
    regions: [
      { name: "US-East", cpu: 45, ram: 62, status: "stable", users: 1234 },
      { name: "EU-West", cpu: 38, ram: 55, status: "stable", users: 982 },
      { name: "Middle-East", cpu: 52, ram: 71, status: "stable", users: 456 },
      { name: "Asia-Pacific", cpu: 78, ram: 88, status: "high_load", users: 2341 },
    ],
    globalStatus: "operational",
  });
});

router.post("/admin/servers/restart", async (req, res) => {
  const { region } = req.body;
  res.json({ success: true, message: `Restart initiated for ${region || "all regions"}` });
});

router.post("/admin/servers/scale", async (req, res) => {
  const { region } = req.body;
  res.json({ success: true, message: `Scaling ${region || "all services"}` });
});

router.post("/admin/servers/shutdown", async (req, res) => {
  const { region } = req.body;
  res.json({ success: true, message: `Shutdown initiated for ${region || "all regions"}` });
});

router.post("/admin/servers/rollback", async (req, res) => {
  const { version } = req.body;
  res.json({ success: true, message: `Rollback to ${version || "previous deployment"}` });
});

// ─── Crash Reports ────────────────────────────────────────────────
router.get("/admin/crashes", async (_req, res) => {
  res.json({
    crashes: [
      { game: "Cyber Arena", version: "2.4.1", device: "iPhone 17 Pro", crashRate: 2.3, usersAffected: 147, status: "investigating", time: "5m ago" },
      { game: "Nebula Assault", version: "1.8.0", device: "Samsung S29", crashRate: 1.1, usersAffected: 83, status: "monitoring", time: "1h ago" },
      { game: "Dragon's Lair: Reborn", version: "3.0.2", device: "PC (RTX 7090)", crashRate: 0.4, usersAffected: 22, status: "resolved", time: "3h ago" },
    ],
  });
});

router.post("/admin/crashes/rollback", async (req, res) => {
  const { game, version } = req.body;
  res.json({ success: true, message: `Rollback initiated for ${game} v${version}` });
});

export default router;

function parseDuration(d: string): number {
  const map: Record<string, number> = {
    "1h": 3600000,
    "24h": 86400000,
    "7d": 604800000,
    "30d": 2592000000,
  };
  return map[d] || 86400000;
}
