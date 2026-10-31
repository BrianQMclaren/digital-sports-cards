import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import avatar from "../../public/player-avatar.png";
import { CardGlow } from "@/components/ui/card-glow";
import { PriceTicker } from "@/components/PriceTicker";
import { demoSignInAction } from "@/actions/auth";

// Prices only change nightly; the update-games cron also revalidates "/".
export const revalidate = 3600;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-courtside-black text-white">
      <PriceTicker variant="bar" />
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="font-sans text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-6">
            <span className="block text-white">Trade the</span>
            <span className="relative inline-block text-ignite-orange drop-shadow-[0_0_25px_rgba(255,69,0,0.5)] italic">
              Heat
              {/* Underline accent for extra "Sport" vibe */}
              <span className="absolute -bottom-2 left-0 w-full h-2 bg-ignite-orange/30 blur-sm rounded-full" />
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-sans">
            Real-time equity trading for the modern sports fan. Analyze. Trade.
            Dominate the league.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="bg-ignite-orange hover:bg-orange-700 text-white px-8 py-6 text-lg w-full sm:w-auto">
                Start Trading
              </Button>
            </Link>
            <Link href="/signin" className="w-full sm:w-auto">
              <Button className="bg-white hover:bg-gray-200 text-courtside-black px-8 py-6 text-lg w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
            <form action={demoSignInAction} className="w-full sm:w-auto">
              <Button
                type="submit"
                className="bg-transparent hover:bg-white/10 border border-white/20 text-white px-8 py-6 text-lg w-full sm:w-auto"
              >
                Try the Demo
              </Button>
            </form>
          </div>
          <p className="text-sm text-gray-500">
            No sign-up needed. The demo account is shared and resets every
            morning.
          </p>
        </div>

        <CardGlow
          heatScore={92}
          color="from-cyan-400 via-blue-500 to-indigo-600"
        >
          <div className="relative w-[350px] aspect-[2/3] overflow-hidden rounded-[2.5rem]">
            <Image
              src={avatar}
              alt="basketball player avatar"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 350px"
            />
          </div>
        </CardGlow>
      </section>
    </main>
  );
}
