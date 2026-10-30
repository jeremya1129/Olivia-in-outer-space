import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Support GitHub Pages subpath in GitHub Actions CI, while keeping '/' for Vercel, Netlify, Docker, or custom domains
  const base = process.env.VITE_BASE_URL || (process.env.GITHUB_ACTIONS && !process.env.CUSTOM_DOMAIN ? '/Olivia-in-outer-space/' : '/');

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './assets'),
      },
    },
    server: {
      port: 3000,
      open: false,
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          '**/assets/raw_references/**',
          '**/assets/**',
          '**/*.tmp',
          '**/~*',
        ],
      },
    },
  };
});
