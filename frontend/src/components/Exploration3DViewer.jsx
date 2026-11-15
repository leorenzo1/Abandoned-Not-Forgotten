import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { getExplorationModel } from "../data/explorationModels";
import { loadGlbModel } from "../utils/modelLoader";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";
import { Volume2, Square, Sparkles, Maximize2, Minimize2, RotateCcw } from "lucide-react";

export default function Exploration3DViewer({
  objectId,
  objectName,
  body = "mars",
  isOpen = true,
  isExpanded = false,
  onToggleExpand,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneState = useRef({
    renderer: null,
    scene: null,
    camera: null,
    pivot: null,
    groundDisc: null,
    modelGroup: null,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    moveDist: 0,
    animId: null,
    rotors: [],
    meshes: [],
  });

  const [modelConfig, setModelConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedPartIdx, setSelectedPartIdx] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechOk = isSpeechSupported();

  const isMars = body?.toLowerCase() === "mars";
  const glowHex = isMars ? 0xffb703 : 0x38bdf8;
  const accentColor = isMars ? "text-amber-400" : "text-sky-400";
  const activeBorder = isMars
    ? "border-amber-400 bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/50"
    : "border-sky-400 bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/50";

  // Stop any voice narration when switching parts or unmounting
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [objectId]);

  // Handle part selection
  const handleSelectPart = useCallback((idx) => {
    setSelectedPartIdx((prev) => (prev === idx ? -1 : idx));
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  // Update emissive glow on meshes when selectedPartIdx changes
  useEffect(() => {
    const { meshes } = sceneState.current;
    if (!meshes || meshes.length === 0) return;

    meshes.forEach(({ mesh, partIdx, origEmissive, origIntensity }) => {
      if (!mesh.material) return;
      const isSelected = selectedPartIdx >= 0 && partIdx === selectedPartIdx;

      const applyGlow = (mat) => {
        if (!mat || !mat.emissive) return;
        if (isSelected) {
          mat.emissive.setHex(glowHex);
          mat.emissiveIntensity = 0.9;
        } else {
          mat.emissive.copy(origEmissive);
          mat.emissiveIntensity = origIntensity;
        }
      };

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(applyGlow);
      } else {
        applyGlow(mesh.material);
      }
    });
  }, [selectedPartIdx, glowHex]);

  // Voice narration for part info card
  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const parts = modelConfig?.parts || [];
      const currentPart = parts[selectedPartIdx];
      const textToRead = currentPart
        ? `${currentPart.name}. ${currentPart.description}`
        : `${modelConfig?.name || objectName}. Tap any part of the 3D model to inspect its engineering!`;

      speakText(textToRead, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Reset model rotation view
  const handleResetRotation = () => {
    if (sceneState.current.pivot) {
      sceneState.current.pivot.rotation.set(0, 0, 0);
    }
    setSelectedPartIdx(-1);
  };

  // Main Three.js Lifecycle
  useEffect(() => {
    if (!isOpen) return;

    const config = getExplorationModel(objectId);
    setModelConfig(config);
    setIsLoading(true);
    setLoadError(false);
    setSelectedPartIdx(-1);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGL not supported:", e);
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const pivot = new THREE.Group();
    scene.add(pivot);

    // Enhanced Studio Celestial Lighting
    const hemiLight = new THREE.HemisphereLight(
      0xffffff,
      isMars ? 0x3d2018 : 0x222634,
      1.3
    );
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(
      isMars ? 0xffc285 : 0xa6d4ff,
      0.9
    );
    dirLight2.position.set(-4, 3, -4);
    scene.add(dirLight2);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.7);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    // Landing Ground Disc with Luminous Outer Hologram Ring
    const discGroup = new THREE.Group();
    const discColor = config?.groundColor || (isMars ? 0x3d2018 : 0x222634);
    const groundMat = new THREE.MeshStandardMaterial({
      color: discColor,
      roughness: 0.88,
      metalness: 0.12,
    });
    const groundDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.85, 1.85, 0.05, 48),
      groundMat
    );
    groundDisc.position.y = -0.025;
    discGroup.add(groundDisc);

    // Subtle luminous outer ground ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: isMars ? 0xfbbf24 : 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.82, 48), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    discGroup.add(ring);

    pivot.add(discGroup);

    // Initial Camera position
    const camPos = config?.cameraPosition || [0, 1.8, 4.8];
    const lookAtPos = config?.lookAt || [0, 0.8, 0];
    camera.position.set(camPos[0], camPos[1], camPos[2]);
    camera.lookAt(lookAtPos[0], lookAtPos[1], lookAtPos[2]);

    const state = sceneState.current;
    state.renderer = renderer;
    state.scene = scene;
    state.camera = camera;
    state.pivot = pivot;
    state.groundDisc = discGroup;
    state.meshes = [];
    state.rotors = [];

    // Load Model (GLB or Pathfinder Combo)
    let isCancelled = false;

    const setupLoadedModel = (rootObject, partsConfig) => {
      if (isCancelled) return;

      const modelGroup = new THREE.Group();
      modelGroup.add(rootObject);

      // Scale and center model
      const box = new THREE.Box3().setFromObject(rootObject);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      rootObject.position.x = -center.x;
      rootObject.position.y = -box.min.y; // Sit directly on the ground disc at y = 0
      rootObject.position.z = -center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = config?.targetScale || 2.15;
      const scale = maxDim > 0 ? targetSize / maxDim : 1;
      modelGroup.scale.setScalar(scale);

      // Register parts, optimize PBR materials, and identify helicopter rotors
      const taggedMeshes = [];
      const identifiedRotors = [];

      rootObject.traverse((child) => {
        // Check for Ingenuity Helicopter counter-rotating rotors
        if (config?.isHelicopter && (child.name === "rotors_01" || child.name === "rotors_02")) {
          identifiedRotors.push(child);
        }

        if (!child.isMesh) return;

        // Clone material so emissive glow mutations are isolated
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => {
            const cloned = m.clone();
            cloned.roughness = Math.min(Math.max(cloned.roughness ?? 0.5, 0.25), 0.85);
            return cloned;
          });
        } else if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = Math.min(Math.max(child.material.roughness ?? 0.5, 0.25), 0.85);
        }

        const primaryMat = Array.isArray(child.material)
          ? child.material[0]
          : child.material;
        const matName = primaryMat?.name || "";

        // Match child mesh to defined part
        let matchedPartIdx = -1;
        if (child.userData.isSojourner) {
          matchedPartIdx = 0; // Part 0 in Pathfinder combo is Sojourner
        } else if (partsConfig && partsConfig.length > 0) {
          matchedPartIdx = partsConfig.findIndex((p) => {
            if (p.match) return p.match(child, matName);
            return false;
          });
          // Default to last part (often body) if unmatched
          if (matchedPartIdx === -1 && partsConfig.length > 0) {
            matchedPartIdx = partsConfig.length - 1;
          }
        }

        child.userData.partIdx = matchedPartIdx;

        taggedMeshes.push({
          mesh: child,
          partIdx: matchedPartIdx,
          origEmissive: primaryMat?.emissive
            ? primaryMat.emissive.clone()
            : new THREE.Color(0),
          origIntensity: primaryMat?.emissiveIntensity || 0,
        });
      });

      state.rotors = identifiedRotors;
      pivot.add(modelGroup);
      state.modelGroup = modelGroup;
      state.meshes = taggedMeshes;
      setIsLoading(false);
    };

    if (config?.type === "pathfinder-combo") {
      // Load both Pathfinder lander and Sojourner rover
      Promise.all([loadGlbModel(config.landerUrl), loadGlbModel(config.roverUrl)])
        .then(([landerScene, roverScene]) => {
          const comboGroup = new THREE.Group();
          comboGroup.add(landerScene);

          // Position Sojourner rolling out of the exit ramps
          roverScene.traverse((c) => {
            c.userData.isSojourner = true;
          });
          roverScene.position.set(0.85, 0.0, 0.65);
          roverScene.rotation.y = 0.45;
          roverScene.scale.setScalar(0.72);
          comboGroup.add(roverScene);

          setupLoadedModel(comboGroup, config.parts);
        })
        .catch((err) => {
          console.error("Pathfinder combo load failed:", err);
          if (!isCancelled) {
            setLoadError(true);
            setIsLoading(false);
          }
        });
    } else if (config?.type === "glb") {
      loadGlbModel(config.url)
        .then((gltfScene) => {
          setupLoadedModel(gltfScene, config.parts);
        })
        .catch((err) => {
          console.error("GLB Load Failed:", err);
          if (!isCancelled) {
            setLoadError(true);
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }

    // Pointer event interaction (Drag to spin & Tap to inspect)
    const onPointerDown = (e) => {
      state.isDragging = true;
      state.moveDist = 0;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.moveDist += Math.abs(dx) + Math.abs(dy);

      pivot.rotation.y += dx * 0.012;
      pivot.rotation.x = Math.max(
        -0.35,
        Math.min(0.65, pivot.rotation.x + dy * 0.007)
      );
    };

    const onPointerUp = (e) => {
      state.isDragging = false;

      // Detect Tap vs Drag
      if (state.moveDist < 8 && state.modelGroup) {
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const hits = raycaster.intersectObjects(
          state.modelGroup.children,
          true
        );
        if (hits.length > 0) {
          let hitObj = hits[0].object;
          while (
            hitObj &&
            hitObj.userData.partIdx === undefined &&
            hitObj.parent
          ) {
            hitObj = hitObj.parent;
          }
          if (
            hitObj &&
            hitObj.userData.partIdx !== undefined &&
            hitObj.userData.partIdx >= 0
          ) {
            handleSelectPart(hitObj.userData.partIdx);
          }
        }
      }
    };

    const onPointerCancel = () => {
      state.isDragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    // Responsive Canvas Resize Observer (Prevents Layout Shift)
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Render Animation Loop
    let lastTime = performance.now();
    const animate = (time) => {
      state.animId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Slow auto-rotate when not actively dragging
      if (!state.isDragging && selectedPartIdx < 0) {
        pivot.rotation.y += 0.0035;
      }

      // Smooth horizontal spin for Ingenuity Helicopter elesi (rotor blades)
      // Both rotors rotate around their vertical shaft axis (local X axis [1, 0, 0]),
      // automatically counter-rotating in opposite directions without tumbling!
      if (state.rotors && state.rotors.length > 0) {
        const rotorSpeed = 16.0; // rad/s
        state.rotors.forEach((rotor) => {
          rotor.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotorSpeed * delta);
        });
      }

      renderer.render(scene, camera);
    };
    state.animId = requestAnimationFrame(animate);

    return () => {
      isCancelled = true;
      if (state.animId) cancelAnimationFrame(state.animId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      renderer.dispose();
    };
  }, [objectId, isOpen, handleSelectPart, isMars]);

  const parts = modelConfig?.parts || [];
  const currentPart = selectedPartIdx >= 0 ? parts[selectedPartIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* 3D Viewport Frame with Fixed Aspect Ratio (Zero Layout Shift) */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl backdrop-blur-md transition-all ${
          isExpanded ? "h-[55vh] min-h-[380px]" : "h-72 sm:h-80"
        }`}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 bg-neutral-950/90 backdrop-blur-xs">
            <div
              className={`h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 ${
                isMars ? "border-t-amber-400" : "border-t-sky-400"
              }`}
            />
            <span className="text-xs font-bold text-white tracking-wide animate-pulse">
              Loading 3D model...
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              Preparing historic NASA hardware
            </span>
          </div>
        )}

        {/* Fallback Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-neutral-950/90 p-6 text-center">
            <span className="text-xs font-semibold text-neutral-300">
              3D model preview unavailable on this browser
            </span>
            <span className="text-[11px] text-neutral-400">
              Switching to archival mission imagery
            </span>
          </div>
        )}

        {/* Interactive WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-grab active:cursor-grabbing touch-none select-none"
        />

        {/* HUD Top Bar: Drag Hint & Actions */}
        <div className="pointer-events-none absolute top-2.5 inset-x-3 flex items-center justify-between z-20">
          <span className="rounded-lg border border-neutral-800/80 bg-neutral-950/70 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 backdrop-blur-xs">
            Drag to rotate • Tap part to glow
          </span>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={handleResetRotation}
              title="Reset View Angle"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors backdrop-blur-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                title={isExpanded ? "Exit Expanded View" : "Full Screen 3D View"}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors backdrop-blur-xs"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Planet Surface Disc Badge */}
        <div className="pointer-events-none absolute bottom-2.5 left-3 z-20">
          <span className="rounded-md bg-neutral-950/80 px-2 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-800/80 backdrop-blur-xs">
            Surface: {isMars ? "Martian Regolith" : "Lunar Dust"}
          </span>
        </div>
      </div>

      {/* Part Selection Buttons (Works without tapping the 3D model) */}
      {parts.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 px-0.5">
            <span>Tap parts on model or buttons below:</span>
            {selectedPartIdx >= 0 && (
              <button
                onClick={() => setSelectedPartIdx(-1)}
                className="text-[10px] font-bold text-neutral-400 hover:text-white underline underline-offset-2"
              >
                Clear Glow
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {parts.map((p, idx) => {
              const isSelected = selectedPartIdx === idx;
              return (
                <button
                  key={p.id || idx}
                  onClick={() => handleSelectPart(idx)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? activeBorder
                      : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      isSelected
                        ? isMars
                          ? "bg-amber-400 animate-pulse"
                          : "bg-sky-400 animate-pulse"
                        : "bg-neutral-500"
                    }`}
                  />
                  <span>{p.shortName || p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Educational Kid-Friendly Part Info Card */}
      {currentPart && (
        <div
          className={`rounded-2xl border p-4 shadow-lg transition-all animate-in fade-in-50 duration-200 ${
            isMars
              ? "border-amber-500/30 bg-amber-950/25 text-amber-100"
              : "border-sky-500/30 bg-sky-950/25 text-sky-100"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className={`h-4 w-4 ${accentColor}`} />
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                {currentPart.name}
              </h5>
            </div>

            {speechOk && (
              <button
                onClick={handleToggleVoice}
                title={isSpeaking ? "Stop voice" : "Read explanation aloud"}
                className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold transition-all ${
                  isSpeaking
                    ? "border-amber-400 bg-amber-400/20 text-amber-300 animate-pulse"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white"
                }`}
              >
                {isSpeaking ? (
                  <Square className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
                <span>{isSpeaking ? "Stop" : "Read Aloud"}</span>
              </button>
            )}
          </div>

          <p className="text-xs font-medium leading-relaxed text-neutral-200">
            {currentPart.description}
          </p>
        </div>
      )}
    </div>
  );
}
