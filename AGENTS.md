# HeatCheck

NBA player trading game. Users sign up with a $1,000 virtual balance, draft player cards at the player's current price, and track ROI as prices move. Prices are driven by a Heat Score recalculated nightly from BallDontLie game stats.

Architecture, decisions, and roadmap: see `docs/architecture.md`.

Issues are tracked in GitHub Issues. Use the `gh` CLI to read them.

## Stack

- Next.js 16 (App Router), React 19.2, React Compiler enabled
- TypeScript (strict), path alias `@/*` → `src/*`
- PostgreSQL on Neon, Drizzle ORM via `drizzle-orm/neon-http`
- Zod 4 + drizzle-zod for validation and DB types
- Auth: custom JWT (jose, HS256, 7-day expiry) in an httpOnly `auth_token` cookie; passwords hashed with argon2
- UI: Tailwind CSS v4, shadcn/ui (`radix-ui` package), lucide-react, Framer Motion
- Vercel Cron for data sync
- Package manager: pnpm

## Commands

- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm exec tsc --noEmit`
- Generate migration from schema: `pnpm db:generate`
- Apply migrations: `pnpm db:migrate`
- Seed: `pnpm seed`
- No test runner is installed. Don't write or run tests unless the task is to set one up.

## Structure

- `src/app/` pages: `/` landing, `(auth)/signin`, `(auth)/signup`, `/dashboard`, `/draft`
- `src/app/api/draft-player/route.ts` POST, drafts a player for the current user
- `src/app/api/load-players/route.ts` and `src/app/api/cron/update-games/route.ts` cron jobs (GET)
- `src/actions/auth.ts` server actions: sign in, sign up, sign out
- `src/actions/players.ts`, `src/actions/playerStats.ts` BallDontLie fetch helpers (not server actions)
- `src/db/schema.ts` tables: usersTable, playersTable, gamesTable, cardsTable
- `src/lib/dal.ts` DB read helpers (getCurrentUser, getCardsForUser, getMarketPlayers, ...)
- `src/lib/auth.ts` JWT and cookie helpers
- `src/lib/calculateStats.ts` Heat Score, price, heat tiers, ROI
- `src/lib/types.ts` Zod schemas for BallDontLie responses and inferred DB types
- `src/proxy.ts` Next 16 proxy (formerly middleware): auth redirects for `/dashboard` and auth pages
- `src/components/ui/` shadcn components

## Domain Rules

- Heat Score: average over the player's last 5 games of `pts*1.0 + reb*0.8 + ast*0.8 + stl*1.2`, divided by BASELINE (17), times 50, rounded, min 0. 50 = average NBA player.
- Price: `250 * (score / 50)`, floor of 50.
- Tiers: score >= 60 is hot ("SURGING"), >= 40 neutral, below 40 cold.
- A user can own at most one card per player (`cards_user_player_unique`).

## Conventions

- DB reads go in `src/lib/dal.ts`. Don't query the DB directly from pages or components.
- Server Components for data loading. Add `"use client"` only for interactivity.
- Validate all user input and external API data with Zod before using it.
- Prefer named exports.
- Formatting follows Prettier defaults (`.prettierrc` is `{}`): double quotes, semicolons, 2-space indent.
- Use existing components in `src/components/ui/` before writing custom ones.

## Auth Rules

- `src/proxy.ts` does NOT run on `/api/*` routes. Every route handler and server action must check auth itself with `getCurrentUser()` or `getAuthPayload()`.
- Cron routes authenticate with `Authorization: Bearer ${CRON_SECRET}`. Never remove that check.
- Never write new JWT or cookie logic. Use `src/lib/auth.ts`.
- Never expose `process.env` values to client components.

## Database Rules

- Schema changes: edit `src/db/schema.ts`, then run `pnpm db:generate`. Never hand-edit or delete files in `drizzle/`.
- The `neon-http` driver does not support `db.transaction()`. If a task needs multiple writes to succeed or fail together (e.g. deduct balance + create card), stop and flag it instead of writing non-atomic code.
- Never run migrations against production.

## Env Vars (names only)

DATABASE_URL, JWT_SECRET, BALLDONTLIE_API_KEY, CRON_SECRET

## Before Finishing Any Task

- Run `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build`. Fix failures before saying you're done.
- Keep changes scoped to the task. No unrelated refactors.
