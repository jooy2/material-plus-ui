/**
 * PostCSS for the docs' own Vite pipeline. Vite looks for this file at its
 * root, which for VitePress is this directory.
 *
 * The site renders the real components, and their class names are Tailwind
 * utilities, so the pass that compiles the docs' CSS has to be a Tailwind pass.
 * Which files it scans is decided in `.vitepress/theme/styles/index.css`.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};

export default config;
