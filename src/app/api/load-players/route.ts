import { NextRequest, NextResponse } from "next/server";
import { fetchPlayers } from "@/actions/players";
import { playersTable } from "@/db/schema";
import db from "@/db";
import { PlayerInsert } from "@/lib/types";

export async function GET(req: NextRequest) {
  const authToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let cursor = 0;
  while (true) {
    const players = await fetchPlayers(cursor);
    console.log(
      `Fetched ${players.data.length} players, next cursor: ${players.meta.next_cursor}`,
    );
    const values: PlayerInsert[] = players.data.map((player) => {
      const insert: PlayerInsert = {
        ballDontLieId: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        sport: "NBA",
      };
      return insert;
    });
    await db.insert(playersTable).values(values).onConflictDoNothing();
    if (!players.meta.next_cursor) {
      break;
    }
    cursor = players.meta.next_cursor;
  }
  return NextResponse.json({ success: true });
}
