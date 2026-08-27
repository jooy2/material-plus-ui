/**
 * Marks every `React.forwardRef` and `React.createContext` call in the build
 * output with a `@__PURE__` annotation.
 *
 * A bundler drops an export nobody imported only if it can prove that
 * evaluating it does nothing. `React.forwardRef(fn)` is a function call, and a
 * bundler has no way to know that this particular one is harmless — so a module
 * that exports more than one component holds all of them the moment anything
 * imports any of them. Nine files here do: `MPTabs.tsx` is `MPTabs`, `MPTab` and
 * `MPTabPanel`, and importing the middle one used to cost 4.48 kB against the
 * 2.19 kB it costs annotated.
 *
 * `sideEffects` in `package.json` is the other half of this and does the larger
 * job — it is what lets a whole module be dropped. This is the finer cut, inside
 * a module that was kept.
 *
 * ## Why it is done here and not written in the source
 *
 * The annotation has to sit immediately before the call, which puts it in the
 * middle of the line a component is declared on:
 *
 *     export const MPPanes = React.forwardRef<HTMLDivElement, MPPanesProps>(function MPPanes(
 *
 * That line is already 87 columns and the repository's limit is 100. Fourteen
 * more characters pushes thirty of the sixty-eight declarations over it, and
 * Prettier's answer to an over-long call is to break the arguments onto their
 * own lines — which re-indents the entire component body underneath. Written in
 * the source, this optimisation costs a four-thousand-line diff across the
 * component library and the blame history of every file in it, in exchange for
 * a comment that says the same thing sixty-eight times.
 *
 * Emitted JavaScript has no such opinion. Nothing reads `dist/`, `terser` runs
 * over it next with `preserve_annotations` on, and a component added tomorrow is
 * annotated without anyone remembering to.
 *
 * The count is checked against the source rather than trusted, because the
 * failure this could have — an emitted shape the pattern does not match — is a
 * component that silently stops being separable from the ones beside it.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The calls worth annotating: the ones this library makes at the top level of a
 * module, to build a value it then exports.
 *
 * `memo` and `lazy` are not used here yet and are listed anyway — they are the
 * same shape and the same problem, and a component that reaches for one should
 * not have to find this file first.
 */
const CALLS = String.raw`(?:forwardRef|createContext|memo|lazy)`;

/* `= React.forwardRef(` in the source, `=r.forwardRef(` once the import has been
   renamed. Anchored on the assignment so a call made inside a component body —
   which runs on every render and is nobody's dead code — is left alone. */
const IN_SOURCE = new RegExp(String.raw`=\s*React\.${CALLS}\b`, 'g');
const IN_BUILD = new RegExp(String.raw`=\s*([A-Za-z_$][\w$]*)\.(${CALLS})\(`, 'g');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  );
}

const count = (files, pattern) =>
  files.reduce(
    (total, file) => total + (readFileSync(file, 'utf8').match(pattern)?.length ?? 0),
    0
  );

const sources = walk(resolve(root, 'src')).filter((file) => /\.tsx?$/.test(file));
const expected = count(sources, IN_SOURCE);

const built = walk(resolve(root, 'dist')).filter((file) => file.endsWith('.js'));
let annotated = 0;

for (const file of built) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(IN_BUILD, (match, alias, call) => {
    annotated += 1;

    return `= /*@__PURE__*/ ${alias}.${call}(`;
  });

  if (after !== before) {
    writeFileSync(file, after);
  }
}

if (annotated !== expected) {
  throw new Error(
    `annotated ${annotated} calls in dist/ but the source makes ${expected} — ` +
      'the emitted shape has changed and the pattern in this file no longer matches it'
  );
}

console.log(`pure: ${annotated} calls annotated across ${built.length} modules`);
