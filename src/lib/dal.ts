import db from "@/db";
import { cache } from "react";
import { usersTable } from "@/db/schema";
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
