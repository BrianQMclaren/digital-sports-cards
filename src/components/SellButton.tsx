"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  calculateProfitValue,
  calculateROIPercent,
  isProfit,
} from "@/lib/calculateStats";

interface SellButtonProps {
  cardId: string;
  buyPrice: number;
  currentPrice: number;
}

export default function SellButton(props: SellButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const profit = calculateProfitValue(props.currentPrice, props.buyPrice);
  const percent = calculateROIPercent(props.currentPrice, props.buyPrice);
  const positive = isProfit(profit);
  const breakEven = profit === 0;
  const sign = positive ? "+" : breakEven ? "" : "-";
  const profitColor = positive
    ? "text-green-500"
    : breakEven
      ? "text-gray-400"
      : "text-red-500";

  async function handleConfirm() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/sell-card/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: props.cardId,
          expectedPrice: props.currentPrice,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (res.ok && data.success === true) {
        router.refresh();
        return;
      }

      setError(data.error ?? "Could not sell this card");
    } catch {
      setError("Could not sell this card");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative z-10 px-6 pb-6">
      {error ? (
        <p role="alert" className="mb-2 text-xs font-mono text-red-400">
          {error}
        </p>
      ) : null}
      {isConfirming ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-gray-400">
              Sell for ${props.currentPrice.toFixed(2)}
            </span>
            <span className={`text-sm font-bold ${profitColor}`}>
              {sign}${Math.abs(profit).toFixed(2)} ({sign}
              {Math.abs(percent).toFixed(1)}%)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={isLoading}
              onClick={handleConfirm}
              className="w-full bg-white text-black hover:bg-ignite-orange hover:text-white font-bold transition-colors"
            >
              {isLoading ? "Selling..." : "Confirm"}
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setError(null);
                setIsConfirming(false);
              }}
              className="w-full font-bold"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsConfirming(true)}
          className="w-full bg-white text-black hover:bg-ignite-orange hover:text-white font-bold transition-colors"
        >
          Sell
        </Button>
      )}
    </div>
  );
}
