import db from "@/db";
import { cardsTable, playersTable, usersTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { and, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

const DraftPlayerBodySchema = z.object({
  playerId: z.uuid(),
});

function postgresErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (typeof code === "string") return code;
  }
  if (error instanceof Error) {
    return postgresErrorCode(error.cause);
  }
  return undefined;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "You are not logged in" },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
  }

  const parsed = DraftPlayerBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
  }

  let result:
    | { status: "not_found" }
    | { status: "insufficient_funds" }
    | { status: "ok"; balance: number | null };
  try {
    result = await db.transaction(async (tx) => {
      const player = await tx.query.playersTable.findFirst({
        where: eq(playersTable.id, parsed.data.playerId),
      });
      if (!player) return { status: "not_found" as const };

      // Conditional update: Postgres locks the row and re-checks the balance,
      // so concurrent drafts can't both pass the affordability check.
      const [updated] = await tx
        .update(usersTable)
        .set({
          virtualBalance: sql`${usersTable.virtualBalance} - ${player.currentPrice}`,
        })
        .where(
          and(
            eq(usersTable.id, user.id),
            gte(usersTable.virtualBalance, player.currentPrice),
          ),
        )
        .returning({ virtualBalance: usersTable.virtualBalance });
      if (!updated) return { status: "insufficient_funds" as const };

      // A duplicate card throws here and rolls back the balance deduction.
      await tx.insert(cardsTable).values({
        userId: user.id,
        playerId: player.id,
        buyPrice: player.currentPrice,
      });

      return { status: "ok" as const, balance: updated.virtualBalance };
    });
  } catch (error) {
    if (postgresErrorCode(error) === "23505") {
      return NextResponse.json(
        { error: "You already own this player" },
        { status: 409 },
      );
    }
    throw error;
  }

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }
  if (result.status === "insufficient_funds") {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, balance: result.balance });
}
