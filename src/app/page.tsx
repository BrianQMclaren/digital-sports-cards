import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import avatar from "../../public/player-avatar.png";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-courtside-black text-white">
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
          <div className="flex gap-4">
            <Link href="/signup">
              <Button className="bg-ignite-orange hover:bg-orange-700 text-white px-8 py-6 text-lg">
                Start Trading
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Anchor */}
        <div className="flex-1 shadow-2xl">
          <Image
            src={avatar}
            alt="player avatar"
            width={400}
            height={400}
            sizes="(max-width: 768px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        </div>
      </section>
    </main>
  );
}
