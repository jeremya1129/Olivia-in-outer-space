import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
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
});
