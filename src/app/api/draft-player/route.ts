import db from "@/db";
import { cardsTable, playersTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { eq } from "drizzle-orm";
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

  const player = await db.query.playersTable.findFirst({
    where: eq(playersTable.id, parsed.data.playerId),
  });
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  try {
    await db.insert(cardsTable).values({
      userId: user.id,
      playerId: player.id,
      buyPrice: player.currentPrice,
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

  return NextResponse.json({ success: true });
}
