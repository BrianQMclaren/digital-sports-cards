import { getCurrentUser, getAllPlayers } from "@/lib/dal";
import DraftRoom from "@/components/DraftRoom";
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
      <DraftRoom players={players} />
    </div>
  );
}
