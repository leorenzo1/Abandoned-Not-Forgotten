import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

let dracoLoader = null;
let gltfLoader = null;

function getLoader() {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();

    // 1. Draco mesh decompression (for Opportunity, Apollo LM, Ingenuity)
    if (!dracoLoader) {
      dracoLoader = new DRACOLoader();
      const base = import.meta.env.BASE_URL || "/";
      const dracoPath = `${base.replace(/\/$/, "")}/draco/gltf/`;
      dracoLoader.setDecoderPath(dracoPath);
    }
    gltfLoader.setDRACOLoader(dracoLoader);

    // 2. Meshopt decompression (for Surveyor-3)
    if (MeshoptDecoder) {
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    }
  }
  return gltfLoader;
}

// In-memory GLTF cache so once downloaded, switching objects is instant
const glbCache = new Map();

export async function loadGlbModel(url) {
  if (glbCache.has(url)) {
    const cachedScene = glbCache.get(url);
    return cachedScene.clone(true);
  }

  const loader = getLoader();
  const base = import.meta.env.BASE_URL || "/";
  const fullUrl = url.startsWith("http") ? url : `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

  return new Promise((resolve, reject) => {
    loader.load(
      fullUrl,
      (gltf) => {
        glbCache.set(url, gltf.scene);
        resolve(gltf.scene.clone(true));
      },
      undefined,
      (err) => {
        console.error("Failed to load 3D GLB model:", fullUrl, err);
        reject(err);
      }
    );
  });
}
