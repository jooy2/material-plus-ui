# TODO

The run that added the components `neba` has and this library did not. **It is finished** — all thirty-three units are on `main`.

What is kept here is the part worth keeping: the two questions nobody has answered, the working method, and the environment traps that cost time to rediscover. The task list itself is gone. Delete the file when the rest has found a better home.

## Where it got to

Thirty-three units landed on `main`, each as its own commit with implementation, tests, bilingual documentation, a props row, a demo, a gallery entry and a changelog entry.

|  |  |
| --- | --- |
| Shared vocabulary | `density`, `elevation`, `transition`, `classNames`, `MPThreshold` |
| Documentation | `design-language.md`, four sections in `prop-conventions.md` |
| Hooks | `useMPDisclosure`, `useMPMediaQuery`, `useMPElementSize`, `useMPOnScreen` |
| Layout | `MPFlex`, `MPPortal`, `MPScrollArea`, `MPScrollZone`, `MPToolbar`, `MPFloatingBottomNavigation`, `MPMockup` |
| Display | `MPAnchor`, `MPAppLogo`, `MPDataList`, `MPCodeBlock`, `MPTreeView` |
| Inputs | `MPTreeSelect` |
| Data | `MPDataTable`, `MPStatistic`, `MPSparkline`, `MPLineChart`, `MPAreaChart`, `MPBarChart`, `MPPieChart`, `MPScatterChart`, `MPGaugeChart`, `MPHeatmapChart`, `MPTimelineChart` |
| Feedback | `MPMeter`, `MPHoverCard`, `MPTour` |

**The list is empty.** What is left is the two questions below, which were raised and never answered.

## The working method

Each unit is one commit, and nothing is committed until all of it is done:

1. Read `neba`'s version at `/Users/joo/LocalSrc/neba` for the problem it solves and the decisions it made. **Do not transcribe it.** The prop surface is usually the right one; the implementation, the tables and every comment are written fresh in this library's vocabulary — MD3 roles, `MPDensity` as `0…-3`, `containerSurface`, `MPStateLayer`, the `--_mp-color-*` indirections.
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

**The browser has to be installed before any of this works.** `npx playwright install chromium` — a `playwright` version bump leaves the cache holding the revision the previous version wanted, and vitest reports the mismatch as an unhandled error with no test results rather than as a missing browser.

**The full component suite cannot be run in one go on this machine.** The browser page closes partway through — `[vitest] Browser connection was closed while running tests` — somewhere after about seventy files, and the run reports the files it never reached rather than a failure. It is the environment, not the tests.

Run it in four chunks instead. `scripts/` has nothing for this; the script that was used is below, and it takes about four minutes.

```bash
cd test/components && ls -d */ | sed 's#/##' > /tmp/dirs.txt && cd -
```

Then a `bash` script that reads `/tmp/dirs.txt`, splits it into four, and runs `npx vitest run` once per chunk with the directories as arguments. Note two traps: `mapfile` does not exist in macOS's bash 3.2, and an unquoted `$VAR` holding a space-separated list does **not** word-split in zsh, so the whole list arrives as one filter and vitest answers "No test files found".

The other suites run in one go: `npx vitest run test/internal test/hooks test/styles test/locales test/types`.

## Two open questions

Both were raised during the run and neither was answered. Neither blocks anything.

- **`transition` on `MPBox` costs 1.2 kB gzipped**, taking it from 0.4 kB to 1.7 kB, because the effect tables are object literals and a bundler cannot tree-shake a key. It is on eight display components. Worth deciding whether `MPBox` in particular should keep it.
- **`MPBox` never calls `useMPSize`**, so an `MPConfigProvider`'s `size` does not reach it. Left alone deliberately as out of scope, but it is a real inconsistency: every other component that takes a `size` reads the provider.

## Things worth knowing before touching anything

- **`--mp-sys-color-*` are inputs, not values.** They are what a _consumer_ sets and are undefined on a page that has not. The sheet's own derivations are `--_mp-color-*`, and hand-written CSS must read those. This was found the hard way: `MPCodeBlock`'s `mono` theme drew nothing at all until it was fixed, and `MPTreeView`'s guide lines had the same bug.
- **Comments count as source for the stylesheet split.** `scripts/build-split-styles.mjs` attributes a hand-written rule to a component by looking for the class name in that component's files — including its comments. Naming another component's class in a comment pulls its CSS into your sheet. `internal/animate-core.ts` says so at the top.
- **A table of literal class strings in a shared file is paid for by every component that imports the file**, not only by the ones that read the table. That is why `internal/density.ts` and `internal/elevation.ts` exist separately from `internal/scale.ts`. Where a value is genuinely computed from two axes — `MPDataList`'s gaps, `MPCodeBlock`'s padding — a custom property set inline is smaller and exact; where it is one axis, keep the literal table.
- **`npm run measure` reports a deferred figure** because `MPCodeBlock` fetches its grammars. Each scenario is bundled twice, the second time with `highlight.js` external, and the difference is printed beside the total. Do not switch it to `splitting: true` — esbuild emits a chunk for every `import()` it parsed, before tree shaking decides the module is unreachable, so an `import { MPButton }` came out carrying thirty-six grammar chunks no real build emits.
- **Two `render()` calls in one test poison every test after it in the file.** Even with an `unmount()` between them: the body comes back holding one empty `<div>` and every later `document.querySelector` finds nothing, while the same tests pass in isolation. React logs "overlapping act() calls" and nothing else. Split the comparison into two tests, or — better — assert the relationship inside one render, which is usually the stronger claim anyway. Cost about twenty minutes twice.
- **`npx tsc --noEmit` does not check the docs.** The root `tsconfig.json` excludes `docs` and `test`, so a demo with a bad prop typechecks clean and then throws in the browser — `level="title-medium"` on `MPTypography` got as far as a rendered page saying _Element type is invalid_. `npm run typecheck` is the one that runs all three projects, and it is what step 8 means.
- **The library ships no preflight.** An element whose size a caller sets needs `box-border` written on it, or the number means the content box. `MPCodeBlock`'s `maxHeight` was off by its padding until it got one.
