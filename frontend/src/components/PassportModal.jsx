import { useEffect } from "react";
import { Moon, Globe, Trophy, Lock, CheckCircle2, HelpCircle, X, Sparkles } from "lucide-react";

export default function PassportModal({
  isOpen,
  onClose,
  objects,
  discoveredIds,
  onSelectObject,
  onResetProgress,
}) {
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

  const total = objects.length;
  const foundCount = discoveredIds.length;
  const progressPercent = Math.round((foundCount / total) * 100);

  const moonObjects = objects.filter((o) => o.body === "moon");
  const marsObjects = objects.filter((o) => o.body === "mars");

  const moonFound = moonObjects.filter((o) => discoveredIds.includes(o.id)).length;
  const marsFound = marsObjects.filter((o) => discoveredIds.includes(o.id)).length;

  const hasMoonBadge = moonFound === moonObjects.length;
  const hasMarsBadge = marsFound === marsObjects.length;
  const hasMasterBadge = foundCount === total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Passport Book Container */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 sm:px-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Explorer Passport
            </h3>
            <p className="text-xs text-neutral-400">
              Official NASA Space Apps Explorer Logbook
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
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-neutral-300">
                Machines Discovered
              </span>
              <span className="font-mono font-bold text-sky-400">
                {foundCount} / {total} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-500 ease-out"
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
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  hasMoonBadge
                    ? "border-sky-500/40 bg-sky-950/20 text-white shadow-sm"
                    : "border-neutral-800/80 bg-neutral-900/20 opacity-50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${hasMoonBadge ? "border-sky-500/40 bg-sky-500/20" : "border-neutral-800 bg-neutral-900"}`}>
                  <Moon className={`h-5 w-5 ${hasMoonBadge ? "text-sky-300" : "text-neutral-500"}`} />
                </div>
                <div>
                  <span className="block text-xs font-bold">Lunar Pioneer</span>
                  <span className="text-[11px] text-neutral-400">
                    {hasMoonBadge ? "Unlocked! (4/4)" : `${moonFound}/4 Moon sites`}
                  </span>
                </div>
              </div>

              {/* Martian Badge */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  hasMarsBadge
                    ? "border-amber-500/40 bg-amber-950/20 text-white shadow-sm"
                    : "border-neutral-800/80 bg-neutral-900/20 opacity-50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${hasMarsBadge ? "border-amber-500/40 bg-amber-500/20" : "border-neutral-800 bg-neutral-900"}`}>
                  <Globe className={`h-5 w-5 ${hasMarsBadge ? "text-amber-300" : "text-neutral-500"}`} />
                </div>
                <div>
                  <span className="block text-xs font-bold">Martian Scout</span>
                  <span className="text-[11px] text-neutral-400">
                    {hasMarsBadge ? "Unlocked! (4/4)" : `${marsFound}/4 Mars rovers`}
                  </span>
                </div>
              </div>

              {/* Master Badge */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  hasMasterBadge
                    ? "border-emerald-500/40 bg-emerald-950/20 text-white shadow-sm"
                    : "border-neutral-800/80 bg-neutral-900/20 opacity-50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${hasMasterBadge ? "border-emerald-500/40 bg-emerald-500/20" : "border-neutral-800 bg-neutral-900"}`}>
                  {hasMasterBadge ? (
                    <Trophy className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <Lock className="h-5 w-5 text-neutral-500" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold">Master Explorer</span>
                  <span className="text-[11px] text-neutral-400">
                    {hasMasterBadge ? "All Discovered!" : `${foundCount}/8 Complete`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stamps Collection Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Passport Stamps
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {objects.map((obj) => {
                const isFound = discoveredIds.includes(obj.id);
                const isMars = obj.body === "mars";
                return (
                  <button
                    key={obj.id}
                    disabled={!isFound}
                    onClick={() => {
                      onSelectObject(obj);
                      onClose();
                    }}
                    className={`group relative flex flex-col items-center justify-between rounded-2xl border p-3 text-center transition-all ${
                      isFound
                        ? isMars
                          ? "border-amber-500/30 bg-amber-950/15 hover:border-amber-400 cursor-pointer"
                          : "border-sky-500/30 bg-sky-950/15 hover:border-sky-400 cursor-pointer"
                        : "border-neutral-800/70 bg-neutral-900/20 cursor-not-allowed opacity-45"
                    }`}
                  >
                    {/* Stamp Seal */}
                    <div className={`my-2 flex h-12 w-12 items-center justify-center rounded-full border border-dashed ${
                      isFound
                        ? isMars
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-sky-500/50 bg-sky-500/10"
                        : "border-neutral-700 bg-neutral-900/80"
                    }`}>
                      {isFound ? (
                        isMars ? (
                          <Sparkles className="h-5 w-5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-sky-400" />
                        )
                      ) : (
                        <HelpCircle className="h-5 w-5 text-neutral-600" />
                      )}
                    </div>

                    <div className="w-full">
                      <span className="block truncate text-xs font-bold text-white">
                        {isFound ? obj.name : "Unexplored"}
                      </span>
                      <span className="block truncate text-[10px] text-neutral-400 font-mono mt-0.5">
                        {isFound ? `Year ${obj.year}` : `Hint: ${obj.body}`}
                      </span>
                    </div>

                    {isFound && (
                      <span className="mt-2 inline-block rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                        Discovered
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-3.5 bg-neutral-900/40 sm:px-8">
          <button
            onClick={onResetProgress}
            className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
          >
            Reset exploration stamps
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-white px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-neutral-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}