# Contributing to Material Plus

Thank you for contributing to the project. Your contributions will help us take the project to the next level.

This project adheres to the [Contributor Covenant](CODE_OF_CONDUCT.md) code of conduct, version 2.1. Your contribution implies that you have read and agree to this policy. Any behavior that undermines the quality of the project community, including this policy, will be warned or restricted by the maintainers.

## Repository layout

The repository holds one design system and three things built out of it:

| Path               | What it is                              | How it is run                                                                        |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/react`   | The npm package, `material-plus-ui`     | `cd packages/react && npm install`, then `npm test`, `npm run lint`, `npm run build` |
| `packages/flutter` | The pub.dev package, `material_plus_ui` | `cd packages/flutter && flutter pub get`, then `flutter test`, `flutter analyze`     |
| `docs`             | The documentation site, shared by both  | `cd docs && npm install`, then `npm run dev`                                         |

There is no install at the repository root, and no root `package.json`. Each of the three is entered and run on its own.

### The React package

```text
packages/react/src/        # component source, built to dist/
packages/react/test/       # vitest suites, run in a real browser
packages/react/scripts/    # the build steps: import specifiers, minification, style sheets, bundle size
```

A component is one directory under `src/components`: the `.tsx` file and an `index.ts` that re-exports it. It is styled with utility classes on its own elements, off the design tokens in `src/styles.css`. Anything shared between components lives in `src/internal`, and the translated strings live in `src/locales`.

`src/a2ui` is the one part of `src/` that is not the library itself: it is the [A2UI](https://a2ui.org) catalog, published as `material-plus-ui/a2ui`, and it draws agent-described interfaces with the components above. It has two rules of its own, both explained in `src/a2ui/index.ts`. The protocol SDK it needs is an optional peer dependency, so nothing outside that directory may import `@a2ui/*`; and nothing in it may write a utility class, because a class used only there would land in the whole stylesheet and in none of the split per-component sheets.

Nothing is set on the page or on an element the component does not own — no reset, no provider, no global rule — because the library has to coexist with whatever Material setup a project already has. A change that reaches outside that boundary needs a reason in the pull request.

### The Flutter package

```text
packages/flutter/lib/src/components/   # one folder per component, mp_<name>.dart
packages/flutter/lib/src/theme/        # the colour scheme, type scale, shapes, shadows and motion
packages/flutter/lib/src/internal/     # what components share, not exported
packages/flutter/lib/src/locales/      # the translations, exported from lib/locales.dart
packages/flutter/test/                 # widget tests
packages/flutter/example/              # the gallery, and the renderer behind every Flutter preview on the site
packages/flutter/tool/generate.dart    # writes the barrel and the gallery's demo registry
```

Nothing in the package imports `package:flutter/material.dart` or `package:flutter/cupertino.dart`, and it has no dependencies: every widget is built on `package:flutter/widgets.dart`. The colour roles are derived from the source colour with the same arithmetic and the same numbers as `packages/react/src/styles.css`, and `test/theme/color_scheme_test.dart` holds the two to the same hex values, so a change to the token sheet's tone stops is a change to `lib/src/theme/color_scheme.dart` too.

`lib/material_plus_ui.dart` and `example/lib/demos/registry.dart` are generated. After adding a component (`lib/src/components/<name>/mp_<name>.dart`) or a demo, run `dart run tool/generate.dart`; `test/package/generated_test.dart` fails when either file is out of date.

### The documentation site

A few notes that are easy to trip over:

- The site renders the React components from `packages/react/src` through a Vite alias, so a component edit shows up in `npm run dev` without a rebuild.
- The Flutter previews are the real package compiled for the web. `cd docs && npm run flutter:demos` builds them into `docs/public/flutter`, which is git-ignored; without it the previews say so rather than rendering something misleading. The script skips the build when one is already there, and `npm run build` reuses it, so after a change to the package or to a demo run `npm run flutter:demos -- --force`.
- The Dart on the site is quoted straight out of `packages/flutter/example/lib/demos/`, so a snippet in the docs is code the analyser has checked. Change the demo, not the Markdown.
- A component that exists in both packages says the same things on one page, with `::: fw react` / `::: fw flutter` around only the parts that genuinely differ, and anything that differs should say why. The props tables are `docs/.vitepress/data/props.ts` for React and `docs/.vitepress/data/props-flutter/<page>.ts` for Flutter, where a row is derived from its React row and states only what Dart spells differently.
- Every documentation page exists in both `docs/en` and `docs/ko`. Add the English page, and add the Korean one as well; writing it in your own language and leaving the translation to someone else is fine, but the file has to be there.

## Development

Node.js 22 or later is required for the React package and the site, and Flutter 3.41 or later for the Flutter package.

| Task                     | Where                      | Command                                                |
| ------------------------ | -------------------------- | ------------------------------------------------------ |
| Install (also builds)    | `packages/react`           | `npm install`                                          |
| Build                    | `packages/react`           | `npm run build`                                        |
| Test                     | `packages/react`           | `npm run test`                                         |
| Type-check               | `packages/react`           | `npm run typecheck`                                    |
| Lint and format          | `packages/react`           | `npm run lint:fix`, `npm run format:fix`               |
| Bundle size              | `packages/react`           | `npm run measure`                                      |
| Install                  | `packages/flutter`         | `flutter pub get`                                      |
| Test                     | `packages/flutter`         | `flutter test`                                         |
| Analyze and format       | `packages/flutter`         | `flutter analyze`, `dart format lib test tool`         |
| Barrel and demo registry | `packages/flutter`         | `dart run tool/generate.dart`                          |
| Gallery                  | `packages/flutter/example` | `flutter run`                                          |
| Documentation site       | `docs`                     | `npm install`, then `npm run dev`                      |
| Flutter previews         | `docs`                     | `npm run flutter:demos -- --force`                     |
| Release notes preview    | repository root            | `node .github/scripts/release-notes.mjs react-v1.12.0` |

The React tests run in a real browser through Playwright rather than in a DOM emulator, so a browser has to be installed: `npx playwright install chromium`. A plain `npm run test` uses Chromium alone. `VITEST_BROWSER` picks another engine, or several as a comma-separated list, out of `chromium`, `firefox` and `webkit`; CI sets it per job and runs all three on Linux, Windows and macOS.

The Flutter tests are widget tests and run headless in the Flutter tester, with no device or emulator. They never put a `MaterialApp` around a component: the package imports no Material, so a test that passes only inside one is not testing what a consumer gets.

## Issues

Issues can be created on the following page: https://github.com/jooy2/material-plus-ui/issues

Alternatively, you can reach the maintainers at https://cdget.com/contact. However, we prefer to track progress via GitHub Issues.

When creating an issue, keep the following in mind:

- Please specify the correct category selection based on the format of the issue (e.g., bug report, feature request).
- Check to see if there are duplicate issues.
- Describe in detail what is happening and what needs to be fixed. You may need additional materials such as images or video.
- Name which of the two packages it is and its version: for `material-plus-ui`, the React version and the browser and bundler you saw it in; for `material_plus_ui`, the Flutter version and the platform.
- Use appropriate keyword titles to make it easy for others to search and understand.
- Please use English in all content.

A security vulnerability is not a general issue. Report one through the process in [SECURITY.md](SECURITY.md).

## How to contribute (Pull Requests)

### Write the code you want to change

Here's the process for contributing to the project:

1. Clone the project (or rebase to the latest commit in the main branch)
2. Install the package (if the package manager exists)
3. Setting up lint or code formatter in the IDE (if your project includes a linter) and installing the relevant plugins. Some projects may use specific commands to check rules and perform formatting after module installation and before committing.
4. Write the code that needs to be fixed
5. Update the documentation (if it exists) or create a new one. If your project supports multilingual documentation, update the documentation for all languages. You can fill in the content in your own language and not translate it.
6. Add or modify tests as needed (if test code exists). You should also verify that existing tests pass.

### Write a commit message

While we don't have strict restrictions on commit messages, we recommend that you follow the recommendations below whenever possible:

- Write in English.
- Use the ` symbol to name functions, variables, or folders and files.
- Use a format like `xxx: message (fixes #1)`. The content in parentheses is optional.
- The message includes a summary of what was modified.
- It's a good idea to separate multiple modifications into their own commit messages.
- Keep one component to one commit. A change that touches five components is five commits, so that a later reader can find, read or revert the one they care about on its own.

It is recommended that you include a tag at the beginning of the commit message. Between the tag and the message, use `: ` between the tag and the message.

tags conform to the ["Udacity Git Commit Message Style Guide"](https://udacity.github.io/git-styleguide). However, you are welcome to use tags not listed here for additional situations.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Changes to documentation
- `style`: Formatting, missing semicolons, etc.; no code change
- `refactor`: Refactoring production code
- `test`: Adding tests, refactoring test; no production code change
- `chore`: Updating build tasks, package manager configs, etc.; no production code change

Informal tags:

- `package`: Modifications to package settings, modules, or GitHub projects
- `typo`: Fix typos

This repository holds two packages, so a tag is preceded by the codebase the change belongs to:

- `[javascript]` for a change to `packages/react` alone, as in `[javascript] fix: keep the focus on the trigger after a picker is cleared`
- `[dart]` for a change to `packages/flutter` alone, as in `[dart] test: cover a slider dragged past its end`
- No prefix for a change that touches both packages, or neither, as in `docs: say on the tabs page which panels are rendered`

### Create a pull request

When creating a pull request, keep the following in mind:

- Include a specific description of what the modification is, why it needs to be made, and how it works.
- Check to see if there are duplicate pull requests.
- Please use English in all content.

Typically, a project maintainer will review and test your code before merging it into the project. This process can take some time, and they may ask you for further edits or clarifications in the comments.

## Releasing

A maintainer releases each package on its own, from a tag of its own. The GitHub release in between is written by `.github/workflows/release.yml`, which holds no registry token and never publishes. The steps are the same for both packages.

1. **Cut the version** in one commit on `main`. For the React package, that is `version` in `packages/react/package.json` and the same number twice at the top of `packages/react/package-lock.json`: the file's own `version` and `packages[""].version`. `packages/react/pnpm-lock.yaml` does not record it. For the Flutter package, it is `version` in `packages/flutter/pubspec.yaml` and the `material_plus_ui` entry in `packages/flutter/example/pubspec.lock`, which follows the path dependency. In the package's `CHANGELOG.md`, rename `## vNext (YYYY--)` to `## X.Y.Z (YYYY-MM-DD)`, open the section with a paragraph saying what the release is, and put a new, empty `## vNext (YYYY--)` above it. Push, and let CI pass on that commit.
1. **Tag that commit** with the package's prefix, `react-vX.Y.Z` or `flutter-vX.Y.Z`, and push the tag by name: `git tag react-v1.12.0`, then `git push origin react-v1.12.0`. `git push --tags` would push every local tag, so it is not used. The React package's releases from before the repository held two packages are tagged `vX.Y.Z`.
1. **The workflow** checks that the tag names the version in the package's manifest and writes the release notes from its changelog. The React job then packs the package with `npm pack`, which runs the build and its bundle check, and attaches the tarball, which is exactly what `npm publish` uploads. The Flutter job runs `dart pub publish --dry-run` and attaches nothing, because pub has no command that writes its archive to a file. Re-running it updates that release instead of failing.
1. **Publish to the registries by hand**, with `npm publish` in `packages/react` and `dart pub publish` in `packages/flutter`.

The body of the release is the version's whole changelog section, followed by links to the changelog on the docs site and in the repository. GitHub cuts a body off at 125,000 characters, so a section longer than that is replaced by its opening paragraph and the links. Preview the body with `node .github/scripts/release-notes.mjs react-v1.12.0`; it fails on a version that is missing, undated or empty.
