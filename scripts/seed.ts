import "dotenv/config";
import { hash } from "argon2";
import { eq, and } from "drizzle-orm";

// IMPORTANT: use relative imports from /scripts
import db from "../src/db";
import { usersTable, playersTable, cardsTable } from "../src/db/schema";

async function seed() {
  // Safety guard: don’t seed prod by accident
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run seed in production.");
  }

  console.log("Seeding...");

  // 1) Ensure players exist
  const players = await db
    .select({
      id: playersTable.id,
      firstName: playersTable.firstName,
      lastName: playersTable.lastName,
    })
    .from(playersTable)
    .limit(10);

  if (players.length === 0) {
    throw new Error(
      "No players found. Load players first (your load-players step).",
    );
  }

  // 2) Create or find a test user
  const email = "test@example.com";
  const username = "testuser";

  const existingUser = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  let userId: string;

  if (existingUser.length) {
    userId = existingUser[0].id;
    console.log("User exists:", email);
  } else {
    const passwordHash = await hash("Password123");

    const inserted = await db
      .insert(usersTable)
      .values({
        firstName: "Test",
        lastName: "User",
        email,
        username,
        passwordHash,
        // virtualBalance defaults to 1000.0
      })
      .returning({ id: usersTable.id });

    userId = inserted[0].id;
    console.log("Created user:", email);
  }

  // 3) Seed a few cards for that user (no duplicates)
  // Pick the first N players and ensure we don't insert duplicates.
  const toSeed = players.slice(0, 5);

  for (const p of toSeed) {
    // If you don't have a unique constraint yet, do a manual check.
    const alreadyOwned = await db
      .select({ id: cardsTable.id })
      .from(cardsTable)
      .where(and(eq(cardsTable.userId, userId), eq(cardsTable.playerId, p.id)))
      .limit(1);

    if (alreadyOwned.length) {
      console.log(`Skip (already owned): ${p.firstName} ${p.lastName}`);
      continue;
    }

    // Buy price: simple deterministic-ish value so it's consistent across runs
    const buyPrice = 50 + Math.floor(Math.random() * 100); // 50..149

    await db.insert(cardsTable).values({
      userId,
      playerId: p.id,
      buyPrice,
    });

    console.log(`Added card: ${p.firstName} ${p.lastName} @ ${buyPrice}`);
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
