export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { signOut } from "@/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return (
    <div className="flex flex-1 flex-col h-screen p-4 bg-courtside-black rounded-xl">
      <div className="overflow-hidden flex flex-1 gap-4">
        <aside className="rounded-xl bg-panel w-64 border-r border-white/10 hidden md:block">
          <h1 className="p-6 font-sans text-1xl font-black uppercase tracking-tighter text-white">
            Welcome back, <br></br>
            <span className="text-ignite-orange">{user.firstName}</span>
          </h1>
          {/* Navigation items go here */}
        </aside>
        {/* Main Content Area */}
        <main className="rounded-xl bg-panel flex-1 overflow-y-auto relative">
          <header className="h-16 border-b border-white/10 flex justify-between items-center px-6 bg-black/40 backdrop-blur-md sticky top-0 z-20">
            <div className="p-2 font-sans font-black text-xl text-white">
              HEAT<span className="text-ignite-orange">CHECK</span>
            </div>
            <form action={signOut}>
              <button className="cursor-pointer" type="submit">
                Sign out
              </button>
            </form>
          </header>
          <div className="p-8">{children}</div>
        </main>
      </div>
      <div className="flex bg-panel rounded-xl p-6 gap-8 text-sm font-mono text-gray-400 mt-4">
        <span className="text-stat-green">LIVE: LAL +2.5</span>
        <span>NYK -1.0</span>
        <span className="text-ignite-orange animate-pulse">MARKET OPEN</span>
      </div>
    </div>
  );
}
