# Olivia in Outer Space 🚀

An interactive, touch-friendly, personalized space exploration web application designed for toddlers **Olivia** and **Anna**.

Built with React 18, Vite, and Tailwind CSS, featuring an Earth Spaceport Launchpad, a Solar System Highway cockpit, word-by-word read-along stories, procedural Web Audio feedback, authentic NASA spacecraft photography, and custom cartoon astronaut avatars.

---

## 📁 Repository Layout

```text
.
├── .github/workflows/deploy.yml   # GitHub Actions workflow for GitHub Pages deployment
├── Olivia-in-Outer-Space/         # Main React + Vite application, assets, data & scripts
│   ├── src/                       # React components, data, utilities, and styles
│   ├── public/                    # Static web assets, PWA manifest, and SPA redirects
│   ├── data/                      # SQLite databases & normalized JSON catalogs
│   ├── scripts/                   # Python data/imagery pipelines & headless Chrome E2E test
│   ├── DEPLOYMENT.md              # Vercel, Netlify, GitHub Pages, Docker & PWA guide
│   └── README.md                  # Detailed application & pipeline documentation
└── README.md                      # This repository overview
```

---

## 🚀 Quickstart

All frontend and Python pipeline commands run from the `Olivia-in-Outer-Space/` directory:

```bash
cd Olivia-in-Outer-Space
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For full documentation on components, NASA/Solar System data pipelines, E2E testing (`npm run test:flow`), and deployment options, see:
- [`Olivia-in-Outer-Space/README.md`](Olivia-in-Outer-Space/README.md)
- [`Olivia-in-Outer-Space/DEPLOYMENT.md`](Olivia-in-Outer-Space/DEPLOYMENT.md)
