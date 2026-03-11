export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-courtside-black overflow-hidden">
      <aside className="w-64 border-r border-white/10 bg-black/20 hidden md:block">
        <div className="p-6 font-sans font-black text-xl text-white">
          HEAT<span className="text-ignite-orange">CHECK</span>
        </div>
        {/* Navigation items go here */}
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header / Stats Ticker */}
        <header className="h-16 border-b border-white/10 flex items-center px-8 bg-black/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex gap-8 text-sm font-mono text-gray-400">
            <span className="text-stat-green">LIVE: LAL +2.5</span>
            <span>NYK -1.0</span>
            <span className="text-ignite-orange animate-pulse">
              MARKET OPEN
            </span>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
