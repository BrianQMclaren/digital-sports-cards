"use client";

import { Player } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DraftPlayerProps {
  player: Player;
  balance: number;
}

export default function DraftPlayer(props: DraftPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isPriced = props.player.currentPrice > 0;
  const canAfford = props.player.currentPrice <= props.balance;

  async function handleClick() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/draft-player/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: props.player.id }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (res.ok && data.success === true) {
        router.push("/dashboard");
        return;
      }

      setError(data.error ?? "Could not draft this player");
    } catch {
      setError("Could not draft this player");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="group flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] hover:border-white/10">
      <div>{props.player.firstName}</div>
      <div className="flex-1 space-y-1 mb-6">
        <h3 className="font-sans font-black uppercase text-lg text-white leading-none">
          {props.player.lastName}
        </h3>
        <p className="text-xs font-mono text-gray-500">
          {props.player.firstName}
        </p>
        <div className="pt-2 flex justify-between items-center">
          <span className="text-sm font-mono text-gray-400">Draft Price</span>
          <span className="text-lg font-black text-white tracking-tighter">
            ${props.player.currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mb-2 text-xs font-mono text-red-400">
          {error}
        </p>
      ) : null}
      <Button
        disabled={isLoading || !isPriced || !canAfford}
        onClick={handleClick}
        className="w-full bg-white text-black hover:bg-ignite-orange hover:text-white font-bold transition-colors"
      >
        {isLoading
          ? "Processing..."
          : !isPriced
            ? "Not priced yet"
            : canAfford
              ? "Draft Player"
              : "Insufficient funds"}
      </Button>
    </div>
  );
}
