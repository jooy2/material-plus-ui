/**
 * Empties `dist/` before anything writes into it.
 *
 * `tsc` only ever *writes*. It has no notion of an output file that should no
 * longer exist, so a module deleted from `src/` stays in `dist/` for as long as
 * the directory does — and `package.json` publishes `dist/` whole. A component
 * removed from the barrel would therefore keep resolving through
 * `material-plus-ui/components/<name>`, which is a subpath export the
 * documentation promises is the same import as the barrel's. An export that was
 * taken out of one and not the other is worse than either answer on its own.
 *
 * The same staleness shows up in every measurement taken off the build. The
 * `@__PURE__` count that `annotate-pure.mjs` prints is a count of what is in
 * `dist/`, and `measure-bundle.mjs` walks a module graph rooted there: both
 * would quietly report on files no source has produced for several releases.
 *
 * Deliberately its own step at the front of `npm run build` rather than a flag
 * on `tsc`. TypeScript's `--clean` needs `incremental` and a build-info file,
 * and half of what lands in `dist/` is not `tsc`'s at all — the two stylesheets,
 * the split sheets, the `'use client'` banners. What has to be emptied is the
 * directory, not one compiler's share of it.
 *
 * `force` so a first build, or one after `rm -rf dist`, is not an error: there
 * is nothing to remove and that is the state this is trying to reach.
 */
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

rmSync(resolve(root, 'dist'), { recursive: true, force: true });
