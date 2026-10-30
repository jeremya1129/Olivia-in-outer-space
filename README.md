# Olivia in Outer Space 🚀

An interactive, touch-friendly, personalized space exploration web application designed for toddlers **Olivia** and **Anna**. 

Built with React 18, Vite, and Tailwind CSS, featuring oversized tactile flight deck controls, procedural Web Audio feedback, authentic NASA spacecraft photography, and customized cartoon and real-photo avatars.

---

## 🌟 Key Features

- **Toddler-First Flight Deck (`Cockpit.jsx`)**:
  - Fullscreen cockpit canopy with rotating Earth and starry space background.
  - Tactile destination push buttons sized $\ge 96\text{px}$ (`min-h-[96px]`) with `touch-action: manipulation` for easy toddler tapping.
  - Physical rumble effect (`animate-rumble`), engine blast-off sounds, and animated rocket launch zoom towards chosen destinations.
  - Toggle between **Custom Cartoon Art** and **Personalized Real Photo Faces** of Olivia and Anna in their astronaut flight helmets.
  - Authentic replica of the beloved white-and-charcoal Little Tikes Adventure Rocket with purple observation dome, steering wheel, and red crayon markings.

- **Audio Engine (`AudioPlayer.jsx`)**:
  - Zero-latency procedural Web Audio synthesizer fallbacks (`playBlastoff`, `playBeep`, `playBirdChirp`, `playTwinkle`, `playRoverBeep`, `playWhoosh`).
  - Text-to-Speech narration via Web Speech API and support for local voice/SFX `.mp3` audio clips.

- **Planetary Landing View (`PlanetView.jsx`)**:
  - Interactive destination screen with oversized sensory action buttons (*Wave to Earth*, *Space Yawn with the Moon*, *Drive the Mars Rover*, *Spin Saturn's Rings*).
  - True-color spacecraft photography overlays with instant return-to-cockpit launch buttons.

---

## 🛰️ Planetary Data Engineering & NASA Imagery Pipelines

### 1. Solar System Database (`data/schema.sql` & `scripts/fetch_solar_data.py`)
- **SQLite Database**: [`data/solar_system.db`](file:///G:/My%20Drive/Antigravity/Olivia-in-Outer-Space/data/solar_system.db)
- **Normalized JSON**: [`data/solar_system.json`](file:///G:/My%20Drive/Antigravity/Olivia-in-Outer-Space/data/solar_system.json)
- Ingests **20 primary celestial bodies**:
  - **Star**: Sun (`soleil`)
  - **Terrestrial Planets**: Mercury (`mercure`), Venus (`venus`), Earth (`terre`), Mars (`mars`)
  - **Giant Planets**: Jupiter (`jupiter`), Saturn (`saturne`), Uranus (`uranus`), Neptune (`neptune`)
  - **Key Moons**: The Moon (`lune`), Phobos, Deimos, Europa, Ganymede, Callisto, Titan, Enceladus, Triton
  - **Dwarf Planets**: Pluto (`pluton`), Ceres (`ceres`)
- Normalizes physical properties (radius, mass, gravity, density, orbital periods, rotation, temperature in °C) and enriches each body with toddler sensory hooks, primary hex colors, and NASA identifiers.
- Guaranteed zero-null values with built-in astronomical baseline fallbacks.

```bash
# Ingest or re-fetch solar system celestial data
python scripts/fetch_solar_data.py
```

### 2. Curated NASA Spacecraft Imagery Pipeline (`scripts/fetch_nasa_images.py`)
- Queries the public **NASA Image and Video Library API** (`https://images-api.nasa.gov/search`) using curated spacecraft queries to ensure authentic photography (SDO, MESSENGER, Magellan, Apollo 17, Viking, Juno, Cassini, Voyager 2, New Horizons, Dawn, and MRO HiRISE).
- Downloads original spacecraft images to `assets/real_imagery/{body_id}/original.jpg`.
- Utilizes **Pillow (`PIL`)** to generate:
  - `display.webp`: Proportional display image ($\le 1200\times 1200\text{ px}$) at 85% WebP quality.
  - `thumb.webp`: Proportional thumbnail ($256\times 256\text{ px}$) at 85% WebP quality.
- Automatically mirrors assets to `public/assets/real_imagery/` for web serving and updates both SQLite and JSON databases.

```bash
# Run the NASA image pipeline for all 20 celestial bodies
python scripts/fetch_nasa_images.py
```

---

## 📁 Repository Structure

```text
olivia-in-outer-space/
├── assets/
│   ├── cartoons/            # Cartoon SVG avatars, cockpit console, and rocket
│   │   ├── characters/      # Olivia, Anna cartoon & photo face assets
│   │   └── cockpit/         # Adventure rocket & console elements
│   ├── real_imagery/        # NASA spacecraft photography (original + WebP)
│   ├── audio/               # Voice recordings & toddler sound effects
│   └── backgrounds/         # Space & orbit backgrounds
├── data/
│   ├── schema.sql           # SQLite schema for celestial bodies table
│   ├── solar_system.db      # SQLite database (20 bodies, 0 nulls)
│   ├── solar_system.json    # Normalized JSON export
│   ├── celestial_bodies.db  # Core 8 bodies SQLite database
│   └── celestial_bodies.json# Core normalized JSON catalog
├── public/
│   └── assets/              # Static public assets served by Vite
├── scripts/
│   ├── fetch_solar_data.py  # Solar system data ingestion & normalization pipeline
│   ├── fetch_nasa_images.py # NASA imagery fetcher & WebP optimization pipeline
│   ├── ingest_celestial_data.py # Initial celestial ingestion script
│   └── process_assets.py    # Pillow asset preprocessing pipeline
├── src/
│   ├── components/
│   │   ├── Cockpit.jsx      # Tactile flight deck, character avatars & launch sequence
│   │   ├── PlanetView.jsx   # Interactive destination view & sensory actions
│   │   └── AudioPlayer.jsx  # Web Audio synthesizer & speech narrator
│   ├── data/
│   │   └── celestialData.json # Core UI destination configuration
│   ├── App.jsx              # Main application router & view switcher
│   ├── main.jsx             # React DOM entry point
│   └── index.css            # Tailwind directives & toddler touch styles
├── package.json             # NPM dependencies & scripts
├── vite.config.js           # Vite server & watcher configuration
└── tailwind.config.js       # Tailwind CSS styling configuration
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node.js LTS v24.22)
- **Python**: 3.9+ with `Pillow` installed (`pip install Pillow`)

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🎨 Asset Management & Hygiene

- **Reference Media**: Raw private references placed in `assets/raw_references/` are excluded from version control via `.gitignore`.
- **Pre-processing**: Process raw reference photos into cropped transparent PNGs:
  ```bash
  python scripts/process_assets.py
  ```
- **Image Pipeline**: Optimized WebP images are tracked in Git, ensuring fast load times on tablets and mobile devices.
