import { Game } from "./types";

// Average NBA player: ~11 pts, ~4.5 rebounds, ~2.5 assists, ~0.8 steals
// Heat Score formula = (11 × 1.0) + (4.2 × 0.8) + (2.0 × 0.8) + (0.8 × 1.2) = score
// A BASELINE of 17 is a raw number once i have enough game data in db will revisit to get a closer avg
// 50 heat score - avg nba player
// 34 raw (2x baseline) = 100 heat score
// 0 raw = 0 heat score

const BASELINE = 17;

export function calculateHeatScore(games: Game[]): number {
  if (!games.length) return 0;

  const scores = games.map(
    (game) =>
      (game.points ?? 0) * 1.0 +
      (game.rebounds ?? 0) * 0.8 +
      (game.assists ?? 0) * 0.8 +
      (game.steals ?? 0) * 1.2,
  );

  // Calculating the average raw score across all of a player's games
  const average =
    scores.reduce((acc, current) => acc + current, 0) / scores.length;
  const raw = (average / BASELINE) * 50;
  return Math.round(Math.max(raw, 0));
}

export function calculateCurrentPrice(heatScore: number): number {
  const basePrice = 250;
  // Card price should never go below 50
  return Math.max(basePrice * (heatScore / 50), 50);
}

export type HeatTier = "cold" | "neutral" | "hot";

export const HEAT_TIER_CONFIG: Record<
  HeatTier,
  {
    label: string;
    badgeColor: string;
    textColor: string;
  }
> = {
  cold: {
    label: "COLD",
    badgeColor: "bg-slate-700",
    textColor: "text-slate-300",
  },
  neutral: {
    label: "NEUTRAL",
    badgeColor: "bg-gray-600",
    textColor: "text-gray-200",
  },
  hot: {
    label: "SURGING",
    badgeColor: "bg-orange-600",
    textColor: "text-white",
  },
};

export function getHeatTier(score: number): HeatTier {
  if (score >= 60) return "hot";
  if (score >= 40) return "neutral";
  return "cold";
}

export function calculateProfitValue(
  currentPrice: number,
  buyPrice: number,
): number {
  const profitValue = currentPrice - buyPrice;
  return profitValue;
}

export function isProfit(profitValue: number): boolean {
  const profit = profitValue > 0;
  return profit;
}

export function calculateROIPercent(
  currentPrice: number,
  buyPrice: number,
): number {
  return ((currentPrice - buyPrice) / buyPrice) * 100;
}
