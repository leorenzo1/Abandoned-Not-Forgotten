import { BookOpen, Rocket, Award } from "lucide-react";

export default function Header({
  currentView,
  onViewChange,
  discoveredCount = 0,
  totalObjects = 8,
  onOpenPassport,
  onOpenQuiz,
  onOpenReferences,
}) {
  const navItems = [
    { id: "overview", label: "Home" },
    { id: "map", label: "Explore 3D" },
    { id: "subtabs", label: "SubTabs & Stories" },
    { id: "story", label: "Timeline" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/85 px-4 sm:px-8 backdrop-blur-md">
      {/* Brand Title */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onViewChange("overview")}
        onKeyDown={(e) => e.key === "Enter" && onViewChange("overview")}
        className="cursor-pointer transition-opacity hover:opacity-85 focus:outline-none flex items-center gap-2.5"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400 font-mono text-xs font-black text-slate-950">
          ANF
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-tight text-white sm:text-base leading-tight">
            Abandoned, Not Forgotten
          </span>
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            NASA Space Apps Challenge 2026
          </span>
        </div>
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
                className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
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

        {/* Action Pills: Passport, Quiz & References */}
        <div className="flex items-center gap-1.5 border-l border-neutral-800/80 pl-2 sm:pl-3">
          {/* Mission Quiz Challenge Button */}
          <button
            onClick={onOpenQuiz}
            title="Take the Junior Space Quiz Challenge"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-amber-500/50 hover:bg-neutral-800"
          >
            <Rocket className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Quiz Games</span>
          </button>

          {/* Explorer Passport Button */}
          <button
            onClick={onOpenPassport}
            title="Open Explorer Passport Logbook"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-sky-500/50 hover:bg-neutral-800"
          >
            <Award className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden md:inline">Passport</span>
            <span className="rounded-md bg-sky-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-300">
              {discoveredCount}/{totalObjects}
            </span>
          </button>

          {/* NASA Sources & References Button */}
          <button
            onClick={onOpenReferences}
            title="View Official NASA Mission Sources & References"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-purple-500/50 hover:bg-neutral-800"
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden lg:inline">References</span>
          </button>
        </div>
      </div>
    </header>
  );
}
