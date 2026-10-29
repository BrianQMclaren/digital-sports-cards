import { getCurrentUser, getAllPlayers } from "@/lib/dal";
import DraftRoom from "@/components/DraftRoom";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function Draft() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const players = await getAllPlayers();
  const balance = user.virtualBalance ?? 0;

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 font-mono text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
        <h1 className="font-sans text-4xl font-black uppercase tracking-tighter text-white">
          Draft <span className="text-ignite-orange">Room</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Build your legacy. Select players to join your exchange.
        </p>
        <p className="mt-4 font-mono text-sm text-gray-400">
          Balance{" "}
          <span className="text-lg font-black text-white tracking-tighter">
            ${balance.toFixed(2)}
          </span>
        </p>
      </header>
      <DraftRoom players={players} balance={balance} />
    </div>
  );
}
