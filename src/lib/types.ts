import { gamesTable, playersTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { getCardsForUser } from "@/lib/dal";

/* BallDontLie API Types */
export const BdlTeamSchema = z.object({
  id: z.number(),
  conference: z.string(),
  division: z.string(),
  city: z.string(),
  name: z.string(),
  full_name: z.string(),
  abbreviation: z.string(),
});
export type BdlTeamData = z.infer<typeof BdlTeamSchema>;

export const BdlGameSchema = z.object({
  id: z.number(),
  date: z.string(),
});
export type BdlGameData = z.infer<typeof BdlGameSchema>;

export const BdlPlayerSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  position: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  jersey_number: z.string().nullable().optional(),
  college: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  draft_year: z.number().nullable(),
  draft_round: z.number().nullable(),
  draft_number: z.number().nullable(),
  team: BdlTeamSchema.optional(),
});
export type BdlPlayerData = z.infer<typeof BdlPlayerSchema>;

export const BdlPlayerStatsSchema = z.object({
  id: z.number(),
  min: z.string(),
  pts: z.number().nullable(),
  reb: z.number().nullable(),
  ast: z.number().nullable(),
  stl: z.number().nullable(),
  player: BdlPlayerSchema,
  game: BdlGameSchema,
});
export type BdlPlayerStats = z.infer<typeof BdlPlayerStatsSchema>;

export const BdlMetaSchema = z.object({
  next_cursor: z.number().nullable().optional(),
  per_page: z.number(),
});
export type BdlMetaData = z.infer<typeof BdlMetaSchema>;

export const BdlPlayersResponseSchema = z.object({
  data: BdlPlayerSchema.array(),
  meta: BdlMetaSchema,
});
export type BdlPlayersResponse = z.infer<typeof BdlPlayersResponseSchema>;

export const BdlPlayersStatsResponseSchema = z.object({
  data: BdlPlayerStatsSchema.array(),
  meta: BdlMetaSchema,
});
export type BdlPlayersStatsResponse = z.infer<
  typeof BdlPlayersStatsResponseSchema
>;

/* Internal DB Types */
export const PlayerInsertSchema = createInsertSchema(playersTable);
export type PlayerInsert = z.infer<typeof PlayerInsertSchema>;

export const GameInsertSchema = createInsertSchema(gamesTable);
export type GameInsert = z.infer<typeof GameInsertSchema>;

export type Player = InferSelectModel<typeof playersTable>;
export type Game = InferSelectModel<typeof gamesTable>;

export const PlayerUpdateSchema = createUpdateSchema(playersTable);
export type PlayerUpdate = z.infer<typeof PlayerUpdateSchema>;

export type UserCard = Awaited<ReturnType<typeof getCardsForUser>>[number];
