Drop NASA GLB files here and the Explore globe will use them automatically:

  moon.glb   -> used for the Moon
  mars.glb   -> used for the Mars

If a file is missing (or fails to load), the globe falls back to the
texture in /public (moon-texture.jpg / mars-texture.jpg).

If the pins look rotated away from the real landing sites, open the site with
?rot=90 (try 0, 90, 180, 270 or any number) to spin the model, then copy the
value that lines up into modelRotationDeg in src/components/GlobeView.jsx.

Credit line: check the asset's page on science.nasa.gov/3d-resources and
update the "credit" strings in GlobeView.jsx to match.
