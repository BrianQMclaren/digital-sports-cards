import { getCurrentUser, getAllPlayers } from "@/lib/dal";
import DraftPlayer from "@/components/DraftPlayer";
import { redirect } from "next/navigation";

export default async function Draft() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const players = await getAllPlayers();

  return (
    <div>
      {players.map((player) => (
        <DraftPlayer key={player.id} player={player} />
      ))}
    </div>
  );
}
