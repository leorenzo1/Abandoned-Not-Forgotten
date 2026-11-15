import { useEffect, useState } from "react";
import { Moon, Globe, Trophy, Lock, CheckCircle2, HelpCircle, X, Sparkles, Compass } from "lucide-react";

export default function PassportModal({
  isOpen,
  onClose,
  objects,
  discoveredIds,
  onSelectObject,
  onResetProgress,
}) {
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validIds = new Set(objects.map((o) => o.id));
  const validFoundIds = discoveredIds.filter((id) => validIds.has(id));
  const total = objects.length;
  const foundCount = Math.min(validFoundIds.length, total);
  const progressPercent = total > 0 ? Math.round((foundCount / total) * 100) : 0;

  const moonObjects = objects.filter((o) => o.body === "moon");
  const marsObjects = objects.filter((o) => o.body === "mars");

  const moonFound = moonObjects.filter((o) => validFoundIds.includes(o.id)).length;
  const marsFound = marsObjects.filter((o) => validFoundIds.includes(o.id)).length;

  const hasMoonBadge = moonFound === moonObjects.length && moonObjects.length > 0;
  const hasMarsBadge = marsFound === marsObjects.length && marsObjects.length > 0;
  const hasMasterBadge = foundCount === total;

  const filteredList =
    activeTab === "all"
      ? objects
      : objects.filter((o) => o.body === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Passport Book Container */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 sm:px-8 bg-neutral-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                NASA Space Apps Challenge 2026
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Space Discovery Collection & Passport
            </h3>
            <p className="text-xs text-neutral-400">
              Official Explorer Logbook · Discover machines across the Solar System
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Progress Tracker */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-neutral-300">
                Explorers Discovered
              </span>
              <span className="font-mono font-bold text-sky-400">
                {foundCount} / {total} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-purple-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Mission Badges
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Lunar Badge */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                  hasMoonBadge
                    ? "border-sky-500/40 bg-sky-950/20 text-white shadow-sm"
                    : "border-neutral-800/80 bg-neutral-900/20 opacity-60"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  hasMoonBadge ? "border-sky-400 bg-sky-400/20 text-sky-300" : "border-neutral-800 bg-neutral-900 text-neutral-500"
                }`}>
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Lunar Pioneer</span>
                  <span className="block text-[10px] text-neutral-400">
                    {moonFound}/{moonObjects.length} Moon sites
                  </span>
                </div>
              </div>

              {/* Martian Badge */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                  hasMarsBadge
                    ? "border-amber-500/40 bg-amber-950/20 text-white shadow-sm"
                    : "border-neutral-800/80 bg-neutral-900/20 opacity-60"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  hasMarsBadge ? "border-amber-400 bg-amber-400/20 text-amber-300" : "border-neutral-800 bg-neutral-900 text-neutral-500"
                }`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Martian Trailblazer</span>
                  <span className="block text-[10px] text-neutral-400">
                    {marsFound}/{marsObjects.length} Mars sites
                  </span>
                </div>
              </div>

              {/* Master Badge */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                  hasMasterBadge
                    ? "border-emerald-500/40 bg-emerald-950/20 text-white shadow-sm"
                    : "border-neutral-800/80 bg-neutral-900/20 opacity-60"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  hasMasterBadge ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-neutral-800 bg-neutral-900 text-neutral-500"
                }`}>
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">Master Cosmologist</span>
                  <span className="block text-[10px] text-neutral-400">
                    {hasMasterBadge ? "All Unlocked!" : `Find all ${total}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Explorer Passport Stamps
            </h4>
            <div className="flex items-center gap-1">
              {["all", "moon", "mars"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-white text-black font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Machine Stamp Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredList.map((obj) => {
              const isDiscovered = discoveredIds.includes(obj.id);
              const isMars = obj.body === "mars";
              const isMoon = obj.body === "moon";
              const accentColor = isMoon ? "text-sky-300" : isMars ? "text-amber-300" : "text-purple-300";

              return (
                <div
                  key={obj.id}
                  onClick={() => {
                    if (isDiscovered) {
                      onSelectObject(obj);
                      onClose();
                    }
                  }}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all ${
                    isDiscovered
                      ? "cursor-pointer border-neutral-700 bg-neutral-900/70 hover:border-neutral-500 hover:bg-neutral-900"
                      : "border-neutral-900 bg-neutral-950/40 opacity-50"
                  }`}
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    isDiscovered
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-400"
                      : "border-neutral-800 bg-neutral-900 text-neutral-600"
                  }`}>
                    {isDiscovered ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block truncate text-sm font-bold text-white">
                        {isDiscovered ? obj.name : "Uncharted Explorer"}
                      </span>
                      {obj.year && isDiscovered && (
                        <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                          {obj.year}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs font-semibold italic ${isDiscovered ? accentColor : "text-neutral-500"}`}>
                      {isDiscovered ? `"${obj.nickname}"` : "Explore to unlock passport stamp"}
                    </p>

                    {isDiscovered && obj.funFact && (
                      <p className="mt-1.5 line-clamp-2 text-[11px] text-neutral-300">
                        {obj.funFact}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset progress */}
          <div className="pt-4 border-t border-neutral-900 flex justify-between items-center text-xs text-neutral-500">
            <span>Progress automatically saves in your browser</span>
            {discoveredIds.length > 0 && (
              <button
                onClick={onResetProgress}
                className="text-neutral-500 hover:text-rose-400 transition-colors"
              >
                Reset Discovery Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
