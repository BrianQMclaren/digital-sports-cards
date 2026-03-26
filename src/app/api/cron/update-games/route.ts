import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerStats } from "@/actions/playerStats";
import db from "@/db";
import { getAllPlayers } from "@/lib/dal";
import { GameInsert, PlayerUpdate } from "@/lib/types";
import { gamesTable, playersTable } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import {
  calculateCurrentPrice,
  calculateHeatScore,
} from "@/lib/calculateStats";

export async function GET(req: NextRequest) {
  const authToken = req.headers.get("authorization")?.replace("Bearer ", "");

  if (authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const players = await getAllPlayers();
    const playerIds = players.map((player) => player.ballDontLieId);
    const playerStats = await fetchPlayerStats(playerIds);
    const stats: GameInsert[] = playerStats.map((playerStat) => {
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

    // Fetch all recent player games in ONE query

    // For each of the players who played last night:
    // 1. Find player in memory using .find()
    // 2. Filter games in memory using .filter()
    // 3. Hit the DB to update their stats

    const internalPlayerIds = players.map((player) => player.id);
    const getRecentPlayerGames = await db.query.gamesTable.findMany({
      where: inArray(gamesTable.playerId, internalPlayerIds),
      orderBy: [desc(gamesTable.date)],
    });

    for (const playerStat of playerStats) {
      // Find the player first
      const player = players.find(
        (player) => player.ballDontLieId === playerStat.player.id,
      );

      if (!player) {
        throw new Error(`${playerStat.id} not found`);
      }
      // Filter a recent player games to get only the last 5 games for the current player
      const playerGames = getRecentPlayerGames
        .filter((game) => game.playerId === player.id)
        .slice(0, 5);

      const score = calculateHeatScore(playerGames);
      const price = calculateCurrentPrice(score);

      const update: PlayerUpdate = {
        pointsPerGame: playerStat.pts,
        reboundsPerGame: playerStat.reb,
        assistsPerGame: playerStat.ast,
        stealsPerGame: playerStat.stl,
        gamesPlayed: playerGames.length,
        heatCheckScore: score,
        currentPrice: price,
        lastUpdated: new Date(),
      };

      await db
        .update(playersTable)
        .set(update)
        .where(eq(playersTable.ballDontLieId, playerStat.player.id));
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
