"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowProps {
  children: React.ReactNode;
  color?: string; // e.g., "from-cyan-500 to-blue-600"
  className?: string;
  heatScore?: number;
}

export function CardGlow({
  children,
  color = "from-cyan-500 to-blue-500",
  className,
  heatScore = 0,
}: GlowProps) {
  const isElite = heatScore >= 90;
  const activeColor = isElite
    ? "from-orange-500 via-amber-400 to-red-400"
    : color;
  return (
    <div className={cn("relative group", className)}>
      {/* THE ANIMATED GLOW LAYER */}
      <motion.div
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{
          opacity: isElite ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
          scale: [0.5, 0.6, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r blur-3xl z-0 transition-all duration-500",
          activeColor,
        )}
      />

      {/* 2. THE INTERNAL HEAT WAVE (Energy Streak) */}
      {isElite && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2.5rem]">
          <motion.div
            initial={{ x: "-100%", skewX: -12 }}
            animate={{ x: "200%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "circIn",
            }}
            className={cn(
              "absolute inset-0 z-0 blur-[80px] transform-gpu pointer-events-none",
              "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]",
              isElite
                ? "from-orange-500/60 via-amber-400/30 to-transparent"
                : "from-blue-500/40 via-cyan-400/20 to-transparent",
            )}
          />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
