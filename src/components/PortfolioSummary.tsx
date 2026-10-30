import { calculatePortfolioSummary, isProfit } from "@/lib/calculateStats";

type PortfolioSummaryProps = ReturnType<typeof calculatePortfolioSummary>;

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PortfolioSummary(props: PortfolioSummaryProps) {
  const positive = isProfit(props.totalReturn);
  const breakEven = props.totalReturn === 0;
  const sign = positive ? "+" : breakEven ? "" : "-";
  const returnColor = positive
    ? "text-green-500"
    : breakEven
      ? "text-gray-400"
      : "text-red-500";

  const tiles = [
    {
      label: "Net Worth",
      value: `$${formatMoney(props.netWorth)}`,
      detail: null,
      color: "text-white",
      detailColor: "text-gray-500",
    },
    {
      label: "Total Return",
      value: `${sign}$${formatMoney(Math.abs(props.totalReturn))}`,
      detail: `${sign}${Math.abs(props.totalReturnPercent).toFixed(1)}%`,
      color: returnColor,
      detailColor: returnColor,
    },
    {
      label: "Cash",
      value: `$${formatMoney(props.cash)}`,
      detail: null,
      color: "text-white",
      detailColor: "text-gray-500",
    },
    {
      label: "Holdings",
      value: `$${formatMoney(props.holdingsValue)}`,
      detail: `${props.holdingsCount} ${props.holdingsCount === 1 ? "player" : "players"}`,
      color: "text-white",
      detailColor: "text-gray-500",
    },
  ];

  return (
    <section
      aria-label="Portfolio summary"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl bg-panel border border-white/10 p-4"
        >
          <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-2">
            {tile.label}
          </p>
          <p className={`text-xl md:text-2xl font-black ${tile.color}`}>
            {tile.value}
          </p>
          {tile.detail ? (
            <p className={`text-sm font-mono ${tile.detailColor}`}>
              {tile.detail}
            </p>
          ) : null}
        </div>
      ))}
    </section>
  );
}
