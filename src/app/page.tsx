import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import avatar from "../../public/player-avatar.png";
import { CardGlow } from "@/components/ui/card-glow";

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

        <CardGlow
          heatScore={92}
          color="from-cyan-400 via-blue-500 to-indigo-600"
        >
          {/* Added 'w-[400px]' and 'aspect-[2/3]' to give the 'fill' image a workspace */}
          <div className="relative w-[400px] aspect-[2/3] overflow-hidden rounded-[2.5rem]">
            <Image
              src={avatar}
              alt="basketball player avatar"
              fill
              className="object-cover"
              priority
              /* This tells Next.js to optimize for a 400px wide card */
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </CardGlow>
      </section>
    </main>
  );
}
