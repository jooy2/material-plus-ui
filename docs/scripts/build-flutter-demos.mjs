/**
 * Builds the Flutter gallery into `public/flutter`.
 *
 * The Flutter previews on this site are not screenshots and not a React
 * stand-in. They are the real package, compiled for the web and embedded one
 * demo per `<iframe>` by `theme/components/Demo.vue`. The cost of that is this
 * step: a documentation build needs the Flutter SDK.
 *
 * It is skipped when the output is already there, because a web build takes a
 * minute or two and almost no documentation edit invalidates it. Pass `--force`
 * after a change to the package or to a demo.
 *
 * If Flutter is not installed the step is skipped with a warning rather than
 * failing: somebody editing Korean prose should not need a Flutter toolchain,
 * and `Demo.vue` has a message for a preview whose build is missing. CI installs
 * the SDK, so the deployed site always has the previews.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(docsDir, '..');
const exampleDir = resolve(repoRoot, 'packages/flutter/example');
const outDir = resolve(docsDir, 'public/flutter');

const force = process.argv.includes('--force');

/** `flutter build web` writes this, and `Demo.vue` probes for it. */
const marker = resolve(outDir, 'version.json');

const flutter = process.platform === 'win32' ? 'flutter.bat' : 'flutter';

if (!force && existsSync(marker)) {
  console.log(
    '[material-plus-ui docs] Flutter previews already built. ' +
      'Run `npm run flutter:demos -- --force` to rebuild.'
  );
} else {
  /*
   * `--base-href` has to match where the output is served from, which is
   * `public/flutter`, so `/flutter/`. Without it every asset the engine asks for
   * resolves against the documentation page's own path and 404s.
   *
   * `--pwa-strategy=none` drops the service worker, and that is a correctness
   * fix rather than an optimisation. Flutter's worker caches the whole app under
   * the documentation site's own origin, so a rebuilt gallery would not appear:
   * every reader who had opened a component page before would keep being served
   * the previous build until the worker updated itself. A preview embedded in a
   * page has no use for offline support, and the HTTP cache does the part that
   * was worth having.
   *
   * `--no-tree-shake-icons`: the gallery ships no icon font, so the icon
   * tree-shaker has nothing to shrink, and leaving it on only gives it a chance
   * to trip over the text fonts the gallery does ship.
   */
  const result = spawnSync(
    flutter,
    [
      'build',
      'web',
      '--release',
      '--base-href',
      '/flutter/',
      '--pwa-strategy=none',
      '--no-tree-shake-icons',
      '--output',
      outDir
    ],
    { cwd: exampleDir, stdio: 'inherit', shell: process.platform === 'win32' }
  );

  if (result.error?.code === 'ENOENT') {
    console.warn(
      '[material-plus-ui docs] Flutter is not on PATH, so the Flutter previews will be missing. ' +
        'Install the SDK from https://docs.flutter.dev/install and run `npm run flutter:demos`.'
    );
  } else if (result.status !== 0) {
    // An exit code rather than a throw: the Flutter toolchain has already
    // printed the real error, and a stack trace on top of it says nothing.
    process.exitCode = result.status ?? 1;
  } else {
    console.log(`[material-plus-ui docs] Flutter previews built into ${outDir}`);
  }
}
