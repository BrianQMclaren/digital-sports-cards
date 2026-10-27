"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Player } from "@/lib/types";
import DraftPlayer from "@/components/DraftPlayer";

interface DraftRoomProps {
  players: Player[];
}

export default function DraftRoom({ players }: DraftRoomProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? players.filter((p) =>
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      )
    : players;

  return (
    <>
      <div className="relative mb-10 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">
          No players match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((player) => (
            <DraftPlayer key={player.id} player={player} />
          ))}
        </div>
      )}
    </>
  );
}
