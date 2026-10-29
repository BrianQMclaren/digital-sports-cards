import { BdlPlayersStatsResponseSchema, BdlPlayerStats } from "@/lib/types";

export async function fetchPlayerStats(): Promise<BdlPlayerStats[]> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const date = yesterday.toISOString().slice(0, 10);

  const params = new URLSearchParams();
  params.append("dates[]", date);
  params.append("per_page", "100");

  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) throw new Error("Missing BALLDONTLIE_API_KEY");
  const headers = { Authorization: key };

  const results: BdlPlayerStats[] = [];
  let nextCursor: number | null | undefined = undefined;

  while (true) {
    if (nextCursor !== undefined) {
      params.set("cursor", String(nextCursor));
    }

    const url = `https://api.balldontlie.io/v1/stats?${params.toString()}`;
    console.log(
      `Fetching player stats for ${date}, cursor=${nextCursor ?? "start"}`,
    );

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `Players stats fetch failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const pageResult = BdlPlayersStatsResponseSchema.parse(data);
    results.push(...pageResult.data);

    console.log(
      `Got ${pageResult.data.length} results. next_cursor: ${pageResult.meta.next_cursor}`,
    );

    if (!pageResult.meta.next_cursor) {
      break;
    }

    nextCursor = pageResult.meta.next_cursor;
  }
  return results;
}
