import { useState, useEffect } from "react";
import {
  Volume2,
  Square,
  Camera,
  Sparkles,
  Compass,
  Box,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { formatLatLng } from "../utils/formatLatLng";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";

const getAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

export default function StoryView({
  objects,
  currentIndex,
  onNavigate,
  onSelectIndex,
  isCooldown,
  onInspect,
  onViewIn3D,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const speechOk = isSpeechSupported();

  const currentObject = objects[currentIndex] || objects[0];
  const isMars = currentObject?.body?.toLowerCase() === "mars";
  const accentColor = isMars ? "text-amber-400" : "text-sky-400";
  const badgeBorder = isMars
    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
    : "border-sky-500/30 bg-sky-500/10 text-sky-300";

  if (currentIndex !== prevIndex) {
    setPrevIndex(currentIndex);
    setIsSpeaking(false);
    setImgError(false);
    stopSpeech();
  }

  // Stop speech when story view unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Keyboard arrow navigation on desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        if (!isCooldown && currentIndex > 0) {
          onNavigate(-1);
        }
      } else if (e.key === "ArrowRight") {
        if (!isCooldown && currentIndex < objects.length - 1) {
          onNavigate(1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isCooldown, objects.length, onNavigate]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const fullNarration = `${currentObject.name}. Nicknamed ${
        currentObject.nickname || ""
      }. ${currentObject.storyboard || currentObject.story}. What we learned: ${(
        currentObject.whatWeLearned || []
      ).join(". ")}`;
      speakText(fullNarration, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleJumpTo = (idx) => {
    if (isCooldown || idx === currentIndex) return;
    if (onSelectIndex) {
      onSelectIndex(idx);
    } else {
      onNavigate(idx - currentIndex);
    }
  };

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] flex-col px-3 sm:px-6 lg:px-8 py-4 sm:py-6 transition-all duration-300">
      {/* Dynamic Header & Interactive Horizontal Timeline Rail */}
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Chronological Exploration Record
              </span>
              <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-400">
                1967 – Present
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Space Machine Timeline
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline font-mono text-xs text-neutral-400">
              Site <span className="text-white font-bold">{currentIndex + 1}</span> of {objects.length}
            </span>
            {currentObject?.year && (
              <span className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 font-mono text-sm font-bold text-white shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>{currentObject.year}</span>
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Milestone Rail (dynamic horizontal scrubber on desktop, swipeable on mobile) */}
        <div className="relative pt-2">
          {/* Subtle track line on desktop */}
          <div className="hidden lg:block absolute top-[22px] left-6 right-6 h-0.5 bg-neutral-800/80 -z-0" />

          <div className="flex items-center gap-2 lg:justify-between overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {objects.map((obj, idx) => {
              const isSelected = idx === currentIndex;
              const isObjMars = obj.body?.toLowerCase() === "mars";
              const dotColor = isObjMars ? "bg-amber-400" : "bg-sky-400";
              const activeBorder = isObjMars
                ? "border-amber-400 bg-amber-400/10 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50"
                : "border-sky-400 bg-sky-400/10 text-white shadow-lg shadow-sky-950/40 ring-1 ring-sky-400/50";

              return (
                <button
                  key={obj.id}
                  onClick={() => handleJumpTo(idx)}
                  title={`${obj.year}: ${obj.name} (${obj.body})`}
                  className={`group relative z-10 flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? activeBorder
                      : "border-neutral-800/80 bg-neutral-950/90 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 transition-transform ${dotColor} ${
                      isSelected ? "scale-125 ring-2 ring-white/30" : "opacity-60 group-hover:opacity-100"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-bold leading-none text-neutral-400 group-hover:text-neutral-300">
                      {obj.year}
                    </span>
                    <span className="text-xs font-semibold leading-tight line-clamp-1 max-w-[110px] xl:max-w-[130px]">
                      {obj.nickname || obj.name.split(" ")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Artifact Card: Widescreen Horizontal Presentation on PC */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/85 p-5 shadow-2xl backdrop-blur-md sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left / Narrative Column: Dynamic Horizontal Scaling on PC */}
          <div className="flex flex-col space-y-6 lg:col-span-7 xl:col-span-7 2xl:col-span-8">
            {/* Meta Tags & Voice Narration */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${badgeBorder}`}
                >
                  {currentObject?.body}
                </span>
                {currentObject?.mission && (
                  <span className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
                    Mission: {currentObject.mission}
                  </span>
                )}
              </div>

              {speechOk && (
                <button
                  onClick={handleToggleSpeech}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
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

            {/* Machine Name & Nickname */}
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {currentObject?.name}
              </h3>
              {currentObject?.nickname && (
                <p className={`mt-1 text-base font-bold italic tracking-wide sm:text-lg ${accentColor}`}>
                  "{currentObject.nickname}"
                </p>
              )}
            </div>

            {/* First-Person Story / Storyboard Narrative */}
            <div className="space-y-3.5 text-neutral-200">
              {(currentObject?.storyboard || currentObject?.story || "")
                .split("\n\n")
                .map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm sm:text-base xl:text-lg leading-relaxed text-neutral-200/95"
                  >
                    {para}
                  </p>
                ))}
            </div>

            {/* Side-by-Side Horizontal Subgrid for "What We Learned" & "Did You Know" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* What We Learned (From NASA Mission Science Data) */}
              {currentObject?.whatWeLearned && currentObject.whatWeLearned.length > 0 && (
                <div className="flex flex-col rounded-2xl border border-sky-500/20 bg-sky-950/25 p-5 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>What We Learned</span>
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-200 flex-1">
                    {currentObject.whatWeLearned.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold text-sm leading-none">•</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* "Did You Know?" Callout Card */}
              {currentObject?.funFact && (
                <div
                  className={`flex flex-col rounded-2xl border p-5 shadow-sm ${
                    isMars
                      ? "border-amber-500/30 bg-amber-950/25 text-amber-200"
                      : "border-sky-500/30 bg-sky-950/25 text-sky-200"
                  }`}
                >
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>Did You Know?</span>
                  </h5>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-neutral-200/95 flex-1">
                    {currentObject.funFact}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive 3D Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onViewIn3D && (
                <button
                  onClick={() => onViewIn3D(currentObject)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-md transition-all hover:bg-neutral-200 cursor-pointer"
                >
                  <Compass className="h-4 w-4 text-sky-600" />
                  <span>View on 3D Planet</span>
                </button>
              )}

              {onInspect && (
                <button
                  onClick={() => onInspect(currentObject)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-4 py-2.5 text-xs font-semibold text-neutral-300 transition-all hover:border-neutral-600 hover:text-white cursor-pointer"
                >
                  <Box className="h-3.5 w-3.5 text-sky-400" />
                  <span>Inspect 3D Hardware</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>

          {/* Right / Media & Specs Column: Cinema Archival Photo & Coords */}
          <div className="flex flex-col space-y-4 lg:col-span-5 xl:col-span-5 2xl:col-span-4">
            {/* Cinematic Archival Photo */}
            {currentObject?.image && !imgError ? (
              <div className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
                <img
                  key={currentObject.id}
                  src={getAssetUrl(currentObject.image)}
                  alt={currentObject.name}
                  className="aspect-[16/10] sm:aspect-video lg:aspect-[16/11] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
                {currentObject.imageCredit && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3.5 py-2 text-right text-[11px] font-medium text-neutral-300">
                    Credit: {currentObject.imageCredit}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-8 text-center aspect-[16/10]">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
                  <Camera className="h-6 w-6 text-neutral-400" />
                </div>
                <span className="text-xs font-semibold text-neutral-300">
                  Archival NASA Photography
                </span>
                <span className="text-[11px] text-neutral-400 mt-1 max-w-[220px]">
                  {currentObject.name}
                </span>
              </div>
            )}

            {/* Landing Site Card */}
            {currentObject?.where && (
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Landing Site</span>
                </div>
                <span className="text-sm font-semibold text-white leading-snug">
                  {currentObject.where}
                </span>
              </div>
            )}

            {/* Surface Coordinates Card */}
            {currentObject?.coordinatesText ? (
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span>Surface Coordinates</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs sm:text-sm text-sky-300 font-bold">
                    {currentObject.coordinatesText}
                  </span>
                  {currentObject.coordinatesLink && (
                    <a
                      href={currentObject.coordinatesLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20 transition-all"
                    >
                      Traverse ↗
                    </a>
                  )}
                </div>
              </div>
            ) : currentObject?.lat != null ? (
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span>Surface Coordinates</span>
                </div>
                <span className="font-mono text-sm font-semibold text-neutral-200">
                  {formatLatLng(currentObject.lat, currentObject.lng)}
                </span>
              </div>
            ) : null}

            {/* Mission Historical Status Note */}
            <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-3.5 text-xs text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isMars ? "bg-amber-400" : "bg-sky-400"}`} />
                <span>Preserved Historical Site</span>
              </span>
              <span className="font-mono font-medium text-neutral-300">
                {currentObject.body === "moon" ? "Lunar Heritage" : "Martian Relic"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Footer */}
      <div className="mt-5 flex items-center justify-between">
        <button
          disabled={isCooldown || currentIndex === 0}
          onClick={() => onNavigate(-1)}
          className="flex items-center gap-1.5 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm text-neutral-400 font-mono font-medium">
            <span className="text-white font-bold">{currentIndex + 1}</span> / {objects.length}
          </span>
          <span className="hidden md:inline text-[11px] text-neutral-400">
            Tip: Use ← → keys to navigate
          </span>
        </div>

        <button
          disabled={isCooldown || currentIndex === objects.length - 1}
          onClick={() => onNavigate(1)}
          className="flex items-center gap-1.5 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
