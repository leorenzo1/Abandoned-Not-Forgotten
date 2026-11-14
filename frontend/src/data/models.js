// 3D cartoon models built from three.js procedural geometries.
// Each model provides interactive, clickable parts with educational descriptions.
import * as T from "three";

function P(g, c, x, y, z, a, b, d) {
  const m = new T.Mesh(g, new T.MeshToonMaterial({ color: c }));
  m.position.set(x || 0, y || 0, z || 0);
  m.rotation.set(a || 0, b || 0, d || 0);
  return m;
}

function bx(w, h, d, c, x, y, z, a, b, e) {
  return P(new T.BoxGeometry(w, h, d), c, x, y, z, a, b, e);
}

function cy(r1, r2, h, c, x, y, z, a, b, e, s) {
  return P(new T.CylinderGeometry(r1, r2, h, s || 24), c, x, y, z, a, b, e);
}

function sp(r, c, x, y, z) {
  return P(new T.SphereGeometry(r, 16, 12), c, x, y, z);
}

function G(l) {
  const g = new T.Group();
  l.forEach((m) => g.add(m));
  return g;
}

function legs(n, r, yc, len, s, c) {
  const o = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 6.2832) / n + 0.8;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    const pr = r + (len / 2) * Math.sin(s);
    o.push(cy(0.04, 0.04, len, c, sa * r, yc, ca * r, -ca * s, 0, sa * s, 8));
    o.push(cy(0.14, 0.14, 0.04, c, sa * pr, 0.02, ca * pr, 0, 0, 0, 12));
  }
  return o;
}

const C0 = 0xf0f0f5;
const GR = 0xcfcfe0;
const BL = 0x2a4bd8;
const YL = 0xffd23f;
const PK = 0xff6b9d;
const DK = 0x3a3a4a;
const MT = 0x3ddc97;
const OR = 0xff9f45;
const SK = 0x4cc9f0;

export const MODELS = [
  {
    id: "surveyor-3",
    n: "Surveyor 3",
    w: "moon",
    s: "A robot scout that landed on April 20, 1967 to test if the Moon's ground could hold a spacecraft.",
    b: function () {
      return [
        G([cy(0.17, 0.17, 0.3, DK, 0, 2.15, 0), sp(0.1, SK, 0, 2.15, 0.16)]),
        G([bx(1.4, 0.05, 0.9, BL, 0, 2.5, 0, 0, 0, 0.15)]),
        G([bx(0.08, 0.08, 1, C0, 0.45, 0.9, 0.6, 0, 0.5, 0), bx(0.22, 0.12, 0.22, PK, 0.7, 0.9, 1.0)]),
        G(legs(3, 0.5, 0.55, 1.2, 0.4, GR)),
        G([bx(0.8, 0.55, 0.8, C0, 0, 1.2, 0), cy(0.06, 0.06, 0.8, GR, 0, 1.85, 0)]),
      ];
    },
    i: [
      ["TV camera", "Its camera took thousands of photos so scientists on Earth could see the Moon up close."],
      ["Solar panel", "A panel on top caught sunlight to make electricity for the robot."],
      ["Soil scoop arm", "A robotic arm with a scoop dug small trenches and tested how strong the ground was."],
      ["Landing legs", "Three legs held it steady. Its tests showed the Moon could support the weight of an Apollo Lunar Module."],
      ["Main body", "In 1969, Apollo 12 astronauts Pete Conrad and Alan Bean visited it and took parts home to study how years on the Moon changed them."],
    ],
  },
  {
    id: "moon-buggy",
    n: "Apollo 15 Lunar Rover",
    w: "moon",
    s: "The Lunar Roving Vehicle, first driven on Apollo 15, let astronauts explore much farther than they could walk.",
    b: function () {
      const w = [];
      [
        [-0.7, -0.9],
        [0.7, -0.9],
        [-0.7, 0.9],
        [0.7, 0.9],
      ].forEach((p) => {
        w.push(cy(0.32, 0.32, 0.2, DK, p[0], 0.32, p[1], 0, 0, 1.5708, 20));
      });
      return [
        G(w),
        G([
          bx(0.5, 0.1, 0.4, PK, -0.3, 0.7, -0.1),
          bx(0.5, 0.1, 0.4, PK, 0.3, 0.7, -0.1),
          bx(0.5, 0.45, 0.08, PK, -0.3, 0.95, -0.35),
          bx(0.5, 0.45, 0.08, PK, 0.3, 0.95, -0.35),
        ]),
        G([cy(0.03, 0.03, 0.9, GR, 0, 1.1, 0.75), cy(0.5, 0.05, 0.15, YL, 0, 1.65, 0.75)]),
        G([bx(1.1, 0.2, 2, C0, 0, 0.55, 0), bx(0.6, 0.2, 0.5, MT, 0, 0.75, -0.85)]),
      ];
    },
    i: [
      ["Wire-mesh wheels", "Four open-mesh wheels rolled smoothly over fine powdery dust and rocks without getting stuck."],
      ["Astronaut seats", "Two astronauts rode side by side strapped into lawn-chair-style folding seats."],
      ["Antenna dish", "High-gain antenna dish broadcast live color TV and telemetry directly back to Earth."],
      ["Chassis and battery", "Electric-powered frame ran on dual silver-zinc batteries instead of gasoline."],
    ],
  },
  {
    id: "viking-lander",
    n: "Viking Lander",
    w: "mars",
    s: "Viking 1 and 2 landed on Mars in 1976 to conduct the first biology experiments searching for signs of life.",
    b: function () {
      return [
        G([bx(0.08, 0.08, 1, OR, 0.5, 1.3, 0.6, 0, 0.5, 0), bx(0.2, 0.12, 0.2, PK, 0.75, 1.3, 1.0)]),
        G([
          cy(0.07, 0.07, 0.2, DK, -0.35, 1.3, -0.3),
          sp(0.07, SK, -0.35, 1.3, -0.2),
          cy(0.07, 0.07, 0.2, DK, 0, 1.3, -0.5),
          sp(0.07, SK, 0, 1.3, -0.4),
        ]),
        G([cy(0.03, 0.03, 0.7, GR, 0.45, 1.5, -0.35), cy(0.4, 0.05, 0.12, YL, 0.45, 1.95, -0.35)]),
        G(legs(3, 0.7, 0.55, 1.2, 0.45, GR)),
        G([cy(0.85, 0.85, 0.4, C0, 0, 1, 0, 0, 0, 0, 6)]),
      ];
    },
    i: [
      ["Robotic scoop arm", "The mechanical arm scooped up Martian soil and placed it into mini onboard chemical laboratories."],
      ["Stereo cameras", "Dual facsimile cameras captured the first high-resolution color panoramas of the Red Planet."],
      ["High-gain antenna", "Sent scientific data and weather reports millions of miles across the solar system to Earth."],
      ["Landing legs", "Three spring-loaded legs absorbed touchdown impact and kept the craft level on rocky terrain."],
      ["Science instrument body", "Housed experiments that analyzed the atmosphere, organic molecules, and Martian wind patterns."],
    ],
  },
  {
    id: "spirit-opportunity",
    n: "Spirit & Opportunity",
    w: "mars",
    s: "Twin exploration rovers that landed in January 2004 to find out if liquid water once existed on ancient Mars.",
    b: function () {
      const w = [];
      [-0.6, 0, 0.6].forEach((z) => {
        [-0.75, 0.75].forEach((x) => {
          w.push(cy(0.28, 0.28, 0.22, DK, x, 0.28, z, 0, 0, 1.5708, 20));
        });
      });
      return [
        G([
          cy(0.04, 0.04, 0.8, GR, 0, 1.45, -0.55),
          bx(0.35, 0.18, 0.18, DK, 0, 1.9, -0.55),
          sp(0.06, SK, -0.1, 1.9, -0.45),
          sp(0.06, SK, 0.1, 1.9, -0.45),
        ]),
        G(w),
        G([bx(1.4, 0.06, 1.8, BL, 0, 1.1, 0)]),
        G([bx(0.07, 0.07, 0.9, PK, 0.3, 0.75, 0.95), sp(0.11, MT, 0.3, 0.75, 1.45)]),
        G([bx(1, 0.4, 1.4, C0, 0, 0.85, 0)]),
      ];
    },
    i: [
      ["Pancam mast", "Panoramic cameras mounted at human eye level identified rock targets, including hematite 'blueberries'."],
      ["Rocker-bogie 6 wheels", "Articulated suspension climbed over boulders as tall as the wheels without tipping over."],
      ["Solar panel deck", "Converted Martian sunlight into power. Dust devils occasionally swept the panels clean!"],
      ["Instrument deployment arm", "Held a microscopic imager, alpha particle X-ray spectrometer, and rock abrasion tool."],
      ["Warm electronics box", "Insulated body protected computer brains and batteries through freezing Martian nights."],
    ],
  },
  {
    id: "ingenuity",
    n: "Ingenuity Helicopter",
    w: "mars",
    spin: 0,
    s: "The first aircraft in history to achieve powered, controlled flight on another planet, logging 72 flights.",
    b: function () {
      return [
        G([bx(2.6, 0.03, 0.2, DK, 0, 2.15, 0), bx(0.2, 0.03, 2.6, DK, 0, 2.3, 0)]),
        G([bx(0.9, 0.05, 0.9, BL, 0, 1.95, 0)]),
        G(legs(4, 0.3, 0.35, 0.8, 0.25, DK)),
        G([bx(0.6, 0.5, 0.6, C0, 0, 1, 0), cy(0.04, 0.04, 0.6, GR, 0, 1.55, 0)]),
      ];
    },
    i: [
      ["Counter-rotating rotor blades", "Carbon-fiber blades spun at 2,400 RPM—5 times faster than on Earth—to lift in thin Martian air."],
      ["Solar panel array", "Mounted above the rotors to catch maximum sunlight and recharge lithium-ion batteries."],
      ["Carbon-composite legs", "Ultra-lightweight legs designed to flex during touchdowns on sand and rocky slopes."],
      ["Avionics fuselage box", "Carried autonomous navigation cameras, sensors, and computers since Earth was too far for real-time joysticking."],
    ],
  },
];
