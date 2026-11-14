export default function Header({ currentView, onViewChange }) {
  const navItems = [
    { id: "overview", label: "Home" },
    { id: "map", label: "Explore" },
    { id: "story", label: "Timeline" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-black/80 px-6 backdrop-blur-md sm:px-10">
      {/* Editorial Title */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onViewChange("overview")}
        onKeyDown={(e) => e.key === "Enter" && onViewChange("overview")}
        className="cursor-pointer transition-opacity hover:opacity-80 focus:outline-none"
      >
        <span className="text-sm font-bold tracking-tight text-white sm:text-base">
          Abandoned, Not Forgotten
        </span>
      </div>

      {/* Clean Tab Navigation */}
      <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-300 hover:text-neutral-200"
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
