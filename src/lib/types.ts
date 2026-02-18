import { playersTable } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export const TeamSchema = z.object({
  id: z.number(),
  conference: z.string(),
  division: z.string(),
  city: z.string(),
  name: z.string(),
  full_name: z.string(),
  abbreviation: z.string(),
});

export type TeamData = z.infer<typeof TeamSchema>;

export const PlayerSchema = z.object({
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
  team: TeamSchema,
});

export type PlayerData = z.infer<typeof PlayerSchema>;

export const MetaSchema = z.object({
  next_cursor: z.number().nullable(),
  per_page: z.number(),
});

export type MetaData = z.infer<typeof MetaSchema>;

export const PlayersResponseSchema = z.object({
  data: PlayerSchema.array(),
  meta: MetaSchema,
});

export type PlayersResponse = z.infer<typeof PlayersResponseSchema>;

export const PlayerInsertSchema = createInsertSchema(playersTable);
export type PlayerInsert = z.infer<typeof PlayerInsertSchema>;
