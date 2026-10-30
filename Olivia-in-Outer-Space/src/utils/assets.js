/**
 * Resolves an asset path against Vite's configured BASE_URL.
 * Seamlessly handles root domain deployments (Vercel, Netlify, Docker, Custom Domain)
 * and subpath deployments (e.g., GitHub Pages: https://user.github.io/repo-name/).
 *
 * @param {string} path - Absolute or relative path to asset (e.g. '/assets/cartoons/characters/olivia.png')
 * @returns {string} - Fully qualified base-aware URL
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
