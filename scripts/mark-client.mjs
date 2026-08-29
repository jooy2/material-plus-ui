/**
 * Puts `"use client"` on every module that renders, and on nothing else.
 *
 * React ships two builds. The one a React Server Component renders against —
 * `react/react-server` — is missing most of the hooks: no `createContext`, no
 * `useState`, no `useContext`, no `useRef`, no `useEffect`. A module that
 * reaches for one has to declare itself client, and a bundler that understands
 * the directive draws the boundary there.
 *
 * Without the directive a Next.js App Router build does not warn. It fails:
 *
 *     Error: Failed to collect page data for /
 *     cause: TypeError: e.createContext is not a function
 *
 * — from a `page.jsx` whose only sin was `import { MPButton } from
 * 'material-plus-ui'`. That is every App Router project, on the default
 * component, which is the one a page starts as.
 *
 * ## Why every component and not only the ones that need it
 *
 * Because "needs it" is not a property of the module, which was measured rather
 * than assumed. Twenty components here touch no client-only React API and could
 * therefore have shipped usable from both sides. Rendered from a Next.js server
 * component with the directive withheld, **seven of the twenty fail anyway**:
 * `MPCheckbox`, `MPSwitch`, `MPSlider`, `MPOverlay`, `MPCollapsible`,
 * `MPOtpField` and `MPSegmentedButton`, every one of them with
 *
 *     Error: Event handlers cannot be passed to Client Component props.
 *
 * for a reason that is nowhere in the module's own text: they wrap the caller's
 * `onChange` into an `onCheckedChange`, or a `render`, for the Base UI part
 * underneath — and Base UI's parts are client, so the closure has to cross a
 * boundary it cannot cross. Nothing in `MPCheckbox.tsx` mentions a hook. It is
 * simply that a wrapper wraps.
 *
 * And the line between those seven and the thirteen that pass is not one a
 * caller could draw either. `MPCheckbox` and `MPCard` are the same shape from
 * the outside and the same shape to a static analysis; one of them happens to
 * hand a function downwards. A library whose server-safety depends on which
 * component you reached for, with the error pointing inside the library, is
 * worse than a library that ships a few hundred bytes it did not strictly have
 * to — and it is bytes a bundler drops anyway, since the directive itself is
 * removed when the module is bundled. Measured before and after: the same
 * gzipped size to the byte, in esbuild and in Rollup.
 *
 * So the rule is one sentence — **a module that renders is a client module, a
 * module that only holds data is not** — which is where Base UI, MUI and Radix
 * all landed.
 *
 * There is a second rule, and the icons are the whole of why. A component that
 * will be handed to a client component **as a prop** has to be a client
 * reference itself, or `<MPIcon icon={CheckIcon} />` written in a server
 * component fails with *Functions cannot be passed directly to Client
 * Components*, pointing at a `forwardRef` object. `lucide-react` marks its
 * `Icon` module and not its icons, so ours are built on a server unless
 * something says otherwise. So: a module that hands on a value it imported from
 * another package is client too. There is no way to know from here whether that
 * value is data or a component, and one of the two has to be able to cross.
 *
 * That rule marks `constants/glyphs.ts`, which is the twenty-nine renamed lucide
 * exports and nothing else. It is a separate file from `constants/icons.ts` for
 * exactly this reason: `ICONS` is read with a property access, and a server
 * component cannot read a property off a *client* module's namespace — it gets
 * `undefined`, and React reports an invalid element type. The table therefore
 * lives one module up, unmarked, holding the references the marked one produces,
 * and both halves work from a server component. Neither did before the split:
 * whichever module carried the directive, the other half broke.
 *
 * The barrels are the exception that makes all of it work. `dist/index.js`
 * re-exports everything, and a directive there would turn one import of `MPBox`
 * into the whole library client-side; a re-export of a client module from a
 * server one is exactly what a boundary is, and every bundler follows it.
 * `internal/i18n.ts`, the nine message tables and the eighteen locales stay
 * server-side for the same reason — they are data, and `registerMPMessages`
 * should be callable from wherever an application does its setup.
 *
 * ## Why here and not in the source
 *
 * The same argument as `annotate-pure.mjs`: `dist/` is derived, so derive this
 * too. Written in the source it is a line somebody has to remember on the day
 * they add a component, and forgetting it breaks a consumer's build rather than
 * this one's.
 *
 * It also has to run after `terser`, which deletes it. `compress.directives` is
 * on by default and strips what it reads as a redundant prologue, which is what
 * `"use client"` looks like to a minifier that has never heard of React Server
 * Components. Adding it here rather than turning that option off means there is
 * no option to turn back on by accident.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');
const require = createRequire(import.meta.url);

/**
 * The React APIs that exist in a browser and not on a React server, read out of
 * the two builds installed here rather than typed into this file.
 *
 * React ships `react.development.js` and `react.react-server.development.js`,
 * and the difference between their exports is the list: `createContext`,
 * `useState`, `useContext`, `useRef`, `useEffect` and fifteen others. A React
 * release that moves a hook across that line moves this with it.
 *
 * Subtracting one from the other rather than testing the server build for
 * absence, because absence catches *types* as well: `React.ComponentProps` is
 * exported by neither build — it does not exist at runtime at all — and a module
 * is not client for having written down a prop type.
 *
 * By absolute path, because React's `exports` map does not offer `./cjs/` to
 * anybody, which is fair enough since the only reason to want it is this.
 */
const reactDir = dirname(require.resolve('react/package.json'));
const onServer = new Set(
  Object.keys(require(resolve(reactDir, 'cjs/react.react-server.development.js')))
);
const CLIENT_ONLY_REACT = new Set(
  Object.keys(require(resolve(reactDir, 'cjs/react.development.js'))).filter(
    (name) => !onServer.has(name)
  )
);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  );
}

/**
 * The file with its comments blanked out and everything else left alone.
 *
 * This repository's source is more prose than code — `useState` appears in a
 * dozen doc comments explaining why something does *not* use it, and `<div>` in
 * a good few more.
 */
function code(text) {
  let out = '';
  let index = 0;

  while (index < text.length) {
    const character = text[index];

    if (character === '"' || character === "'" || character === '`') {
      const start = index;
      index += 1;

      while (index < text.length) {
        if (text[index] === '\\') {
          index += 2;
          continue;
        }

        if (text[index] === character) {
          index += 1;
          break;
        }

        index += 1;
      }

      out += text.slice(start, index);
      continue;
    }

    if (character === '/' && text[index + 1] === '/') {
      while (index < text.length && text[index] !== '\n') {
        out += ' ';
        index += 1;
      }

      continue;
    }

    if (character === '/' && text[index + 1] === '*') {
      while (index < text.length && !(text[index] === '*' && text[index + 1] === '/')) {
        out += text[index] === '\n' ? '\n' : ' ';
        index += 1;
      }

      out += '  ';
      index += 2;
      continue;
    }

    out += character;
    index += 1;
  }

  return out;
}

/** Markup, as opposed to a `.tsx` that turned out to hold only types. */
const RENDERS = /<[A-Za-z][\w.]*[\s/>]/;
/** `import { Check } from 'lucide-react'` — a value out of somebody else's package. */
const FOREIGN = /import\s+(?!type\s)([\s\S]*?)\s+from\s+['"]([^.'"][^'"]*)['"]/g;
/** `export const CheckIcon = Check;` — that value, handed on under a new name. */
const PASSED_ON =
  /export\s+(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*(?::[^=]*)?=\s*([A-Za-z_$][\w$]*)\s*;/g;
const NAMESPACED = /\b([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/g;
const NAMED_FROM_REACT = /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/g;

const files = walk(src).filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.d.ts'));
const client = new Set();

for (const file of files) {
  const text = code(readFileSync(file, 'utf8'));

  if (file.endsWith('.tsx') && RENDERS.test(text)) {
    client.add(file);
    continue;
  }

  /*
   * And the modules that hold no markup and still cannot run on a server: the
   * three that make a context, and `internal/animate.ts`, which is hooks.
   */
  for (const [, namespace, member] of text.matchAll(NAMESPACED)) {
    if (namespace === 'React' && CLIENT_ONLY_REACT.has(member)) {
      client.add(file);
    }
  }

  for (const [, named] of text.matchAll(NAMED_FROM_REACT)) {
    for (const part of named.split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0];

      if (CLIENT_ONLY_REACT.has(name)) {
        client.add(file);
      }
    }
  }

  /* And the values that came from another package and leave under a new name. */
  const foreign = new Set();

  for (const [, clause, specifier] of text.matchAll(FOREIGN)) {
    if (specifier === 'react') {
      continue;
    }

    for (const part of clause.replace(/[{}*]/g, ',').split(',')) {
      const name = part.trim().replace(/^type\s+/, '');
      const renamed = /\s+as\s+([A-Za-z_$][\w$]*)$/.exec(name);

      if (renamed) {
        foreign.add(renamed[1]);
      } else if (/^[A-Za-z_$][\w$]*$/.test(name)) {
        foreign.add(name);
      }
    }
  }

  for (const [, source] of text.matchAll(PASSED_ON)) {
    if (foreign.has(source)) {
      client.add(file);
    }
  }
}

let written = 0;
const missing = [];

for (const file of client) {
  const built = resolve(dist, relative(src, file)).replace(/\.tsx?$/, '.js');

  let before;

  try {
    before = readFileSync(built, 'utf8');
  } catch {
    missing.push(relative(root, built));
    continue;
  }

  if (/^\s*(['"])use client\1/.test(before)) {
    continue;
  }

  writeFileSync(built, `"use client";\n${before}`);
  written += 1;
}

if (missing.length > 0) {
  throw new Error(
    `these modules need "use client" and have no build output: ${missing.join(', ')}`
  );
}

/*
 * The barrels and the data have to stay server-side, and that is the whole
 * reason the directive is placed per module rather than on the entry.
 */
const SERVER_SIDE = [
  'index.js',
  `components${sep}button${sep}index.js`,
  `internal${sep}i18n.js`,
  `internal${sep}messages${sep}common.js`,
  `locales${sep}ko.js`
];

for (const file of SERVER_SIDE) {
  if (/use client/.test(readFileSync(resolve(dist, file), 'utf8'))) {
    throw new Error(
      `dist/${file} carries "use client" — it holds no markup, and marking it ` +
        'would pull more across the boundary than the module it was meant for'
    );
  }
}

console.log(
  `client: ${written} of ${files.length} modules marked "use client" ` +
    `(${files.length - client.size} hold no markup and stay server-side)`
);
