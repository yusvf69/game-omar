import { Router } from "express";
import { db } from "@workspace/db";
import { subscriptionsTable, subscriptionPlansTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListSubscriptionsQueryParams,
  CreateSubscriptionBody,
  GetSubscriptionParams,
  UpdateSubscriptionParams,
  UpdateSubscriptionBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/subscriptions/plans", async (_req, res) => {
  const plans = await db.select().from(subscriptionPlansTable).orderBy(subscriptionPlansTable.id);
  res.json(plans.map(p => ({
    ...p,
    monthlyPrice: Number(p.monthlyPrice),
    yearlyPrice: Number(p.yearlyPrice),
    adsEnabled: p.adsEnabled === "true",
    earlyAccess: p.earlyAccess === "true",
    prioritySupport: p.prioritySupport === "true",
  })));
});

router.get("/subscriptions", async (req, res) => {
  const query = ListSubscriptionsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: "Invalid query" }); return; }

  const rows = await db.select({
    sub: subscriptionsTable,
    username: usersTable.username,
  })
    .from(subscriptionsTable)
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .orderBy(desc(subscriptionsTable.createdAt));

  let filtered = rows;
  if (query.data.plan) filtered = filtered.filter(r => r.sub.plan === query.data.plan);
  if (query.data.status) filtered = filtered.filter(r => r.sub.status === query.data.status);

  res.json(filtered.map(r => ({
    ...r.sub,
    username: r.username ?? null,
    price: Number(r.sub.price),
  })));
});

router.post("/subscriptions", async (req, res) => {
  const body = CreateSubscriptionBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const prices: Record<string, Record<string, number>> = {
    free: { monthly: 0, quarterly: 0, yearly: 0 },
    basic: { monthly: 4.99, quarterly: 12.99, yearly: 39.99 },
    premium: { monthly: 9.99, quarterly: 26.99, yearly: 89.99 },
    vip: { monthly: 19.99, quarterly: 54.99, yearly: 179.99 },
  };
  const price = prices[body.data.plan]?.[body.data.billingCycle] ?? 0;

  const today = new Date().toISOString().split("T")[0];
  const [sub] = await db.insert(subscriptionsTable).values({
    userId: body.data.userId,
    plan: body.data.plan,
    billingCycle: body.data.billingCycle,
    price: price.toString(),
    startDate: today,
    status: "active",
  }).returning();

  await db.update(usersTable)
    .set({ subscriptionPlan: body.data.plan })
    .where(eq(usersTable.id, body.data.userId));

  res.status(201).json({ ...sub, price: Number(sub.price) });
});

router.get("/subscriptions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db.select({
    sub: subscriptionsTable,
    username: usersTable.username,
  })
    .from(subscriptionsTable)
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .where(eq(subscriptionsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  const r = rows[0];
  res.json({ ...r.sub, username: r.username ?? null, price: Number(r.sub.price) });
});

router.patch("/subscriptions/:id", async (req, res) => {
  const params = UpdateSubscriptionParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateSubscriptionBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [sub] = await db.update(subscriptionsTable).set(body.data).where(eq(subscriptionsTable.id, params.data.id)).returning();
  if (!sub) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...sub, price: Number(sub.price) });
});

export default router;
