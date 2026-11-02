# HeatCheck

A stock market for NBA players. Draft player cards, and watch their prices move every night based on real game stats.

**Live demo:** https://heat-check-nu.vercel.app

Click **Try the Demo**, no sign-up needed.

![HeatCheck dashboard](docs/screenshot.png)

## How it works

- Every new account starts with a $1,000 virtual balance.
- Draft player cards at the player's current price, and sell them back at the current price whenever you like.
- Each player has a Heat Score based on their last 5 games: the average of `pts × 1.0 + reb × 0.8 + ast × 0.8 + stl × 1.2`, scaled so that 50 is an average NBA player.
- Price = 250 × (Heat Score / 50), with a $50 floor.
- Scores and prices update once a night, after the day's games finish.

See [docs/architecture.md](docs/architecture.md) for the full design.

## Engineering highlights

- **Atomic trades:** balance and card changes run in one database transaction with conditional updates, so double-clicks can't double-spend or double-sell.
- **Nightly data pipeline:** Vercel Cron pulls BallDontLie stats, recalculates scores and prices, and records the previous price for the Heat Index ticker.
- **Trade history:** sold cards are kept for realized profit history, with a partial unique index allowing one active card per player.
- **Shared demo account:** it resets before each nightly reprice, so visitors see real overnight gains and losses.
- **Custom JWT auth:** jose, httpOnly cookies, and argon2 password hashing.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, PostgreSQL on Neon, Drizzle ORM, Zod, Vercel.

## Roadmap

- AI scouting reports generated nightly from each player's last 5 games (in progress)
- Shareable result cards
- Market hours: trading closes from tip-off until prices update

## Run locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file with these variables (see `.env.example`):

   ```
   DATABASE_URL=
   JWT_SECRET=
   BALLDONTLIE_API_KEY=
   CRON_SECRET=
   ```

3. Apply migrations and start the dev server:

   ```bash
   pnpm db:migrate
   pnpm dev
   ```

4. Trigger the nightly jobs manually. Load players first, then update games (this also resets the demo account):

   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/load-players
   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/update-games
   ```
