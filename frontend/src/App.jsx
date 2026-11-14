import { useEffect, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import Header from "./components/Header";
import LandingHero from "./components/LandingHero";
import MapView from "./components/MapView";
import StoryView from "./components/StoryView";
import DetailPanel from "./components/DetailPanel";
import objects from "./data/objects.json";

const STEP = 2.2; // radians per click, about 125 degrees
const COOLDOWN_MS = 1400; // aligns with the ~1.5s spring settle time

export default function App() {
  const [currentView, setCurrentView] = useState("overview"); // "overview" | "map" | "story"
  const [initialMapBody, setInitialMapBody] = useState("moon");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const timerRef = useRef(null);

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
    triggerCooldown();
  };

  const handleHeroNavigate = (targetView, body) => {
    if (body) setInitialMapBody(body);
    setCurrentView(targetView);
  };

  const handleSelectObject = (obj) => {
    setSelectedObject(obj);
    const objIndex = objects.findIndex((item) => item.id === obj.id);
    if (objIndex !== -1) {
      setCurrentIndex(objIndex);
    }
  };

  // Starfield rotation angle: turns during timeline navigation
  const targetStarfieldAngle = currentView === "story" ? -currentIndex * STEP : 0;

  return (
    <div className="relative min-h-screen text-white select-none">
      {/* Background Starfield with celestial rotation scheme & comets */}
      <Starfield target={targetStarfieldAngle} />

      {/* Top Observatory Navigation Bar */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        totalObjects={objects.length}
      />

      {/* Main Viewport */}
      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        {currentView === "overview" && (
          <LandingHero onNavigate={handleHeroNavigate} />
        )}

        {currentView === "map" && (
          <MapView
            objects={objects}
            initialBody={initialMapBody}
            onSelectObject={handleSelectObject}
          />
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

      {/* Telemetry Detail Slide-Over Modal */}
      {selectedObject && (
        <DetailPanel
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}
    </div>
  );
}
