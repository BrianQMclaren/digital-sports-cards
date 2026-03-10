"use client";

import { Player } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DraftPlayerProps {
  player: Player;
}

export default function DraftPlayer(props: DraftPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/draft-player/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: props.player.id }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Player fetch failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div>{props.player.firstName}</div>
      <Button disabled={isLoading} onClick={handleClick}>
        {isLoading ? "Loading..." : "Draft"}
      </Button>
    </div>
  );
}
