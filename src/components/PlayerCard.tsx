import { CardContent, CardHeader } from "@/components/ui/card";
import { CardGlow } from "@/components/ui/card-glow";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { MarketPlayer, UserCard } from "@/lib/types";
import {
  getHeatTier,
  HEAT_TIER_CONFIG,
  calculateProfitValue,
  isProfit,
  calculateROIPercent,
} from "@/lib/calculateStats";
import { getPlayerAvatar } from "@/lib/avatars";

type PlayerCardProps =
  | { variant: "portfolio"; card: UserCard }
  | { variant: "market"; player: MarketPlayer };

export const PlayerCard = (props: PlayerCardProps) => {
  const player = props.variant === "portfolio" ? props.card : props.player;
  const buyPrice = props.variant === "portfolio" ? props.card.buyPrice : null;
  const tier = getHeatTier(player.heatCheckScore);
  const config = HEAT_TIER_CONFIG[tier];
  const stats = {
    ppg: player.pointsPerGame ?? 0,
    rpg: player.reboundsPerGame ?? 0,
    apg: player.assistsPerGame ?? 0,
    spg: player.stealsPerGame ?? 0,
  };

  return (
    <CardGlow
      heatScore={player.heatCheckScore}
      className="relative max-w-full bg-[#020617] border-slate-800 overflow-hidden rounded-[.75rem]"
      aria-label={`${player.firstName} ${player.lastName} player card`}
    >
      {/* Layer 1 — avatar image */}
      <Image
        src={getPlayerAvatar(player.ballDontLieId)}
        alt={`${player.firstName} ${player.lastName}`}
        fill
        className="object-cover object-top"
        priority
      />
      {/* ── HEADER: heat score + player name ── */}
      <CardHeader className="relative z-10 flex flex-row justify-between items-start p-6 pb-0">
        {/* Heat score box — left */}
        <div aria-label={`Heat score ${player.heatCheckScore}`}>
          <p className="text-[16px] mb-2 tracking-widest text-white">
            HEAT SCORE
          </p>
          <p className="border border-cyan-500/50 rounded-lg p-2 mb-2 bg-[#0e2a3a] text-4xl font-black text-cyan-400 w-fit">
            {player.heatCheckScore}
          </p>
          <Badge className={`${config.badgeColor} ${config.textColor} mt-1`}>
            {config.label}
          </Badge>
        </div>

        {/* Player name — right */}
        <div className="text-right">
          <p className="text-xs text-orange-500 font-bold uppercase tracking-widest">
            {player.firstName}
          </p>
          <p className="text-xl font-black text-white uppercase">
            {player.lastName}
          </p>
        </div>
      </CardHeader>

      {/* ── CONTENT: full bleed image + stats overlay ── */}
      <CardContent className="relative z-10 p-0 flex-1 min-h-[320px]">
        {/* Layer 3 — price + stats pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 grid grid-cols-2 gap-2">
          {/* Price — left */}
          <div className="border border-slate-700 rounded-lg p-2 bg-black/40">
            <p className="text-[14px] text-gray-400 tracking-widest">
              CURRENT PRICE
            </p>
            <p className="text-2xl font-black text-white mb-1">
              ${player.currentPrice.toFixed(2)}
            </p>
            {/* only show ROI in portfolio variant */}
            {props.variant === "portfolio" &&
              buyPrice !== null &&
              (() => {
                const profit = calculateProfitValue(
                  player.currentPrice,
                  buyPrice,
                );
                const percent = calculateROIPercent(
                  player.currentPrice,
                  buyPrice,
                );
                const positive = isProfit(profit);
                return (
                  <p
                    className={`text-md font-bold ${positive ? "text-green-500" : "text-red-500"}`}
                  >
                    {positive ? "▲" : "▼"} {positive ? "+" : ""}
                    {percent.toFixed(1)}%
                  </p>
                );
              })()}
          </div>

          <dl
            aria-label="Player stats"
            className="border border-slate-700 rounded-lg p-2 bg-black/40 text-right"
          >
            <div className="flex justify-between">
              <dt className="text-[16px] text-gray-400">PPG</dt>
              <dd className="text-[16px] font-bold text-white">
                {stats.ppg.toFixed(1)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[16px] text-gray-400">RPG</dt>
              <dd className="text-[16px] font-bold text-white">
                {stats.rpg.toFixed(1)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[16px] text-gray-400">APG</dt>
              <dd className="text-[16px] font-bold text-white">
                {stats.apg.toFixed(1)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[16px] text-gray-400">SPG</dt>
              <dd className="text-[16px] font-bold text-white">
                {stats.spg.toFixed(1)}
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </CardGlow>
  );
};
