/**
 * What this library costs a project that uses some of it.
 *
 * Bundles `dist/` for a handful of fixed scenarios and prints the gzipped size
 * of each, so the numbers in the changelog and the documentation are read off a
 * real bundler rather than remembered. `build-split-styles.mjs` already does
 * this for the stylesheet; this is the same idea for the JavaScript.
 *
 * ## Why a bundler and not `unpackedSize`
 *
 * Because the failure being measured is invisible to a file listing. Up to
 * 1.3.0 this package had no `sideEffects` field, so importing `MPBox` — a
 * `<div>` with three classes on it — produced a 62.3 kB bundle, the same 62.3 kB
 * an import of all hundred and fourteen produced. Nothing about the published files said
 * so. bundlephobia would not have said so either: it reports what a package
 * weighs, and the thing worth knowing is what *one component* weighs.
 *
 * So the scenarios are marginal: one component, five, ten, and everything. What
 * the columns say is how steeply the second number climbs from the first.
 *
 * ## The two columns
 *
 * `marginal` holds `@base-ui/react` external along with React, and is this
 * library's own contribution — the number to watch when a change here is
 * supposed to have made something smaller.
 *
 * `+ Base UI` bundles Base UI in, and is closer to what a project actually
 * downloads. It is much the larger of the two past a few components and almost
 * none of it is ours, which is worth seeing beside the first column rather than
 * instead of it: shaving this library's contribution matters most exactly where
 * the other column is small.
 *
 * Both are gzip, because that is what crosses the network. Neither includes the
 * stylesheet — `build-split-styles.mjs` prints that, and adding CSS bytes to
 * JavaScript bytes produces a figure that is not any real download.
 *
 * ## The identity check
 *
 * `material-plus-ui/components/button` exists so that a build which gets
 * tree-shaking wrong has a path that cannot go wrong, and it is only worth
 * documenting while it costs nothing to take. The last check bundles `MPButton`
 * both ways and fails if either way pulls in a module the other did not, or
 * weighs more — so the day the barrel starts costing something, this says so
 * rather than the README going quietly out of date.
 *
 * Same modules and same size rather than the same bytes: esbuild walks the graph
 * from the entry, so the two orderings differ and the minifier hands out its
 * short names in that order — which is also why the comparison is on minified
 * length and not on gzip, since gzip reads a difference in ordering as a
 * difference of about ten bytes. What the claim means is that nothing extra
 * comes along, and that is what is checked.
 */
import { gzipSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'dist/index.js');

/* React is always somebody else's, and is external in both columns. */
const REACT = ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'];
const BASE_UI = ['@base-ui/react', '@base-ui/react/*'];

/**
 * The scenarios, and why these.
 *
 * `MPBox` is the floor: the smallest component in the library, and therefore the
 * one whose bundle is almost entirely whatever the library makes everybody
 * carry. `MPButton` is the smallest component that speaks — it says *Loading* —
 * so it is where the message table and the icon runtime show up. The middle two
 * are what an application looks like. `null` is every runtime export there is.
 */
const SCENARIOS = [
  ['MPBox', ['MPBox']],
  ['MPButton', ['MPButton']],
  ['MPTextField', ['MPTextField']],
  ['5 components', ['MPButton', 'MPTextField', 'MPCard', 'MPCheckbox', 'MPTypography']],
  [
    '10 components',
    [
      'MPButton',
      'MPTextField',
      'MPCard',
      'MPCheckbox',
      'MPTypography',
      'MPDialog',
      'MPSelect',
      'MPMenu',
      'MPTabs',
      'MPSnackbarProvider'
    ]
  ],
  ['everything', null]
];

/**
 * One bundle, from a source string rather than a file on disk.
 *
 * `stdin` with a `resolveDir` of the repository root, so the entry resolves
 * `material-plus-ui` through the alias below and everything under it through the
 * real `node_modules` — the same resolution a consumer's build does, without
 * writing scratch files into the working tree.
 */
async function bundle(source, { external }) {
  const built = await esbuild.build({
    stdin: { contents: source, resolveDir: root, sourcefile: 'scenario.js', loader: 'js' },
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    external,
    alias: { 'material-plus-ui': entry },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent'
  });

  const [output] = built.outputFiles;
  const [meta] = Object.values(built.metafile.outputs);

  return {
    gzip: gzipSync(Buffer.from(output.text), { level: 9 }).length,
    bytes: output.text.length,
    modules: Object.keys(meta.inputs).length,
    exports: meta.exports.length
  };
}

/* `export *` rather than a name list for the last scenario, so "everything"
   cannot drift out of date as components are added. */
const scenario = (names) =>
  names === null
    ? `export * from 'material-plus-ui';\n`
    : `import { ${names.join(', ')} } from 'material-plus-ui';\nexport { ${names.join(', ')} };\n`;

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const rows = [];

for (const [name, names] of SCENARIOS) {
  const source = scenario(names);
  const marginal = await bundle(source, { external: [...REACT, ...BASE_UI] });
  const total = await bundle(source, { external: REACT });

  rows.push({
    name,
    count: names?.length ?? marginal.exports,
    marginal: marginal.gzip,
    total: total.gzip,
    modules: marginal.modules
  });
}

const width = Math.max(...rows.map((row) => row.name.length));

console.log('bundle: gzip, React external, this library on top of Base UI and with it');

for (const row of rows) {
  console.log(
    `        ${row.name.padEnd(width)}  ${kb(row.marginal).padStart(8)}` +
      `  (+ Base UI ${kb(row.total).padStart(8)})  ${String(row.modules).padStart(3)} modules`
  );
}

/*
 * And the promise the subpath exports make.
 */
const barrel = await bundle(
  `import { MPButton } from 'material-plus-ui';\nexport { MPButton };\n`,
  {
    external: [...REACT, ...BASE_UI]
  }
);
const subpath = await bundle(
  `import { MPButton } from './dist/components/button/index.js';\nexport { MPButton };\n`,
  { external: [...REACT, ...BASE_UI] }
);

if (barrel.bytes !== subpath.bytes || barrel.modules !== subpath.modules) {
  throw new Error(
    'importing MPButton through the barrel no longer costs what importing it through ' +
      `material-plus-ui/components/button does — ${barrel.modules} modules and ` +
      `${barrel.bytes} B against ${subpath.modules} and ${subpath.bytes} B. One of them ` +
      'is carrying something the other is not, and the documentation says they are the same'
  );
}

console.log(`        subpath imports still cost what the barrel does (${barrel.modules} modules)`);
