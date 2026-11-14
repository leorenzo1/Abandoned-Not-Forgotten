import * as THREE from "three";

// Converts a latitude/longitude (degrees, east-positive) into a point on a sphere.
// Matches three.js' SphereGeometry UV layout for an equirectangular texture whose
// centre column is 0° longitude (true for both /moon-texture.jpg and /mars-texture.jpg).
export function latLngToVector3(lat, lng, radius = 1) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lngRad = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    radius * Math.cos(latRad) * Math.cos(lngRad),
    radius * Math.sin(latRad),
    -radius * Math.cos(latRad) * Math.sin(lngRad)
  );
}
