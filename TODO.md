# TODO

What is left of the run that added the components `neba` has and this library did not. The list of what to build came from the Prompter and is fixed; what follows is where it got to, how the finished ones were built, and what each unfinished one needs.

This file is a working note. Delete it when the list is empty.

## Where it got to

Twenty units landed on `main`, each as its own commit with implementation, tests, bilingual documentation, a props row, a demo, a gallery entry and a changelog entry.

|  |  |
| --- | --- |
| Shared vocabulary | `density`, `elevation`, `transition`, `classNames`, `MPThreshold` |
| Documentation | `design-language.md`, four sections in `prop-conventions.md` |
| Hooks | `useMPDisclosure`, `useMPMediaQuery`, `useMPElementSize`, `useMPOnScreen` |
| Layout | `MPFlex`, `MPPortal`, `MPScrollArea`, `MPScrollZone`, `MPToolbar`, `MPFloatingBottomNavigation`, `MPMockup` |
| Display | `MPAnchor`, `MPAppLogo`, `MPDataList`, `MPCodeBlock`, `MPTreeView` |
| Feedback | `MPMeter`, `MPHoverCard` |

Thirteen units remain, listed below.

## The working method

Each unit is one commit, and nothing is committed until all of it is done:

1. Read `neba`'s version at `/Users/jooyeon/PersonalSrc/neba` for the problem it solves and the decisions it made. **Do not transcribe it.** The prop surface is usually the right one; the implementation, the tables and every comment are written fresh in this library's vocabulary — MD3 roles, `MPDensity` as `0…-3`, `containerSurface`, `MPStateLayer`, the `--_mp-color-*` indirections.
2. Implement under `src/components/<kebab>/MP<Name>.tsx` plus an `index.ts`, and register it in `src/index.ts` (alphabetical).
3. Add any Base UI entry point to `optimizeDeps.include` in `vitest.config.ts`, or the first test that touches it reloads the page mid-run.
4. Hand-written CSS, if any, goes at the end of `src/styles.css` with a section banner.
5. Tests under `test/components/<kebab>/MP<Name>.test.tsx`. Every test comment says _why_ the behaviour is what it is, not what the line does.
6. Documentation: `docs/en/components/<group>/<kebab>.md` and the `ko` twin, a `<PropsTable>` block in `docs/.vitepress/data/props.ts`, a demo at `docs/.vitepress/demos/<kebab>/hero.tsx`, and an entry in `docs/.vitepress/demos/gallery/all.tsx`.
7. A `### Added` entry under `vNext` in `CHANGELOG.md`.
8. `npm run format:fix`, `npm run typecheck`, `npm run lint`, the tests, `npm run build`.
9. Re-read the size figures off the build and update them in `README.md` and both `guide/getting-started.md` files.
10. Commit, with a body that explains the decisions rather than listing the files.

### Running the tests

**The full component suite cannot be run in one go on this machine.** The browser page closes partway through — `[vitest] Browser connection was closed while running tests` — somewhere after about seventy files, and the run reports the files it never reached rather than a failure. It is the environment, not the tests.

Run it in four chunks instead. `scripts/` has nothing for this; the script that was used is below, and it takes about four minutes.

```bash
cd test/components && ls -d */ | sed 's#/##' > /tmp/dirs.txt && cd -
```

Then a `bash` script that reads `/tmp/dirs.txt`, splits it into four, and runs `npx vitest run` once per chunk with the directories as arguments. Note two traps: `mapfile` does not exist in macOS's bash 3.2, and an unquoted `$VAR` holding a space-separated list does **not** word-split in zsh, so the whole list arrives as one filter and vitest answers "No test files found".

The other suites run in one go: `npx vitest run test/internal test/hooks test/styles test/locales test/types`.

## What is left

### 1. `MPTreeSelect` — written, parked on `wip/tree-select`

**The branch `wip/tree-select` holds a complete implementation and a test file that does not pass.** Start there rather than from nothing; the design below is already in the code.

A value chosen from a tree rather than from a list — the gap between `MPSelect` (a flat list behind a field) and `MPTreeView` (a hierarchy with no field).

Settled decisions, all of them already written into the branch:

- `items` is nested `MPTreeSelectItem[]`, each with `value`, `label`, `searchLabel?`, `startIcon?`, `disabled?`, `selectable?`, `children?`.
- `selectableBranches` is **off** by default: the branches are the taxonomy and the leaves are the answers, and a "Europe" chosen alongside "France" is usually a data model nobody meant. An item's own `selectable` overrides it either way.
- A branch that cannot be chosen still opens and shuts, so what comes back from `MPTreeView`'s `onSelectedChange` is filtered rather than trusted.
- `searchable` filters the tree and **keeps every ancestor of a match** — filtered to bare matches a tree is a list, and a list of leaves is what a tree was chosen over. A node that matches keeps all of its own children. Every branch the filter kept is force-opened, because a match folded inside a shut parent was not shown.
- The search field's placeholder comes from the `command` namespace rather than a new string: `MPCommandPalette` already writes "Search" down once.
- The tree inside the popup is `variant="text"` — the popup is already a sheet at elevation 2.
- It is built on `MPPickerShell` from `internal/Picker.tsx`, with `slug="tree-select"`.

**What is unfinished.** The tests fail at the first step: clicking the trigger does not open the popup, so fourteen of eighteen fall over together. Every other picker in the library opens from a plain click on `getByRole('button', { name: <label> })` — compare `test/components/time-picker/MPTimePicker.test.tsx`, which does exactly that and passes. The difference has not been found. Look first at whether `MPTreeSelect` is swallowing something the shell needs, and at the probe technique that was being used when the session ended: render, dump `screen.container.querySelectorAll('button')` and `document.querySelectorAll('.mp-portal').length` through a deliberately failing `expect(...).toBe('DUMP')`.

Nothing else is done: no documentation, no props rows, no demo, no gallery entry, no changelog.

### 2. `MPDataTable`

The largest single item left — `neba`'s is 2,516 lines plus a 319-line `internal/data-table.ts`. Sorting, filtering, pagination, column resizing, row selection, CSV export. Read `neba/src/components/data-table/DataTable.tsx` and `neba/src/internal/data-table.ts` before planning it.

This library already has `MPTable`, which is the presentational half. Decide early whether `MPDataTable` wraps it or replaces it; `neba` keeps them separate and that is probably right here too.

Expect this one to want its own `internal/data-table.ts` for the sort comparators, the filter predicates and the CSV writer, on the same reasoning `internal/mockup.tsx` gives: a component whose interesting fifty lines are buried in machinery is a component nobody can read.

### 3. `MPTour`

A guided walk-through: a sequence of steps, each anchored to an element, with a scrim that cuts a hole around the target. `neba`'s is 480 lines. Needs an i18n namespace of its own for the Back / Next / Skip / "Step 2 of 5" strings, filled in for the eighteen locales in `src/locales/`.

### 4–13. The charts

Ten components, and they share almost everything, so they are one piece of work rather than ten:

`MPAreaChart`, `MPBarChart`, `MPLineChart`, `MPPieChart`, `MPScatterChart`, `MPGaugeChart`, `MPHeatmapChart`, `MPTimelineChart`, `MPSparkline`, `MPStatistic`.

`neba` keeps the shared parts in `src/internal/chart.ts`, `chart-frame.tsx` and `chart-line.tsx`. Build the equivalent first — the scales, the axes, the grid, the legend, the tooltip and the frame — then each chart is the shape it draws.

Two decisions to make before writing any of them:

- **The palette.** A chart needs a series of distinguishable colours and MD3 has four accent families. `MPThreshold` (in `src/types.ts`) already established that a computed colour names a _role_ rather than a hex; the same rule should decide how a five-series chart is coloured. Deriving a series ramp from `--mp-source-color` is the obvious answer and has not been tried.
- **Whether they carry an SVG library.** `neba` draws everything by hand. Doing the same here keeps the dependency count where it is; the arithmetic is the cost.

`MPStatistic` is the odd one out — a big number with a label and a trend, no axes — and is the quickest of the ten. Consider doing it first to settle the palette question on something small.

## Two loose ends from earlier work

Neither is on the list above; both were raised and neither was answered.

- **`transition` on `MPBox` costs 1.2 kB gzipped**, taking it from 0.4 kB to 1.7 kB, because the effect tables are object literals and a bundler cannot tree-shake a key. It is on eight display components. Worth deciding whether `MPBox` in particular should keep it.
- **`MPBox` never calls `useMPSize`**, so an `MPConfigProvider`'s `size` does not reach it. Left alone deliberately as out of scope, but it is a real inconsistency: every other component that takes a `size` reads the provider.

## Things worth knowing before touching anything

- **`--mp-sys-color-*` are inputs, not values.** They are what a _consumer_ sets and are undefined on a page that has not. The sheet's own derivations are `--_mp-color-*`, and hand-written CSS must read those. This was found the hard way: `MPCodeBlock`'s `mono` theme drew nothing at all until it was fixed, and `MPTreeView`'s guide lines had the same bug.
- **Comments count as source for the stylesheet split.** `scripts/build-split-styles.mjs` attributes a hand-written rule to a component by looking for the class name in that component's files — including its comments. Naming another component's class in a comment pulls its CSS into your sheet. `internal/animate-core.ts` says so at the top.
- **A table of literal class strings in a shared file is paid for by every component that imports the file**, not only by the ones that read the table. That is why `internal/density.ts` and `internal/elevation.ts` exist separately from `internal/scale.ts`. Where a value is genuinely computed from two axes — `MPDataList`'s gaps, `MPCodeBlock`'s padding — a custom property set inline is smaller and exact; where it is one axis, keep the literal table.
- **`npm run measure` reports a deferred figure** because `MPCodeBlock` fetches its grammars. Each scenario is bundled twice, the second time with `highlight.js` external, and the difference is printed beside the total. Do not switch it to `splitting: true` — esbuild emits a chunk for every `import()` it parsed, before tree shaking decides the module is unreachable, so an `import { MPButton }` came out carrying thirty-six grammar chunks no real build emits.
- **The library ships no preflight.** An element whose size a caller sets needs `box-border` written on it, or the number means the content box. `MPCodeBlock`'s `maxHeight` was off by its padding until it got one.
