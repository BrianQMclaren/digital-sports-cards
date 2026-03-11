import { getCurrentUser, getAllPlayers } from "@/lib/dal";
import DraftPlayer from "@/components/DraftPlayer";
import { redirect } from "next/navigation";

export default async function Draft() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const players = await getAllPlayers();

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="font-sans text-4xl font-black uppercase tracking-tighter text-white">
          Draft <span className="text-ignite-orange">Room</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Build your legacy. Select players to join your exchange.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {players.map((player) => (
          <DraftPlayer key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
