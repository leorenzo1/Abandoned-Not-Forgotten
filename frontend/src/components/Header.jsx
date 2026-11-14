export default function Header({
  currentView,
  onViewChange,
  discoveredCount = 0,
  totalObjects = 8,
  onOpenPassport,
  onOpenQuiz,
}) {
  const navItems = [
    { id: "overview", label: "Home" },
    { id: "map", label: "Explore" },
    { id: "story", label: "Timeline" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-black/80 px-4 sm:px-8 backdrop-blur-md">
      {/* Brand Title */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onViewChange("overview")}
        onKeyDown={(e) => e.key === "Enter" && onViewChange("overview")}
        className="cursor-pointer transition-opacity hover:opacity-85 focus:outline-none flex items-center gap-2"
      >
        <span className="text-sm font-extrabold tracking-tight text-white sm:text-base">
          Abandoned, Not Forgotten
        </span>
      </div>

      {/* Navigation and Activity Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Main View Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-1.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-300 hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Pills: Passport & Quiz */}
        <div className="flex items-center gap-1.5 border-l border-neutral-800/80 pl-2 sm:pl-3">
          {/* Explorer Passport Button */}
          <button
            onClick={onOpenPassport}
            title="Open Explorer Passport Logbook"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-sky-500/50 hover:bg-neutral-800"
          >
            <span>Passport</span>
            <span className="rounded-md bg-sky-500/20 px-1.5 py-0.5 font-mono text-[11px] font-bold text-sky-300">
              {discoveredCount}/{totalObjects}
            </span>
          </button>

          {/* Junior Quiz Challenge Button */}
          <button
            onClick={onOpenQuiz}
            title="Take the Junior Space Quiz"
            className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-amber-500/50 hover:bg-neutral-800"
          >
            Quiz
          </button>
        </div>
      </div>
    </header>
  );
}