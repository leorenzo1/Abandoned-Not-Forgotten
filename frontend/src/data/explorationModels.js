// Registry and configuration for all 3D exploration models
import * as THREE from "three";

// Helper to resolve asset paths with base URL support
export const getAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

export const EXPLORATION_MODELS = {
  // 1. Apollo 11 Lunar Module (Eagle)
  "apollo-11": {
    name: "Apollo 11 Lunar Module (Eagle)",
    type: "glb",
    url: "/models/apollo-lunar-module.glb",
    body: "moon",
    targetScale: 2.2,
    cameraPosition: [0, 1.9, 5.0],
    lookAt: [0, 0.9, 0],
    groundColor: 0x222634,
    parts: [
      {
        id: "ascent-stage",
        name: "Ascent Stage & Cabin",
        shortName: "Crew Cabin",
        description: "The cozy rocket cabin where Neil Armstrong and Buzz Aldrin lived! After exploring the surface, its engine blasted them back up into space.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group51") || n.startsWith("polysurfa3") || n.startsWith("polysurfa4") || n.startsWith("pcone") || n.startsWith("pcube28") || n.startsWith("pcube29");
        },
      },
      {
        id: "descent-stage",
        name: "Descent Stage (Launch Base)",
        shortName: "Descent Base",
        description: "The golden octagonal base that carried the landing rocket engine. It stayed behind on the Moon to serve as Eagle's launch pad!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group73") || n.startsWith("group74") || n.startsWith("group75") || n.startsWith("pcube2") || n.startsWith("pcylinder1") || n.startsWith("pcylinder2") || n.startsWith("polysurfac.002");
        },
      },
      {
        id: "landing-gear",
        name: "Landing Legs & Footpads",
        shortName: "Landing Legs",
        description: "Four sturdy legs with wide saucer-shaped footpads that kept the heavy spaceship from sinking into soft lunar dust.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group31") || n.startsWith("polysurfa1") || n.startsWith("pplane") || n.startsWith("ppipe");
        },
      },
      {
        id: "thrusters",
        name: "Steering Thruster Quads",
        shortName: "Thruster Jets",
        description: "Small plus-shaped rocket jets that puffed tiny squirts of gas to steer, tilt, and balance the spacecraft in the vacuum of space.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group13");
        },
      },
    ],
  },

  // 2. Apollo 12 Lunar Module (Intrepid)
  "apollo-12": {
    name: "Apollo 12 Lunar Module (Intrepid)",
    type: "glb",
    url: "/models/apollo-lunar-module.glb",
    body: "moon",
    targetScale: 2.2,
    cameraPosition: [0, 1.9, 5.0],
    lookAt: [0, 0.9, 0],
    groundColor: 0x222634,
    parts: [
      {
        id: "ascent-stage",
        name: "Ascent Stage & Cabin",
        shortName: "Crew Cabin",
        description: "The top cabin where astronauts Pete Conrad and Alan Bean rode down to the Moon and returned to lunar orbit.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group51") || n.startsWith("polysurfa3") || n.startsWith("polysurfa4") || n.startsWith("pcone") || n.startsWith("pcube28") || n.startsWith("pcube29");
        },
      },
      {
        id: "descent-stage",
        name: "Descent Stage Base",
        shortName: "Descent Base",
        description: "The gold-wrapped bottom half that touched down just 535 feet from Surveyor 3 with pinpoint precision!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group73") || n.startsWith("group74") || n.startsWith("group75") || n.startsWith("pcube2") || n.startsWith("pcylinder1") || n.startsWith("pcylinder2") || n.startsWith("polysurfac.002");
        },
      },
      {
        id: "landing-gear",
        name: "Landing Legs & Footpads",
        shortName: "Landing Legs",
        description: "Four wide shock-absorbing legs that cushioned touchdown in Oceanus Procellarum.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group31") || n.startsWith("polysurfa1") || n.startsWith("pplane") || n.startsWith("ppipe");
        },
      },
      {
        id: "thrusters",
        name: "Steering Thruster Quads",
        shortName: "Thruster Jets",
        description: "Reaction control thrusters used to carefully maneuver Intrepid close to the Surveyor crater.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.startsWith("group13");
        },
      },
    ],
  },

  // 3. Opportunity Rover (MER-B)
  "opportunity-rover": {
    name: "Opportunity Rover (MER-B)",
    type: "glb",
    url: "/models/opportunity.glb",
    body: "mars",
    targetScale: 2.3,
    cameraPosition: [0, 1.9, 5.1],
    lookAt: [0, 0.85, 0],
    groundColor: 0x3d2018,
    parts: [
      {
        id: "pancam-mast",
        name: "Pancam Camera Mast",
        shortName: "Camera Mast",
        description: "The tall 'periscope' neck standing at human eye level. Its twin stereo cameras snapped thousands of colorful 360-degree panoramas of Mars!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "gray" || m === "white" || m === "black";
        },
      },
      {
        id: "solar-wings",
        name: "Solar Panel Wings",
        shortName: "Solar Wings",
        description: "Broad solar wings that soaked up Martian sunshine every morning to recharge the rover's batteries. Friendly Martian dust devils even blew the dust off them!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m.includes("solar");
        },
      },
      {
        id: "wheels",
        name: "Rocker-Bogie 6 Wheels",
        shortName: "6 Wheels",
        description: "Six independently motorized aluminum wheels with cleat treads. Its articulated suspension climbed over tall boulders without ever tipping over!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "lightgraymetal" || m === "lambert1";
        },
      },
      {
        id: "robotic-arm",
        name: "Robotic Science Arm",
        shortName: "Robot Arm",
        description: "A folding mechanical arm carrying a microscope, rock drill, and spectrometers to inspect rocks up close and discover mineral 'blueberries'!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "copper" || m === "gold";
        },
      },
      {
        id: "warm-body",
        name: "Warm Electronics Body",
        shortName: "Cozy Body",
        description: "The gold-wrapped insulated core holding the rover's computer brain and batteries, keeping them warm through sub-zero Martian nights down to -140°F!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "gold2";
        },
      },
    ],
  },

  // 4. Spirit Rover (MER-A)
  "spirit-rover": {
    name: "Spirit Rover (MER-A)",
    type: "glb",
    url: "/models/opportunity.glb",
    body: "mars",
    targetScale: 2.3,
    cameraPosition: [0, 1.9, 5.1],
    lookAt: [0, 0.85, 0],
    groundColor: 0x3d2018,
    parts: [
      {
        id: "pancam-mast",
        name: "Pancam Camera Mast",
        shortName: "Camera Mast",
        description: "Panoramic cameras mounted high on the rover's mast that searched the Gusev Crater for ancient signs of water and volcanic activity.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "gray" || m === "white" || m === "black";
        },
      },
      {
        id: "solar-wings",
        name: "Solar Panel Wings",
        shortName: "Solar Wings",
        description: "Converted sunlight into electricity. When a stuck front wheel dragged behind, it uncovered bright white silica soil that proved ancient hot springs once existed!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m.includes("solar");
        },
      },
      {
        id: "wheels",
        name: "Rocker-Bogie 6 Wheels",
        shortName: "6 Wheels",
        description: "Six-wheel drive suspension that rolled over rocky hills, volcanic plains, and sandy trenches across Mars for 6 heroic years.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "lightgraymetal" || m === "lambert1";
        },
      },
      {
        id: "robotic-arm",
        name: "Robotic Science Arm",
        shortName: "Robot Arm",
        description: "Held microscopic imagers and grinding tools that ground into volcanic rocks to test their chemical makeup.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "copper" || m === "gold";
        },
      },
      {
        id: "warm-body",
        name: "Warm Electronics Body",
        shortName: "Cozy Body",
        description: "Insulated body with electric heaters that protected the computer brain through freezing Martian winter seasons.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "gold2";
        },
      },
    ],
  },

  // 5. Ingenuity Mars Helicopter
  "ingenuity-helicopter": {
    name: "Ingenuity Mars Helicopter",
    type: "glb",
    url: "/models/ingenuity.glb",
    body: "mars",
    targetScale: 2.2,
    cameraPosition: [0, 1.8, 4.8],
    lookAt: [0, 0.9, 0],
    isHelicopter: true,
    groundColor: 0x3d2018,
    parts: [
      {
        id: "rotors",
        name: "Counter-Rotating Rotor Blades",
        shortName: "Rotor Blades",
        description: "Two pairs of carbon-fiber blades spinning in opposite directions at 2,400 RPM—5 times faster than on Earth—to lift in Mars' razor-thin air!",
        match: (obj, matName) => {
          const n = (obj.name || "").toLowerCase();
          const m = (matName || "").toLowerCase();
          return n.includes("rotor") || m.includes("blade");
        },
      },
      {
        id: "solar-panel",
        name: "Solar Panel Array",
        shortName: "Solar Panel",
        description: "Rides right on top like a little hat, catching Martian sunshine every day to recharge the lithium-ion batteries that power its flights.",
        match: (obj, matName) => {
          const n = (obj.name || "").toLowerCase();
          const m = (matName || "").toLowerCase();
          return n.includes("solar") || m.includes("chopper_sp") || m.includes("gold");
        },
      },
      {
        id: "legs",
        name: "Carbon-Composite Landing Legs",
        shortName: "Landing Legs",
        description: "Four super lightweight springy legs engineered to flex and absorb touchdowns on rocks, pebbles, and soft sand without breaking.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("leg");
        },
      },
      {
        id: "fuselage",
        name: "Avionics Fuselage Box",
        shortName: "Avionics Box",
        description: "The cozy foil-wrapped cube holding the computer processor, sensors, and thermostat heaters to survive freezing Martian nights down to -130°F!",
        match: (obj, matName) => {
          const n = (obj.name || "").toLowerCase();
          const m = (matName || "").toLowerCase();
          return n === "bus" || m.includes("foil");
        },
      },
      {
        id: "cameras",
        name: "Autonomous Navigation Cameras",
        shortName: "Nav Cameras",
        description: "Downward-pointing camera eyes tracking ground features 30 times a second so Ingenuity could pilot itself without a human joystick from Earth!",
        match: (obj, matName) => {
          const n = (obj.name || "").toLowerCase();
          const m = (matName || "").toLowerCase();
          return n.includes("cam") || n.includes("parts") || m.includes("binoculars");
        },
      },
    ],
  },

  // 6. Viking Lander
  "viking-lander": {
    name: "Viking Lander",
    type: "glb",
    url: "/models/viking-lander.glb",
    body: "mars",
    targetScale: 2.2,
    cameraPosition: [0, 1.8, 4.9],
    lookAt: [0, 0.85, 0],
    groundColor: 0x3d2018,
    parts: [
      {
        id: "scoop-arm",
        name: "Robotic Soil Scoop Arm",
        shortName: "Soil Scoop",
        description: "A 10-foot mechanical arm with a digging scoop that scooped up Martian soil and dropped it into onboard biology mini-laboratories.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "blinn2sg" || m === "blinn6sg";
        },
      },
      {
        id: "antenna-cameras",
        name: "High-Gain Antenna & Cameras",
        shortName: "Antenna & Eyes",
        description: "A dish antenna that beamed radio messages 100 million miles across space, and cameras that sent back the first color panoramas of Mars!",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "blinn8sg" || m === "blinn12sg";
        },
      },
      {
        id: "legs",
        name: "Spring-Loaded Landing Legs",
        shortName: "Landing Legs",
        description: "Three aluminum legs with crushable honeycomb pads that cushioned the touchdown impact when Viking dropped safely to the Martian surface.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "blinn11sg";
        },
      },
      {
        id: "body",
        name: "Science Instrument Body",
        shortName: "Science Body",
        description: "The hexagon chassis packed with biology ovens, gas analyzers, and weather instruments that searched for signs of Martian life in 1976.",
        match: (obj, matName) => {
          const m = (matName || "").toLowerCase();
          return m === "blinn4sg" || m === "blinn9sg" || m === "blinn10sg" || m.includes("initial");
        },
      },
    ],
  },

  // 7. Surveyor 3
  "surveyor-3": {
    name: "Surveyor 3",
    type: "glb",
    url: "/models/surveyor-3.glb",
    body: "moon",
    targetScale: 2.1,
    cameraPosition: [0, 1.9, 4.9],
    lookAt: [0, 0.9, 0],
    groundColor: 0x222634,
    parts: [
      {
        id: "solar-panel",
        name: "Solar Panel Array",
        shortName: "Solar Panel",
        description: "A rectangular panel at the very top that pivoted towards the Sun to power the robot during the long lunar daylight.",
        match: (obj, matName) => {
          const n = (obj.name || "").toLowerCase();
          const m = (matName || "").toLowerCase();
          return n.includes("solar") || m.includes("#2e4e8c");
        },
      },
      {
        id: "camera",
        name: "TV Camera Eye",
        shortName: "TV Camera",
        description: "Snapped 6,326 television photos of craters, rocks, and the lunar horizon so scientists on Earth could see the Moon up close.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n === "body_1" || n === "body_2" || n === "body_5";
        },
      },
      {
        id: "scoop-arm",
        name: "Soil Scoop Sampler Arm",
        shortName: "Soil Scoop",
        description: "A robotic digging arm with a scoop that dug trenches up to 7 inches deep to test how strong the lunar ground was for Apollo astronauts.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n === "body_11";
        },
      },
      {
        id: "landing-legs",
        name: "Landing Legs & Footpads",
        shortName: "Landing Legs",
        description: "Three aluminum tubular legs with honeycomb footpads that cushioned its gentle touchdown in the Ocean of Storms in 1967.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n === "body_4" || n === "body_7" || n === "body_8";
        },
      },
      {
        id: "main-body",
        name: "Main Frame & Thermal Foil",
        shortName: "Main Frame",
        description: "Golden foil thermal blankets and electronics visited in 1969 by Apollo 12 astronauts Pete Conrad and Alan Bean, who took parts back to Earth!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("foil") || n.includes("body");
        },
      },
    ],
  },

  // 8. Apollo 15 Lunar Roving Vehicle (LRV)
  "apollo-15": {
    name: "Apollo 15 Lunar Roving Vehicle (LRV)",
    type: "glb",
    url: "/models/lunar_rover.glb",
    body: "moon",
    targetScale: 2.2,
    cameraPosition: [0, 1.7, 4.9],
    lookAt: [0, 0.75, 0],
    groundColor: 0x222634,
    parts: [
      {
        id: "wheels",
        name: "Wire-Mesh Wheels",
        shortName: "Wire Wheels",
        description: "Four open-mesh titanium wheels woven like piano strings that rolled smoothly over fine powdery Moon dust without ever going flat!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("wheel") || n.startsWith("p0_");
        },
      },
      {
        id: "seats",
        name: "Astronaut Folding Seats",
        shortName: "Seats",
        description: "Two astronauts sat side-by-side strapped into lawn-chair-style folding seats, riding over craters and Moon hills!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("seat") || n.startsWith("p1_");
        },
      },
      {
        id: "antenna",
        name: "High-Gain Dish Antenna",
        shortName: "Antenna Dish",
        description: "Pointed directly at planet Earth to beam live color television pictures and astronaut voices across 240,000 miles of space.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("dish") || n.includes("antenna") || n.startsWith("p2_");
        },
      },
      {
        id: "camera",
        name: "Color Television Camera",
        shortName: "Color Camera",
        description: "Controlled remotely by Mission Control in Houston so scientists on Earth could pan around and watch astronauts collect Moon rocks.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("camera") || n.startsWith("p3_");
        },
      },
      {
        id: "controller",
        name: "T-Handle Driving Controller",
        shortName: "T-Joystick",
        description: "Instead of a steering wheel, the astronauts drove the rover using a small T-shaped joystick between their seats, like playing a video game!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("controller") || n.startsWith("p4_");
        },
      },
      {
        id: "frame",
        name: "Chassis & Silver-Zinc Batteries",
        shortName: "Chassis",
        description: "An aluminum folding frame powered by dual silver-zinc batteries that let Apollo 15 astronauts explore 17.5 miles across the Moon.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("frame") || n.includes("batteries") || n.startsWith("p5_");
        },
      },
    ],
  },

  // 9. Mars Pathfinder & Sojourner
  "mars-pathfinder": {
    name: "Mars Pathfinder & Sojourner",
    type: "pathfinder-combo",
    landerUrl: "/models/pathfinder.glb",
    roverUrl: "/models/sojourner.glb",
    body: "mars",
    targetScale: 2.2,
    cameraPosition: [0, 1.8, 5.0],
    lookAt: [0, 0.75, 0],
    groundColor: 0x3d2018,
    parts: [
      {
        id: "sojourner",
        name: "Sojourner Micro-Rover",
        shortName: "Sojourner Rover",
        description: "The legendary microwave-sized rover that rolled down the ramp on 6 little wheels—humanity's very first roving vehicle on Mars!",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("sojourner");
        },
      },
      {
        id: "petals",
        name: "Solar Panel Petals",
        shortName: "Solar Petals",
        description: "Three triangular solar panels that opened up like flower petals after Pathfinder's airbags bounced across Mars to a safe stop.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("petals") || n.startsWith("p0_");
        },
      },
      {
        id: "mast",
        name: "Stereo IMP Camera Mast",
        shortName: "Camera Mast",
        description: "A pop-up camera periscope that rose above the lander to take the first vivid 3D color panoramas of Mars' red landscape.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("camera") || n.startsWith("p1_");
        },
      },
      {
        id: "weather",
        name: "Atmospheric Weather Mast",
        shortName: "Weather Mast",
        description: "Sensors mounted high on a mast measuring Martian wind speeds, daily temperature swings, and atmospheric pressure.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("weather") || n.startsWith("p2_");
        },
      },
      {
        id: "antenna",
        name: "High-Gain Radio Antenna",
        shortName: "Radio Antenna",
        description: "Beamed pictures, weather reports, and rock chemical data across 120 million miles directly to NASA's Deep Space Network.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("antenna") || n.startsWith("p3_");
        },
      },
      {
        id: "ramps",
        name: "Lander Body & Exit Ramps",
        shortName: "Lander & Ramps",
        description: "The central pyramid base station and two unfolding ramps that allowed Sojourner to roll smoothly down onto the Martian soil.",
        match: (obj) => {
          const n = (obj.name || "").toLowerCase();
          return n.includes("ramp") || n.includes("lander") || n.startsWith("p4_") || n.startsWith("p5_");
        },
      },
    ],
  },
};

// Helper to look up a 3D model config by object id or name
export function getExplorationModel(id) {
  if (!id) return null;
  const cleanId = id.toLowerCase().trim();
  if (EXPLORATION_MODELS[cleanId]) return EXPLORATION_MODELS[cleanId];

  // Fallbacks by partial match
  if (cleanId.includes("apollo-11") || cleanId.includes("eagle")) return EXPLORATION_MODELS["apollo-11"];
  if (cleanId.includes("apollo-12") || cleanId.includes("intrepid")) return EXPLORATION_MODELS["apollo-12"];
  if (cleanId.includes("apollo-15") || cleanId.includes("rover") || cleanId.includes("buggy")) return EXPLORATION_MODELS["apollo-15"];
  if (cleanId.includes("opportunity")) return EXPLORATION_MODELS["opportunity-rover"];
  if (cleanId.includes("spirit")) return EXPLORATION_MODELS["spirit-rover"];
  if (cleanId.includes("ingenuity") || cleanId.includes("helicopter")) return EXPLORATION_MODELS["ingenuity-helicopter"];
  if (cleanId.includes("viking")) return EXPLORATION_MODELS["viking-lander"];
  if (cleanId.includes("surveyor")) return EXPLORATION_MODELS["surveyor-3"];
  if (cleanId.includes("pathfinder") || cleanId.includes("sojourner")) return EXPLORATION_MODELS["mars-pathfinder"];

  return null;
}
