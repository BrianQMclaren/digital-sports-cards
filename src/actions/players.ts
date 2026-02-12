import { PlayersResponse, PlayersResponseSchema } from "@/lib/types";

export async function fetchPlayers(cursor: number): Promise<PlayersResponse> {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) throw new Error("Missing BALLDONTLIE_API_KEY");
  const headers = { Authorization: key };
  const init = { headers };
  const response = await fetch(
    `https://api.balldontlie.io/v1/players?per_page=100&cursor=${cursor}`,
    init,
  );
  if (!response.ok)
    throw new Error(
      `Players fetch failed: ${response.status} ${response.statusText}`,
    );
  const data = await response.json();
  return PlayersResponseSchema.parse(data);
}

/*
{
  "data": [
    {
      "id": 115,
      "first_name": "Stephen",
      "last_name": "Curry",
      "position": "G",
      "height": "6-2",
      "weight": "185",
      "jersey_number": "30",
      "college": "Davidson",
      "country": "USA",
      "draft_year": 2009,
      "draft_round": 1,
      "draft_number": 7,
      "team": {
        "id": 10,
        "conference": "West",
        "division": "Pacific",
        "city": "Golden State",
        "name": "Warriors",
        "full_name": "Golden State Warriors",
        "abbreviation": "GSW"
      }
    },
    ...
  ],
  "meta": {
    "next_cursor": 25,
    "per_page": 25
  }
}
 */
