import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MODELS } from "../data/models";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";
import { Volume2, Square } from "lucide-react";

export default function MachinesLab({ initialModelId, onSpeakComment }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const threeState = useRef({});
  const initialIndex = initialModelId
    ? Math.max(0, MODELS.findIndex((m) => m.id === initialModelId || m.n.toLowerCase().includes(initialModelId.toLowerCase())))
    : 0;

  const [modelIndex, setModelIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [selectedPartIndex, setSelectedPartIndex] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const speechOk = isSpeechSupported();

  // Stop speech if switching models or unmounting
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [modelIndex]);

  // Initialize Three.js scene once
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const pivot = new THREE.Group();

    // Soft celestial lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x443366, 1.2));
    const directional = new THREE.DirectionalLight(0xffffff, 0.9);
    directional.position.set(4, 6, 5);
    scene.add(directional);

    camera.position.set(0, 2.4, 6.2);
    camera.lookAt(0, 1.1, 0);

    // Platform ground
    const groundMat = new THREE.MeshToonMaterial({ color: 0x242436 });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.18, 48), groundMat);
    ground.position.y = -0.09;
    pivot.add(ground);
    scene.add(pivot);

    const state = threeState.current;
    Object.assign(state, {
      renderer,
      scene,
      camera,
      pivot,
      ground,
      currentMeshGroup: null,
      selectedPart: -1,
      activeIdx: 0,
      isDragging: false,
    });

    // Raycast part selection
    state.pickPart = (partIdx) => {
      setSelectedPartIndex(partIdx);
      const model = MODELS[state.activeIdx];
      if (model && model.i[partIdx]) {
        const text = `${model.i[partIdx][0]}. ${model.i[partIdx][1]}`;
        onSpeakComment?.(text);
      }
    };

    let moveDist = 0;
    let lastX = 0;
    let lastY = 0;
    let animId;

    const onPointerDown = (e) => {
      state.isDragging = true;
      moveDist = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moveDist += Math.abs(dx) + Math.abs(dy);

      pivot.rotation.y += dx * 0.012;
      pivot.rotation.x = Math.max(-0.25, Math.min(0.6, pivot.rotation.x + dy * 0.006));
    };

    const onPointerUp = (e) => {
      state.isDragging = false;
      if (moveDist >= 8 || !state.currentMeshGroup) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObject(state.currentMeshGroup, true);
      if (!hits.length) return;

      let obj = hits[0].object;
      while (obj && obj.userData.p === undefined) {
        obj = obj.parent;
      }
      if (obj && obj.userData.p !== undefined) {
        state.pickPart(obj.userData.p);
      }
    };

    const onPointerCancel = () => {
      state.isDragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    // Responsive resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      if (!w) return;
      const h = Math.round(Math.min(520, Math.max(340, w * 0.65)));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Render loop
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!state.isDragging && state.selectedPart < 0) {
        pivot.rotation.y += 0.004;
      }
      const activeModel = MODELS[state.activeIdx];
      if (activeModel?.spin !== undefined && state.currentMeshGroup) {
        // Spin helicopter blades
        const rotor = state.currentMeshGroup.children[activeModel.spin];
        if (rotor) rotor.rotation.y += 0.35;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      renderer.dispose();
    };
  }, [onSpeakComment]);

  // Load new model when modelIndex changes
  useEffect(() => {
    const state = threeState.current;
    if (!state.pivot) return;

    state.activeIdx = modelIndex;
    state.selectedPart = -1;
    setSelectedPartIndex(-1);

    if (state.currentMeshGroup) {
      state.pivot.remove(state.currentMeshGroup);
    }

    const group = new THREE.Group();
    const model = MODELS[modelIndex];
    model.b().forEach((partGroup, idx) => {
      partGroup.userData.p = idx;
      group.add(partGroup);
    });

    state.pivot.add(group);
    state.currentMeshGroup = group;
    state.ground.material.color.set(model.w === "moon" ? 0x222634 : 0x3d2018);
    state.pivot.rotation.set(0, 0, 0);
  }, [modelIndex]);

  // Highlight selected part
  useEffect(() => {
    const state = threeState.current;
    state.selectedPart = selectedPartIndex;
    if (!state.currentMeshGroup) return;

    state.currentMeshGroup.children.forEach((partGroup) => {
      const isSelected = partGroup.userData.p === selectedPartIndex;
      partGroup.traverse((mesh) => {
        if (mesh.material && mesh.material.emissive) {
          mesh.material.emissive.setHex(isSelected ? 0x664400 : 0x000000);
        }
      });
    });
  }, [selectedPartIndex]);

  const activeModel = MODELS[modelIndex];
  const isMars = activeModel.w === "mars";
  const badgeColor = isMars ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-sky-500/40 bg-sky-500/10 text-sky-300";

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      let narrative = `${activeModel.n}. ${activeModel.s}`;
      if (selectedPartIndex >= 0 && activeModel.i[selectedPartIndex]) {
        narrative = `${activeModel.i[selectedPartIndex][0]}. ${activeModel.i[selectedPartIndex][1]}`;
      }
      speakText(narrative, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Interactive 3D Machines Lab
          </h2>
          <p className="mt-0.5 text-sm text-neutral-300">
            Rotate 3D models and tap components to inspect historic engineering
          </p>
        </div>

        <span className={`inline-block self-start sm:self-auto rounded-xl border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
          {isMars ? "Martian Technology" : "Lunar Hardware"}
        </span>
      </div>

      {/* Machine Selector Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {MODELS.map((m, idx) => {
          const isSelected = idx === modelIndex;
          return (
            <button
              key={m.id}
              onClick={() => setModelIndex(idx)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                isSelected
                  ? "border-white bg-white text-black shadow-md"
                  : "border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {m.n}
            </button>
          );
        })}
      </div>

      {/* 3D Viewport Card */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/80 shadow-2xl backdrop-blur-md">
        <div ref={containerRef} className="relative w-full overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900/40 to-neutral-950">
          {webglSupported ? (
            <canvas ref={canvasRef} className="block w-full cursor-grab active:cursor-grabbing touch-none" />
          ) : (
            <div className="flex h-80 items-center justify-center p-6 text-sm text-neutral-400">
              WebGL viewer unavailable on this browser.
            </div>
          )}

          {/* Quick HUD controls */}
          <div className="pointer-events-none absolute top-3 left-4 text-xs font-medium text-neutral-400 bg-neutral-950/60 px-2.5 py-1 rounded-lg border border-neutral-800 backdrop-blur-sm">
            Drag to rotate • Tap part to inspect
          </div>
        </div>

        {/* Component Inspection Dossier */}
        <div className="border-t border-neutral-800 p-5 sm:p-6 space-y-4 bg-neutral-950/90">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedPartIndex >= 0 ? activeModel.i[selectedPartIndex][0] : activeModel.n}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {selectedPartIndex >= 0 ? `Subsystem of ${activeModel.n}` : activeModel.s}
              </p>
            </div>

            {speechOk && (
              <button
                onClick={handleReadAloud}
                className={`inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSpeaking
                    ? "border-amber-400 bg-amber-400/20 text-amber-300 animate-pulse shadow-sm"
                    : "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {isSpeaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
              </button>
            )}
          </div>

          {selectedPartIndex >= 0 && (
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                Function & Science
              </span>
              <p className="text-sm font-medium leading-relaxed text-neutral-200">
                {activeModel.i[selectedPartIndex][1]}
              </p>
            </div>
          )}

          {/* Interactive Component Chip Matrix */}
          <div>
            <span className="block text-xs font-semibold text-neutral-400 mb-2">
              Select a component to inspect:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeModel.i.map((part, pIdx) => {
                const isPartSelected = pIdx === selectedPartIndex;
                return (
                  <button
                    key={part[0]}
                    onClick={() => {
                      setSelectedPartIndex(pIdx);
                      threeState.current.pickPart?.(pIdx);
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      isPartSelected
                        ? "border-amber-400 bg-amber-400/20 text-amber-200 shadow-sm"
                        : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-600 hover:text-white"
                    }`}
                  >
                    {part[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
