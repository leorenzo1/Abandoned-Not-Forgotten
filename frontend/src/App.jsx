import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import Header from "./components/Header";
import LandingHero from "./components/LandingHero";
// Loaded on demand so three.js is only downloaded when the Explore view opens
const GlobeView = lazy(() => import("./components/GlobeView"));
import StoryView from "./components/StoryView";
import DetailPanel from "./components/DetailPanel";
import PassportModal from "./components/PassportModal";
import QuizModal from "./components/QuizModal";
import ReferencesModal from "./components/ReferencesModal";
import rawObjects from "./data/objects.json";

// Show the stories from oldest to newest
const objects = [...rawObjects].sort((a, b) => a.year - b.year);

const COOLDOWN_MS = 400;

export default function App() {
  const [currentView, setCurrentView] = useState("overview"); // "overview" | "map" | "subtabs" | "story"
  const [initialMapBody, setInitialMapBody] = useState("moon");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);
  const [discoveryToast, setDiscoveryToast] = useState(null);

  const validIds = new Set(objects.map((o) => o.id));

  // Persistent Explorer Passport discovery tracker (strictly sanitized to current valid missions)
  const [discoveredIds, setDiscoveredIds] = useState(() => {
    try {
      const saved = localStorage.getItem("anf_discovered_machines");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const clean = Array.isArray(parsed) ? parsed.filter((id) => validIds.has(id)) : [];
      localStorage.setItem("anf_discovered_machines", JSON.stringify(clean));
      return clean;
    } catch {
      return [];
    }
  });

  const timerRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const triggerCooldown = () => {
    setIsCooldown(true);
    timerRef.current = setTimeout(() => {
      setIsCooldown(false);
    }, COOLDOWN_MS);
  };

  const handleNavigateStory = (delta) => {
    if (isCooldown) return;
    const nextIdx = currentIndex + delta;
    if (nextIdx < 0 || nextIdx >= objects.length) return;
    setCurrentIndex(nextIdx);
    triggerCooldown();
  };

  const handleHeroNavigate = (targetView, body) => {
    if (body) setInitialMapBody(body);
    setCurrentView(targetView);
  };

  const handleViewIn3D = (obj) => {
    if (obj?.body) {
      setInitialMapBody(obj.body.toLowerCase());
    }
    setCurrentView("map");
    setSelectedObject(obj);
  };

  const handleSelectObject = (obj) => {
    setSelectedObject(obj);
    if (obj?.id && validIds.has(obj.id) && !discoveredIds.includes(obj.id)) {
      setDiscoveredIds((prev) => {
        const next = [...prev, obj.id];
        try {
          localStorage.setItem("anf_discovered_machines", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      // Show celebratory achievement toast
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setDiscoveryToast({
        name: obj.name,
        nickname: obj.nickname,
        body: obj.body,
      });
      toastTimerRef.current = setTimeout(() => {
        setDiscoveryToast(null);
      }, 3500);
    }
  };

  const handleDiscoverWithoutOpening = (obj) => {
    if (obj?.id && !discoveredIds.includes(obj.id)) {
      setDiscoveredIds((prev) => {
        const next = [...prev, obj.id];
        try {
          localStorage.setItem("anf_discovered_machines", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  const handleResetProgress = () => {
    setDiscoveredIds([]);
    try {
      localStorage.removeItem("anf_discovered_machines");
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative min-h-screen text-white select-none">
      {/* Serene Cosmic Starfield Background */}
      <Starfield />

      {/* Top Observatory Navigation Bar */}
      <Header
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          setSelectedObject(null);
        }}
        discoveredCount={discoveredIds.length}
        totalObjects={objects.length}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenReferences={() => setIsReferencesOpen(true)}
      />

      {/* Main Viewport */}
      <main
        className={`relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 transition-all duration-300 ease-out ${
          selectedObject ? "lg:pr-[440px] xl:pr-[480px]" : ""
        }`}
      >
        {currentView === "overview" && (
          <LandingHero
            onNavigate={handleHeroNavigate}
            onOpenQuiz={() => setIsQuizOpen(true)}
            onOpenPassport={() => setIsPassportOpen(true)}
            onOpenReferences={() => setIsReferencesOpen(true)}
          />
        )}

        {/* Kept mounted in the DOM to preserve WebGL context, camera angle, and prevent freezing on tab switch */}
        <div className={`w-full flex items-center justify-center ${currentView === "map" ? "" : "hidden pointer-events-none"}`}>
          <Suspense
            fallback={<p className="text-sm text-neutral-300">Loading the planets...</p>}
          >
            <GlobeView
              objects={objects}
              initialBody={initialMapBody}
              selectedId={selectedObject?.id}
              onSelectObject={handleSelectObject}
            />
          </Suspense>
        </div>

        {/* Chronological Timeline Journey */}
        {currentView === "story" && (
          <StoryView
            objects={objects}
            currentIndex={currentIndex}
            onNavigate={handleNavigateStory}
            isCooldown={isCooldown}
            onInspect={handleSelectObject}
            onViewIn3D={handleViewIn3D}
          />
        )}
      </main>

      {/* Explore 3D Mission Overview Sidebar */}
      <DetailPanel
        object={selectedObject}
        isOpen={!!selectedObject}
        onClose={() => setSelectedObject(null)}
        onOpenTimeline={(obj) => {
          const idx = objects.findIndex((o) => o.id === (obj?.id || selectedObject?.id));
          if (idx !== -1) setCurrentIndex(idx);
          setCurrentView("story");
          setSelectedObject(null);
        }}
      />

      {/* Explorer Passport Modal */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        objects={objects}
        discoveredIds={discoveredIds}
        onSelectObject={handleSelectObject}
        onResetProgress={handleResetProgress}
      />

      {/* Junior Space Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      {/* Official NASA References & Coordinates Modal */}
      <ReferencesModal
        isOpen={isReferencesOpen}
        onClose={() => setIsReferencesOpen(false)}
      />

      {/* Celebratory Discovery Toast */}
      {discoveryToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce">
          <div className="flex items-center gap-4 rounded-2xl border border-sky-400/50 bg-neutral-950/95 px-5 py-3 shadow-2xl backdrop-blur-md">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-400">
                New Passport Stamp Collected!
              </span>
              <span className="block text-sm font-bold text-white">
                {discoveryToast.name}
              </span>
            </div>
            <button
              onClick={() => setIsPassportOpen(true)}
              className="ml-2 rounded-xl bg-sky-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-sky-300 transition-colors"
            >
              View Passport
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
