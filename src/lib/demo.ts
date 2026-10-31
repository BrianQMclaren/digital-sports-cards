import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import { desc, eq, isNotNull } from "drizzle-orm";
import db from "@/db/index";
import { cardsTable, playersTable, usersTable } from "@/db/schema";
import { STARTING_BALANCE } from "@/lib/calculateStats";

export const DEMO_EMAIL = "demo@heatcheck.app";
export const DEMO_USERNAME = "demo";

const DEMO_MAX_CARDS = 4;
const DEMO_MAX_SPEND = 850;

// Wipes the shared demo account and re-seeds it with a starter portfolio.
// Creates the demo user if it doesn't exist. Returns the demo user's id.
export async function resetDemoAccount(): Promise<string> {
  // Hash outside the transaction: argon2 is slow and doesn't need the lock.
  // The password is random and never stored, so nobody can sign in with it.
  const passwordHash = await argon2.hash(randomBytes(32).toString("hex"));

  return db.transaction(async (tx) => {
    // onConflictDoNothing: two first-time visitors may race to create it.
    await tx
      .insert(usersTable)
      .values({
        firstName: "Demo",
        lastName: "Trader",
        username: DEMO_USERNAME,
        email: DEMO_EMAIL,
        passwordHash,
      })
      .onConflictDoNothing({ target: usersTable.email });

    const [demoUser] = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, DEMO_EMAIL));
    if (!demoUser) throw new Error("Demo user could not be created");

    await tx.delete(cardsTable).where(eq(cardsTable.userId, demoUser.id));

    const candidates = await tx
      .select({ id: playersTable.id, currentPrice: playersTable.currentPrice })
      .from(playersTable)
      .where(isNotNull(playersTable.previousPrice))
      .orderBy(desc(playersTable.heatCheckScore))
      .limit(DEMO_MAX_CARDS);

    // Stop at the first player that would push the total over the cap.
    const picks: typeof candidates = [];
    let totalSpent = 0;
    for (const player of candidates) {
      if (totalSpent + player.currentPrice > DEMO_MAX_SPEND) break;
      picks.push(player);
      totalSpent += player.currentPrice;
    }

    if (picks.length > 0) {
      await tx.insert(cardsTable).values(
        picks.map((player) => ({
          userId: demoUser.id,
          playerId: player.id,
          buyPrice: player.currentPrice,
        })),
      );
    }

    await tx
      .update(usersTable)
      .set({ virtualBalance: STARTING_BALANCE - totalSpent })
      .where(eq(usersTable.id, demoUser.id));

    return demoUser.id;
  });
}
