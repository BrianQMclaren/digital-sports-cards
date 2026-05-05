import db from "@/db";
import { cache } from "react";
import { cardsTable, playersTable, usersTable } from "@/db/schema";
import { getAuthPayload } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
    .where(eq(cardsTable.userId, userId));
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
