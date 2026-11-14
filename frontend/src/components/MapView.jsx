import { useState } from "react";

export default function MapView({ objects, onSelectObject, initialBody = "moon" }) {
  const [selectedBody, setSelectedBody] = useState(initialBody);

  const filteredObjects = objects.filter(
    (obj) => obj.body?.toLowerCase() === selectedBody.toLowerCase()
  );

  const isMars = selectedBody.toLowerCase() === "mars";

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-6">
      {/* Planetary Body Selector */}
      <div className="flex w-full items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Surface Reconnaissance Map
          </h2>
          <p className="font-mono text-xs text-neutral-400">
            Select a target world and inspect recorded surface equipment
          </p>
        </div>

        {/* Luna vs Mars Switcher */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-md">
          <button
            onClick={() => setSelectedBody("moon")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              !isMars
                ? "border border-sky-400/40 bg-sky-500/20 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-200 shadow-[0_0_6px_#ffffff]"></span>
            Luna
          </button>
          <button
            onClick={() => setSelectedBody("mars")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              isMars
                ? "border border-amber-500/40 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
            Mars
          </button>
        </div>
      </div>

      {/* Surface Map Viewport */}
      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/15 bg-black/80 shadow-2xl backdrop-blur-md">
        {/* Cartographic Coordinate Graticule */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]"></div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:10%_10%]"></div>

        {/* Planetary Visual Texture: Moon vs Mars */}
        {isMars ? (
          /* Martian Surface Simulation */
          <div className="absolute inset-0 bg-gradient-to-br from-[#451206] via-[#240803] to-[#0c0301]">
            <svg
              className="h-full w-full opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 1000 600"
            >
              <defs>
                <radialGradient id="mars-crater" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#872911" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#3d1007" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#1a0603" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="250" cy="220" rx="140" ry="90" fill="url(#mars-crater)" />
              <ellipse cx="620" cy="380" rx="190" ry="120" fill="url(#mars-crater)" />
              <ellipse cx="800" cy="180" rx="110" ry="70" fill="url(#mars-crater)" />
              <path
                d="M 50,300 Q 300,320 600,280 T 950,340"
                fill="none"
                stroke="#68210e"
                strokeWidth="12"
                opacity="0.3"
              />
            </svg>
          </div>
        ) : (
          /* Lunar Surface Simulation */
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a202c] via-[#0f141d] to-[#06080c]">
            <svg
              className="h-full w-full opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 1000 600"
            >
              <defs>
                <radialGradient id="lunar-maria" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2d3748" stopOpacity="0.9" />
                  <stop offset="65%" stopColor="#1a202c" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0a0d14" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="320" cy="260" rx="180" ry="130" fill="url(#lunar-maria)" />
              <ellipse cx="680" cy="320" rx="220" ry="140" fill="url(#lunar-maria)" />
              <ellipse cx="500" cy="140" rx="90" ry="60" fill="url(#lunar-maria)" />
              <circle cx="210" cy="420" r="45" fill="none" stroke="#4a5568" strokeWidth="2" opacity="0.4" />
              <circle cx="780" cy="180" r="30" fill="none" stroke="#4a5568" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
        )}

        {/* Telemetry coordinate marks */}
        <div className="pointer-events-none absolute top-3 left-4 z-20 font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
          Reconnaissance Sector: {selectedBody.toUpperCase()} // Grid 10x10
        </div>
        <div className="pointer-events-none absolute right-4 bottom-3 z-20 font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
          Target Sites: {filteredObjects.length} Verified
        </div>

        {/* Percentage-Positioned Interactive Pins */}
        <div className="absolute inset-0 z-30">
          {filteredObjects.map((obj) => {
            const leftPercent = `${(obj.coordinates?.x ?? 0.5) * 100}%`;
            const topPercent = `${(obj.coordinates?.y ?? 0.5) * 100}%`;

            return (
              <div
                key={obj.id}
                style={{ left: leftPercent, top: topPercent }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                {/* Sonar beacon ping */}
                <span
                  className={`absolute -inset-2.5 rounded-full opacity-75 animate-ping ${
                    isMars ? "bg-amber-400" : "bg-sky-400"
                  }`}
                />

                {/* Pin Target Button */}
                <button
                  onClick={() => onSelectObject(obj)}
                  aria-label={`Inspect ${obj.name}`}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all hover:scale-125 focus:outline-none focus-visible:ring-2 ${
                    isMars
                      ? "border-amber-400/80 bg-amber-950/80 text-amber-200 shadow-amber-900/50 hover:border-amber-300 focus-visible:ring-amber-400"
                      : "border-sky-400/80 bg-sky-950/80 text-sky-200 shadow-sky-900/50 hover:border-sky-300 focus-visible:ring-sky-400"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isMars ? "bg-amber-400" : "bg-sky-400"
                    }`}
                  />
                </button>

                {/* Hover telemetry tooltip card */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="whitespace-nowrap rounded-lg border border-white/15 bg-black/90 px-3 py-1.5 font-mono text-xs text-white shadow-xl backdrop-blur-md">
                    <div className="font-bold">{obj.name}</div>
                    <div className="text-[10px] text-neutral-400">
                      Year: {obj.year} // Click to inspect
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Surface Map Helper Bar */}
      <div className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 font-mono text-xs text-neutral-400">
        <span className="flex items-center gap-2">
          <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-neutral-300">
            Click
          </kbd>
          Select beacon to open telemetry dossier
        </span>
        <span>
          Viewing {filteredObjects.length} {selectedBody} site(s)
        </span>
      </div>
    </section>
  );
}
