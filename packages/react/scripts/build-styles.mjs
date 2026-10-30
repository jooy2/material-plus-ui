/**
 * The stylesheet half of the build.
 *
 * `tsc` only emits JavaScript, so nothing under `src/` that ends in `.css`
 * reaches `dist/` on its own. This runs last in `npm run build` and writes the
 * two files the package exports:
 *
 *   src/standalone.css  --(Tailwind)-->  dist/styles.css     `material-plus-ui/styles.css`
 *   src/styles.css      --(copy)------>  dist/tailwind.css   `material-plus-ui/tailwind.css`
 *
 * The names cross over, and deliberately so. `material-plus-ui/styles.css` is the
 * one line a project with no build-side Tailwind imports, so it has to be the
 * obvious name; `src/styles.css` is the token sheet, which is only *part* of it.
 *
 * Compiling here rather than in the consumer's build is what removes Tailwind
 * from their install entirely: `tailwindcss` is a devDependency of this package
 * and stays one. The scan is driven by the `@source '.'` inside `src/styles.css`
 * — the same line that, in the copied file, means `node_modules/material-plus-ui/dist/`
 * for a consumer who does run Tailwind. One declaration serves both outputs.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

mkdirSync(dist, { recursive: true });

/* The token sheet, for a project that runs Tailwind itself. */
copyFileSync(resolve(root, 'src/styles.css'), resolve(dist, 'tailwind.css'));

/* The finished stylesheet, for everyone else.
   `from` has to be the real source path: Tailwind resolves `@import` and
   `@source` against the file they are written in, so a wrong `from` would look
   for the tokens and the components somewhere they are not. */
const from = resolve(root, 'src/standalone.css');
const to = resolve(dist, 'styles.css');

const compiled = await postcss([tailwindcss({ optimize: true })]).process(
  readFileSync(from, 'utf8'),
  { from, to }
);

writeFileSync(to, compiled.css);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

console.log(
  `styles: dist/styles.css ${kb(compiled.css.length)}, dist/tailwind.css ${kb(
    readFileSync(resolve(dist, 'tailwind.css')).length
  )}`
);
