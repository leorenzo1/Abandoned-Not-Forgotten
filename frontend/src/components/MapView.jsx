import { useState, useRef, useEffect, useCallback } from "react";

export default function MapView({ objects, onSelectObject, initialBody = "moon", onBodyChange }) {
  const [selectedBody, setSelectedBody] = useState(initialBody);
  const [activeObjectId, setActiveObjectId] = useState(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [currentTheta, setCurrentTheta] = useState(0);
  const [globeSize, setGlobeSize] = useState(380);

  const globeRef = useRef(null);
  const targetThetaRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startThetaRef = useRef(0);

  const filteredObjects = objects.filter(
    (obj) => obj.body?.toLowerCase() === selectedBody.toLowerCase()
  );

  const isMars = selectedBody.toLowerCase() === "mars";
  const textureUrl = isMars ? "/mars-texture.jpg" : "/moon-texture.jpg";

  // Measure globe size responsively
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 640) setGlobeSize(290);
      else if (w < 1024) setGlobeSize(360);
      else setGlobeSize(400);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleBodySwitch = (body) => {
    if (body === selectedBody) return;
    const prev = selectedBody;
    setSelectedBody(body);
    setCurrentTheta(0);
    targetThetaRef.current = null;
    setActiveObjectId(null);
    onBodyChange?.(body, prev);
  };

  // Shortest angular difference between two angles
  const shortestAngleDiff = (target, current) => {
    let diff = (target - current) % (2 * Math.PI);
    if (diff < -Math.PI) diff += 2 * Math.PI;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    return diff;
  };

  // Main animation loop: smooth rotation and panning
  useEffect(() => {
    let raf;
    const animate = (time) => {
      const dt = Math.min((time - (lastTimeRef.current || time)) / 1000, 0.05) || 0.016;
      lastTimeRef.current = time;

      if (!isDraggingRef.current) {
        if (targetThetaRef.current !== null) {
          setCurrentTheta((prevTheta) => {
            const diff = shortestAngleDiff(targetThetaRef.current, prevTheta);
            if (Math.abs(diff) < 0.005) {
              const finalVal = targetThetaRef.current;
              targetThetaRef.current = null;
              return finalVal;
            }
            return prevTheta + diff * Math.min(1, dt * 6.5);
          });
        } else if (isAutoRotating) {
          setCurrentTheta((prevTheta) => (prevTheta + 0.08 * dt) % (2 * Math.PI));
        }
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isAutoRotating]);

  // Pan directly to an object's longitude
  const panToObject = useCallback((obj) => {
    const lngRad = ((obj.lng ?? 0) * Math.PI) / 180;
    targetThetaRef.current = lngRad;
    setActiveObjectId(obj.id);
    onSelectObject(obj);
  }, [onSelectObject]);

  // Interactive mouse/touch dragging to spin planet
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startThetaRef.current = currentTheta;
    targetThetaRef.current = null;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const dx = clientX - startXRef.current;
    const radPerPixel = (2 * Math.PI) / (globeSize * 2.5);
    setCurrentTheta(startThetaRef.current - dx * radPerPixel);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Spherical projection for surface dots
  const radius = globeSize / 2;
  const bgTextureWidth = globeSize * 2;
  const bgPosX = -((currentTheta / (2 * Math.PI)) % 1) * bgTextureWidth;

  const visibleDots = filteredObjects.map((obj) => {
    const lngRad = ((obj.lng ?? 0) * Math.PI) / 180;
    const latRad = ((obj.lat ?? 0) * Math.PI) / 180;

    let dLng = (lngRad - currentTheta) % (2 * Math.PI);
    if (dLng < -Math.PI) dLng += 2 * Math.PI;
    if (dLng > Math.PI) dLng -= 2 * Math.PI;

    const isFront = Math.abs(dLng) < Math.PI / 2;
    if (!isFront) return null;

    // 3D Orthographic spherical projection
    const x = radius + radius * Math.cos(latRad) * Math.sin(dLng);
    const y = radius - radius * Math.sin(latRad);
    const z = Math.cos(latRad) * Math.cos(dLng);

    if (z <= 0.08) return null;

    const isActive = activeObjectId === obj.id;

    return {
      obj,
      x,
      y,
      z,
      scale: Math.max(0.6, z),
      opacity: Math.max(0.2, (z - 0.08) / 0.92),
      isActive,
    };
  }).filter(Boolean);

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-8">
      {/* Top Header Bar */}
      <div className="flex w-full flex-col gap-4 border-b border-neutral-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Explore the Moon and Mars
          </h2>
          <p className="mt-0.5 text-sm text-neutral-300">
            Drag the planet to spin it. Tap a dot to meet a machine.
          </p>
        </div>

        {/* Clean World Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
          >
            {isAutoRotating ? "Stop spinning" : "Keep spinning"}
          </button>

          <div className="inline-flex rounded-2xl border border-neutral-800 bg-neutral-950 p-1">
            <button
              onClick={() => handleBodySwitch("moon")}
              className={`rounded-xl px-4 py-1 text-sm font-medium transition-colors ${
                !isMars ? "bg-white text-black shadow-sm" : "text-neutral-300 hover:text-white"
              }`}
            >
              Moon
            </button>
            <button
              onClick={() => handleBodySwitch("mars")}
              className={`rounded-xl px-4 py-1 text-sm font-medium transition-colors ${
                isMars ? "bg-white text-black shadow-sm" : "text-neutral-300 hover:text-white"
              }`}
            >
              Mars
            </button>
          </div>
        </div>
      </div>

      {/* Rotating Celestial Planet Globe Stage */}
      <div className="relative my-8 flex items-center justify-center">
        {/* Subtle space ambient halo */}
        <div
          style={{ width: globeSize + 60, height: globeSize + 60 }}
          className={`pointer-events-none absolute rounded-full opacity-35 blur-2xl transition-all duration-700 ${
            isMars ? "bg-amber-600/30" : "bg-sky-400/20"
          }`}
        />

        {/* Planet Sphere */}
        <div
          ref={globeRef}
          style={{
            width: globeSize,
            height: globeSize,
            backgroundImage: `url(${textureUrl})`,
            backgroundSize: `${bgTextureWidth}px ${globeSize}px`,
            backgroundPosition: `${bgPosX}px 0px`,
            backgroundRepeat: "repeat-x",
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="relative cursor-grab rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.95)] active:cursor-grabbing select-none"
        >
          {/* Spherical 3D Light & Shadow Mask */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_32%,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_-30px_-30px_60px_rgba(0,0,0,0.95),inset_15px_15px_30px_rgba(255,255,255,0.1)]" />

          {/* Surface Placeholder Site Dots Rotating with Planet */}
          {visibleDots.map(({ obj, x, y, z, scale, opacity, isActive }) => (
            <button
              key={obj.id}
              onClick={(e) => {
                e.stopPropagation();
                panToObject(obj);
              }}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale * (isActive ? 1.4 : 1)})`,
              }}
              className="group absolute z-30 flex items-center justify-center focus:outline-none"
              aria-label={`Inspect ${obj.name}`}
            >
              {/* Target dot with subtle halo */}
              <span
                className={`h-5 w-5 rounded-full border-2 shadow-md transition-all ${
                  isActive
                    ? (isMars ? "border-white bg-amber-400 shadow-[0_0_12px_#fbbf24]" : "border-white bg-sky-400 shadow-[0_0_12px_#38bdf8]")
                    : "border-white/80 bg-white shadow-sm group-hover:scale-125"
                }`}
              />

              {/* Tooltip on front face */}
              <div
                style={{ opacity: z > 0.4 ? 1 : z * 2.5 }}
                className="pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded border border-neutral-700 bg-neutral-900/95 px-2 py-0.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                {obj.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation: Click to Pan Directly to Object */}
      <div className="w-full max-w-2xl text-center">
        <p className="text-sm font-semibold text-neutral-300">
          Or pick a machine below
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {filteredObjects.map((obj) => {
            const isSelected = activeObjectId === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => panToObject(obj)}
                className={`rounded-2xl border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "border-white bg-white text-black shadow-md"
                    : "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <span>{obj.name}</span>
                {obj.year && <span className="ml-1.5 text-sm opacity-60">({obj.year})</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
