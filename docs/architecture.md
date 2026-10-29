# 🏀 HeatCheck: System Design & Architecture

Status: MVP in progress

## What's Built

- Sign up, sign in, sign out (custom JWT auth)
- Landing page
- Draft Room player search (client-side, filters by name)
- Dashboard: user's holdings with current price, Heat Score, tier badge, and ROI
- Draft Room: list of all players, draft a card at current price (atomic balance check + deduction; unaffordable players show "Insufficient funds")
- Virtual balance shown on the dashboard and in the Draft Room
- Nightly data sync: player roster + game stats, Heat Score and price recalculation

## Not Built Yet

- Selling cards
- AI insights (`latestInsight` column exists but is unused)
- Comparison mode
- List virtualization

## Tech Stack Overview

- Framework: Next.js 16 (App Router), React 19.2, React Compiler
- Database: PostgreSQL on Neon (serverless WebSocket driver, supports transactions)
- ORM: Drizzle ORM + drizzle-zod
- Validation: Zod 4
- Authentication: Custom JWT with jose, httpOnly cookie, argon2 password hashing
- UI: shadcn/ui, Radix UI, Tailwind CSS v4, Framer Motion, lucide-react
- Automation: Vercel Cron Jobs
- Data source: BallDontLie API

## Database Design

- **usersTable:** Identity, argon2 password hash, and virtual balance (default 1,000).
- **playersTable:** Source of truth for each athlete: rolling stat averages, Heat Score, current price. `performanceContext` (jsonb) and `latestInsight` are reserved for future AI features.
- **gamesTable:** One row per player per game (points, rebounds, assists, steals). Indexed on player + date for fast "last 5 games" lookups. This is the dataset for future AI trend analysis.
- **cardsTable:** Links users to players. Stores `buyPrice` to calculate ROI against the player's current price. One card per user per player.

## Heat Score & Pricing

Defined in `src/lib/calculateStats.ts`.

- **Per-game raw score:** `pts × 1.0 + reb × 0.8 + ast × 0.8 + stl × 1.2`
- **Heat Score:** Average raw score over the last 5 games, divided by a baseline of 17, times 50. A score of 50 represents an average NBA player.
- **Price:** `250 × (Heat Score / 50)`, with a floor of 50.
- **Tiers:** 60+ is "Surging", 40 to 59 is "Neutral", below 40 is "Cold".

The baseline of 17 is an estimate and will be recalibrated once there's enough game data.

## Architectural Decisions ("The Why")

### Server-First Data Flow

Pages are Server Components that read through a data access layer (`src/lib/dal.ts`). Auth mutations use Server Actions. Drafting uses a route handler (`POST /api/draft-player`).

**Why:** Keeping reads and writes on the server keeps the client bundle small and keeps DB access in one place. Every Server Action and route handler is still a public endpoint, so each one checks auth and validates input on its own.

### Drizzle ORM vs. Prisma

Migrated from Prisma to Drizzle ORM.

**Why:** Drizzle is lightweight, which helps with cold starts on Vercel, and lets me write type-safe SQL, including window functions like the `ROW_NUMBER()` query that pulls each player's last 5 games in one round trip.

### Custom JWT Auth

Built on jose instead of a third-party auth provider.

**Why:** Full control over the session lifecycle and a chance to understand auth end to end. Passwords are hashed with argon2. Sessions are HS256 JWTs stored in an httpOnly cookie (secure in production) with a 7-day expiry. httpOnly keeps the token out of reach of client-side JavaScript. `src/proxy.ts` handles page-level redirects; API routes check auth individually.

**Known gaps:** No explicit `SameSite` setting (browsers default to Lax), no token revocation, no rate limiting on sign in.

### Automated Data Ingestion (Cron Jobs)

Two Vercel Cron jobs, both protected by a `CRON_SECRET` bearer token:

- **09:50 UTC, `/api/load-players`:** Pulls active players from BallDontLie and inserts any new ones.
- **10:00 UTC, `/api/cron/update-games`:** Fetches the previous day's stat lines, stores games for players who logged minutes, then recalculates each player's averages, Heat Score, and price from their last 5 games.

**Why:** Stats only change once a day, so a nightly batch is cheaper and simpler than polling. 10:00 UTC is roughly 5 to 6 AM ET, after games finish and before morning traffic.

## Accessibility

shadcn/ui and Radix provide accessible primitives, and player cards use `aria-label` and semantic `<dl>` stat lists. Custom visuals (card glow, animations) still need manual review, including `prefers-reduced-motion` support.

## Product Roadmap

- [ ] Marketplace: ~~deduct balance on draft, validate affordability~~ (done, via `db.transaction()`), add selling.
- [ ] Fuzzy Player Search: upgrade to typo-tolerant search with Postgres pg_trgm.
- [ ] Comparison Mode: side-by-side performance charts.
- [ ] AI Insights: generated scouting reports from `gamesTable` data.
- [ ] List Virtualization: for the Draft Room as the player list grows.
- [ ] Real-time Stats: live game tracking. Needs a non-serverless solution (e.g. Pusher, Ably) since Vercel functions can't hold WebSocket connections.
