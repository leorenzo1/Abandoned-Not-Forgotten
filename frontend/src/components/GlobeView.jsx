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
    model: "/models/moon.glb",
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

// True only if the file really exists (dev servers answer 200 + HTML for missing files).
function useAssetExists(url) {
  const [result, setResult] = useState({ url: null, ok: false });

  useEffect(() => {
    let cancelled = false;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        const type = res.headers.get("content-type") || "";
        if (!cancelled) setResult({ url, ok: res.ok && !type.includes("text/html") });
      })
      .catch(() => {
        if (!cancelled) setResult({ url, ok: false });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // null = still checking
  return result.url === url ? result.ok : null;
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
  const modelExists = useAssetExists(config.model);

  useEffect(() => {
    onModelState(modelExists === true);
  }, [modelExists, onModelState]);

  const sphere = <TexturedSphere url={config.texture} />;
  if (modelExists !== true) return sphere;

  return (
    <ModelBoundary fallback={sphere}>
      <Suspense fallback={sphere}>
        <GlbBody url={config.model} rotationDeg={rotationDeg} />
      </Suspense>
    </ModelBoundary>
  );
}

function Pin({ obj, radius, accent, isActive, isHovered, onSelect, onHover }) {
  const ringRef = useRef(null);
  const STALK = 0.09;

  const position = useMemo(() => latLngToVector3(obj.lat, obj.lng, radius), [obj.lat, obj.lng, radius]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize()),
    [position]
  );

  // Pulsing ring around the selected pin
  useFrame(({ clock }) => {
    const ring = ringRef.current;
    if (!ring) return;
    const t = (clock.elapsedTime * 0.9) % 1;
    ring.scale.setScalar(1 + t * 2.2);
    ring.material.opacity = 0.7 * (1 - t);
  });

  const color = isActive ? accent : "#ffffff";
  const headScale = isActive ? 1.5 : isHovered ? 1.3 : 1;

  return (
    <group position={position} quaternion={quaternion}>
      {/* stalk */}
      <mesh position={[0, STALK / 2, 0]}>
        <cylinderGeometry args={[0.006, 0.006, STALK, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* head */}
      <mesh position={[0, STALK, 0]} scale={headScale}>
        <sphereGeometry args={[0.035, 20, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* pulsing ring on the surface */}
      {isActive && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <ringGeometry args={[0.03, 0.04, 40]} />
          <meshBasicMaterial color={accent} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* big invisible hit area so pins are easy to tap */}
      <mesh
        position={[0, STALK, 0]}
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
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {(isActive || isHovered) && (
        <Html position={[0, STALK + 0.09, 0]} center style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900/95 px-2.5 py-1 text-sm font-medium text-white shadow-lg">
            {obj.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Smoothly swings the camera around the planet to face a point on its surface.
function CameraRig({ focus }) {
  const target = useRef(null);

  useEffect(() => {
    target.current = focus ? focus.clone().normalize() : null;
  }, [focus]);

  useFrame(({ camera }, dt) => {
    const goal = target.current;
    if (!goal) return;
    const current = camera.position.clone().normalize();
    if (current.angleTo(goal) < 0.01) {
      target.current = null;
      return;
    }
    const full = new THREE.Quaternion().setFromUnitVectors(current, goal);
    const step = new THREE.Quaternion().slerp(full, 1 - Math.exp(-dt * 4));
    camera.position.applyQuaternion(step);
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
  const [hoveredId, setHoveredId] = useState(null);
  const [spin, setSpin] = useState(true);
  const [focus, setFocus] = useState(DEFAULT_FOCUS);
  const [usingNasaModel, setUsingNasaModel] = useState(false);

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
      setFocus(latLngToVector3(obj.lat, obj.lng, 1));
    }
  };

  const switchBody = (next) => {
    if (next === body) return;
    setBody(next);
    setHoveredId(null);
    onSelectObject(null);
    setFocus(DEFAULT_FOCUS.clone());
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* 3D stage */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/40 sm:h-[540px] lg:h-[640px]">
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

            <CameraRig focus={focus} />
            <OrbitControls
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.55}
              zoomSpeed={0.7}
              minDistance={1.7}
              maxDistance={6}
              autoRotate={spin && !activeId}
              autoRotateSpeed={0.6}
              onStart={() => setFocus(null)}
            />
          </Canvas>

          {usingNasaModel && (
            <div className="pointer-events-none absolute bottom-3 left-4 text-xs text-neutral-400">
              3D model: {config.credit}
            </div>
          )}
        </div>

        {/* Machine list */}
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-neutral-300">
            {config.label} machines ({bodyObjects.length})
          </p>
          <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap">
            {bodyObjects.map((obj) => {
              const isSelected = obj.id === activeId;
              return (
                <button
                  key={obj.id}
                  onClick={() => selectObject(obj)}
                  onMouseEnter={() => setHoveredId(obj.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? "border-white bg-white text-black shadow-md"
                      : "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  <span>{obj.name}</span>
                  {obj.year && <span className="text-sm opacity-60">{obj.year}</span>}
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
