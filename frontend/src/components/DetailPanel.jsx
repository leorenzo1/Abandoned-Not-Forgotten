import { useEffect } from "react";
import { formatLatLng } from "../utils/formatLatLng";

export default function DetailPanel({ object, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <aside
      aria-label="Machine story"
      className={`fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l border-neutral-800 bg-neutral-950/95 shadow-[-10px_0_30px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-out sm:w-[420px] md:w-[460px] ${
        isOpen && object ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}
    >
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 sm:px-8">
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <span>{object?.body}</span>
          {object?.year && (
            <>
              <span>·</span>
              <span>Year {object.year}</span>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-2xl border border-neutral-800 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white focus:outline-none"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content Body */}
      {object && (
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {object.name}
            </h3>
            {object.mission && (
              <p className="mt-1 text-sm text-neutral-300">
                Mission: {object.mission}
              </p>
            )}
          </div>

          {/* Photo Frame */}
          {object.image ? (
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              <img
                src={object.image}
                alt={object.name}
                className="h-56 w-full object-cover"
                loading="lazy"
              />
              {object.imageCredit && (
                <div className="bg-neutral-900 px-3 py-1 text-right text-sm text-neutral-300">
                  Credit: {object.imageCredit}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 text-sm text-neutral-400">
              Photo coming soon
            </div>
          )}

          {/* Coordinates & Status Specs */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-sm">
            <div>
              <span className="block text-neutral-400 text-sm">Where to find it</span>
              <span className="text-neutral-200 font-mono">
                {object.lat != null ? formatLatLng(object.lat, object.lng) : "Coming soon"}
              </span>
            </div>
            <div>
              <span className="block text-neutral-400 text-sm">Where is it now?</span>
              <span className="text-neutral-200">
                {object.status || "Surface Monument"}
              </span>
            </div>
          </div>

          {/* Historical Narrative */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300">
              The story
            </h4>
            <p className="mt-2 text-base leading-relaxed text-neutral-200">
              {object.story || "Story coming soon."}
            </p>
          </div>

          {/* External NASA link */}
          {object.sourceUrl && (
            <div className="pt-2">
              <a
                href={object.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white hover:underline"
              >
                <span>Learn more at NASA</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
