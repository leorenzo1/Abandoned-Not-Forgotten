export default function Header({ currentView, onViewChange, totalObjects }) {
  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "map", label: "Surface Maps" },
    { id: "story", label: `Timeline (${totalObjects})` },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-black/60 px-4 backdrop-blur-xl sm:px-8">
      {/* Brand & Telemetry Indicator */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onViewChange("overview")}
        onKeyDown={(e) => e.key === "Enter" && onViewChange("overview")}
        className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_10px_#38bdf8]"></span>
        </span>
        <div className="flex flex-col text-left">
          <span className="font-mono text-xs font-semibold tracking-widest text-sky-400 uppercase">
            NASA Space Apps 2026
          </span>
          <span className="text-sm font-bold tracking-wider text-white uppercase sm:text-base">
            Abandoned, Not Forgotten
          </span>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <nav aria-label="Observatory navigation" className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative rounded-full px-3.5 py-1.5 font-mono text-xs font-medium tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4 ${
                isActive
                  ? "border border-sky-400/40 bg-sky-500/20 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
