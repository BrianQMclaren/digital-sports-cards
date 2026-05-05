export const dynamic = "force-dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

import { getCardsForUser, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { PlayerCard } from "@/components/PlayerCard";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const cards = await getCardsForUser(user.id);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex justify-between flex-col">
        <div className="mb-4">
          <p className="text-gray-500 font-medium">
            Market is open. Build your portfolio.
          </p>
        </div>
        <div>
          <Button
            asChild
            className="bg-ignite-orange hover:bg-orange-600 text-courtside-black font-bold md:mx-auto"
          >
            <Link href="/draft">
              Go to Draft <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {cards.map((card) => (
              <div key={card.id} className="w-full sm:max-w-[380px] sm:mx-auto">
                <PlayerCard variant="portfolio" card={card} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
