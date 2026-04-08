import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerStats } from "@/actions/playerStats";
import db from "@/db";
import { getAllPlayers } from "@/lib/dal";
import { GameInsert, PlayerUpdate } from "@/lib/types";
import { gamesTable, playersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  calculateCurrentPrice,
  calculateHeatScore,
} from "@/lib/calculateStats";
import { getAverage } from "@/lib/getAverage";

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

    const ranked = db
      .select({
        // spread all columns
        id: gamesTable.id,
        playerId: gamesTable.playerId,
        ballDontLieId: gamesTable.ballDontLieId,
        date: gamesTable.date,
        points: gamesTable.points,
        rebounds: gamesTable.rebounds,
        assists: gamesTable.assists,
        steals: gamesTable.steals,
        rn: sql<number>`ROW_NUMBER() OVER (
      PARTITION BY ${gamesTable.playerId}
      ORDER BY ${gamesTable.date} DESC
    )`.as("rn"),
      })
      .from(gamesTable)
      .as("ranked");

    const recentPlayerGames = await db
      .select()
      .from(ranked)
      .where(sql`${ranked.rn} <= 5`);

    for (const playerStat of playerStats) {
      // Find the player first
      const player = players.find(
        (player) => player.ballDontLieId === playerStat.player.id,
      );

      if (!player) {
        throw new Error(`${playerStat.id} not found`);
      }
      // Filter a recent player games to get only the last 5 games for the current player
      const playerGames = recentPlayerGames.filter(
        (game) => game.playerId === player.id,
      );

      const slicedGames = playerGames.slice(0, 5);

      const score = calculateHeatScore(slicedGames);
      const price = calculateCurrentPrice(score);

      // Replace the last game stats with average stats from the last 5 games
      const gamePoints = slicedGames.map((game) => {
        const pts = game.points ?? 0;
        return pts;
      });

      const gameRebounds = slicedGames.map((game) => {
        const rebs = game.rebounds ?? 0;
        return rebs;
      });
      const gameAssists = slicedGames.map((game) => {
        const assists = game.assists ?? 0;
        return assists;
      });
      const gameSteals = slicedGames.map((game) => {
        const steals = game.steals ?? 0;
        return steals;
      });

      const averagePoints = getAverage(gamePoints);
      const averageRebounds = getAverage(gameRebounds);
      const averageAssists = getAverage(gameAssists);
      const averageSteals = getAverage(gameSteals);

      const update: PlayerUpdate = {
        pointsPerGame: averagePoints,
        reboundsPerGame: averageRebounds,
        assistsPerGame: averageAssists,
        stealsPerGame: averageSteals,
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
    if (!(error instanceof Error)) {
      throw error;
    }
    console.error("Error getting player stats:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to update games" },
      { status: 500 },
    );
  }
}
