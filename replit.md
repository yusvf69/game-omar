# GamingOS Platform

A comprehensive gaming ecosystem — Game Store, User Accounts, Subscriptions, and Admin Panel — built as a full-stack React+Vite + Express API with PostgreSQL/Drizzle ORM.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/gaming-os run dev` — run the frontend (port 18317, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4, wouter (routing), TanStack Query
- API: Express 5, contract-first with OpenAPI + Orval codegen
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema: games, users, subscriptions, reviews, wishlist, achievements
- `lib/api-spec/` — OpenAPI spec (source of truth for the API contract)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation
- `artifacts/api-server/src/routes/` — All backend route handlers
- `artifacts/gaming-os/src/pages/` — All frontend pages
- `artifacts/gaming-os/src/components/` — Layout, GameCard, shared UI
- `artifacts/gaming-os/src/index.css` — Dark gaming theme (electric blue + deep near-black)

## Architecture decisions

- **Contract-first API**: OpenAPI spec defines the contract; Orval generates hooks + Zod schemas so server and client are always in sync.
- **Demo user**: `DEMO_USER_ID = 1` is hardcoded as the "current user" throughout the frontend (no auth in V1).
- **Subscription tiers**: `free / basic / premium / vip` — stored on both games and users; games are gated by tier.
- **Mutation shapes** (Orval convention): mutations receive `{ id: number; data: Body }` (not `{ params, data }`). Path params are top-level beside `data`.
- **Select components**: Radix UI Select.Item cannot have empty string values — use `"__all__"` as the sentinel for "no filter" and convert to `undefined` before passing to the API.

## Product

- **Store** — Featured hero game, trending/new-release grids, category browser, live stats bar
- **Game Library** — Searchable, sortable, filterable grid of all games
- **Game Detail** — Full game page with metadata, reviews, wishlist add, play button
- **Subscriptions** — Four-tier pricing page (Free/Basic/Premium/VIP) with monthly/yearly toggle
- **Profile** — User stats (XP, level, playtime, achievements), progress bar, achievement list
- **Achievements** — Full achievement catalog filterable by rarity (common/rare/epic/legendary)
- **Wishlist** — Personal saved games list with remove
- **Admin Dashboard** — Revenue area chart, subscription breakdown pie chart, top games table, platform stats
- **Admin Games** — CRUD table for all games (create, edit, delete)
- **Admin Users** — User table with ban/unban
- **Admin Subscriptions** — Subscription table with status management

## User preferences

_None set yet._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing the OpenAPI spec before running typecheck.
- Run `pnpm --filter @workspace/db run push` after changing any DB schema file.
- The `features` column in `subscription_plans` is a PostgreSQL text array — use `{"item1","item2"}` syntax in raw SQL, not JSON.
- Drizzle `numeric` columns come back as strings from the DB driver — call `Number(...)` on `price` and `rating` fields when using them.
- `listGames` query returns items typed as `ListGamesQueryResult[number]` — there is no standalone `ListGamesResponseItem` export.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
