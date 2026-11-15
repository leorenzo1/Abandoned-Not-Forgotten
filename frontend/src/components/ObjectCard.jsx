export default function ObjectCard({ object }) {
  if (!object) return null;

  const isMars = object.body?.toLowerCase() === "mars";

  return (
    <article className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      {/* Target body pill & Year */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase ${
            isMars
              ? "border border-amber-500/40 bg-amber-950/40 text-amber-300"
              : "border border-sky-400/40 bg-sky-950/40 text-sky-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isMars ? "bg-amber-400" : "bg-sky-300"
            }`}
          />
          {object.body || "Unknown"}
        </span>
        {object.year && (
          <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
            Year {object.year}
          </span>
        )}
      </div>

      {/* Object Title & Mission */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {object.name}
        </h2>
        {object.mission && (
          <p className="mt-1 text-xs font-medium tracking-wide text-neutral-400 uppercase">
            Mission: {object.mission}
          </p>
        )}
      </div>

      {/* Photo with credit */}
      {object.image ? (
        <div className="group relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60">
          <img
            src={object.image}
            alt={object.name}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {object.imageCredit && (
            <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-neutral-300 backdrop-blur-sm">
              Credit: {object.imageCredit}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-xs text-neutral-400">
          Photo pending
        </div>
      )}

      {/* Status */}
      {object.status && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-300">
          <span className="font-semibold text-neutral-400">Status:</span>
          <span>{object.status}</span>
        </div>
      )}

      {/* Story narrative */}
      {object.story && (
        <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
          {object.story}
        </p>
      )}

      {/* Documentation link */}
      {object.sourceUrl && (
        <div className="mt-5 border-t border-white/10 pt-4 text-right">
          <a
            href={object.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            <span>Documentation</span>
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </article>
  );
}
