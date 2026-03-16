export const dynamic = "force-dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

import { getCardsForUser, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const cards = await getCardsForUser(user.id);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex justify-between flex-col m">
        <div className="mb-4">
          <p className="text-gray-500 font-medium">
            Market is open. Build your portfolio.
          </p>
        </div>
        <Button
          asChild
          className="bg-ignite-orange hover:bg-orange-600 text-courtside-black font-bold md:mx-auto"
        >
          <Link href="/draft">
            Go to Draft <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-[0.2em] mb-6">
          Active Holdings
        </h2>
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center">
            <p className="text-gray-500 italic">
              No players in your rotation yet
            </p>
            <Link
              href="/draft"
              className="text-ignite-orange font-bold hover:underline mt-4 inline-block"
            >
              Start your first draft
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const profitValue = card.currentPrice - card.buyPrice;
              const isProfit = profitValue >= 0;
              return (
                <div
                  key={card.id}
                  className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-ignite-orange/50 transition-all overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-sans font-black uppercase text-xl text-white leading-none">
                          {card.lastName}
                        </h3>
                        <p className="text-xs font-mono text-gray-500 mt-1">
                          {card.firstName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-ignite-orange leading-none">
                          {card.heatScore}
                        </div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                          Heat Score
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-400 uppercase">
                        Current Value
                      </p>
                      <p className="text-2xl font-black tracking-tighter text-white">
                        ${card.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 font-mono font-bold text-sm ${isProfit ? "text-stat-green" : "text-red-500"}`}
                    >
                      {isProfit ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {isProfit ? "+" : ""} ${Math.abs(profitValue).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
