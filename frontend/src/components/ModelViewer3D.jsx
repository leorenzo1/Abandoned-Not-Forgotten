import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCw, Maximize2, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { getModelConfig } from "../data/models";

// Shared loaders to cache downloads across mounts
const gltfLoader = new GLTFLoader();
const stlLoader = new STLLoader();
const geometryCache = new Map();

export default function ModelViewer3D({
  modelId,
  interactive = true,
  autoRotate: initialAutoRotate = true,
  showControls = true,
  showBadge = true,
  className = "",
  style = {},
  selectedPartIndex = -1,
  onSelectPart,
  onExpand,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const downPosRef = useRef(null);

  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    rootGroup: null,
    modelGroup: null,
    terrainMesh: null,
    beaconGroup: null,
    beaconRing: null,
    highlightedMeshes: [],
    autoRotate: initialAutoRotate,
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [hoveredPartName, setHoveredPartName] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [selectedBeaconScreenPos, setSelectedBeaconScreenPos] = useState(null);

  const modelConfig = useMemo(() => getModelConfig(modelId), [modelId]);
  const isMoon = modelConfig.w === "moon";
  const highlightColor = isMoon ? 0xffcc00 : 0xff9922; // Radiant gold for Moon, vivid amber for Mars

  // Keep auto-rotate ref in sync
  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // Pause auto-rotation when user explicitly selects a part so they can inspect it comfortably
  useEffect(() => {
    if (selectedPartIndex >= 0) {
      setAutoRotate(false);
    }
  }, [selectedPartIndex]);

  // Initialize Three.js scene, camera, controls, and lighting
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      setLoadError("WebGL is not supported in this browser.");
      setLoading(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(2.8, 2.2, 3.8);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 7.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.06;
    controls.target.set(0, 0.45, 0);

    // Deep space starry particles
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 25 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Ambient planetary lighting
    const ambientLight = new THREE.AmbientLight(
      isMoon ? 0x222a38 : 0x3d2720,
      isMoon ? 0.38 : 0.55
    );
    scene.add(ambientLight);

    // Low-angle stark solar directional light creating dramatic crater shadows
    const sunLight = new THREE.DirectionalLight(0xfff8ed, 2.6);
    sunLight.position.set(5, 3.2, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Earthshine / Sky bounce fill
    const fillLight = new THREE.DirectionalLight(
      isMoon ? 0x486b99 : 0x8a5136,
      0.45
    );
    fillLight.position.set(-4, 1.5, -3);
    scene.add(fillLight);

    // Root group for the entire machine and terrain
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Dynamic 3D target beacon pointer for highlighted parts
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;

    // Glowing target ring
    const ringGeo = new THREE.RingGeometry(0.12, 0.16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: highlightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const beaconRing = new THREE.Mesh(ringGeo, ringMat);
    beaconRing.rotation.x = -Math.PI / 2;
    beaconGroup.add(beaconRing);

    // Vertical holographic laser beam
    const beamGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.28, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    const beaconBeam = new THREE.Mesh(beamGeo, beamMat);
    beaconBeam.position.y = 0.14;
    beaconGroup.add(beaconBeam);

    // Brilliant crystal diamond head
    const headGeo = new THREE.OctahedronGeometry(0.045, 0);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const beaconHead = new THREE.Mesh(headGeo, headMat);
    beaconHead.position.y = 0.28;
    beaconGroup.add(beaconHead);

    rootGroup.add(beaconGroup);

    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.controls = controls;
    stateRef.current.rootGroup = rootGroup;
    stateRef.current.beaconGroup = beaconGroup;
    stateRef.current.beaconRing = beaconRing;

    // Responsive resize observer
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Render loop
    let animId;
    const animate = (time) => {
      animId = requestAnimationFrame(animate);
      if (stateRef.current.autoRotate && controls && !controls.state) {
        rootGroup.rotation.y += 0.004;
      }

      // Animate pulsing beacon if visible
      if (beaconGroup.visible) {
        const pulse = 1 + 0.15 * Math.sin(time * 0.006);
        beaconRing.scale.set(pulse, pulse, pulse);
        beaconHead.rotation.y = time * 0.002;

        // Project beacon 3D position to 2D screen coordinates for floating badge
        const worldPos = new THREE.Vector3();
        beaconHead.getWorldPosition(worldPos);
        worldPos.y += 0.12;
        worldPos.project(camera);

        if (worldPos.z < 1) {
          const x = ((worldPos.x + 1) * container.clientWidth) / 2;
          const y = ((-worldPos.y + 1) * container.clientHeight) / 2;
          setSelectedBeaconScreenPos({ x, y });
        } else {
          setSelectedBeaconScreenPos(null);
        }
      } else {
        setSelectedBeaconScreenPos(null);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      ringGeo.dispose();
      beamGeo.dispose();
      headGeo.dispose();
    };
  }, [isMoon, highlightColor]);

  // Load Model & Landing Site Terrain when modelConfig changes
  useEffect(() => {
    const { scene, rootGroup } = stateRef.current;
    if (!scene || !rootGroup) return;

    let isCancelled = false;
    setLoading(true);
    setLoadError(null);

    // Keep beacon group, remove prior models & terrain
    const childrenToRemove = rootGroup.children.filter(
      (c) => c !== stateRef.current.beaconGroup
    );
    childrenToRemove.forEach((c) => rootGroup.remove(c));
    rootGroup.rotation.set(0, 0, 0);

    const loadTerrain = async () => {
      // 1. Apollo 11 Tranquility Base real digital elevation STL terrain
      if (modelConfig.terrainFile) {
        try {
          let geometry = geometryCache.get(modelConfig.terrainFile);
          if (!geometry) {
            geometry = await new Promise((resolve, reject) => {
              stlLoader.load(modelConfig.terrainFile, resolve, undefined, reject);
            });
            geometry.center();
            geometry.computeVertexNormals();
            geometryCache.set(modelConfig.terrainFile, geometry);
          }

          if (isCancelled) return;

          const terrainMat = new THREE.MeshStandardMaterial({
            color: 0x82807c,
            roughness: 0.94,
            metalness: 0.06,
            flatShading: false,
          });

          const terrainMesh = new THREE.Mesh(geometry, terrainMat);
          terrainMesh.rotation.x = -Math.PI / 2; // STL elevation Z becomes Y
          const terrainScale = 3.8 / 255.5;
          terrainMesh.scale.setScalar(terrainScale);
          terrainMesh.position.set(0, -0.06, 0);
          terrainMesh.receiveShadow = true;
          terrainMesh.castShadow = true;

          // Assign terrain part index (Part 3: Tranquility Base Cratered Terrain)
          terrainMesh.userData.p = 3;
          terrainMesh.userData.isTerrain = true;
          rootGroup.add(terrainMesh);
          stateRef.current.terrainMesh = terrainMesh;

          // Add historic Apollo landing site markers (Part 4: Surface Science & Experiments)
          const markerGroup = createLandingSiteMarkers(modelConfig.id);
          markerGroup.traverse((n) => {
            if (n.isMesh) {
              n.userData.p = 4;
            }
          });
          rootGroup.add(markerGroup);
        } catch (err) {
          console.warn("Could not load Apollo 11 STL landing site terrain, using procedural terrain fallback:", err);
          createProceduralTerrain(rootGroup, true);
        }
      } else {
        createProceduralTerrain(rootGroup, isMoon);
      }
    };

    const loadMachineModel = async () => {
      // 2. Load Real NASA GLB if available
      if (modelConfig.modelFile) {
        try {
          const gltf = await new Promise((resolve, reject) => {
            gltfLoader.load(modelConfig.modelFile, resolve, undefined, reject);
          });

          if (isCancelled) return;

          const modelScene = gltf.scene;

          // Compute exact bounding box and scale to standard viewing size
          const box = new THREE.Box3().setFromObject(modelScene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          const targetDim = modelConfig.hasLandingSite ? 1.7 : 2.0;
          const scale = targetDim / maxDim;
          modelScene.scale.setScalar(scale);

          // Center horizontally and rest feet squarely on top of the terrain
          const groundY = modelConfig.hasLandingSite ? 0.08 : 0.02;
          modelScene.position.x = -center.x * scale;
          modelScene.position.z = -center.z * scale;
          modelScene.position.y = -box.min.y * scale + groundY;

          // Tag each mesh to its component subsystem so it is interactable & highlightable!
          assignMeshPartIndices(modelConfig.id, modelScene);

          rootGroup.add(modelScene);
          stateRef.current.modelGroup = modelScene;
          setLoading(false);
          return;
        } catch (err) {
          console.warn(`NASA GLB model (${modelConfig.modelFile}) failed to load, using procedural representation:`, err);
        }
      }

      // Procedural fallback model
      if (modelConfig.b) {
        const group = new THREE.Group();
        const parts = modelConfig.b();
        parts.forEach((partGroup, idx) => {
          partGroup.userData.p = idx;
          partGroup.traverse((n) => {
            if (n.isMesh) {
              n.userData.p = idx;
              n.castShadow = true;
              n.receiveShadow = true;
            }
          });
          group.add(partGroup);
        });
        group.position.y = 0.04;
        rootGroup.add(group);
        stateRef.current.modelGroup = group;
      }
      setLoading(false);
    };

    Promise.all([loadTerrain(), loadMachineModel()]);

    return () => {
      isCancelled = true;
    };
  }, [modelConfig, isMoon]);

  // Tag meshes of GLB models to their respective functional components
  function assignMeshPartIndices(id, modelScene) {
    const isApollo = id === "apollo-11" || id.includes("apollo-11") || id.includes("apollo-12");

    if (isApollo) {
      // Apollo 11 Lunar Module
      // Part 0: Eagle Descent Stage
      // Part 1: Ascent Stage & Crew Cabin
      // Part 2: Lunar Landing Gear & Footpads
      modelScene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          const meshBox = new THREE.Box3().setFromObject(node);
          const y = meshBox.getCenter(new THREE.Vector3()).y;
          if (y < 2.05) {
            node.userData.p = 2; // Landing Gear & Footpads
          } else if (y >= 2.05 && y < 3.25) {
            node.userData.p = 0; // Eagle Descent Stage
          } else {
            node.userData.p = 1; // Ascent Stage & Crew Cabin
          }
        }
      });
    } else if (id.includes("ingenuity")) {
      // Ingenuity Mars Helicopter
      // Part 0: Rotor Blades
      // Part 1: Solar Panel Array
      // Part 2: Landing Legs
      // Part 3: Avionics Fuselage
      modelScene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          const name = (node.name || "").toUpperCase();
          if (name.includes("ROTOR")) {
            node.userData.p = 0;
          } else if (name.includes("SOLAR") || name.includes("10460")) {
            node.userData.p = 1;
          } else if (name.includes("CYLINDER")) {
            node.userData.p = 2;
          } else {
            node.userData.p = 3;
          }
        }
      });
    } else if (id.includes("opportunity") || id.includes("spirit")) {
      // Opportunity & Spirit Rovers
      // Part 0: Pancam Mast & Stereo Cameras
      // Part 1: Rocker-Bogie 6-Wheel Suspension
      // Part 2: Solar Array Wings
      // Part 3: Instrument Deployment Arm
      // Part 4: Warm Electronics Box
      modelScene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          const meshBox = new THREE.Box3().setFromObject(node);
          const center = meshBox.getCenter(new THREE.Vector3());
          if (center.y > 0.8) {
            node.userData.p = 0; // Mast
          } else if (center.y < -0.3) {
            node.userData.p = 1; // Wheels
          } else if (center.z < -0.2) {
            node.userData.p = 2; // Solar wings
          } else if (center.z > 0.4) {
            node.userData.p = 3; // Robotic arm
          } else {
            node.userData.p = 4; // WEB chassis
          }
        }
      });
    } else if (id.includes("viking")) {
      // Viking Lander
      // Part 0: Robotic Soil Sampler Arm
      // Part 1: Facsimile Stereo Cameras
      // Part 2: High-Gain Dish Antenna
      // Part 3: Shock-Absorbing Landing Legs
      // Part 4: Atmosphere & Weather Package
      modelScene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          const meshBox = new THREE.Box3().setFromObject(node);
          const center = meshBox.getCenter(new THREE.Vector3());
          if (center.y < -0.2) {
            node.userData.p = 3; // Legs
          } else if (center.x > 0.4) {
            node.userData.p = 0; // Arm
          } else if (center.y > 0.5) {
            node.userData.p = 2; // Antenna
          } else if (center.z > 0.2) {
            node.userData.p = 1; // Cameras
          } else {
            node.userData.p = 4; // Science body
          }
        }
      });
    }
  }

  // Update visual emissive glow highlight & 3D target beacon whenever selectedPartIndex changes
  useEffect(() => {
    const { rootGroup, beaconGroup, beaconRing } = stateRef.current;
    if (!rootGroup) return;

    const selectedMeshes = [];

    // Traverse all meshes in the 3D scene
    rootGroup.traverse((node) => {
      if (node.isMesh && node.userData.p !== undefined) {
        const isSelected = node.userData.p === selectedPartIndex;

        if (isSelected) {
          selectedMeshes.push(node);

          // Save original material if not stored
          if (!node.userData.origMaterial) {
            node.userData.origMaterial = node.material;
          }

          // If material already cloned for this node, use it; otherwise clone so we don't bleed into other meshes
          if (node.material === node.userData.origMaterial) {
            node.material = node.userData.origMaterial.clone();
          }

          if (node.material.emissive) {
            node.material.emissive.setHex(highlightColor);
            node.material.emissiveIntensity = 0.9;
          }
        } else {
          // Restore original material and reset emissive
          if (node.userData.origMaterial) {
            node.material = node.userData.origMaterial;
          }
          if (node.material && node.material.emissive) {
            node.material.emissive.setHex(0x000000);
            node.material.emissiveIntensity = 0;
          }
        }
      }
    });

    // Position 3D target beacon at the center of the highlighted component
    if (selectedMeshes.length > 0 && beaconGroup) {
      const partBox = new THREE.Box3();
      selectedMeshes.forEach((mesh) => partBox.expandByObject(mesh));
      const partCenter = partBox.getCenter(new THREE.Vector3());
      const partSize = partBox.getSize(new THREE.Vector3());

      // Place beacon on top of the highlighted part
      beaconGroup.position.copy(partCenter);
      beaconGroup.position.y = partBox.max.y + 0.05;

      // Scale ring proportionally to the part's footprint
      const ringScale = Math.max(0.8, Math.min(2.5, Math.max(partSize.x, partSize.z) * 1.5));
      if (beaconRing) beaconRing.scale.set(ringScale, ringScale, ringScale);

      beaconGroup.visible = true;
    } else if (beaconGroup) {
      beaconGroup.visible = false;
      setSelectedBeaconScreenPos(null);
    }
  }, [selectedPartIndex, highlightColor]);

  // Pointer interaction: click to select parts, hover for interactive cursor & tooltips
  const handlePointerDown = (e) => {
    downPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (!downPosRef.current || !canvasRef.current) return;
    const dx = e.clientX - downPosRef.current.x;
    const dy = e.clientY - downPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    // If dragged/orbited by more than 7px, do not treat as a click
    if (dist > 7) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, stateRef.current.camera);

    const interactiveMeshes = [];
    stateRef.current.rootGroup.traverse((obj) => {
      if (obj.isMesh && obj.userData.p !== undefined) {
        interactiveMeshes.push(obj);
      }
    });

    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (hits.length > 0) {
      const hitPartIndex = hits[0].object.userData.p;
      onSelectPart?.(hitPartIndex);
    }
  };

  const handlePointerMove = (e) => {
    if (!canvasRef.current || !stateRef.current.rootGroup || !stateRef.current.camera) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, stateRef.current.camera);

    const interactiveMeshes = [];
    stateRef.current.rootGroup.traverse((obj) => {
      if (obj.isMesh && obj.userData.p !== undefined) {
        interactiveMeshes.push(obj);
      }
    });

    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (hits.length > 0) {
      canvas.style.cursor = "pointer";
      const partIdx = hits[0].object.userData.p;
      const partName = modelConfig.i?.[partIdx]?.[0];
      setHoveredPartName(partName || null);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      canvas.style.cursor = "grab";
      setHoveredPartName(null);
      setTooltipPos(null);
    }
  };

  const handlePointerLeave = () => {
    setHoveredPartName(null);
    setTooltipPos(null);
  };

  // Procedural ground pedestal
  function createProceduralTerrain(parent, moonBody) {
    const radius = 2.4;
    const geometry = new THREE.CylinderGeometry(radius, radius * 1.05, 0.16, 64);
    const material = new THREE.MeshStandardMaterial({
      color: moonBody ? 0x222634 : 0x3d2018,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    parent.add(ground);

    for (let c = 0; c < 4; c++) {
      const angle = (c * Math.PI) / 2 + 0.4;
      const dist = 1.1 + (c % 2) * 0.5;
      const craterGeom = new THREE.RingGeometry(0.12, 0.18, 24);
      const craterMat = new THREE.MeshBasicMaterial({
        color: moonBody ? 0x161824 : 0x28140f,
        side: THREE.DoubleSide,
      });
      const crater = new THREE.Mesh(craterGeom, craterMat);
      crater.rotation.x = -Math.PI / 2;
      crater.position.set(Math.cos(angle) * dist, 0.005, Math.sin(angle) * dist);
      parent.add(crater);
    }
  }

  // Historic Apollo landing site surface landmarks
  function createLandingSiteMarkers(id) {
    const group = new THREE.Group();
    const isApollo15 = id?.includes("apollo-15");

    // 1. Apollo American Flag
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8),
      new THREE.MeshBasicMaterial({ color: 0xdddddd })
    );
    flagPole.position.set(0.85, 0.22, 0.45);
    group.add(flagPole);

    const flagFabric = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xcc2233, side: THREE.DoubleSide })
    );
    flagFabric.position.set(0.93, 0.34, 0.45);
    group.add(flagFabric);

    if (isApollo15) {
      // Apollo 15: Lunar Roving Vehicle proxy parked near the Lunar Module
      const roverChassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.08, 0.42),
        new THREE.MeshStandardMaterial({ color: 0xd8d8e5, metalness: 0.5, roughness: 0.3 })
      );
      roverChassis.position.set(-0.95, 0.12, 0.55);
      roverChassis.rotation.y = 0.35;
      group.add(roverChassis);

      // Rover high gain dish antenna
      const dish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.01, 0.03, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd23f })
      );
      dish.position.set(-0.95, 0.26, 0.5);
      group.add(dish);

      // ALSEP heat flow & seismic station
      const alsep = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.09, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 })
      );
      alsep.position.set(-0.6, 0.1, -0.65);
      group.add(alsep);
    } else {
      // Apollo 11: Laser Ranging Retroreflector (LRRR)
      const lrrr = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.08, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 })
      );
      lrrr.position.set(-0.85, 0.08, 0.55);
      group.add(lrrr);

      // Early Apollo Seismometer (PSEP)
      const psep = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12),
        new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.5 })
      );
      psep.position.set(-0.6, 0.08, -0.65);
      group.add(psep);
    }

    return group;
  }

  const handleResetCamera = () => {
    const { camera, controls } = stateRef.current;
    if (!camera || !controls) return;
    camera.position.set(2.8, 2.2, 3.8);
    controls.target.set(0, 0.45, 0);
    controls.update();
  };

  const selectedPartName =
    selectedPartIndex >= 0 && modelConfig.i?.[selectedPartIndex]?.[0]
      ? modelConfig.i[selectedPartIndex][0]
      : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none bg-radial from-neutral-900/60 via-neutral-950/90 to-neutral-950 ${className}`}
      style={{ minHeight: "260px", ...style }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="block h-full w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-xs">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mb-2" />
          <span className="text-xs font-semibold text-neutral-300">
            {modelConfig.terrainFile
              ? `Loading ${modelConfig.shortName || "Apollo"} Landing Site DEM...`
              : "Loading 3D Machine Model..."}
          </span>
          <span className="text-[11px] text-neutral-400 mt-0.5">
            NASA 3D Resources
          </span>
        </div>
      )}

      {/* Load Error Notice */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/90 p-4 text-center">
          <p className="text-xs text-neutral-400">{loadError}</p>
        </div>
      )}

      {/* Top Left: Authentic Landing Site Badge */}
      {showBadge && (
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1 max-w-[70%]">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-200 backdrop-blur-md shadow-lg">
            <span
              className={`h-2 w-2 rounded-full ${
                isMoon ? "bg-sky-400" : "bg-amber-500"
              }`}
            />
            <span className="truncate">{modelConfig.shortName || modelConfig.n}</span>
          </div>

          {modelConfig.hasLandingSite && (
            <div className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30 backdrop-blur-xs">
              <MapPin className="h-3 w-3 text-sky-400" />
              <span>{modelConfig.siteName || "NASA Topographic DEM"}</span>
            </div>
          )}
        </div>
      )}

      {/* Floating 3D Highlight Tag over Selected Part */}
      {selectedBeaconScreenPos && selectedPartName && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full transition-all duration-150"
          style={{
            left: `${selectedBeaconScreenPos.x}px`,
            top: `${selectedBeaconScreenPos.y}px`,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/80 bg-neutral-950/95 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-2xl backdrop-blur-md animate-bounce">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="whitespace-nowrap">{selectedPartName}</span>
            </div>
            <div className="h-2 w-0.5 bg-amber-400/80" />
          </div>
        </div>
      )}

      {/* Hover Tooltip when pointer is over a clickable part */}
      {hoveredPartName && tooltipPos && !selectedBeaconScreenPos && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
          }}
        >
          <div className="rounded-lg border border-neutral-700 bg-neutral-950/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md whitespace-nowrap">
            Tap to inspect: <span className="text-sky-300">{hoveredPartName}</span>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Buttons */}
      {showControls && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
          {/* Auto-rotate toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            title={autoRotate ? "Pause orbit rotation" : "Start orbit rotation"}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-all ${
              autoRotate
                ? "border-sky-400/60 bg-sky-950/60 text-sky-300 shadow-sm"
                : "border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:text-white"
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? "animate-spin-slow" : ""}`} />
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={handleResetCamera}
            title="Reset viewing angle"
            className="flex h-8 items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950/80 px-2.5 text-[11px] font-semibold text-neutral-300 backdrop-blur-md hover:border-neutral-700 hover:text-white transition-all"
          >
            Reset
          </button>

          {/* Optional Expand View */}
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              title="Open full 3D Machines Lab"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/80 text-neutral-300 backdrop-blur-md hover:border-neutral-700 hover:text-white transition-all"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Bottom Left Hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden sm:block text-[10px] text-neutral-400">
        Tap any part to highlight • Drag to orbit
      </div>
    </div>
  );
}
