import { NextRequest, NextResponse } from "next/server";
import { fetchPlayers } from "@/actions/players";
import { playersTable } from "@/db/schema";
import db from "@/db";
import { PlayerInsert } from "@/lib/types";

export async function GET(req: NextRequest) {
  let length = 100;
  let cursor = 0;
  while (length > 0) {
    const players = await fetchPlayers(cursor);
    cursor = players.meta.next_cursor ?? 0;
    length = players.data.length;
    console.log(`Fetched ${length} players, next cursor: ${cursor}`);
    const values: PlayerInsert[] = players.data.map((player) => {
      const insert: PlayerInsert = {
        ballDontLieId: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        sport: "NBA",
      };
      return insert;
    });
    await db.insert(playersTable).values(values);
    await new Promise((resolve) => setTimeout(resolve, 15000)); // Throttle requests to avoid hitting rate limits
  }
  return NextResponse.json({ success: true });
}
