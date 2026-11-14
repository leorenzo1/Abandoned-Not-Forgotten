import { useState, useEffect } from "react";
import { Volume2, Square, Camera } from "lucide-react";
import { formatLatLng } from "../utils/formatLatLng";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";

export default function StoryView({
  objects,
  currentIndex,
  onNavigate,
  isCooldown,
  onInspect,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const speechOk = isSpeechSupported();

  const currentObject = objects[currentIndex] || objects[0];
  const isMars = currentObject?.body?.toLowerCase() === "mars";
  const accentColor = isMars ? "text-amber-400" : "text-sky-400";
  const badgeBorder = isMars ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-sky-500/30 bg-sky-500/10 text-sky-300";

  if (currentIndex !== prevIndex) {
    setPrevIndex(currentIndex);
    setIsSpeaking(false);
    stopSpeech();
  }

  // Stop speech when story view unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const fullNarration = `${currentObject.name}. Nicknamed ${currentObject.nickname || ""}. ${currentObject.story}. Did you know? ${currentObject.funFact || ""}`;
      speakText(fullNarration, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-4 py-8">
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Space Machine Timeline
          </h2>
          <p className="mt-0.5 text-sm text-neutral-300">
            Journey through history: Site {currentIndex + 1} of {objects.length}
          </p>
        </div>

        {currentObject?.year && (
          <span className="rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 font-mono text-sm font-semibold text-white shadow-sm">
            {currentObject.year}
          </span>
        )}
      </div>

      {/* Main Artifact Card */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Information Column */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeBorder}`}>
                  {currentObject?.body}
                </span>
                {currentObject?.mission && (
                  <span className="text-xs text-neutral-400">
                    Mission: {currentObject.mission}
                  </span>
                )}
              </div>

              {speechOk && (
                <button
                  onClick={handleToggleSpeech}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSpeaking
                      ? "border-amber-400 bg-amber-400/20 text-amber-300 animate-pulse shadow-sm"
                      : "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  {isSpeaking ? (
                    <Square className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  <span>{isSpeaking ? "Stop Voice" : "Read Story"}</span>
                </button>
              )}
            </div>

            <div>
              <h3 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {currentObject?.name}
              </h3>
              {currentObject?.nickname && (
                <p className={`mt-1 text-base font-bold italic tracking-wide sm:text-lg ${accentColor}`}>
                  "{currentObject.nickname}"
                </p>
              )}
            </div>

            {/* Scale and Location Quick Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {currentObject?.sizeComparison && (
                <span className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-200">
                  {currentObject.sizeComparison}
                </span>
              )}
              {currentObject?.status && (
                <span className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1.5 text-xs font-medium text-neutral-200">
                  {currentObject.status}
                </span>
              )}
            </div>

            <p className="text-base leading-relaxed text-neutral-200 sm:text-lg">
              {currentObject?.story || "Story coming soon."}
            </p>

            {/* "Did You Know?" Callout Card */}
            {currentObject?.funFact && (
              <div className={`rounded-2xl border p-4 shadow-sm ${
                isMars
                  ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                  : "border-sky-500/30 bg-sky-950/20 text-sky-200"
              }`}>
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1">
                  Did You Know?
                </h5>
                <p className="text-sm font-medium leading-relaxed text-neutral-200">
                  {currentObject.funFact}
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => onInspect(currentObject)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-md transition-all hover:bg-neutral-200"
              >
                <span>Open Full Dossier</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Side Info Box */}
          <div className="w-full md:w-80 md:flex-shrink-0 space-y-4">
            {currentObject?.image ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md">
                <img
                  src={currentObject.image}
                  alt={currentObject.name}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                />
                {currentObject.imageCredit && (
                  <div className="bg-neutral-900 px-3 py-1 text-right text-xs text-neutral-400">
                    Credit: {currentObject.imageCredit}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-6 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
                  <Camera className="h-6 w-6 text-neutral-400" />
                </div>
                <span className="text-xs font-semibold text-neutral-300">
                  Archival Imagery Dossier
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5 max-w-[200px]">
                  Curated photos being prepared by the research team
                </span>
              </div>
            )}

            {currentObject?.superpower && (
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Historic Feat
                </h4>
                <p className="text-xs font-medium leading-relaxed text-neutral-200">
                  {currentObject.superpower}
                </p>
              </div>
            )}

            {currentObject?.lat != null && (
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Surface Coordinates
                </span>
                <span className="font-mono text-sm font-medium text-neutral-200">
                  {formatLatLng(currentObject.lat, currentObject.lng)}
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
          className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-2 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Previous
        </button>

        <span className="text-sm text-neutral-400 font-mono font-medium">
          {currentIndex + 1} / {objects.length}
        </span>

        <button
          disabled={isCooldown || currentIndex === objects.length - 1}
          onClick={() => onNavigate(1)}
          className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-2 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </section>
  );
}