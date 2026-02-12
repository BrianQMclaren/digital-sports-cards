import { getCurrentUser } from "@/lib/dal";
import { fetchPlayers } from "@/actions/players";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const players = await fetchPlayers();

  return (
    <div>
      Dashboard - Welcome to the league, {user.firstName}!
      <ul>
        {players.data.map((p) => (
          <li key={p.id}>{p.first_name}</li>
        ))}
      </ul>
    </div>
  );
}
