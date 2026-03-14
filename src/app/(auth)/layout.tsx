export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.18 0.01 250) 0%, oklch(0.04 0 0) 65%)",
      }}
      className="flex flex-col h-screen overflow-hidden"
    >
      <div className="p-6 font-sans font-black text-xl text-white text-center">
        HEAT<span className="text-ignite-orange">CHECK</span>
      </div>
      <main className="flex-1 flex items-center justify-center overflow-y-auto relative">
        <div className="w-full max-w-lg p-8">{children}</div>
      </main>
    </div>
  );
}
