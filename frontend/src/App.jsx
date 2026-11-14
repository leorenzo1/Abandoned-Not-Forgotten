import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import Header from "./components/Header";
import LandingHero from "./components/LandingHero";
// Loaded on demand so three.js is only downloaded when the Explore view opens
const GlobeView = lazy(() => import("./components/GlobeView"));
import StoryView from "./components/StoryView";
import DetailPanel from "./components/DetailPanel";
import rawObjects from "./data/objects.json";

// Show the stories from oldest to newest
const objects = [...rawObjects].sort((a, b) => a.year - b.year);

const STEP = 2.2; // radians per click, about 125 degrees
const COOLDOWN_MS = 1400; // aligns with the ~1.5s spring settle time

export default function App() {
  const [currentView, setCurrentView] = useState("overview"); // "overview" | "map" | "story"
  const [initialMapBody, setInitialMapBody] = useState("moon");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const timerRef = useRef(null);

  const [storyAngle, setStoryAngle] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
    setStoryAngle((prev) => prev - delta * STEP);
    triggerCooldown();
  };

  const handleHeroNavigate = (targetView, body) => {
    if (body) setInitialMapBody(body);
    setCurrentView(targetView);
  };

  const handleSelectObject = (obj) => {
    setSelectedObject(obj);
  };

  // Starfield rotation angle: only changes when clicking Previous/Next within Timeline view
  const targetStarfieldAngle = currentView === "story" ? storyAngle : 0;

  return (
    <div className="relative min-h-screen text-white select-none">
      {/* Background Starfield with celestial rotation scheme & comets */}
      <Starfield target={targetStarfieldAngle} />

      {/* Top Observatory Navigation Bar */}
      <Header
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          setSelectedObject(null);
        }}
        totalObjects={objects.length}
      />

      {/* Main Viewport */}
      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        {currentView === "overview" && (
          <LandingHero onNavigate={handleHeroNavigate} />
        )}

        {currentView === "map" && (
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
        )}

        {currentView === "story" && (
          <StoryView
            objects={objects}
            currentIndex={currentIndex}
            onNavigate={handleNavigateStory}
            isCooldown={isCooldown}
            onInspect={setSelectedObject}
          />
        )}
      </main>

      {/* Smooth Non-Blurring Sidebar Dossier */}
      <DetailPanel
        object={selectedObject}
        isOpen={!!selectedObject}
        onClose={() => setSelectedObject(null)}
      />
    </div>
  );
}
