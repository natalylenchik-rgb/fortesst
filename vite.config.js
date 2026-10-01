import { defineConfig } from 'vite';

const host = '0.0.0.0';
const port = 5173;

export default defineConfig({
  // Relative production assets let dist/ work on sub-path hosts such as
  // GitHub Pages and in drag-and-drop static hosting previews.
  base: './',
  server: {
    host,
    port,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host,
    port,
    strictPort: true,
    allowedHosts: true,
  },
});
