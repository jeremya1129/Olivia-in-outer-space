# 🚀 Olivia in Outer Space — Deployment Guide

This application is packaged and prepared for zero-friction deployment to any hosting provider or platform.

---

## 🌟 Option 1: GitHub Pages (Recommended — 100% Free & Automated)

The repository already includes an automated GitHub Actions deployment workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Quick 1-Time Activation:
1. Go to your GitHub repository: [github.com/jeremya1129/Olivia-in-outer-space](https://github.com/jeremya1129/Olivia-in-outer-space).
2. Click **Settings** (top tab) $\rightarrow$ **Pages** (in left sidebar under "Code and automation").
3. Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions** from the dropdown.
4. Push any commit to `main` (or click **Actions** $\rightarrow$ **Deploy to GitHub Pages** $\rightarrow$ **Run workflow**).
5. Your live app will be published at:
   ```text
   https://jeremya1129.github.io/Olivia-in-outer-space/
   ```

---

## ⚡ Option 2: Vercel (Fastest Global CDN)

A dedicated [`vercel.json`](vercel.json) configuration is already included with SPA rewrites and 1-year asset caching headers.

### Deployment Steps:
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your GitHub repository: `jeremya1129/Olivia-in-outer-space`.
4. Keep the default settings (Framework Preset: Vite, Root Directory: `./`).
5. Click **Deploy**. Vercel will build and assign an instant live URL with automatic SSL.

---

## 🌐 Option 3: Netlify / Cloudflare Pages

Both [`netlify.toml`](netlify.toml) and [`public/_redirects`](public/_redirects) are included.

### Netlify:
1. Log in to [netlify.com](https://netlify.com) $\rightarrow$ **Add new site** $\rightarrow$ **Import an existing project**.
2. Connect your GitHub repository.
3. Build command: `npm run build` | Publish directory: `dist`.
4. Click **Deploy Olivia in Outer Space**.

### Cloudflare Pages:
1. In Cloudflare Dashboard, go to **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
2. Select `jeremya1129/Olivia-in-outer-space`.
3. Framework preset: **Vite** | Build command: `npm run build` | Output directory: `dist`.

---

## 🐳 Option 4: Docker Container (Self-Hosted, Railway, Fly.io, Cloud Run)

A multi-stage [`Dockerfile`](Dockerfile) and custom [`nginx.conf`](nginx.conf) with gzip compression and caching are pre-configured.

### Build and Run Locally:
```bash
# Build the production Docker image (~25 MB)
npm run docker:build
# or: docker build -t olivia-in-outer-space .

# Run container on port 8080
npm run docker:run
# or: docker run -d -p 8080:80 --name olivia-space olivia-in-outer-space
```
Access the application at `http://localhost:8080`.

---

## 📱 Option 5: Install as a Full-Screen App on iPad & Tablets (PWA)

A Progressive Web App manifest ([`public/manifest.webmanifest`](public/manifest.webmanifest)) and high-resolution icons are configured so toddlers can use it full-screen without any browser address bars or navigation buttons:

### On iPad / iPhone (Safari):
1. Open your deployed URL in Safari.
2. Tap the **Share** button (box with upward arrow).
3. Tap **Add to Home Screen**.
4. The app will launch like a native iPad app in standalone full-screen mode!

### On Android Tablets / Chrome:
1. Open the deployed URL in Google Chrome.
2. Tap the three-dot menu icon $\rightarrow$ **Install App** (or **Add to Home Screen**).
3. The app will install to the app launcher and open in immersive full-screen.

---

## 🛠️ Local Build Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local Vite development server on port 3000 |
| `npm run build` | Compile optimized production bundle into `dist/` (Root domain `/`) |
| `npm run build:gh-pages` | Compile optimized production bundle for GitHub Pages subpath (`/Olivia-in-outer-space/`) |
| `npm run preview` | Spin up local HTTP server to preview the compiled `dist/` build |
| `npm run test:flow` | Run automated headless Chrome user testing suite (33 assertions) |
| `npm run docker:build` | Build lightweight NGINX Alpine production container |
| `npm run docker:run` | Run container locally on `http://localhost:8080` |
