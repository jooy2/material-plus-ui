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
 *
 * ## The second pass
 *
 * A long class list is written here as an array of lines joined with a space,
 * which is a readable way to spell a hundred characters of Tailwind and — to a
 * bundler — a method call on an array. `['a', 'b'].join(' ')` cannot be proved
 * harmless any more than `forwardRef(fn)` can, so every such constant in a
 * module is kept the moment anything in that module is imported.
 *
 * `internal/surface.ts` is where that showed: `MPBox` renders a `<div>` and
 * reads one export from it, and was carrying `FADE` and `SHEET_MOTION` — the
 * motion classes for the portalled surfaces, which an `MPBox` has none of — for
 * 60% of its bundle. Annotated, `MPBox` is 0.4 kB against 0.5 kB.
 *
 * The array literal is found by matching brackets rather than by a pattern,
 * because Tailwind's own syntax is full of them: `[&>svg]:size-full` inside a
 * string would end a naive `\[.*?\]` at the wrong place.
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

/**
 * Every `[` in a module paired with the `]` that closes it, skipping the ones
 * that are inside a string or a comment, and noting whether anything between
 * the two was called.
 *
 * The strings are the point: a Tailwind class list is `['[&>svg]:block', ...]`,
 * and three of the four brackets on that line are text.
 *
 * The call is the safety. `['a', 'b'].join(' ')` is pure because evaluating the
 * array does nothing; `[register(), 'b'].join(' ')` is not, and annotating it
 * would licence a bundler to delete the `register()` along with the string. No
 * such array exists here — the guard is so that the day one does, it is not
 * quietly marked harmless.
 */
function brackets(code) {
  const open = [];
  const pairs = new Map();
  let calls = 0;
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
      while (index < code.length && code[index] !== '\n') {
        index += 1;
      }

      continue;
    }

    if (character === '/' && code[index + 1] === '*') {
      index += 2;

      while (index < code.length && !(code[index] === '*' && code[index + 1] === '/')) {
        index += 1;
      }

      index += 2;
      continue;
    }

    if (character === '(') {
      calls += 1;
    } else if (character === '[') {
      open.push({ index, calls });
    } else if (character === ']') {
      const start = open.pop();

      if (start !== undefined && start.calls === calls) {
        pairs.set(index, start.index);
      }
    }

    index += 1;
  }

  return pairs;
}

/* `= [...].join(` and `, [...].join(` — an array literal being turned into a
   string to name a constant. A join anywhere else is somebody's runtime work. */
const JOINED = /^\]\s*\.join\(/;
const ASSIGNED = /[=,]\s*$/;

let joined = 0;

for (const file of built) {
  const before = readFileSync(file, 'utf8');
  const at = [];

  for (const [close, open] of brackets(before)) {
    if (!JOINED.test(before.slice(close, close + 8))) {
      continue;
    }

    const preceding = before.slice(0, open);

    if (!ASSIGNED.test(preceding) || /@__PURE__/.test(preceding.slice(-40))) {
      continue;
    }

    at.push(open);
  }

  if (at.length === 0) {
    continue;
  }

  let after = before;

  for (const index of at.sort((a, b) => b - a)) {
    after = `${after.slice(0, index)}/*@__PURE__*/${after.slice(index)}`;
  }

  joined += at.length;
  writeFileSync(file, after);
}

console.log(
  `pure: ${annotated} calls and ${joined} class lists annotated across ${built.length} modules`
);
