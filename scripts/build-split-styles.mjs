/**
 * The split half of the stylesheet build.
 *
 * `dist/styles.css` is one file with every rule in it, and for the project that
 * imports one line and stops thinking about CSS that is the right shape. It is
 * also 104 kB, all of it, for a page that renders an `MPBox` — because Tailwind
 * generates from a *file scan* and not from an import graph, so what a consumer
 * imports has no bearing on what the scan found.
 *
 * This writes the other shape: the sheet cut along the same seams the JavaScript
 * is already cut along.
 *
 *   dist/styles/tokens.css        the colour roles and the scales — the part
 *                                 every component needs and no component owns
 *   dist/styles/<component>.css   the utilities that component's classes spell
 *                                 out, and the hand-written rules it draws with
 *
 * A consumer imports the tokens once and a sheet per component, and pays for
 * what they render:
 *
 *     import 'material-plus-ui/styles/tokens.css';
 *     import 'material-plus-ui/styles/button.css';
 *
 * Rules repeat between component sheets — `flex` is in a dozen of them — and
 * that is the trade. A bundler concatenates the sheets before compressing, and
 * gzip is very good at a rule it has already seen, so the repetition costs
 * little until the component count gets high enough that the whole sheet was
 * the better answer anyway. `npm run build` prints where that crossing is.
 *
 * ## How a component's sheet is decided
 *
 * Two questions, both answered from the source rather than from a list somebody
 * has to remember to update:
 *
 * - **Which files does this component read from?** Its own directory plus every
 *   `src/` module it imports, transitively. `MPTextField` draws part of itself
 *   through `internal/FieldOutline.tsx`, so that file's classes are the text
 *   field's classes. Those paths become the sheet's `@source` list.
 * - **Which hand-written rules does it draw with?** `src/styles.css` ends in
 *   real CSS — keyframes, the grid's breakpoints, the marquee — which Tailwind
 *   passes through untouched and therefore cannot attribute. A rule goes into a
 *   component's sheet when one of the `mp-` class names in its selector appears
 *   in that component's files, and the keyframes and `@property` registrations
 *   those rules name come along with them.
 *
 * Both checks are enforced rather than assumed: a hand-written rule no component
 * claims, or a custom property a sheet uses and neither it nor `tokens.css`
 * defines, fails the build. That is what keeps this file from rotting quietly
 * the next time a component is added.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'src');
const out = resolve(root, 'dist/styles');

/*
 * Every sheet is compiled as if it sat in `src/`, because that is where the
 * `@source` paths below are written relative to and where `@import 'tailwindcss'`
 * has to resolve from. The file is never written — PostCSS only reads `from` as
 * a location.
 */
const compile = async (css, name) => {
  const from = resolve(src, `${name}.css`);

  return (await postcss([tailwindcss({ optimize: true })]).process(css, { from, to: from })).css;
};

const PREAMBLE = [
  "@import 'tailwindcss/theme.css' layer(theme);",
  "@import 'tailwindcss/utilities.css' source(none);"
].join('\n');

/* ------------------------------------------------------------------ sources */

/**
 * Whether a source file puts anything into the build at all.
 *
 * `src/types.ts` is the case this exists for: it is types and nothing else, so
 * `dist/types.js` is an empty file — and yet it names every value in the type
 * scale, `'headline-large'` and the rest, which Tailwind's scanner reads as
 * candidate class names and turns into two kilobytes of rules per sheet. A
 * module that emits no JavaScript renders nothing and can spell no class a
 * component uses, so it is not scanned.
 *
 * Decided from the build output rather than from a list of filenames, so a
 * second types-only module gets the same treatment without anyone noticing it
 * had to be added here.
 */
function emitsCode(file) {
  const built = resolve(root, 'dist', relative(src, file)).replace(/\.tsx?$/, '.js');

  try {
    return statSync(built).size > 0;
  } catch {
    /* Not built yet, or not built at all — scan it and be safe. */
    return true;
  }
}

/** Every `src/` file a component reads from, itself included, transitively. */
function graphOf(componentDir) {
  const seen = new Set();
  const queue = readdirSync(componentDir).map((entry) => join(componentDir, entry));

  while (queue.length > 0) {
    const file = queue.pop();

    if (seen.has(file) || !/\.tsx?$/.test(file)) {
      continue;
    }

    seen.add(file);

    const text = readFileSync(file, 'utf8');

    for (const [, specifier] of text.matchAll(/from\s+'(\.[^']+)'/g)) {
      const base = resolve(dirname(file), specifier);
      const candidates = [
        `${base}.tsx`,
        `${base}.ts`,
        join(base, 'index.tsx'),
        join(base, 'index.ts')
      ];

      for (const candidate of candidates) {
        try {
          if (statSync(candidate).isFile()) {
            queue.push(candidate);
            break;
          }
        } catch {
          /* Not this extension. */
        }
      }
    }
  }

  return [...seen].filter(emitsCode);
}

/* -------------------------------------------------- the hand-written rules */

/*
 * `src/styles.css` is tokens first and real CSS after, and the boundary is the
 * `@theme` block: everything up to and including it is registration, everything
 * past it is a rule somebody wrote by hand. Found by walking the tree rather
 * than by line number, so moving a block around the file cannot break it.
 */
const tokenSheet = readFileSync(resolve(src, 'styles.css'), 'utf8');
const parsed = postcss.parse(tokenSheet, { from: resolve(src, 'styles.css') });

let boundary = -1;

parsed.each((node, index) => {
  if (node.type === 'atrule' && node.name === 'theme') {
    boundary = index;
  }
});

if (boundary < 0) {
  throw new Error('src/styles.css: no @theme block, so the tokens cannot be told from the rules');
}

const headNodes = parsed.nodes.slice(0, boundary + 1);
const tailNodes = parsed.nodes.slice(boundary + 1);

/*
 * Through a `Root` rather than by joining `toString()`: a statement at-rule
 * gets its semicolon from the root that holds it, and `@source '.'` without one
 * swallows the block after it as a body.
 */
const asCss = (nodes) => {
  const holder = postcss.root();

  nodes.forEach((node) => holder.append(node.clone()));

  return holder.toString();
};

/** The same, with the `@source` lines dropped — each sheet declares its own. */
const asCssWithoutSources = (nodes) => {
  const holder = postcss.root();

  nodes.forEach((node) => holder.append(node.clone()));
  holder.walkAtRules('source', (node) => node.remove());

  return holder.toString();
};

/** The `mp-` class names a selector matches on. */
const classesIn = (node) =>
  node.type === 'rule'
    ? [...node.selector.matchAll(/\.(mp-[a-z0-9-]+)/g)].map(([, name]) => name)
    : [];

/**
 * Whether a component's files spell this class, as a whole name.
 *
 * `includes` is not enough and the difference is not academic: the type scale
 * gives every component a `text-mp-headline-large`, which contains `mp-headline`
 * — the marquee's class — as a substring. Matched loosely, one animation's
 * keyframes end up in all seventy-five sheets.
 */
const spells = (text, name) => new RegExp(`${name}(?![\\w-])`).test(text);

/** Every `mp-` class under a node, so a `@media` block is judged by its contents. */
function classesUnder(node) {
  const found = classesIn(node);

  if (node.nodes) {
    for (const child of node.nodes) {
      found.push(...classesUnder(child));
    }
  }

  return found;
}

/**
 * The node, narrowed to the parts this component draws with — or `null`.
 *
 * A `@media` block is kept for the rules inside it that the component claims and
 * not for the ones it does not, which is what stops a breakpoint written for the
 * grid from arriving in the marquee's sheet with an empty body.
 */
function claim(node, text) {
  if (node.type === 'rule') {
    const classes = classesIn(node);

    return classes.length > 0 && classes.some((name) => spells(text, name)) ? node : null;
  }

  if (node.type === 'atrule' && node.nodes && node.name !== 'keyframes') {
    const kept = node.nodes.map((child) => claim(child, text)).filter(Boolean);

    if (kept.length === 0) {
      return null;
    }

    const clone = node.clone();

    clone.removeAll();
    kept.forEach((child) => clone.append(child.clone()));

    return clone;
  }

  return null;
}

/** The `@keyframes` and `@property` names a set of rules refers to. */
function referenced(nodes) {
  const names = new Set();
  const visit = (node) => {
    if (node.type === 'decl') {
      for (const [, name] of node.value.matchAll(/\b(mp-[a-z0-9-]+)\b/g)) {
        names.add(name);
      }
      for (const [, name] of node.value.matchAll(/var\(\s*(--mp-[a-z0-9-]+)/g)) {
        names.add(name);
      }
    }
    node.nodes?.forEach(visit);
  };

  nodes.forEach(visit);

  return names;
}

/* ------------------------------------------------------------------- write */

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const tokens = await compile(
  /*
   * `@layer properties, theme;` pins the order the whole sheet gets by writing
   * both layers in one file. Split apart, the order would otherwise be decided
   * by which sheet a consumer happened to import first.
   */
  `@layer properties, theme;\n${PREAMBLE}\n${asCssWithoutSources(headNodes)}`,
  'tokens'
);

writeFileSync(resolve(out, 'tokens.css'), tokens);

const definedByTokens = new Set(
  [...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(([, name]) => name)
);

/*
 * The whole sheet leaves sixty-odd custom properties undefined on purpose — the
 * `--md-sys-color-*` roles it reads off the page if they are there, and the
 * `--accordion-panel-height` sort that Base UI writes at runtime. So the check
 * below is not "everything is defined", which would be false of `styles.css`
 * too. It is "the split leaves nothing undefined that the whole sheet defines".
 */
const wholeSheet = readFileSync(resolve(root, 'dist/styles.css'), 'utf8');
const NEEDED = /var\(\s*(--[a-z0-9-]+)\s*\)/g;
const undefinedInWhole = new Set(
  [...new Set([...wholeSheet.matchAll(NEEDED)].map(([, name]) => name))].filter(
    (name) => !new RegExp(`\\${name}\\s*:`).test(wholeSheet)
  )
);
const claimed = new Set();
const sizes = [];

const components = readdirSync(resolve(src, 'components')).sort();

for (const name of components) {
  const dir = resolve(src, 'components', name);
  const files = graphOf(dir);
  const text = files.map((file) => readFileSync(file, 'utf8')).join('\n');

  const own = tailNodes.map((node) => claim(node, text)).filter(Boolean);

  own.forEach((node, index) => {
    if (node.type === 'rule' || node.nodes) claimed.add(tailNodes.indexOf(node) >= 0 ? node : null);
    void index;
  });

  /* Keyframes and `@property` registrations are pulled in by name, from the
     rules that animate with them, rather than claimed on their own. */
  const names = referenced(own);
  const supporting = tailNodes.filter(
    (node) =>
      node.type === 'atrule' &&
      (node.name === 'keyframes' || node.name === 'property') &&
      names.has(node.params.trim())
  );

  const sources = files
    .map((file) => `@source '${relative(src, file)}';`)
    .sort()
    .join('\n');

  const sheet = await compile(
    [PREAMBLE, sources, asCss(supporting), asCss(own)].filter(Boolean).join('\n'),
    name
  );

  /* A sheet that reaches for a custom property nothing defines renders as
     nothing at all, and would do it silently. */
  const defined = new Set([...sheet.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(([, token]) => token));
  /* Only a `var()` with no fallback: one that has a second argument renders as
     that argument rather than as nothing, which is the whole point of writing
     it — `var(--tw-ease, var(--default-transition-timing-function))`. */
  const missing = [...new Set([...sheet.matchAll(NEEDED)].map(([, token]) => token))].filter(
    (token) => !defined.has(token) && !definedByTokens.has(token) && !undefinedInWhole.has(token)
  );

  if (missing.length > 0) {
    throw new Error(`dist/styles/${name}.css uses ${missing.join(', ')}, which nothing defines`);
  }

  writeFileSync(resolve(out, `${name}.css`), sheet);
  sizes.push([name, sheet.length, own.length + supporting.length]);
}

/*
 * And the split has to add up to the whole.
 *
 * Everything above decides what goes where — which files a component reads
 * from, which hand-written rule it draws with — and every one of those decisions
 * is a chance to leave a rule in no sheet at all. That failure is invisible from
 * the outside: the component renders, the page is merely wrong, and no test that
 * mounts a component would see it.
 *
 * So the sheets are checked against a reference compiled from every source file
 * at once, which is `dist/styles.css` by another name. A selector in the
 * reference and in none of the sheets is a rule the split path lost.
 */
const reference = await compile(
  [
    PREAMBLE,
    [...new Set(components.flatMap((name) => graphOf(resolve(src, 'components', name))))]
      .map((file) => `@source '${relative(src, file)}';`)
      .sort()
      .join('\n'),
    asCss(tailNodes)
  ].join('\n'),
  'reference'
);

/*
 * One selector at a time, not one rule at a time: Tailwind merges two utilities
 * that compile to the same declarations into a single comma-separated rule, and
 * whether a given pair lands together depends on what else was in the scan. Two
 * selectors in one rule here and one each in two sheets is the same CSS.
 */
const selectorsOf = (css) => {
  const found = new Set();

  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) {
      found.add(selector);
    }
  });

  return found;
};

const covered = new Set(
  components.flatMap((name) => [...selectorsOf(readFileSync(resolve(out, `${name}.css`), 'utf8'))])
);

for (const selector of selectorsOf(tokens)) {
  covered.add(selector);
}

const lost = [...selectorsOf(reference)].filter((selector) => !covered.has(selector));

if (lost.length > 0) {
  throw new Error(
    `the split sheets are missing ${lost.length} of the whole sheet's rules, starting with ${lost
      .slice(0, 5)
      .join(', ')}`
  );
}

/* Every hand-written rule has to belong to something. One that belongs to
   nothing is in the whole sheet and in none of the split ones — a component
   that renders correctly on `styles.css` and not on its own. */
const unclaimed = tailNodes.filter((node) => {
  if (node.type === 'atrule' && (node.name === 'keyframes' || node.name === 'property')) {
    return false;
  }

  const classes = classesUnder(node);

  if (classes.length === 0) {
    return false;
  }

  return !components.some((name) => {
    const text = graphOf(resolve(src, 'components', name))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');

    return classes.some((cls) => spells(text, cls));
  });
});

if (unclaimed.length > 0) {
  const shown = unclaimed.map((node) => node.selector ?? `@${node.name} ${node.params}`);

  throw new Error(`src/styles.css: no component claims ${shown.join(', ')}`);
}

/* --------------------------------------------------------------- reporting */

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const gz = (text) => gzipSync(Buffer.from(text), { level: 9 }).length;
const whole = wholeSheet;

const sorted = [...sizes].sort((a, b) => b[1] - a[1]);
const median = sorted[Math.floor(sorted.length / 2)];
const withRules = sizes.filter(([, , rules]) => rules > 0).length;

/*
 * Where the split stops paying, measured rather than guessed.
 *
 * Component sheets repeat each other's utilities, so their total climbs faster
 * than the whole sheet's does — and somewhere it passes it. Reported here in
 * components, taken in alphabetical order and compressed together the way a
 * bundler would concatenate them, so the number moves on its own as components
 * are added and the docs never quote a figure that stopped being true.
 */
const wholeGz = gz(whole);
const accumulated = [tokens];
let crossing = sizes.length;

for (const [name] of sizes) {
  accumulated.push(readFileSync(resolve(out, `${name}.css`), 'utf8'));

  if (gz(accumulated.join('\n')) > wholeGz) {
    crossing = accumulated.length - 2;
    break;
  }
}

console.log(
  `styles: dist/styles/tokens.css ${kb(tokens.length)} (gzip ${kb(gz(tokens))}), ` +
    `${sizes.length} component sheets — largest ${sorted[0][0]} ${kb(sorted[0][1])}, ` +
    `median ${kb(median[1])}, ${withRules} carrying hand-written rules`
);
console.log(
  `        whole sheet ${kb(whole.length)} (gzip ${kb(wholeGz)}); the split is the ` +
    `smaller download up to about ${crossing} components, and larger past that`
);
