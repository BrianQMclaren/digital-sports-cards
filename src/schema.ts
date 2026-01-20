import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  jsonb,
  integer,
  serial,
} from "drizzle-orm/pg-core";

// 1. Users Profile
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
  virtualBalance: doublePrecision("virtual_balance").default(1000.0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Players (The Assets with Core Stats)
export const players = pgTable("players", {
  id: integer("id").primaryKey(), // API ID
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  sport: text("sport").notNull(),

  // --- Core Stats Columns ---
  pointsPerGame: doublePrecision("ppg").default(0.0),
  reboundsPerGame: doublePrecision("rpg").default(0.0),
  assistsPerGame: doublePrecision("apg").default(0.0),
  stealsPerGame: doublePrecision("spg").default(0.0),
  gamesPlayed: integer("games_played").default(0),
  // ---------------------------

  currentPrice: doublePrecision("current_price").default(0.0),
  latestInsight: text("latest_insight"),
  performanceContext: jsonb("performance_context"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// 3. Cards (Ownership)
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  playerId: integer("player_id").references(() => players.id),
  buyPrice: doublePrecision("buy_price").notNull(),
  mintedAt: timestamp("minted_at").defaultNow(),
});
