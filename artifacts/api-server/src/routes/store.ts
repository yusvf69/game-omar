import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable, usersTable, subscriptionsTable, reviewsTable } from "@workspace/db";
import { eq, count, avg, desc, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/store/summary", async (_req, res) => {
  const [gamesCount] = await db.select({ count: count() }).from(gamesTable);
  const [usersCount] = await db.select({ count: count() }).from(usersTable);
  const [activeSubs] = await db.select({ count: count() }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const [avgRating] = await db.select({ avg: avg(gamesTable.rating) }).from(gamesTable);

  const categories = await db.select({ category: gamesTable.category }).from(gamesTable);
  const uniqueCategories = new Set(categories.map(c => c.category)).size;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const [newReleases] = await db.select({ count: count() }).from(gamesTable)
    .where(gte(gamesTable.releaseDate, oneWeekAgo.toISOString().split("T")[0]));

  res.json({
    totalGames: gamesCount.count,
    totalUsers: usersCount.count,
    activeSubscribers: activeSubs.count,
    categories: uniqueCategories,
    newReleasesCount: newReleases.count,
    averageRating: Number(avgRating.avg ?? 0),
  });
});

router.get("/admin/dashboard", async (_req, res) => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalGames] = await db.select({ count: count() }).from(gamesTable);
  const [activeSubs] = await db.select({ count: count() }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const [bannedUsers] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.status, "banned"));
  const [pendingReviews] = await db.select({ count: count() }).from(reviewsTable);

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalDownloads] = await db.select({ sum: sql<number>`sum(downloads)` }).from(gamesTable);

  const allSubs = await db.select({ price: subscriptionsTable.price }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const totalRevenue = allSubs.reduce((sum, s) => sum + Number(s.price), 0) * 12;

  const recentUsers = await db.select().from(usersTable)
    .where(gte(usersTable.createdAt, weekAgo))
    .orderBy(desc(usersTable.createdAt));

  res.json({
    totalUsers: totalUsers.count,
    totalGames: totalGames.count,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    activeSubscriptions: activeSubs.count,
    newUsersToday: recentUsers.filter(u => u.createdAt.toISOString().split("T")[0] === today).length,
    newUsersThisWeek: recentUsers.length,
    downloads: Number(totalDownloads.sum ?? 0),
    bannedUsers: bannedUsers.count,
    pendingReviews: pendingReviews.count,
    churnRate: 3.2,
  });
});

router.get("/admin/revenue", async (_req, res) => {
  const allSubs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));

  const byPlan: Record<string, { revenue: number; subscribers: number }> = {};
  for (const sub of allSubs) {
    const plan = sub.plan;
    if (!byPlan[plan]) byPlan[plan] = { revenue: 0, subscribers: 0 };
    byPlan[plan].revenue += Number(sub.price) * 12;
    byPlan[plan].subscribers += 1;
  }

  const totalRevenue = Object.values(byPlan).reduce((s, p) => s + p.revenue, 0);
  const totalMonthly = totalRevenue / 12;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const recentMonths = months.map((month, i) => ({
    month,
    revenue: Math.round((totalMonthly * (0.7 + i * 0.06)) * 100) / 100,
    newSubscribers: Math.round(allSubs.length * (0.1 + i * 0.02)),
  }));

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    monthlyRevenue: Math.round(totalMonthly * 100) / 100,
    yearlyRevenue: Math.round(totalRevenue * 100) / 100,
    byPlan: Object.entries(byPlan).map(([plan, data]) => ({
      plan,
      revenue: Math.round(data.revenue * 100) / 100,
      subscribers: data.subscribers,
    })),
    recentMonths,
  });
});

router.get("/admin/subscriptions/breakdown", async (_req, res) => {
  const allSubs = await db.select({ plan: subscriptionsTable.plan }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const total = allSubs.length;

  const counts: Record<string, number> = {};
  for (const s of allSubs) counts[s.plan] = (counts[s.plan] ?? 0) + 1;

  const colors: Record<string, string> = {
    free: "#6b7280",
    basic: "#60a5fa",
    premium: "#a78bfa",
    vip: "#fbbf24",
  };

  res.json(
    Object.entries(counts).map(([plan, count]) => ({
      plan,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[plan] ?? "#6b7280",
    }))
  );
});

router.get("/admin/top-games", async (_req, res) => {
  const games = await db.select().from(gamesTable).orderBy(desc(gamesTable.rating), desc(gamesTable.downloads)).limit(10);
  res.json(games.map(g => ({ ...g, price: Number(g.price), rating: Number(g.rating) })));
});

export default router;
