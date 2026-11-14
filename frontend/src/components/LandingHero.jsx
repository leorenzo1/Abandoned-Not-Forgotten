export default function LandingHero({ onNavigate }) {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-2xl sm:p-14">
        {/* Subtle grid accent */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Challenge badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/40 px-4 py-1.5 font-mono text-xs font-medium tracking-widest text-sky-300 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          NASA Space Apps Challenge 2026
        </div>

        {/* Main Title */}
        <h1 className="relative text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          Abandoned, <br />
          <span className="bg-gradient-to-r from-sky-200 via-white to-amber-200 bg-clip-text text-transparent">
            Not Forgotten
          </span>
        </h1>

        {/* Prompt subtitle */}
        <p className="relative mx-auto mt-4 max-w-xl text-base font-light tracking-wide text-neutral-300 sm:text-lg">
          Storytelling about NASA&apos;s discarded equipment on the Moon and Mars
        </p>

        {/* Action controls */}
        <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => onNavigate("map")}
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-sky-400/40 bg-gradient-to-r from-sky-600/80 to-blue-600/80 px-8 py-3.5 font-mono text-xs font-semibold tracking-wider text-white uppercase shadow-lg shadow-sky-900/40 transition-all hover:scale-105 hover:border-sky-300 hover:shadow-sky-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:w-auto"
          >
            <span>Explore Surface Maps</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate("story")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-mono text-xs font-semibold tracking-wider text-neutral-200 uppercase backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
          >
            <span>Launch Timeline</span>
          </button>
        </div>

        {/* Planetary Targets strip */}
        <div className="relative mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate("map", "moon")}
            onKeyDown={(e) => e.key === "Enter" && onNavigate("map", "moon")}
            className="group cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-sky-400/30 hover:bg-sky-950/20"
          >
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-sky-300 uppercase">
              <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_6px_#7dd3fc]"></span>
              Target: Luna
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Descent stages, lunar rovers, and survey landers
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigate("map", "mars")}
            onKeyDown={(e) => e.key === "Enter" && onNavigate("map", "mars")}
            className="group cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-amber-500/30 hover:bg-amber-950/20"
          >
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-300 uppercase">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span>
              Target: Mars
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Rovers, landers, rotorcraft, and descent hardware
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
