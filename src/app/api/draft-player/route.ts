import db from "@/db";
import { cardsTable, playersTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "You are not logged in" });

  const body = await req.json();
  const playerWhere = eq(playersTable.id, body.playerId);
  const player = await db.query.playersTable.findFirst({
    where: playerWhere,
  });
  if (!player) return NextResponse.json({ message: "Player not found" });
  await db.insert(cardsTable).values({
    userId: user.id,
    playerId: player.id,
    buyPrice: player.currentPrice,
  });
  return NextResponse.json({ success: true });
}
