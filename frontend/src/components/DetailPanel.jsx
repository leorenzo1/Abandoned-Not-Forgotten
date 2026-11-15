import { useEffect, useState } from "react";
import { X, Camera, Volume2, Square, ExternalLink, Users, Target, FlaskConical, Award, MapPin, Sparkles } from "lucide-react";
import { formatLatLng } from "../utils/formatLatLng";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";

export default function DetailPanel({ object, isOpen, onClose }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [prevId, setPrevId] = useState(object?.id);
  const speechOk = isSpeechSupported();

  if (object?.id !== prevId) {
    setPrevId(object?.id);
    setIsSpeaking(false);
    stopSpeech();
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        stopSpeech();
        setIsSpeaking(false);
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopSpeech();
    };
  }, [isOpen, onClose]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const fullNarration = `${object.name}. Nicknamed ${object.nickname || ""}. ${object.storyboard || object.story}. Did you know? ${object.funFact || ""}`;
      speakText(fullNarration, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const isMars = object?.body?.toLowerCase() === "mars";
  const isMoon = object?.body?.toLowerCase() === "moon";
  const accentColor = isMoon ? "text-sky-400" : isMars ? "text-amber-400" : "text-purple-400";
  const badgeBorder = isMoon
    ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
    : isMars
    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
    : "border-purple-500/30 bg-purple-500/10 text-purple-300";

  return (
    <>
      {/* Dimmed backdrop on mobile & tablet */}
      {isOpen && object && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        aria-label="Machine story"
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l border-neutral-800 bg-neutral-950 shadow-[-20px_0_50px_rgba(0,0,0,0.98)] transition-transform duration-300 ease-out sm:w-[440px] lg:w-[480px] xl:w-[520px] ${
          isOpen && object ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Top Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 sm:px-8 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeBorder}`}>
              {object?.body}
            </span>
            {object?.year && (
              <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-xs text-neutral-400">
                {object.year}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        {object && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Title & Kid-friendly Nickname */}
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {object.name}
              </h3>
              {object.nickname && (
                <p className={`mt-1 text-base font-bold italic tracking-wide sm:text-lg ${accentColor}`}>
                  "{object.nickname}"
                </p>
              )}
              {object.mission && (
                <p className="mt-1 text-xs text-neutral-400 font-medium">
                  Mission: {object.mission}
                </p>
              )}
            </div>

            {/* Photo Frame or Research Image Template Placeholder */}
            {object.image ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md">
                <img
                  src={object.image}
                  alt={object.name}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />
                {object.imageCredit && (
                  <div className="bg-neutral-900 px-3 py-1 text-right text-xs text-neutral-400">
                    Credit: {object.imageCredit}
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
                <span className="text-[11px] text-neutral-400 mt-0.5 max-w-[240px]">
                  Curated photos from NASA archives
                </span>
              </div>
            )}

            {/* "Kid-Sized" Specs Grid */}
            <div className="space-y-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Explorer Dossier
              </h4>

              {object.where && (
                <div className="text-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Location</span>
                  <span className="text-neutral-200 font-medium">{object.where}</span>
                </div>
              )}

              {object.sizeComparison && (
                <div className="text-sm border-t border-neutral-800/60 pt-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Scale</span>
                  <span className="text-neutral-200 font-medium">{object.sizeComparison}</span>
                </div>
              )}

              {object.superpower && (
                <div className="text-sm border-t border-neutral-800/60 pt-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Superpower</span>
                  <span className="text-neutral-200 font-medium leading-snug">{object.superpower}</span>
                </div>
              )}

              {object.leftBehind && (
                <div className="text-sm border-t border-neutral-800/60 pt-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Left Behind on Surface</span>
                  <span className="text-neutral-200 font-medium">{object.leftBehind}</span>
                </div>
              )}

              <div className="text-sm border-t border-neutral-800/60 pt-2.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Resting Location & Coordinates</span>
                <span className="text-neutral-200 font-medium">{object.status || "Surface Monument"}</span>
                {object.coordinatesText ? (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-xs text-sky-400 font-semibold">
                      {object.coordinatesText}
                    </span>
                    {object.coordinatesLink && (
                      <a
                        href={object.coordinatesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                      >
                        <span>Traverse</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : object.lat != null ? (
                  <span className="block text-xs font-mono text-neutral-400 mt-0.5">
                    {formatLatLng(object.lat, object.lng)}
                  </span>
                ) : null}
              </div>
            </div>

            {/* "Did You Know?" Callout Box */}
            {object.funFact && (
              <div className={`rounded-2xl border p-4 shadow-sm ${
                isMars
                  ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                  : isMoon
                  ? "border-sky-500/30 bg-sky-950/20 text-sky-200"
                  : "border-purple-500/30 bg-purple-950/20 text-purple-200"
              }`}>
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Did You Know?</span>
                </h5>
                <p className="text-sm font-medium leading-relaxed text-neutral-200">
                  {object.funFact}
                </p>
              </div>
            )}

            {/* Story Narrative with Read Aloud narration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  The Story
                </h4>

                {speechOk && (
                  <button
                    onClick={handleToggleSpeech}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all ${
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
                    <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
                  </button>
                )}
              </div>
              <p className="text-base leading-relaxed text-neutral-200">
                {object.story || "Story coming soon."}
              </p>
            </div>

            {/* What We Learned */}
            {object.whatWeLearned && object.whatWeLearned.length > 0 && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-950/10 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
                  What We Learned
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-200">
                  {object.whatWeLearned.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Creators / People Involved */}
            {object.people && object.people.length > 0 && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-400" />
                  <span>People Involved & Creators</span>
                </h4>
                <ul className="space-y-1 text-xs text-neutral-200">
                  {object.people.map((p, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Purpose */}
            {object.mainPurpose && object.mainPurpose.length > 0 && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Main Mission Purpose</span>
                </h4>
                <ol className="space-y-1 text-xs text-neutral-200 list-decimal list-inside">
                  {object.mainPurpose.map((g, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="ml-1">{g}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Experiments */}
            {object.experiments && object.experiments.length > 0 && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Scientific Experiments</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-200">
                  {object.experiments.map((e, idx) => (
                    <li key={idx} className="rounded-lg bg-neutral-950/50 p-2.5 leading-relaxed">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {object.achievements && object.achievements.length > 0 && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>Key Achievements</span>
                </h4>
                <ol className="space-y-1 text-xs text-neutral-200 list-decimal list-inside">
                  {object.achievements.map((a, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="ml-1">{a}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Where Is It Now? */}
            {object.whereIsItNow && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Where Is It Now?</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {object.whereIsItNow}
                </p>
              </div>
            )}

            {/* External NASA link */}
            {object.sourceUrl && (
              <div className="pt-2 border-t border-neutral-800/80">
                <a
                  href={object.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>Explore official mission archive at NASA</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
