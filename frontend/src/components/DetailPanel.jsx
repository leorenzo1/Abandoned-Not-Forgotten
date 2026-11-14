import { useEffect } from "react";

export default function DetailPanel({ object, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!object) return null;

  const isMars = object.body?.toLowerCase() === "mars";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 p-4 backdrop-blur-md transition-opacity sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-3xl border border-white/20 bg-neutral-950/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Close Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase ${
                isMars
                  ? "border border-amber-500/40 bg-amber-950/40 text-amber-300"
                  : "border border-sky-400/40 bg-sky-950/40 text-sky-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isMars ? "bg-amber-400" : "bg-sky-400"}`} />
              {object.body}
            </span>
            <span className="font-mono text-xs text-neutral-400">
              Year {object.year || "Unknown"}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dossier"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 flex-1 space-y-6">
          <div>
            <h3 id="detail-title" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {object.name}
            </h3>
            <p className="mt-1 font-mono text-xs text-neutral-400 uppercase">
              Mission Designation: {object.mission || "Unspecified"}
            </p>
          </div>

          {/* Photo Frame */}
          {object.image ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60">
              <img
                src={object.image}
                alt={object.name}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
              {object.imageCredit && (
                <div className="bg-black/80 px-3 py-1 text-right font-mono text-[10px] text-neutral-400">
                  Credit: {object.imageCredit}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-44 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center">
              <span className="font-mono text-xs text-neutral-400">
                Official NASA imagery pending archival upload
              </span>
            </div>
          )}

          {/* Telemetry specs grid */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Coordinates</span>
              <span className="text-white font-medium">
                {object.coordinates
                  ? `${object.coordinates.x.toFixed(2)} X, ${object.coordinates.y.toFixed(2)} Y`
                  : "Pending"}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Current Status</span>
              <span className="text-emerald-400 font-medium">
                {object.status || "Surface Monument"}
              </span>
            </div>
          </div>

          {/* Historical Story Narrative */}
          <div>
            <h4 className="font-mono text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Archaeological Record
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300 sm:text-base">
              {object.story || "Narrative documentation pending input from research team."}
            </p>
          </div>

          {/* External NASA link */}
          {object.sourceUrl && (
            <div className="pt-2">
              <a
                href={object.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-950/40 px-4 py-2 font-mono text-xs font-medium text-sky-300 transition-colors hover:border-sky-400 hover:text-white"
              >
                <span>View NASA Archival Source</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
