import {
  BdlPlayersStatsResponseSchema,
  BdlPlayersStatsResponse,
} from "@/lib/types";

export async function fetchPlayerStats(
  playerIds: number[],
): Promise<BdlPlayersStatsResponse> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const date = yesterday.toISOString().slice(0, 10);

  const params = new URLSearchParams();
  playerIds.forEach((id) => {
    params.append("player_ids[]", id.toString());
  });
  params.append("dates[]", date);

  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) throw new Error("Missing BALLDONTLIE_API_KEY");
  const headers = { Authorization: key };
  const init = { headers };
  const response = await fetch(
    `https://api.balldontlie.io/v1/stats?${params.toString()}`,
    init,
  );
  if (!response.ok)
    throw new Error(
      `Players stats fetch failed: ${response.status} ${response.statusText}`,
    );
  const data = await response.json();
  return BdlPlayersStatsResponseSchema.parse(data);
}

/*
    {
    "data": [
      {
        "id": 15531179,
        "min": "30",
        "fgm": 7,
        "fga": 18,
        "fg_pct": 0.389,
        "fg3m": 5,
        "fg3a": 9,
        "fg3_pct": 0.556,
        "ftm": 4,
        "fta": 4,
        "ft_pct": 1,
        "oreb": 2,
        "dreb": 5,
        "reb": 7,
        "ast": 1,
        "stl": 1,
        "blk": 0,
        "turnover": 1,
        "pf": 3,
        "pts": 23,
        "plus_minus": 23,
        "player": {
          "id": 70,
          "first_name": "Jaylen",
          "last_name": "Brown",
          "position": "G",
          "height": "6-6",
          "weight": "223",
          "jersey_number": "7",
          "college": "California",
          "country": "USA",
          "draft_year": 2016,
          "draft_round": 1,
          "draft_number": 3,
          "team_id": 2
        },
        "team": {
          "id": 2,
          "conference": "East",
          "division": "Atlantic",
          "city": "Boston",
          "name": "Celtics",
          "full_name": "Boston Celtics",
          "abbreviation": "BOS"
        },
        "game": {
          "id": 15907438,
          "date": "2024-10-22",
          "season": 2024,
          "status": "Final",
          "period": 4,
          "time": "Final",
          "postseason": false,
          "postponed": false,
          "home_team_score": 132,
          "visitor_team_score": 109,
          "home_team_id": 2,
          "visitor_team_id": 20,
          "ist_stage": null
        }
      },
      ...
    ],
    "meta": {
      "next_cursor": 15531179,
      "per_page": 25
    }
  }
  */
