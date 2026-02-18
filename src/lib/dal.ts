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
      buyPrice: cardsTable.buyPrice,
      firstName: playersTable.firstName,
      lastName: playersTable.lastName,
      heatScore: playersTable.heatCheckScore,
      currentPrice: playersTable.currentPrice,
    })
    .from(cardsTable)
    .innerJoin(playersTable, eq(cardsTable.playerId, playersTable.id))
    .where(eq(cardsTable.userId, userId));
  return cards;
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
