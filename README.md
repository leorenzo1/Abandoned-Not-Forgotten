# 🚀 Abandoned, Not Forgotten

> **NASA Space Apps Challenge 2026**  
> An interactive 3D digital museum and educational experience honoring the inactive rovers, landers, and descent stages resting on the Moon and Mars as permanent monuments of human curiosity and scientific breakthrough.

🌐 **Live Website**: [https://abandoned-not-forgotten.onrender.com/](https://abandoned-not-forgotten.onrender.com/)  
📦 **Repository**: [https://github.com/leorenzo1/Abandoned-Not-Forgotten](https://github.com/leorenzo1/Abandoned-Not-Forgotten)

---

## 🌌 Overview

Across the lunar seas and the Martian deserts lie the silent machines that paved the way for human civilization in the cosmos. Often labeled as "space junk" or "abandoned hardware," each resting machine carries a heartbeat of human ingenuity, international collaboration, and monumental discovery.

**Abandoned, Not Forgotten** transforms official NASA mission science data into an immersive, interactive 3D observatory where students, educators, and space enthusiasts can explore, inspect, and connect emotionally with these historical relics.

---

## ✨ Key Features

### 🪐 1. Interactive 3D Planetary Explorer
- **High-Fidelity 3D Globes**: Explore real-scale 3D models of the **Moon** and **Mars** rendered with Three.js / WebGL.
- **Surface Landing Markers**: Locate exact historic landing sites with precise coordinate telemetry (Surveyor 3, Apollo 11, Apollo 12, Apollo 15, Mars Pathfinder / Sojourner, Spirit, Opportunity, and Ingenuity).
- **Hyperdrive Starfield Warp**: Experience dynamic cosmic warp transitions when traveling between the Moon and Mars, and radial hyperspace acceleration when entering the observatory.

### 📜 2. Dynamic Space Machine Timeline
- **Widescreen Desktop & Responsive Mobile Layout**: Seamless dynamic scaling featuring a horizontal interactive milestone rail on PC and a touch-friendly swipeable scrubber on mobile.
- **First-Person Narrative Storyboards**: Experience each machine's story told in its own voice.
- **Side-by-Side Science Breakdowns**: Highlighting *"What We Learned"* (key scientific findings) and *"Did You Know?"* callouts side-by-side.
- **Voice Narration ("Read Aloud")**: Native Web Speech API integration that narrates the machine's story for accessible learning.
- **Keyboard Navigation**: Fluidly travel through exploration history using `←` and `→` arrow keys.

### 🔍 3. 3D Hardware Inspection Lab
- Inspect 3D models of rovers, landers, and instruments up close with 360° orbital camera controls.
- Examine engineering marvels from the Apollo Lunar Roving Vehicle to the Ingenuity Mars Helicopter.

### 🛂 4. Explorer Passport & Badge Collection
- Digital logbook tracking discovered artifacts across both planetary bodies.
- Collectible mission stamps awarded as you inspect sites and hardware.

### 🎯 5. NASA Junior Space Quiz Challenge
- **29 Educational Trivia Questions**: Spanning all 8 featured missions derived from official NASA archives.
- **Category & Mission Filtering**: Filter trivia by individual missions or test your knowledge across the entire catalog.
- **Instant Visual Validation & Answer Reveal**: Immediate feedback highlighting the correct answer in emerald green with complete mission explanations.
- **Rank Achievement**: Complete the challenge to earn ranks from *Cadet Explorer* to *Chief Cosmologist*.

### 📚 6. Official NASA Science References
- Curated reference catalog linking directly to NASA NSSDC Master Catalog, Apollo Lunar Surface Journal (ALSJ), and NASA JPL Mars Exploration Archives.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **3D Graphics & Shaders**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Interactive Canvas**: HTML5 2D Canvas Starfield with 3D projection kinematics
- **Accessibility & Audio**: Web Speech API (SpeechSynthesis)
- **Deployment**: Render ([abandoned-not-forgotten.onrender.com](https://abandoned-not-forgotten.onrender.com/))

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/leorenzo1/Abandoned-Not-Forgotten.git
   cd Abandoned-Not-Forgotten
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🛰️ Featured Missions & Artifacts

| Mission | Body | Year | Landing Location | Significance |
| :--- | :---: | :---: | :--- | :--- |
| **Surveyor 3** | Moon | 1967 | Oceanus Procellarum | First lunar trench dug; visited by Apollo 12 |
| **Apollo 11** | Moon | 1969 | Mare Tranquillitatis | First human lunar landing; historic descent stage |
| **Apollo 12** | Moon | 1969 | Oceanus Procellarum | Precision landing pinpointed next to Surveyor 3 |
| **Apollo 15** | Moon | 1971 | Hadley-Apennine | First deployment of the Lunar Roving Vehicle (LRV) |
| **Mars Pathfinder** | Mars | 1997 | Ares Vallis | First successful rover (*Sojourner*) on Mars |
| **Spirit (MER-A)** | Mars | 2004 | Gusev Crater | Discovered evidence of past hydrothermal activity |
| **Opportunity (MER-B)** | Mars | 2004 | Meridiani Planum | Traversed 45.16 km; proved ancient liquid water |
| **Ingenuity** | Mars | 2021 | Jezero Crater | First powered flight on another planet (72 flights) |

---

## 📄 License & NASA Acknowledgments

This project is created for the **NASA Space Apps Challenge 2026**.  
All mission imagery, landing coordinates, and science datasets are courtesy of NASA, Jet Propulsion Laboratory (JPL), and the public domain space archives.
