import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const installed = (path: string) =>
  fileURLToPath(new URL(`node_modules/material-plus-ui/dist/${path}`, import.meta.url));

export default defineConfig({
  // Relative, so the built page loads under `mp://` and from `file://` alike.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    // The demos live in `docs/`, outside this package, so they resolve the
    // library and React from here rather than from wherever they sit. The
    // package is a link to `packages/react`, whose own `node_modules` holds a
    // second React and a second Base UI; `dedupe` keeps one copy of each.
    alias: [
      { find: /^material-plus-ui$/, replacement: installed('index.js') },
      { find: /^material-plus-ui\/locales$/, replacement: installed('locales/index.js') }
    ],
    dedupe: ['react', 'react-dom', '@base-ui/react', 'lucide-react']
  },
  // Not Vite's default port, so the dev server does not collide with another.
  server: { port: 5391, strictPort: true, fs: { allow: ['../..'] } },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 2000 }
});
