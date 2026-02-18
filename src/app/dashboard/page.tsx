export const dynamic = "force-dynamic";
import Link from "next/link";

import { getCardsForUser, getCurrentUser } from "@/lib/dal";
//import { fetchPlayers } from "@/actions/players";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  //const players = await fetchPlayers(0);

  const cards = await getCardsForUser(user.id);
  console.log(cards);

  return (
    <div>
      <p>Dashboard - Welcome to the league, {user.firstName}!</p>

      {/* Direct to market place - buy cards */}
      <Link href="/draft">Draft players</Link>

      {cards.length === 0 ? (
        <p>No Players yet</p>
      ) : (
        <ul>
          {cards.map((card) => {
            //Computed property
            const profit = (card.currentPrice - card.buyPrice).toFixed(2);
            return (
              <li key={card.id}>
                {card.firstName} {card.lastName} — Buy: ${card.buyPrice} —
                Current: ${card.currentPrice} — Heat: {card.heatScore}
                <div>Profit: ${profit}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
