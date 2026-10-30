import {
  getHottestPlayers,
  getLastPriceUpdate,
  getTopMovers,
} from "@/lib/dal";

interface PriceTickerProps {
  variant: "bar" | "panel";
}

const TIME_ZONE = "America/New_York";

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const weekday = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
});
const clockTime = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

function formatUpdated(date: Date): string {
  const isToday = dayKey.format(date) === dayKey.format(new Date());
  const day = isToday ? "TODAY" : weekday.format(date).toUpperCase();
  return `UPDATED ${day} ${clockTime.format(date)} ET`;
}

const VARIANT_STYLES = {
  bar: {
    section: "h-11 bg-black/60 border-b border-white/10",
    label: "h-full flex items-center px-4 bg-ignite-orange text-black",
    fade: "from-black",
  },
  panel: {
    section: "bg-panel rounded-xl py-4 text-gray-400",
    label: "px-6 text-ignite-orange",
    fade: "from-panel",
  },
};

export async function PriceTicker(props: PriceTickerProps) {
  const [movers, lastUpdate] = await Promise.all([
    getTopMovers(),
    getLastPriceUpdate(),
  ]);
  const items = movers.length > 0 ? movers : await getHottestPlayers();
  if (items.length === 0) return null;

  const styles = VARIANT_STYLES[props.variant];

  const list = items.map((item) => (
    <li key={item.id} className="flex items-center gap-2 whitespace-nowrap">
      <span className="font-bold uppercase text-white">{item.lastName}</span>
      <span>${item.currentPrice.toFixed(2)}</span>
      {item.changePercent === null ? (
        <span className="text-ignite-orange">
          HEAT {item.heatCheckScore}
        </span>
      ) : item.changePercent > 0 ? (
        <span className="text-stat-green">
          ▲ +{item.changePercent.toFixed(1)}%
        </span>
      ) : (
        <span className="text-red-500">
          ▼ −{Math.abs(item.changePercent).toFixed(1)}%
        </span>
      )}
    </li>
  ));

  return (
    <section
      aria-label="Heat Index: biggest player price moves"
      className={`flex items-center font-mono text-sm text-gray-300 overflow-hidden ${styles.section}`}
    >
      <span className={`shrink-0 font-bold tracking-widest ${styles.label}`}>
        HEAT INDEX
      </span>
      <div className="relative flex-1 min-w-0 overflow-hidden motion-reduce:overflow-x-auto">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r to-transparent ${styles.fade}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l to-transparent ${styles.fade}`}
        />
        <div className="flex w-max motion-safe:animate-ticker hover:[animation-play-state:paused]">
          <ul className="flex shrink-0 items-center gap-8 px-4">{list}</ul>
          <ul
            aria-hidden="true"
            className="flex shrink-0 items-center gap-8 px-4 motion-reduce:hidden"
          >
            {list}
          </ul>
        </div>
      </div>
      {lastUpdate ? (
        <span className="hidden md:block shrink-0 px-4 text-xs text-gray-500 tracking-widest">
          {formatUpdated(lastUpdate)}
        </span>
      ) : null}
    </section>
  );
}
