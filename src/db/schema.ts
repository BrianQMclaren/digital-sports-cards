import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  jsonb,
  integer,
  uuid,
  unique,
} from "drizzle-orm/pg-core";

// 1. Users
export const usersTable = pgTable("usersTable", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  username: text("username").unique().notNull(),
  virtualBalance: doublePrecision("virtual_balance").default(1000.0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// 2. Players (The Athletes & Multi-Sport Stats)
export const playersTable = pgTable("playersTable", {
  id: uuid("id").primaryKey().defaultRandom(),
  ballDontLieId: integer("ball_dont_lie_id").notNull().unique(), // Using IDs from Sports API (e.g. BallDontLie)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  sport: text("sport").notNull(), // "NBA", "MLB", "NFL"

  // Core Stats for NBA (Can be null for other sports)
  pointsPerGame: doublePrecision("ppg").default(0.0),
  reboundsPerGame: doublePrecision("rpg").default(0.0),
  assistsPerGame: doublePrecision("apg").default(0.0),
  stealsPerGame: doublePrecision("spg").default(0.0),
  gamesPlayed: integer("games_played").default(0),

  // Dynamic Valuation & AI Insights
  heatCheckScore: doublePrecision("heat_check_score").default(50.0),
  currentPrice: doublePrecision("current_price").notNull().default(0.0),
  latestInsight: text("latest_insight"),
  performanceContext: jsonb("performance_context"), // Detailed game logs
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// 3. Cards (The Ownership Link)
export const cardsTable = pgTable(
  "cardsTable",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    playerId: uuid("player_id")
      .references(() => playersTable.id)
      .notNull(),
    buyPrice: doublePrecision("buy_price").notNull(),
    mintedAt: timestamp("minted_at").defaultNow(),
  },
  (t) => ({
    userPlayerUnique: unique("cards_user_player_unique").on(
      t.userId,
      t.playerId,
    ),
  }),
);
