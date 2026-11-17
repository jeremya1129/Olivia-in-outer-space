# Olivia in Outer Space 🚀

An interactive, touch-friendly, personalized space exploration web application designed for toddlers **Olivia** and **Anna**.

Built with React 18, Vite, and Tailwind CSS, featuring oversized tactile launchpad and flight deck controls, procedural Web Audio feedback, read-along storybooks, authentic NASA spacecraft photography, and customized cartoon and real-photo avatars.

---

## 🌟 Key Features

- **Earth Spaceport Launchpad (`Launchpad.jsx`)**:
  - Sunny Earth launchpad with interactive Captain Olivia and Navigator Anna avatars, animated Adventure Rocket, and an oversized blast-off push button (`min-h-[96px]`) with `touch-action: manipulation`.
  - 3-phase **Boarding & Blast-Off Cinematic** (boarding ramp, 3-2-1 countdown, liftoff) with a Skip button and `Escape` key support.
  - Toggle between **Custom Cartoon Art** and **Personalized Real Photo Faces** of Olivia and Anna in their astronaut helmets.

- **Solar System Highway & Cockpit (`Cockpit.jsx` & `SolarSystemView.jsx`)**:
  - Fullscreen cockpit canopy framing an interactive horizontal **Solar System Highway** from the Sun to Pluto, with quick-jump chips and an Asteroid Belt divider.
  - Tap any planet to enter its **Planetary System View** with companion moons, orbital metrics, and a **Read-Along Story (`ReadAlongStory.jsx`)** featuring word-by-word speech highlighting and tappable sight words.
  - Physical rumble effect (`animate-rumble`), engine blast-off sounds, and an animated **Little Tikes Adventure Rocket (`FlyingToyRocket.jsx`)** launch zoom toward chosen destinations.

- **Audio Engine (`AudioPlayer.jsx`)**:
  - Zero-latency procedural Web Audio synthesizer (`playBlastoff`, `playBeep`, `playRobotBeep`, `playChildChime`, `playBirdChirp`, `playTwinkle`, `playRoverBeep`, `playWhoosh`).
  - Text-to-Speech narration via Web Speech API with **Child** and **Robot** voice modes, plus optional local audio file playback with automatic synth fallback.

- **Planetary Landing View (`PlanetView.jsx`)**:
  - Interactive destination screen with oversized sensory action buttons (*Wave to Earth*, *Space Yawn with the Moon*, *Drive the Mars Rover*, *Spin Saturn's Rings*) and expandable animated interaction GIF modals.
  - Toggle between **Cartoon Illustrations (`CartoonCelestialBody.jsx`)** and true-color **NASA Spacecraft Photography** with automatic fallback.

---

## 🛰️ Planetary Data Engineering & NASA Imagery Pipelines

### 1. Solar System Database (`data/schema.sql` & `scripts/fetch_solar_data.py`)
- **SQLite Database**: [`data/solar_system.db`](data/solar_system.db)
- **Normalized JSON**: [`data/solar_system.json`](data/solar_system.json)
- Ingests **20 primary celestial bodies**:
  - **Star**: Sun (`sun`)
  - **Terrestrial Planets**: Mercury (`mercury`), Venus (`venus`), Earth (`earth`), Mars (`mars`)
  - **Giant Planets**: Jupiter (`jupiter`), Saturn (`saturn`), Uranus (`uranus`), Neptune (`neptune`)
  - **Key Moons**: The Moon (`moon`), Phobos, Deimos, Europa, Ganymede, Callisto, Titan, Enceladus, Triton
  - **Dwarf Planets**: Pluto (`pluto`), Ceres (`ceres`)
- Normalizes physical properties (radius, mass, gravity, density, orbital periods, rotation, temperature in °C) and enriches each body with toddler sensory hooks, primary hex colors, and NASA identifiers.
- Guaranteed zero-null values with built-in astronomical baseline fallbacks.

```bash
# Ingest or re-fetch solar system celestial data
python3 scripts/fetch_solar_data.py
```

### 2. Curated NASA Spacecraft Imagery Pipeline (`scripts/fetch_nasa_images.py`)
- Queries the public **NASA Image and Video Library API** (`https://images-api.nasa.gov/search`) using curated spacecraft queries (SDO, MESSENGER, Magellan, Apollo 17, Viking, Juno, Cassini, Voyager 2, New Horizons, Dawn, and MRO HiRISE).
- Downloads original spacecraft images to `assets/real_imagery/{body_id}/original.jpg`.
- Utilizes **Pillow (`PIL`)** to generate:
  - `display.webp`: Proportional display image ($\le 1200\times 1200\text{ px}$) at 85% WebP quality.
  - `thumb.webp`: Proportional thumbnail ($256\times 256\text{ px}$) at 85% WebP quality.
- Mirrors assets to `public/assets/real_imagery/` for web serving and updates both SQLite and JSON databases.

```bash
# Run the NASA image pipeline for all 20 celestial bodies
python3 scripts/fetch_nasa_images.py
```

---

## 📁 Repository Structure

```text
Olivia-in-Outer-Space/
├── assets/
│   ├── cartoons/                # Source cartoon SVGs, character cutouts, & interaction GIFs
│   ├── real_imagery/            # NASA spacecraft photography (original + WebP)
│   ├── audio/                   # Placeholder folders for optional voice/SFX audio clips
│   └── backgrounds/             # Backdrop art documentation
├── data/
│   ├── schema.sql               # SQLite schema for celestial_bodies table
│   ├── solar_system.db          # SQLite database (20 bodies, 0 nulls)
│   ├── solar_system.json        # Normalized JSON export (20 bodies)
│   ├── celestial_bodies.db      # Core 8 bodies SQLite database
│   └── celestial_bodies.json    # Core 8 bodies JSON catalog
├── public/
│   ├── assets/                  # Static public assets served by Vite (characters, interactions, real_imagery)
│   ├── manifest.webmanifest     # PWA manifest
│   ├── _redirects               # Cloudflare Pages SPA fallback
│   └── .nojekyll                # Disable Jekyll processing on GitHub Pages
├── scripts/
│   ├── fetch_solar_data.py      # Solar system data ingestion & normalization pipeline
│   ├── fetch_nasa_images.py     # NASA imagery fetcher & WebP optimization pipeline
│   ├── ingest_celestial_data.py # Initial 8-body celestial ingestion script
│   ├── process_assets.py        # Pillow asset preprocessing pipeline
│   ├── generate_interaction_gifs.py # Procedural Pillow GIF generator for all 20 bodies
│   └── test_user_flow.mjs       # Headless Chrome CDP end-to-end test suite (35 assertions)
├── src/
│   ├── components/
│   │   ├── AudioPlayer.jsx      # Web Audio synthesizer & Web Speech narrator context
│   │   ├── CartoonCelestialBody.jsx # Memoized SVG illustrations for all 20 bodies
│   │   ├── Cockpit.jsx          # Cockpit windshield frame & rocket blast-off wrapper
│   │   ├── FlyingToyRocket.jsx  # Animated Little Tikes Adventure Rocket
│   │   ├── Launchpad.jsx        # Earth spaceport start screen & boarding cinematic
│   │   ├── PlanetView.jsx       # Interactive destination view, sensory actions & fact cards
│   │   ├── ReadAlongStory.jsx   # Word-by-word read-along storybook & sight words
│   │   └── SolarSystemView.jsx  # Solar System Highway & Planetary System moon explorer
│   ├── data/
│   │   ├── celestialData.json   # Core UI destination configuration (20 bodies)
│   │   └── planetStories.js     # Read-along stories & sight words for all 20 bodies
│   ├── utils/
│   │   └── assets.js            # Base-URL-aware asset path resolver (getAssetUrl)
│   ├── App.jsx                  # Main application shell, error boundary & lazy view routing
│   ├── main.jsx                 # React DOM entry point
│   └── index.css                # Tailwind directives, toddler touch styles & keyframes
├── index.html                   # HTML entry point & PWA metadata
├── package.json                 # NPM dependencies & scripts
├── vite.config.js               # Vite server, base URL & watcher configuration
├── tailwind.config.js           # Tailwind CSS theme & animations
├── postcss.config.js            # PostCSS configuration
├── Dockerfile                   # Multi-stage Node + Nginx Alpine container build
├── nginx.conf                   # Nginx SPA routing & caching config
├── netlify.toml                 # Netlify build & SPA redirect config
├── vercel.json                  # Vercel SPA rewrite & cache config
└── DEPLOYMENT.md                # Multi-platform deployment & PWA installation guide
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18+
- **Python**: 3.9+ with `Pillow` installed (`pip install Pillow`) for asset/data scripts

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Available NPM Scripts
| Script | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build into `dist/` (base `/`) |
| `npm run build:gh-pages` | Production build for GitHub Pages subpath (`/Olivia-in-outer-space/`) |
| `npm run preview` | Preview the compiled `dist/` build locally |
| `npm run test:flow` | Run headless Chrome E2E user flow test (requires running server at `BASE_URL`, default `http://localhost:3000/`) |
| `npm run docker:build` | Build Docker image `olivia-in-outer-space` |
| `npm run docker:run` | Run Docker container on port 8080 |

---

## 🎨 Asset Management & Hygiene

- **Reference Media**: Raw private references placed in `assets/raw_references/` are excluded from version control via `.gitignore`.
- **Pre-processing**: Process raw reference photos into cropped transparent PNGs:
  ```bash
  python3 scripts/process_assets.py
  ```
- **Interaction GIFs**: Regenerate animated Olivia & Anna interaction GIFs:
  ```bash
  python3 scripts/generate_interaction_gifs.py
  ```
- **Image Pipeline**: Optimized WebP images are tracked in Git under `public/assets/`, ensuring fast load times on tablets and mobile devices.
