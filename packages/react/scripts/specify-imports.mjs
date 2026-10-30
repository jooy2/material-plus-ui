/**
 * Rewrites every relative specifier in the build output to name a file.
 *
 * `./MPButton` becomes `./MPButton.js`, `./components/button` becomes
 * `./components/button/index.js`, and the same in the `.d.ts` beside them.
 *
 * ## Why this is not optional
 *
 * `tsconfig.json` compiles with `module: "Preserve"`, which emits every
 * specifier exactly as the source wrote it — and the source writes them the way
 * TypeScript's own `bundler` resolution reads them, without extensions. That is
 * fine for TypeScript and fine for a bundler with Node-style resolution bolted
 * on, and it is not valid ECMAScript. `package.json` says `"type": "module"`, so
 * every `.js` in `dist/` is a strict ES module, and a strict ES module has to
 * name the file it is importing.
 *
 * What that cost, measured against the 1.3.0 build:
 *
 * - **webpack 5 could not resolve a single module.** Bundling `MPButton`
 *   produced 78 `Module not found` errors, one per specifier it reached, each of
 *   them the `fully specified` breaking-change notice. That is Next.js, Rspack
 *   and every Create React App descendant.
 * - **Node could not import the package at all.** `import('material-plus-ui')`
 *   threw `ERR_MODULE_NOT_FOUND` on the first line of `dist/index.js`, which is
 *   any server-side render that does not go through a bundler first.
 *
 * Vite, esbuild and Rollup-with-`node-resolve` all guess the extension, which is
 * why this survived a release: the documentation site, the test suite and the
 * measurements are all Vite. Fully specified, all five agree.
 *
 * ## Why it is done here and not written in the source
 *
 * The same reason `annotate-pure.mjs` is: the emitted JavaScript is the only
 * place the answer is unambiguous. In the source a specifier points at a `.tsx`
 * file through a `.js` name, which is a spelling TypeScript understands and a
 * reader has to translate; here it points at the file that is actually there,
 * and the script checks that it is — an unresolvable specifier fails the build
 * rather than shipping.
 *
 * The check runs a second time over the finished output, because the failure
 * this guards against is not a crash during the build. It is a package that
 * installs, type-checks, and cannot be imported.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

/*
 * `from './x'`, `import './x'` and `import('./x')` — the three shapes a
 * specifier reaches the emitted output in. Anchored on the keyword so a string
 * that merely looks like a path is left alone.
 */
const SPECIFIER = /\b(from|import)(\s*\(?\s*)(['"])(\.[^'"]*)\3/g;

/**
 * The ranges a comment occupies, so a specifier written inside one is not
 * rewritten.
 *
 * `tsc` keeps comments, and this file's neighbours are full of `import { X }
 * from './y'` written as documentation. Rewriting those would be harmless —
 * `terser` strips them in the next step — but an example that points somewhere
 * this build does not have a file for would fail the resolution check below,
 * and a doc comment is not a build error.
 */
function comments(code) {
  const ranges = [];
  let index = 0;

  while (index < code.length) {
    const character = code[index];

    if (character === '"' || character === "'" || character === '`') {
      index += 1;

      while (index < code.length) {
        if (code[index] === '\\') {
          index += 2;
          continue;
        }

        if (code[index] === character) {
          index += 1;
          break;
        }

        index += 1;
      }

      continue;
    }

    if (character === '/' && code[index + 1] === '/') {
      const start = index;

      while (index < code.length && code[index] !== '\n') {
        index += 1;
      }

      ranges.push([start, index]);
      continue;
    }

    if (character === '/' && code[index + 1] === '*') {
      const start = index;
      index += 2;

      while (index < code.length && !(code[index] === '*' && code[index + 1] === '/')) {
        index += 1;
      }

      index += 2;
      ranges.push([start, index]);
      continue;
    }

    index += 1;
  }

  return ranges;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  );
}

const exists = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

/**
 * What a specifier should have said.
 *
 * A declaration file's specifier is rewritten to the `.js` beside it rather than
 * to the `.d.ts` itself — that is the name TypeScript looks up, in every
 * resolution mode it has.
 */
function specify(file, specifier) {
  const target = resolve(dirname(file), specifier);
  const extension = file.endsWith('.d.ts') ? '.d.ts' : '.js';

  if (exists(`${target}${extension}`)) {
    return `${specifier}.js`;
  }

  if (exists(join(target, `index${extension}`))) {
    return `${specifier}/index.js`;
  }

  return null;
}

const files = walk(dist).filter((file) => /\.(js|d\.ts)$/.test(file));
let rewritten = 0;

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const skip = comments(before);

  const after = before.replace(SPECIFIER, (match, keyword, spacing, quote, specifier, at) => {
    if (skip.some(([start, end]) => at >= start && at < end)) {
      return match;
    }

    if (/\.(js|mjs|cjs|json|css)$/.test(specifier)) {
      return match;
    }

    const specified = specify(file, specifier);

    if (specified === null) {
      throw new Error(`${file}: '${specifier}' does not name a file in dist/`);
    }

    rewritten += 1;

    return `${keyword}${spacing}${quote}${specified}${quote}`;
  });

  if (after !== before) {
    writeFileSync(file, after);
  }
}

/* Read back rather than trust the pass above: what is being prevented is a
   package that builds cleanly and cannot be imported. */
for (const file of files) {
  const code = readFileSync(file, 'utf8');
  const skip = comments(code);

  for (const match of code.matchAll(SPECIFIER)) {
    if (skip.some(([start, end]) => match.index >= start && match.index < end)) {
      continue;
    }

    if (!/\.(js|mjs|cjs|json|css)$/.test(match[4])) {
      throw new Error(`${file}: '${match[4]}' is still not fully specified`);
    }
  }
}

console.log(`specifiers: ${rewritten} rewritten across ${files.length} files`);
