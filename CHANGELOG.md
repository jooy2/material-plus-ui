# Changelog

## Unreleased

**Material UI is gone.** The library now implements Material Design 3 directly instead of building on `@mui/material`, which changes what it is: an implementation of the specification rather than an extension of somebody else's. Everything about how a component is used stays the same — no prop was renamed or removed — but the install, the theming and the styling model are all different.

### Breaking

- **Peer dependencies are one instead of three.** `@mui/material`, `@emotion/react` and `@emotion/styled` are no longer peers; `@base-ui/react` 1 is. It is a peer rather than a dependency because it carries React context — a consumer's `Form` has to be able to see a field from here, and that only works with one copy in the tree.
- **There is no provider, and no MUI theme is read.** A `ThemeProvider` around these components no longer does anything to them. Colours, type, shape and motion come from CSS custom properties instead, so theming moved from JavaScript to CSS.
- **`CssBaseline` is no longer assumed.** The library adds no page-level styling of any kind and no longer expects the page to have a reset: each component resets what it owns on the element it owns — a `<button>`'s browser-default background, a control's font, which a native form control does not inherit.
- `MPColor` is MD3's four accent roles (`primary`, `secondary`, `tertiary`, `error`) rather than Material UI's six. The specification's colour system has no `info`, `success` or `warning`, and offering them would promise roles the token sheet cannot derive.
- `--mp-duration` became `--mp-sys-motion-duration-short4`, and is 200ms rather than 250ms — MD3's `short4`, which is what a text field's label and outline transition on.

### Added

- **Theming from a single source colour.** `--mp-source-color` generates every colour role the way Material generates a scheme from a source colour. The tone stops are read off MD3's own baseline ref palette rather than chosen by eye, so with the default source colour the derived roles land on the reference scheme: `primary` and `error` match its hex exactly in both schemes, and the near-grey roles are within a ΔE of 0.008 — below anything visible.
- **Coexistence with an existing Material setup.** Each role reads `--md-sys-color-*` before falling back to its own derivation, and the library never writes that namespace. A project running Material Web is picked up with no configuration. The full order is `--mp-sys-color-*` (an explicit override) → `--md-sys-color-*` (the page's own) → derived.
- **Dark mode with nothing to configure.** `prefers-color-scheme` is followed by default, and `data-mp-scheme="dark"` or `.dark` on any element drives it explicitly. Both schemes are the same tonal palettes read at different tones, which is how MD3 defines them — so a source colour moves light and dark together and there is no second set of values to keep in sync.
- **Scoped and runtime theming.** Every token is an ordinary inherited custom property, and the derived roles are declared on `*` rather than on `:root` so each element re-resolves them against whatever is in scope where it sits. A section with its own source colour works, a `.dark` on `<body>` works, and a colour a reader picks at runtime is an inline style with no re-render.

### Changed

- `MPTextField` is Base UI's `Field` plus the notch, the adornments and the password toggle. The notched outline is a `<legend>` interrupting a `<fieldset>`'s top border, which is a native behaviour, so the gap is sized to the label with no measuring in JavaScript. State styling reads the `data-focused`, `data-invalid` and `data-disabled` attributes Base UI emits, which keeps it in CSS.
- The IME composition handling — the reason the component exists — is unchanged.
- `large` is Material's own 56px size and the default is a 40px compact variant. The spec defines one size for a text field; the smaller one is a concession to dense forms rather than something MD3 names.
- Token names follow MD3 (`primary`, `on-surface-variant`, `corner-extra-small`, `body-large`) rather than Material UI's palette model (`main`/`light`/`dark`/`contrastText`), which is a different and earlier colour system.
- Only the tokens a component actually reads exist. MD3 defines around fifty colour roles; an outlined text field reads five, and the rest are absent until something needs them.

### Removed

- No CSS-in-JS runtime. Styling is a stylesheet, so there is nothing to inject on render and no hydration pass for theme styles.

## 0.0.1 (2026-08-06)

The first release. Two components, and the scaffolding the rest will be built on.

### Added

- `MPTextField` — a Material UI text field that survives an IME. A controlled `<input>` is rendered from its `value`, and while an input method is composing the browser is holding a provisional string that has not been committed yet; writing `value` back over it in that moment throws the syllable away and jumps the caret. Anything the parent does in its `onChange` — trimming, upper-casing, validating, or simply re-rendering slowly — is enough to cause it. So the field stops rendering `value` for the duration of a composition and shows its own copy of what the element actually contains, while `onChange` keeps firing for every keystroke. This is why `value` and `onChange` are a plain string rather than an event: an event's `target` is the element mid-composition, which is precisely the value that must not be trusted.
- **The field is `@mui/material`'s own `OutlinedInput`,** so the notched outline, the palette, the sizes and every theme override still belong to MUI. What is added around it is the assembly a form needs anyway: `label`, `errorMessage` as helper text, `startIcon` as a leading adornment, and a password reveal toggle that cancels both `mousedown` and `mouseup` so the caret stays where it was left. `rows` renders a `<textarea>`; `resizable` lets the reader drag it taller, vertically only. `onSubmit` fires on Enter, and Enter is then swallowed on a single-line field so a surrounding form is not also submitted natively — `disableEnterKey` extends that to a multiline field. `large` is MUI's `medium` and the default is its `small`: two heights rather than a ladder, because those are the two `@mui/material` has.
- `MPIcon` — a glyph at a known size in a known colour, from whichever icon set you use. The glyph is the `icon` prop rather than `children`, which is what lets the component set the size and colour of an element it did not draw. Two forms are accepted: a **component**, which is what `lucide-react` and most sets export and what allows the size and colour to be passed _into_ the glyph, and an **element**, already drawn and scaled by the box it is laid into. The two are told apart with `React.isValidElement` alone, so the `forwardRef` objects modern icon sets actually export are correctly treated as components.
- **`size` is a length, not a ladder.** A number is CSS pixels and a string is any CSS length. Icon sets are drawn on a pixel grid at specific sizes, and a wrapper inventing five steps of its own would be a second opinion about a decision the set already made; left unset, the glyph draws at whatever size it was authored at. The length is written to the box _and_ to its `font-size`, which is what makes an `<svg>` carrying its own `width` and an `<svg>` sized in `em` come out the same. `color` behaves the same way — unset, the icon inherits whatever it sits in, and the glyph is told `currentColor` so a set with a hardcoded default follows too. Without a `label` the icon is `aria-hidden` and leaves the accessibility tree; with one it is a named `role="img"`.
- **One file imports `lucide-react`,** and it is `src/constants/icons.ts`. Every glyph the library draws is named there under the role it plays (`visibility`) rather than the drawing lucide happens to ship (`Eye`), so the artwork can be swapped without touching a component. It leaves by two doors: named exports, which the library's own components use and which a bundler can tree-shake one at a time, and `ICONS`, a name-keyed table for an application that wants one — an object literal cannot be shaken property by property, so importing it pulls in the whole set, and that trade is the reason the components never reach for it.

### Package

- `@mui/material` 6 through 9, `@emotion/react`, `@emotion/styled`, `react` and `react-dom` 18 or 19 are peer dependencies — the copy already in your project is the copy that is used, so there is never a second MUI in the bundle or a second theme in the tree. Only MUI 9 is exercised in CI.
- `lucide-react` is the one runtime dependency.
- ESM only, TypeScript declarations included. Every component compiles to its own module, so what is not imported is not shipped.
- Four entry points besides the barrel: `material-plus-ui/types`, `material-plus-ui/constants/icons`, `material-plus-ui/styles.css` and `material-plus-ui/tailwind.css`.

### Styles

- **The stylesheet carries no reset, on either path.** Tailwind's Preflight is a page reset and every project using this library already has one in `CssBaseline` — and the two disagree visibly, since Preflight flattens the heading sizes, list markers and link colours MUI's typography sets up, and its `border: 0 solid` restyles every `@mui/material` component on the page rather than only the ones from here. Nothing in this library depends on Preflight.
- `material-plus-ui/styles.css` is finished CSS for a project with no Tailwind of its own; `material-plus-ui/tailwind.css` is the token sheet for a project that has it. Both carry the `@source '.'` that registers the package's compiled files, so a consumer never writes an `@source` whose correctness would depend on where their own CSS file sits.

### Documentation

- A VitePress site in English and Korean at [material-plus.cdget.com](https://material-plus.cdget.com), with live previews that are the components running in the page rather than screenshots. Each preview carries a theme switch of its own, so a component can be read in the theme the page is not in.
- A page per component with its full props table, a getting-started guide covering the peer dependencies and both stylesheet paths, and a component index.

### Testing

- Every component carries its own tests, run in a real browser rather than a DOM emulator — Material UI measures real layout, and a composition cannot be simulated by a synthetic helper. The suite drives genuine `compositionstart` / `compositionupdate` / `compositionend` events through the field and asserts on what the element is actually showing.
- CI runs them across Chromium, Firefox and WebKit on Ubuntu, Windows and macOS, alongside lint, formatting and three separate typecheck passes for `src/`, `test/` and `docs/`.
