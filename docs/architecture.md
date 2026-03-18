# 🏀 HeatCheck: System Design & Architecture

Status: MVP (60% Complete)

## Tech Stack Overview

### Core Tech Stack

- Framework: Next.js 16 (App Router)
- Database: PostgreSQL (via Neon Serverless)
- ORM: Drizzle ORM (Type-safe SQL)
- Authentication: Custom JWT-based Auth using jose and httpOnly cookies.
- UI/UX: Shadcn/UI, Radix UI, Tailwind CSS, and Framer Motion.
- Automation: Vercel Cron Jobs for data synchronization.

### Database Design (Drizzle-Zod)

Structured for relational integrity and future AI-driven analytics.

- usersTable: Manages authentication, identity, and virtual currency balances.
- playersTable: The "Source of Truth." Uses a jsonb field for flexible performance context.
- cardsTable: A junction table linking Users and Players. Tracks buyPrice to calculate real-time ROI.
- gamesTable: Historical logs that serve as the dataset for future AI trend analysis.

### Architectural Decisions ("The Why")

#### Server-First Architecture (Server Actions)

Centralized all business logic and DB mutations within Next.js Server Actions.

**Why**: This significantly reduces the Client-side JS bundle and removes the overhead of maintaining a separate REST API layer. By keeping mutations on the server, I ensure sensitive database logic is never exposed to the client.

#### Drizzle ORM vs. Prisma

Migrated from Prisma to Drizzle ORM.

**Why**: In a serverless environment (Vercel), cold starts are a major bottleneck. Drizzle has zero dependencies and no heavy Rust-binary overhead. It allows me to write type-safe SQL queries that handle complex relational joins (e.g., playersTable to gamesTable) with near-zero latency.

#### Hand-Rolled Security (Custom JWT)

Avoided 3rd-party "black box" auth for a custom jose implementation.

**Why**: I wanted full control over the session lifecycle. By using httpOnly, secure, and SameSite: Strict cookies, the app is natively protected against XSS and CSRF attacks, ensuring high-security standards for a trading platform.

#### Automated Data Ingestion (Cron Jobs)

Nightly synchronization via Vercel Cron.

**Why**: Real-time polling is expensive and unnecessary for daily stats. By scheduling a job at 10:00 AM UTC, the system fetches the latest data from the BallDontLie API, recalculates "HeatCheck Scores," and updates player valuations before the peak daily traffic.

### Performance & Optimization

#### List Virtualization

**Problem**: DOM lag when rendering 500+ athlete cards.

**Solution**: Implementing virtualization to render only the components within the user's viewport, maintaining 60FPS scrolling.

#### Database Branching

**Feature**: Neon Database Branching.

**Why**: I can instantly branch my production DB to a preview environment. This allows me to test destructive schema migrations or complex Cron scripts without risking production data.

#### Accessibility-First UI

**Tools**: Shadcn/UI & Radix UI.

**Why**: These tools provide WCAG-compliant primitives (Cards, Inputs). This allows me to focus on the trading logic and data visualization while knowing the UI is accessible to all users.

## Product Roadmap

[ ] Player Search: Fuzzy search implementation via database indexing.

[ ] Marketplace logic: Full Buy/Sell functionality with virtual balance validation.

[ ] Real-time Stats: Integrating WebSockets for live-game stat tracking.

[ ] AI Insights: Leveraging OpenAI to generate "Scouting Reports" based on gamesTable data.

[ ] Comparison Mode: Side-by-side performance charting for athletes.
