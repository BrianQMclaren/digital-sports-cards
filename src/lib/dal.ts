import db from "@/db";
import { cache } from "react";
import { cardsTable, playersTable, usersTable } from "@/db/schema";
import { getAuthPayload } from "@/lib/auth";
import {
  and,
  desc,
  eq,
  gt,
  gte,
  isNotNull,
  isNull,
  max,
  ne,
} from "drizzle-orm";
import { calculatePriceChangePercent } from "@/lib/calculateStats";

export async function getCurrentUser() {
  const session = await getAuthPayload();
  if (!session?.userId) return null;
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.userId),
    });
    return user || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export const getCardsForUser = async (userId: string) => {
  const cards = await db
    .select({
      id: cardsTable.id,
      ballDontLieId: playersTable.ballDontLieId,
      buyPrice: cardsTable.buyPrice,
      firstName: playersTable.firstName,
      lastName: playersTable.lastName,
      pointsPerGame: playersTable.pointsPerGame,
      reboundsPerGame: playersTable.reboundsPerGame,
      assistsPerGame: playersTable.assistsPerGame,
      stealsPerGame: playersTable.stealsPerGame,
      heatCheckScore: playersTable.heatCheckScore,
      currentPrice: playersTable.currentPrice,
    })
    .from(cardsTable)
    .innerJoin(playersTable, eq(cardsTable.playerId, playersTable.id))
    .where(and(eq(cardsTable.userId, userId), isNull(cardsTable.soldAt)));
  return cards;
};

export const getMarketPlayers = async () => {
  const players = await db
    .select({
      id: playersTable.id,
      ballDontLieId: playersTable.ballDontLieId,
      firstName: playersTable.firstName,
      lastName: playersTable.lastName,
      pointsPerGame: playersTable.pointsPerGame,
      reboundsPerGame: playersTable.reboundsPerGame,
      assistsPerGame: playersTable.assistsPerGame,
      stealsPerGame: playersTable.stealsPerGame,
      heatCheckScore: playersTable.heatCheckScore,
      currentPrice: playersTable.currentPrice,
    })
    .from(playersTable);
  return players;
};

// Movers from the latest nightly update; 30 hours covers one cron run with slack.
const MOVER_WINDOW_MS = 30 * 60 * 60 * 1000;

export const getTopMovers = async (limit = 12) => {
  const players = await db
    .select({
      id: playersTable.id,
      lastName: playersTable.lastName,
      currentPrice: playersTable.currentPrice,
      previousPrice: playersTable.previousPrice,
      heatCheckScore: playersTable.heatCheckScore,
    })
    .from(playersTable)
    .where(
      and(
        gt(playersTable.previousPrice, 0),
        ne(playersTable.currentPrice, playersTable.previousPrice),
        gte(playersTable.lastUpdated, new Date(Date.now() - MOVER_WINDOW_MS)),
      ),
    );
  return players
    .map((player) => ({
      id: player.id,
      lastName: player.lastName,
      currentPrice: player.currentPrice,
      heatCheckScore: player.heatCheckScore,
      // previousPrice > 0 is guaranteed by the where clause.
      changePercent: calculatePriceChangePercent(
        player.currentPrice,
        player.previousPrice ?? 0,
      ),
    }))
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, limit);
};

export const getHottestPlayers = async (limit = 12) => {
  const players = await db
    .select({
      id: playersTable.id,
      lastName: playersTable.lastName,
      currentPrice: playersTable.currentPrice,
      heatCheckScore: playersTable.heatCheckScore,
    })
    .from(playersTable)
    .orderBy(desc(playersTable.heatCheckScore))
    .limit(limit);
  return players.map((player) => ({ ...player, changePercent: null }));
};

// Only the update-games cron sets previousPrice, so load-players inserts
// don't count as a price update.
export const getLastPriceUpdate = async () => {
  const [row] = await db
    .select({ lastUpdated: max(playersTable.lastUpdated) })
    .from(playersTable)
    .where(isNotNull(playersTable.previousPrice));
  return row?.lastUpdated ?? null;
};

export const getAllPlayers = async () => {
  const players = await db.query.playersTable.findMany();
  return players;
};

export const findUsername = cache(async (username: string) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.username, username.toLowerCase()),
  });
  return user;
});

export const findUserByEmail = cache(async (email: string) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email.toLowerCase()),
  });
  return user;
});
