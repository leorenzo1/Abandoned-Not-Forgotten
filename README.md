# Abandoned, Not Forgotten

**NASA Space Apps Challenge 2026**

An interactive 3D digital observatory and educational platform honoring humanity's inactive rovers, landers, and descent stages on the Moon and Mars as permanent monuments of exploration and scientific discovery.

- **Live Application**: [https://abandoned-not-forgotten.onrender.com/](https://abandoned-not-forgotten.onrender.com/)
- **Repository**: [https://github.com/leorenzo1/Abandoned-Not-Forgotten](https://github.com/leorenzo1/Abandoned-Not-Forgotten)

---

## Overview

Across the lunar regolith and Martian plains rest the pioneering machines that paved the way for interplanetary exploration. Often termed "space debris" or "abandoned hardware," each site represents a milestone in human engineering, scientific inquiry, and global cooperation.

**Abandoned, Not Forgotten** translates official NASA mission archives into an interactive 3D experience. Users can inspect surface landing sites, examine hardware in 3D, follow chronological mission storylines, test their knowledge with mission trivia, and review official NASA scientific citations.

---

## Architecture & Features

### 1. Interactive 3D Planetary Explorer
- **High-Fidelity Planetary Globes**: Interactive 3D models of the Moon and Mars built with Three.js and React Three Fiber.
- **Accurate Surface Coordinates**: Direct coordinate telemetry for eight historic landing sites (Surveyor 3, Apollo 11, Apollo 12, Apollo 15, Mars Pathfinder & Sojourner, Spirit, Opportunity, and Ingenuity).
- **Directional Starfield Warp**: Dynamic canvas starfield featuring lateral travel transitions between planets and centered radial acceleration when launching exploration mode.

### 2. Chronological Mission Timeline
- **Dynamic Responsive Scaling**:
  - **Desktop (Widescreen)**: Horizontal layout featuring an interactive chronological scrubber rail, side-by-side narrative and media columns, and dual-column layouts for "What We Learned" and "Did You Know?".
  - **Mobile**: Touch-friendly vertical stack with a horizontally swipeable milestone selector.
- **First-Person Storyboards**: Narratives detailing each machine's operational history and legacy.
- **Integrated Speech Synthesis**: Native Web Speech API narration ("Read Aloud") for accessible learning.
- **Keyboard Navigation**: Timeline traversal using Left (`←`) and Right (`→`) arrow keys.

### 3. 3D Hardware Inspection Lab
- Interactive 3D model viewer offering full orbital camera controls for examining the structural engineering of rovers, descent stages, and instruments.

### 4. Explorer Passport Logbook
- Gamified discovery tracker logging visited planetary sites and awarding digital mission stamps as artifacts are inspected.

### 5. NASA Junior Space Quiz Challenge
- **29 Educational Trivia Questions**: Filterable by mission or playable across the full catalog, sourced from official NASA mission data.
- **Instant Validation & Answer Reveal**: Visual feedback that highlights the correct answer in emerald green with detailed explanations from mission archives.
- **Score & Rank Tracking**: Performance evaluation awarding rank titles based on accuracy.

### 6. NASA Data & Science References
- Catalog linking directly to primary NASA data repositories, including the NASA NSSDC Master Catalog, Apollo Lunar Surface Journal (ALSJ), and the NASA JPL Mars Exploration Program.

---

## Featured Missions & Landing Sites

| Mission | Celestial Body | Year | Landing Location | Coordinates |
| :--- | :---: | :---: | :--- | :--- |
| **Surveyor 3** | Moon | 1967 | Oceanus Procellarum | 3.01634° S, 23.41803° W |
| **Apollo 11 (LM Descent Stage)** | Moon | 1969 | Mare Tranquillitatis | 0.67408° N, 23.47297° E |
| **Apollo 12 (LM & ALSEP)** | Moon | 1969 | Oceanus Procellarum | 3.01239° S, 23.42157° W |
| **Apollo 15 (Lunar Roving Vehicle)** | Moon | 1971 | Hadley-Apennine | 26.13222° N, 3.63386° E |
| **Mars Pathfinder & Sojourner** | Mars | 1997 | Ares Vallis | 19.33° N, 33.55° W |
| **Spirit Rover (MER-A)** | Mars | 2004 | Gusev Crater | 14.5684° S, 175.47263° E |
| **Opportunity Rover (MER-B)** | Mars | 2004 | Meridiani Planum | 1.9462° S, 354.4734° E |
| **Ingenuity Mars Helicopter** | Mars | 2021 | Jezero Crater | 18.4447° N, 77.4508° E |

---

## Technical Stack

- **Client Framework**: React 19, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Canvas Rendering**: HTML5 Canvas with 3D projection kinematics (Starfield)
- **Audio & Accessibility**: Web Speech API (`speechSynthesis`)
- **Deployment Platform**: Render

---

## Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/leorenzo1/Abandoned-Not-Forgotten.git
   cd Abandoned-Not-Forgotten
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install project dependencies:
   ```bash
   npm install
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

5. Create an optimized production build:
   ```bash
   npm run build
   ```

---

## Data Sources & Acknowledgments

Developed as part of the **NASA Space Apps Challenge 2026**.

All planetary textures, orbital coordinates, imagery, and historical documentation are courtesy of:
- NASA / National Aeronautics and Space Administration
- Jet Propulsion Laboratory (JPL / Caltech)
- Apollo Lunar Surface Journal (ALSJ)
- NASA Space Science Data Coordinated Archive (NSSDC)
