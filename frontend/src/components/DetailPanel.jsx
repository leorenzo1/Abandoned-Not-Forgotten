import { useEffect, useState } from "react";
import { X, Camera, ExternalLink, MapPin, Sparkles, ChevronRight, Calendar, Compass, ShieldCheck } from "lucide-react";

// Robust asset URL resolution helper
const getAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

export default function DetailPanel({ object, isOpen, onClose, onOpenTimeline }) {
  const [prevId, setPrevId] = useState(object?.id);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  if (object?.id !== prevId) {
    setPrevId(object?.id);
    setActivePhotoIdx(0);
    setImgError(false);
  }

  const handleSelectPhoto = (idx) => {
    setActivePhotoIdx(idx);
    setImgError(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
        aria-label="Explorer Overview"
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l border-neutral-800 bg-neutral-950 shadow-[-20px_0_50px_rgba(0,0,0,0.98)] transition-transform duration-300 ease-out sm:w-[440px] lg:w-[460px] xl:w-[480px] ${
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
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              Mission Overview
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Overview Body */}
        {object && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
            {/* Title & Kid-friendly Nickname */}
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {object.name}
              </h3>
              {object.nickname && (
                <p className={`mt-1 text-sm font-bold italic tracking-wide sm:text-base ${accentColor}`}>
                  "{object.nickname}"
                </p>
              )}
              {object.mission && (
                <p className="mt-1 text-xs text-neutral-400 font-medium">
                  NASA Mission: {object.mission}
                </p>
              )}
            </div>

            {/* Photo Gallery & Archival Imagery Frame */}
            {(() => {
              const gallery = (object.gallery && object.gallery.length > 0)
                ? object.gallery
                : (object.image ? [{ url: object.image, caption: object.name }] : []);
              const currentPhoto = gallery[activePhotoIdx] || gallery[0];

              if (currentPhoto?.url && !imgError) {
                return (
                  <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-md">
                    <div className="relative group">
                      <img
                        key={`${object?.id}-${activePhotoIdx}`}
                        src={getAssetUrl(currentPhoto.url)}
                        alt={currentPhoto.caption || object.name}
                        className="h-52 w-full object-cover transition-opacity duration-300"
                        loading="lazy"
                        onError={() => setImgError(true)}
                      />
                      {currentPhoto.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 text-[11px] text-neutral-300 font-medium">
                          {currentPhoto.caption}
                        </div>
                      )}
                    </div>

                    {gallery.length > 1 && (
                      <div className="flex items-center gap-1.5 p-2 bg-neutral-950 border-t border-neutral-800/80 overflow-x-auto">
                        {gallery.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectPhoto(idx)}
                            className={`relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border transition-all ${
                              activePhotoIdx === idx
                                ? "border-sky-400 ring-1 ring-sky-400 scale-105"
                                : "border-neutral-800 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={getAssetUrl(img.url)}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                        <span className="ml-auto text-[10px] text-neutral-400 pr-2">
                          {activePhotoIdx + 1} of {gallery.length} photos
                        </span>
                      </div>
                    )}

                    {object.imageCredit && (
                      <div className="bg-neutral-900 px-3 py-1 text-right text-[10px] text-neutral-400 border-t border-neutral-800/60">
                        {object.imageCredit}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-6 text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
                    <Camera className="h-6 w-6 text-neutral-400" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-300">
                    Archival Imagery
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5 max-w-[240px]">
                    NASA Mission Archives
                  </span>
                </div>
              );
            })()}

            {/* Quick Mission Overview / Summary (From NASA Challenge PDF) */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                <span>Mission Overview</span>
              </h4>
              <p className="text-sm font-medium leading-relaxed text-neutral-200">
                {object.overallSummary || object.story}
              </p>
            </div>

            {/* Primary Action Button: Jump Directly to Timeline Story */}
            {onOpenTimeline && (
              <button
                onClick={() => onOpenTimeline(object)}
                className="w-full flex items-center justify-between rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black shadow-lg transition-all hover:bg-neutral-200 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-sky-600" />
                  <span>Read Full Story in Timeline</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Quick Specs Grid */}
            <div className="space-y-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 text-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Explorer Quick Specs
              </h4>

              {/* Landing Date */}
              {(object.landingDate || object.quickTable?.when) && (
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-neutral-400" />
                    <span>Landed</span>
                  </span>
                  <span className="font-medium text-neutral-200 text-right">
                    {object.landingDate || object.quickTable?.when}
                  </span>
                </div>
              )}

              {/* Resting Location */}
              {(object.where || object.quickTable?.where) && (
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-neutral-400" />
                    <span>Location</span>
                  </span>
                  <span className="font-medium text-neutral-200 text-right">
                    {object.quickTable?.where || object.where}
                  </span>
                </div>
              )}

              {/* Surface Coordinates & Traverse */}
              {object.coordinatesText && (
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                  <span className="font-semibold text-neutral-400">Coordinates</span>
                  <div className="text-right">
                    <span className="font-mono text-[11px] font-bold text-sky-400 block">
                      {object.coordinatesText}
                    </span>
                    {object.coordinatesLink && (
                      <a
                        href={object.coordinatesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 mt-0.5"
                      >
                        <span>Traverse Map</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Left Behind / Distance / Key Milestone */}
              {(object.leftBehind || object.quickTable?.leftBehind) && (
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                  <span className="font-semibold text-neutral-400">Left Behind</span>
                  <span className="font-medium text-neutral-200 text-right">
                    {object.quickTable?.leftBehind || object.leftBehind}
                  </span>
                </div>
              )}

              {/* Distance or Last Message */}
              {object.quickTable?.distance && (
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-2">
                  <span className="font-semibold text-neutral-400">Total Distance</span>
                  <span className="font-medium text-neutral-200 text-right">
                    {object.quickTable.distance}
                  </span>
                </div>
              )}

              {/* Where is it now summary */}
              {object.whereIsItNow && (
                <div className="pt-1">
                  <span className="font-semibold text-neutral-400 block mb-1">Status on Surface</span>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                    {object.whereIsItNow}
                  </p>
                </div>
              )}
            </div>

            {/* "Did You Know?" Fact Card */}
            {object.funFact && (
              <div className={`rounded-2xl border p-4 shadow-sm ${
                isMars
                  ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                  : "border-sky-500/30 bg-sky-950/20 text-sky-200"
              }`}>
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Did You Know?</span>
                </h5>
                <p className="text-xs font-medium leading-relaxed text-neutral-200">
                  {object.funFact}
                </p>
              </div>
            )}

            {/* External NASA link */}
            {object.sourceUrl && (
              <div className="pt-1">
                <a
                  href={object.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  <span>Explore official mission archive at NASA</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
