export default function LandingHero({ onNavigate }) {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-2xl">
        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          Abandoned, <br />
          <span className="text-neutral-400">Not Forgotten</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-lg text-base font-normal leading-relaxed text-neutral-300 sm:text-lg">
          An interactive chronicle of NASA&apos;s discarded equipment across the surfaces of the Moon and Mars.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => onNavigate("map")}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-7 py-3 text-xs font-semibold tracking-wider text-black uppercase transition-all hover:bg-neutral-200 sm:w-auto"
          >
            <span>Explore Map</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate("story")}
            className="flex w-full items-center justify-center rounded-lg border border-neutral-700 bg-black/40 px-7 py-3 text-xs font-semibold tracking-wider text-neutral-300 uppercase backdrop-blur-sm transition-all hover:border-neutral-500 hover:text-white sm:w-auto"
          >
            Timeline View
          </button>
        </div>
      </div>
    </section>
  );
}
