import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import MapView from "./MapView";
import { latLngToVector3 } from "../utils/sphere";

/* ------------------------------------------------------------------ *
 * Per-body setup.
 *  - model:      optional NASA GLB. Drop the file in frontend/public/models/
 *                and it is picked up automatically (no code change needed).
 *  - texture:    fallback equirectangular texture used when there is no GLB.
 *  - modelRotationDeg: spin the GLB around its polar axis so its 0° longitude
 *                lines up with the pins. Tune it live with ?rot=90 in the URL.
 *  - pinRadius:  radius the pins sit on (raise it if the GLB has exaggerated
 *                terrain and the pins sink into the surface).
 * ------------------------------------------------------------------ */
const BODIES = {
  moon: {
    label: "Moon",
    model: null, // High-performance 1MB 2K texture; prevents freezing the main thread with 54MB / 750,000-poly GLB
    texture: "/moon-texture.jpg",
    modelRotationDeg: 0,
    pinRadius: 1,
    accent: "#38bdf8",
    halo: "bg-sky-400/20",
    credit: "NASA",
  },
  mars: {
    label: "Mars",
    model: "/models/mars.glb",
    texture: "/mars-texture.jpg",
    modelRotationDeg: 0,
    pinRadius: 1,
    accent: "#fbbf24",
    halo: "bg-amber-600/30",
    credit: "NASA/JPL-Caltech",
  },
};

// Preload assets at module load time so switching planets has zero freeze
useTexture.preload("/moon-texture.jpg");
useGLTF.preload("/models/mars.glb");

const CAMERA_DISTANCE = 3.2;
const DEFAULT_FOCUS = latLngToVector3(10, 0, 1);

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function getRotationOverride() {
  const raw = new URLSearchParams(window.location.search).get("rot");
  const value = raw === null ? NaN : Number(raw);
  return Number.isFinite(value) ? value : null;
}

class ModelBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("NASA 3D model failed to load, using the texture globe instead.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ----------------------------- 3D pieces ----------------------------- */

function TexturedSphere({ url }) {
  const map = useTexture(url);
  return (
    <mesh>
      <sphereGeometry args={[1, 128, 64]} />
      <meshStandardMaterial map={map} roughness={1} metalness={0} />
    </mesh>
  );
}

function GlbBody({ url, rotationDeg }) {
  const { scene } = useGLTF(url);

  // Centre the model and scale it to a unit-radius ball so pins line up.
  const { model, scale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return { model: clone, scale: 2 / Math.max(size.x, size.y, size.z) };
  }, [scene]);

  return (
    <group rotation={[0, THREE.MathUtils.degToRad(rotationDeg), 0]} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

function PlanetBody({ config, rotationDeg, onModelState }) {
  const hasModel = Boolean(config.model);

  useEffect(() => {
    onModelState(hasModel);
  }, [hasModel, onModelState]);

  if (!hasModel) {
    return <TexturedSphere url={config.texture} />;
  }

  return (
    <ModelBoundary fallback={<TexturedSphere url={config.texture} isDeepSpace={config.isDeepSpace} />}>
      <Suspense
        fallback={
          <mesh>
            <sphereGeometry args={[1, 64, 32]} />
            <meshStandardMaterial color="#141419" roughness={0.9} />
          </mesh>
        }
      >
        <GlbBody url={config.model} rotationDeg={rotationDeg} />
      </Suspense>
    </ModelBoundary>
  );
}

function Pin({ obj, radius, accent, isActive, isHovered, onSelect, onHover }) {
  const ripple1Ref = useRef(null);
  const ripple2Ref = useRef(null);
  const beaconHeadRef = useRef(null);
  const haloRef = useRef(null);
  const STALK_HEIGHT = 0.11;

  const position = useMemo(() => latLngToVector3(obj.lat, obj.lng, radius), [obj.lat, obj.lng, radius]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize()),
    [position]
  );

  // Animated continuous radar ripples and floating beacon head
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    // Gentle vertical bob for beacon head
    if (beaconHeadRef.current) {
      const bob = Math.sin(time * 3 + obj.lat * 4) * 0.007;
      beaconHeadRef.current.position.y = STALK_HEIGHT + bob;
      beaconHeadRef.current.rotation.y = time * 0.8;
    }

    // Breathing glow halo
    if (haloRef.current) {
      const pulse = 1 + 0.22 * Math.sin(time * 3.5 + obj.lng * 4);
      haloRef.current.scale.setScalar(pulse);
      const baseAlpha = isActive ? 0.75 : isHovered ? 0.6 : 0.35;
      haloRef.current.material.opacity = baseAlpha * (0.8 + 0.2 * Math.sin(time * 5));
    }

    // Ripple wave 1
    if (ripple1Ref.current) {
      const speed = isActive ? 1.4 : 0.7;
      const t1 = ((time * speed + obj.lat * 2) % 1 + 1) % 1;
      ripple1Ref.current.scale.setScalar(1 + t1 * 2.6);
      ripple1Ref.current.material.opacity = (1 - t1) * (isActive ? 0.85 : isHovered ? 0.65 : 0.4);
    }

    // Ripple wave 2 (offset)
    if (ripple2Ref.current) {
      const speed = isActive ? 1.4 : 0.7;
      const t2 = ((time * speed + 0.5 + obj.lat * 2) % 1 + 1) % 1;
      ripple2Ref.current.scale.setScalar(1 + t2 * 2.6);
      ripple2Ref.current.material.opacity = (1 - t2) * (isActive ? 0.85 : isHovered ? 0.65 : 0.4);
    }
  });

  const headScale = isActive ? 1.4 : isHovered ? 1.25 : 1.0;

  return (
    <group position={position} quaternion={quaternion}>
      {/* Surface Base Target Dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[0.018, 20]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Surface Radar Ripple 1 */}
      <mesh ref={ripple1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.022, 0.03, 32]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Surface Radar Ripple 2 */}
      <mesh ref={ripple2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.022, 0.03, 32]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Holographic Light Beam Stalk (dual layer) */}
      {/* Inner laser core */}
      <mesh position={[0, STALK_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.004, STALK_HEIGHT, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Outer energy beam sheath */}
      <mesh position={[0, STALK_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.008, STALK_HEIGHT, 8]} />
        <meshBasicMaterial color={accent} transparent opacity={isActive ? 0.65 : 0.4} />
      </mesh>

      {/* Floating Beacon Head */}
      <group ref={beaconHeadRef} position={[0, STALK_HEIGHT, 0]} scale={headScale}>
        {/* Core brilliant crystal */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <octahedronGeometry args={[0.032, 0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Luminous corona glow shell */}
        <mesh ref={haloRef}>
          <sphereGeometry args={[0.048, 16, 16]} />
          <meshBasicMaterial color={accent} transparent opacity={0.35} depthWrite={false} />
        </mesh>

        {/* Top antenna flare */}
        <mesh position={[0, 0.038, 0]}>
          <coneGeometry args={[0.008, 0.02, 8]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      </group>

      {/* Tap/Click hit target area */}
      <mesh
        position={[0, STALK_HEIGHT, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(obj);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(obj.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Sleek Tooltip Badge on Hover / Active */}
      {(isActive || isHovered) && (
        <Html position={[0, STALK_HEIGHT + 0.12, 0]} center style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center rounded-2xl border border-neutral-700/80 bg-neutral-950/90 px-3.5 py-2 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: accent }} />
              <span className="text-[11px] font-mono font-semibold text-neutral-400">
                {obj.year}
              </span>
            </div>
            <span className="whitespace-nowrap text-xs font-bold text-white tracking-wide">
              {obj.name}
            </span>
            {obj.nickname && (
              <span className="whitespace-nowrap text-[11px] font-semibold italic text-sky-400 mt-0.5">
                "{obj.nickname}"
              </span>
            )}
            <span className="mt-1 text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
              {isActive ? "Viewing dossier" : "Tap to visit"}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Calculate shortest angular distance on a circle
function shortestAngleDiff(target, current) {
  let diff = (target - current) % (2 * Math.PI);
  if (diff < -Math.PI) diff += 2 * Math.PI;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  return diff;
}

// Smoothly swings the camera around the planet using spherical coordinates.
// This prevents gimbal flips, roll inversion, and jittering with OrbitControls.
function CameraRig({ focus, controlsRef, onArrive }) {
  const targetSpherical = useRef(null);

  useEffect(() => {
    if (!focus) {
      targetSpherical.current = null;
      return;
    }
    const sph = new THREE.Spherical().setFromVector3(focus);
    // Clamp slightly away from exact pole singularities to prevent gimbal lock
    sph.phi = Math.max(0.08, Math.min(Math.PI - 0.08, sph.phi));
    targetSpherical.current = sph;
  }, [focus]);

  useFrame(({ camera }, dt) => {
    const goal = targetSpherical.current;
    if (!goal) return;

    const curSph = new THREE.Spherical().setFromVector3(camera.position);
    const diffTheta = shortestAngleDiff(goal.theta, curSph.theta);
    const diffPhi = goal.phi - curSph.phi;

    // Settle distance smoothly between 2.2 and 3.4
    const desiredRadius = Math.max(2.2, Math.min(camera.position.length(), 3.4));
    const diffRadius = desiredRadius - curSph.radius;

    if (Math.abs(diffTheta) < 0.002 && Math.abs(diffPhi) < 0.002) {
      targetSpherical.current = null;
      camera.position.setFromSphericalCoords(desiredRadius, goal.phi, goal.theta);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      onArrive?.();
      return;
    }

    // Smooth exponential ease
    const t = 1 - Math.exp(-dt * 5.5);
    const nextTheta = curSph.theta + diffTheta * t;
    const nextPhi = curSph.phi + diffPhi * t;
    const nextRadius = curSph.radius + diffRadius * t;

    camera.position.setFromSphericalCoords(nextRadius, nextPhi, nextTheta);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  });

  return null;
}

// Keeps the sunlit side facing the viewer so the planet never goes dark while spinning.
function CameraLight() {
  const light = useRef(null);
  useFrame(({ camera }) => {
    if (!light.current) return;
    light.current.position
      .set(-2.5, 2, 1)
      .applyQuaternion(camera.quaternion)
      .add(camera.position);
  });
  return <directionalLight ref={light} intensity={2.4} />;
}

/* ------------------------------ the view ------------------------------ */

function Globe3D({ objects, initialBody, selectedId, onSelectObject }) {
  const [body, setBody] = useState(initialBody);
  const [prevInitial, setPrevInitial] = useState(initialBody);
  const [hoveredId, setHoveredId] = useState(null);
  const [spin, setSpin] = useState(true);
  const [focus, setFocus] = useState(null);
  const [usingNasaModel, setUsingNasaModel] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const controlsRef = useRef(null);

  // Sync state during render when prop changes (React 19 pattern)
  if (initialBody && initialBody !== prevInitial) {
    setPrevInitial(initialBody);
    setBody(initialBody);
  }

  const config = BODIES[body] ?? BODIES.moon;
  const rotationOverride = useMemo(() => getRotationOverride(), []);
  const rotationDeg = rotationOverride ?? config.modelRotationDeg;

  const bodyObjects = useMemo(
    () => objects.filter((o) => o.body?.toLowerCase() === body),
    [objects, body]
  );
  const activeId = bodyObjects.some((o) => o.id === selectedId) ? selectedId : null;

  const initialCameraPosition = useMemo(
    () => DEFAULT_FOCUS.clone().multiplyScalar(CAMERA_DISTANCE).toArray(),
    []
  );

  const selectObject = (obj) => {
    onSelectObject(obj);
    if (obj.lat != null && obj.lng != null) {
      setIsNavigating(true);
      setFocus(latLngToVector3(obj.lat, obj.lng, 1));
    }
  };

  const switchBody = (next) => {
    if (next === body) return;
    setBody(next);
    setHoveredId(null);
    onSelectObject(null);
    setIsNavigating(false);
    setFocus(null);
  };

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Explore the Moon and Mars
          </h2>
          <p className="mt-0.5 text-sm text-neutral-300">
            Drag to spin, scroll to zoom, and tap a pin to meet a machine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSpin((s) => !s)}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
          >
            {spin ? "Stop spinning" : "Keep spinning"}
          </button>

          <div className="inline-flex rounded-2xl border border-neutral-800 bg-neutral-950 p-1">
            {Object.entries(BODIES).map(([id, b]) => (
              <button
                key={id}
                onClick={() => switchBody(id)}
                className={`rounded-xl px-4 py-1 text-sm font-medium transition-colors ${
                  body === id ? "bg-white text-black shadow-sm" : "text-neutral-300 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/30 shadow-2xl">
        {/* 3D Stage Viewport */}
        <div className="relative h-[400px] w-full sm:h-[480px] lg:h-[540px]">
          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl transition-colors duration-700 ${config.halo}`}
          />

          <Canvas
            camera={{ position: initialCameraPosition, fov: 40, near: 0.1, far: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.35} />
            <CameraLight />

            <Suspense fallback={null}>
              <PlanetBody key={body} config={config} rotationDeg={rotationDeg} onModelState={setUsingNasaModel} />
            </Suspense>

            {bodyObjects
              .filter((o) => o.lat != null && o.lng != null)
              .map((obj) => (
                <Pin
                  key={obj.id}
                  obj={obj}
                  radius={config.pinRadius}
                  accent={config.accent}
                  isActive={obj.id === activeId}
                  isHovered={obj.id === hoveredId}
                  onSelect={selectObject}
                  onHover={setHoveredId}
                />
              ))}

            <CameraRig
              focus={focus}
              controlsRef={controlsRef}
              onArrive={() => {
                setIsNavigating(false);
                setFocus(null);
              }}
            />
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.55}
              zoomSpeed={0.7}
              minDistance={1.7}
              maxDistance={6}
              autoRotate={spin && !activeId && !isNavigating}
              autoRotateSpeed={0.6}
              onStart={() => {
                setFocus(null);
                setIsNavigating(false);
              }}
            />
          </Canvas>

          {usingNasaModel && (
            <div className="pointer-events-none absolute bottom-3 left-4 text-xs text-neutral-400">
              3D model: {config.credit}
            </div>
          )}
        </div>

        {/* Integrated Machine Control Tray */}
        <div className="border-t border-neutral-800/80 bg-neutral-950/70 p-3.5 backdrop-blur-md sm:p-4">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shadow-sm"
                style={{ backgroundColor: config.accent }}
              />
              <span className="text-xs font-semibold tracking-wider uppercase text-neutral-300">
                {config.label} Sites ({bodyObjects.length})
              </span>
            </div>
            <span className="hidden text-xs text-neutral-400 sm:inline">
              Select a site to focus the camera
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {bodyObjects.map((obj) => {
              const isSelected = obj.id === activeId;
              return (
                <button
                  key={obj.id}
                  onClick={() => selectObject(obj)}
                  onMouseEnter={() => setHoveredId(obj.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                    isSelected
                      ? "border-white bg-white text-black shadow-md scale-[1.01]"
                      : "border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/80 hover:text-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold sm:text-sm">
                      {obj.name}
                    </span>
                    {obj.nickname && (
                      <span className={`block truncate text-[11px] font-medium italic ${
                        isSelected ? "text-neutral-700" : "text-neutral-400 group-hover:text-sky-300"
                      }`}>
                        "{obj.nickname}"
                      </span>
                    )}
                  </div>
                  {obj.year && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] ${
                        isSelected
                          ? "bg-neutral-200 text-neutral-800"
                          : "bg-neutral-800 text-neutral-400 group-hover:text-neutral-300"
                      }`}
                    >
                      {obj.year}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Falls back to the original flat-texture globe if the browser has no WebGL.
export default function GlobeView(props) {
  const [webglOk] = useState(hasWebGL);
  if (!webglOk) {
    return (
      <MapView
        objects={props.objects}
        initialBody={props.initialBody}
        onSelectObject={props.onSelectObject}
      />
    );
  }
  return <Globe3D {...props} />;
}
