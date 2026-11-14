import { formatLatLng } from "../utils/formatLatLng";

export default function StoryView({
  objects,
  currentIndex,
  onNavigate,
  isCooldown,
  onInspect,
}) {
  const currentObject = objects[currentIndex] || objects[0];

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-4 py-8">
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Story Timeline
          </h2>
          <p className="mt-0.5 text-sm text-neutral-300">
            Story {currentIndex + 1} of {objects.length}
          </p>
        </div>

        {currentObject?.year && (
          <span className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-sm text-neutral-300">
            {currentObject.year}
          </span>
        )}
      </div>

      {/* Main Artifact Card */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Information Column */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <span>{currentObject?.body}</span>
              {currentObject?.mission && (
                <>
                  <span>·</span>
                  <span>{currentObject.mission}</span>
                </>
              )}
            </div>

            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {currentObject?.name}
            </h3>

            {/* Coordinates and Status */}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y border-neutral-800 py-3 text-sm text-neutral-300">
              {currentObject?.lat != null && (
                <div>
                  <span className="text-neutral-400">Where to find it: </span>
                  <span className="text-neutral-300 font-mono">
                    {formatLatLng(currentObject.lat, currentObject.lng)}
                  </span>
                </div>
              )}
              {currentObject?.status && (
                <div>
                  <span className="text-neutral-400">Where is it now? </span>
                  <span className="text-neutral-300">{currentObject.status}</span>
                </div>
              )}
            </div>

            <p className="mt-4 text-base leading-relaxed text-neutral-200 sm:text-lg">
              {currentObject?.story || "Story coming soon."}
            </p>

            <div className="mt-6">
              <button
                onClick={() => onInspect(currentObject)}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-neutral-500 hover:bg-neutral-800"
              >
                <span>Read the full story</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Photo Frame */}
          <div className="w-full md:w-80 md:flex-shrink-0">
            {currentObject?.image ? (
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                <img
                  src={currentObject.image}
                  alt={currentObject.name}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />
                {currentObject.imageCredit && (
                  <div className="bg-neutral-950 px-3 py-1 text-right text-sm text-neutral-300">
                    {currentObject.imageCredit}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 p-4 text-center">
                <span className="text-sm text-neutral-400">
                  Photo coming soon
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={isCooldown || currentIndex === 0}
          onClick={() => onNavigate(-1)}
          className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Previous
        </button>

        <span className="text-sm text-neutral-400 font-mono">
          {currentIndex + 1} / {objects.length}
        </span>

        <button
          disabled={isCooldown || currentIndex === objects.length - 1}
          onClick={() => onNavigate(1)}
          className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </section>
  );
}
