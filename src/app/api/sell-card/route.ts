import db from "@/db";
import { cardsTable, playersTable, usersTable } from "@/db/schema";
import { calculateProfitValue } from "@/lib/calculateStats";
import { getCurrentUser } from "@/lib/dal";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

const SellCardBodySchema = z.object({
  cardId: z.uuid(),
  expectedPrice: z.number(),
});

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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = SellCardBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { cardId, expectedPrice } = parsed.data;

  const result:
    | { status: "not_found" }
    | { status: "price_changed" }
    | { status: "already_sold" }
    | {
        status: "ok";
        balance: number | null;
        sellPrice: number;
        profit: number;
      } = await db.transaction(async (tx) => {
    const [card] = await tx
      .select({
        buyPrice: cardsTable.buyPrice,
        currentPrice: playersTable.currentPrice,
      })
      .from(cardsTable)
      .innerJoin(playersTable, eq(cardsTable.playerId, playersTable.id))
      .where(
        and(
          eq(cardsTable.id, cardId),
          eq(cardsTable.userId, user.id),
          isNull(cardsTable.soldAt),
        ),
      );
    if (!card) return { status: "not_found" as const };

    // The user confirmed a specific price; don't sell at a different one.
    if (card.currentPrice !== expectedPrice) {
      return { status: "price_changed" as const };
    }

    // Conditional update: if a concurrent request already sold this card,
    // no row comes back and we skip the balance credit.
    const [sold] = await tx
      .update(cardsTable)
      .set({ soldAt: new Date(), sellPrice: card.currentPrice })
      .where(
        and(
          eq(cardsTable.id, cardId),
          eq(cardsTable.userId, user.id),
          isNull(cardsTable.soldAt),
        ),
      )
      .returning({ id: cardsTable.id });
    if (!sold) return { status: "already_sold" as const };

    const [updated] = await tx
      .update(usersTable)
      .set({
        virtualBalance: sql`${usersTable.virtualBalance} + ${card.currentPrice}`,
      })
      .where(eq(usersTable.id, user.id))
      .returning({ virtualBalance: usersTable.virtualBalance });

    return {
      status: "ok" as const,
      balance: updated.virtualBalance,
      sellPrice: card.currentPrice,
      profit: calculateProfitValue(card.currentPrice, card.buyPrice),
    };
  });

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  if (result.status === "price_changed") {
    return NextResponse.json(
      { error: "Price updated, please refresh" },
      { status: 409 },
    );
  }
  if (result.status === "already_sold") {
    return NextResponse.json({ error: "Card already sold" }, { status: 409 });
  }

  return NextResponse.json({
    success: true,
    balance: result.balance,
    sellPrice: result.sellPrice,
    profit: result.profit,
  });
}
