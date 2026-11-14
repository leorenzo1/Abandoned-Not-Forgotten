export default function StoryView({
  objects,
  currentIndex,
  onNavigate,
  isCooldown,
  onInspect,
}) {
  const currentObject = objects[currentIndex] || objects[0];
  const isMars = currentObject?.body?.toLowerCase() === "mars";

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-6">
      {/* Timeline Ribbon Header */}
      <div className="flex w-full items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Chronological Exploration Timeline
          </h2>
          <p className="font-mono text-xs text-neutral-400">
            Journeying through discarded human monuments across space
          </p>
        </div>

        {/* Chronological Year Marker */}
        <div className="rounded-full border border-white/15 bg-black/60 px-4 py-1.5 font-mono text-xs text-neutral-300 backdrop-blur-md">
          Mission Year: <span className="font-bold text-white">{currentObject?.year || "N/A"}</span>
        </div>
      </div>

      {/* Main Artifact Card */}
      <div className="relative mt-6 w-full overflow-hidden rounded-3xl border border-white/15 bg-black/65 p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left Column: Metadata & Narrative */}
          <div className="flex-1">
            {/* Body & Year pill */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase ${
                  isMars
                    ? "border border-amber-500/40 bg-amber-950/40 text-amber-300"
                    : "border border-sky-400/40 bg-sky-950/40 text-sky-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isMars ? "bg-amber-400" : "bg-sky-400"
                  }`}
                />
                Target: {currentObject?.body}
              </span>

              <span className="font-mono text-xs text-neutral-400">
                // #{currentIndex + 1} of {objects.length}
              </span>
            </div>

            {/* Object Title */}
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {currentObject?.name}
            </h3>

            {/* Mission subtitle */}
            <p className="mt-1 font-mono text-xs text-neutral-400 uppercase">
              Mission: {currentObject?.mission || "Unspecified"}
            </p>

            {/* Coordinates & Status Telemetry */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-3 font-mono text-xs">
              <div>
                <span className="text-neutral-400">Coordinates: </span>
                <span className="text-white">
                  {currentObject?.coordinates
                    ? `${currentObject.coordinates.x.toFixed(2)}X / ${currentObject.coordinates.y.toFixed(2)}Y`
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Status: </span>
                <span className="text-emerald-400">
                  {currentObject?.status || "Surface Monument"}
                </span>
              </div>
            </div>

            {/* Narrative text block */}
            <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
              {currentObject?.story || "Historical documentation pending upload."}
            </p>

            {/* Inspect Button */}
            <div className="mt-6">
              <button
                onClick={() => onInspect(currentObject)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 font-mono text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span>Inspect Full Dossier</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className="w-full md:w-80 md:flex-shrink-0">
            {currentObject?.image ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60">
                <img
                  src={currentObject.image}
                  alt={currentObject.name}
                  className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                {currentObject.imageCredit && (
                  <div className="absolute right-2 bottom-2 rounded bg-black/75 px-2 py-0.5 text-[10px] text-neutral-300 backdrop-blur-sm">
                    {currentObject.imageCredit}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
                <svg className="h-8 w-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="mt-2 font-mono text-xs text-neutral-400">
                  Archival imagery pending
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls with Spring Physics Cooldown */}
      <div className="mt-6 flex w-full items-center justify-between gap-4">
        <button
          disabled={isCooldown || currentIndex === 0}
          onClick={() => onNavigate(-1)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-neutral-200 uppercase backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          &larr; Earlier Relic
        </button>

        {/* Dot Sequence Stepper */}
        <div className="flex items-center gap-2">
          {objects.map((obj, i) => (
            <button
              key={obj.id}
              onClick={() => onNavigate(i - currentIndex)}
              disabled={isCooldown}
              aria-label={`Jump to ${obj.name}`}
              className={`h-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? "w-8 bg-sky-400 shadow-[0_0_8px_#38bdf8]"
                  : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          disabled={isCooldown || currentIndex === objects.length - 1}
          onClick={() => onNavigate(1)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-neutral-200 uppercase backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Later Relic &rarr;
        </button>
      </div>
    </section>
  );
}
