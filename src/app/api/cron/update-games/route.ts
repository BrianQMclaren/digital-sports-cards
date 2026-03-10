import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerStats } from "@/actions/playerStats";
import db from "@/db";
import { getAllPlayers } from "@/lib/dal";
import { GameInsert, PlayerUpdate } from "@/lib/types";
import { gamesTable, playersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const players = await getAllPlayers();
    const playerIds = players.map((player) => player.ballDontLieId);
    const playerStats = await fetchPlayerStats(playerIds);
    const stats: GameInsert[] = playerStats.data.map((playerStat) => {
      const player = players.find(
        (player) => player.ballDontLieId === playerStat.player.id,
      );
      if (!player) {
        throw new Error("Player not found");
      }
      const insert: GameInsert = {
        ballDontLieId: playerStat.id,
        playerId: player.id,
        date: new Date(playerStat.game.date),
        points: playerStat.pts,
        rebounds: playerStat.reb,
        assists: playerStat.ast,
        steals: playerStat.stl,
      };
      return insert;
    });
    await db.insert(gamesTable).values(stats).onConflictDoNothing();
    for (const playerStat of playerStats.data) {
      console.log(playerStat);
      const playerCondition = eq(
        playersTable.ballDontLieId,
        playerStat.player.id,
      );
      const player = await db.query.playersTable.findFirst({
        where: playerCondition,
      });
      if (!player) {
        throw new Error(`${playerStat.id} not found`);
      }
      const update: PlayerUpdate = {
        pointsPerGame: playerStat.pts,
        reboundsPerGame: playerStat.reb,
        assistsPerGame: playerStat.ast,
        stealsPerGame: playerStat.stl,
        gamesPlayed: 1,
      };

      await db.update(playersTable).set(update).where(playerCondition);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error getting player stats:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Failed to update games" },
      { status: 500 },
    );
  }
}
