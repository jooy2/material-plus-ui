---
title: Browser support
order: 2
---

# Browser support

<p class="mp-lede">Material Plus runs in <strong>Chrome and Edge 111, Firefox 113 and Safari 16.4</strong> and every later version, on desktop and mobile. The engines behind those versions were run against every demo on this site. In the older ones a few effects are reduced, and the table further down lists each of them.</p>

## The floor

| Browser                      | Minimum | Released   |
| ---------------------------- | ------- | ---------- |
| Chrome, Chrome for Android   | 111     | March 2023 |
| Edge                         | 111     | March 2023 |
| Firefox, Firefox for Android | 113     | May 2023   |
| Safari, Safari on iOS        | 16.4    | March 2023 |
| Samsung Internet             | 22      | July 2023  |

Both installation paths have the same floor: `material-plus-ui/styles.css` and `material-plus-ui/tailwind.css` ship the same token sheet.

## What sets it

| Requirement | Chrome, Edge | Firefox | Safari | What depends on it |
| --- | --- | --- | --- | --- |
| Base UI 1 | 111 | 113 | 16.4 | Focus, keyboard and popup behaviour, from Base UI's own browser list |
| `oklch()` colours | 111 | 113 | 15.4 | Every colour token, including the fallback roles described below |
| `@layer` | 99 | 97 | 15.4 | The cascade layer the tokens sit in |
| The package's JavaScript | 85 | 79 | 14.1 | Syntax up to ES2021, shipped untranspiled |

The floor is the highest number in each column. React 18 and 19 need nothing newer than the last row.

Tailwind CSS v4 names Firefox 128 as its own floor, because it relies on registered custom properties. It ships fallbacks for the utilities that use them, and the demos render in Firefox 113 with only the differences listed in the next section.

Below the floor the library is not supported. In a browser older than Chrome 111, Firefox 113 or Safari 15.4 the colour tokens are not drawn at all, because they are `oklch()` colours.

## What is reduced in older versions

Everything on this list keeps working. It looks or moves differently, and only in the versions named.

| Feature | Reduced in | What happens there |
| --- | --- | --- |
| Theming from `--mp-source-color` | Chrome and Edge before 119, Firefox before 128, Safari before 18 | The default scheme is drawn, light or dark. A role set through `--mp-sys-color-*` still applies |
| Counting in [`MPAnimateCounter`](./components/motion/animate-counter) | Firefox before 128 | The number jumps to its value instead of counting up to it |
| The travelling light in [`MPAnimateLighting`](./components/motion/animate-lighting) | Firefox before 128, Safari 16.4 | The glow is drawn but does not travel |
| The focus ring in [`MPRating`](./components/inputs/rating) | Firefox before 121 | A star clicked with a pointer is ringed too, not only one reached from the keyboard |
| Splitting text into letters and words for the text effects | Firefox before 125 | Text splits on code points and on spaces, so a combined emoji comes apart and a sentence with no spaces counts as one word |
| The quieter description in [`MPPill`](./components/display/pill) | Safari before 17 | The description is drawn in the title's colour |
| Scroll-driven animations, `timeline="view"` on the [Animate components](./components/motion/animate-fade#scrolling-is-a-clock) | Chrome and Edge before 115, Firefox, Safari before 26 | The effect plays once on the clock |
| Week information in `Intl.Locale` | Firefox before 153 | The calendars start the week on Sunday unless `weekStartsOn` is set |

## How the colour roles reach older browsers

A role such as `primary` is not a fixed colour. It is computed in the browser, on each element, from whatever `--mp-source-color` is in scope there:

```css
oklch(from var(--mp-source-color) var(--tone) var(--chroma) h)
```

That is what lets one `--mp-source-color` on a section retheme that section, or change at runtime from an inline style. [Colour](./design/color#how-a-role-is-derived) explains the derivation, and [Inside sRGB](./design/color#inside-srgb) how the accent and error roles are kept inside the gamut. That second step puts `clamp()` and `min()` on the channels of a relative colour, and those are the newest things the stylesheet depends on. So it writes the whole default scheme out a second time, as plain colours, for the browsers without them: Chrome and Edge before 119, Firefox before 128 and Safari before 18. Safari 16.4 to 17.6 have relative colour syntax from an earlier draft of the specification, which accepts neither.

In those browsers the colours are the default scheme's, light or dark, and a `--mp-source-color` of your own changes nothing, because reading a hue out of a colour is what they cannot do. A browser with the current syntax skips that copy. Chrome and Edge 119 to 121 have it according to MDN's data, but they do not start on the macOS the measurements were taken on, so they were not run.

### Theming in the older browsers

A role you set yourself wins in every browser, because each role reads `--mp-sys-color-*` first and Material Web's `--md-sys-color-*` second, before any derivation or fallback:

```css
:root {
  --mp-sys-color-primary: #00639b;
  --mp-sys-color-on-primary: #ffffff;
  /* …and the other roles you want to change */
}
```

A brand that has to appear in Chrome 111 to 118, Firefox 113 to 127 or Safari 16.4 to 17.6 therefore sets its roles this way, once for each scheme it uses. [A single role](./design/color#a-single-role) lists the variables.

## How these numbers were found

Every demo on this site was rendered in one page, each behind its own error boundary, and the page was opened in Playwright's builds of Chromium 111, Firefox 113, 127 and 128, and WebKit 16.4, 17.4 and 18.0, and in Chrome for Testing 122. In each one the run checked for render and page errors and compared all 29 colour roles in both schemes with a current Chromium. In the three oldest it also opened nine popups, from a select to a command palette, and the counter, the lighting effect and the rating's focus ring were checked in the versions the table names. The WebKit builds are Playwright's builds of the engine at the Safari version they are named for, not Safari itself.

Versions between those were not run. For them, and for the version each requirement and feature above was introduced in, the numbers come from [MDN's browser compatibility data](https://github.com/mdn/browser-compat-data) and from what Base UI and Tailwind CSS publish for themselves. The test suite itself runs in the current releases of Chromium, Firefox and WebKit on Linux, Windows and macOS.

## Next

- [Colour](./design/color) — how the roles are derived, and how to set one yourself.
- [Getting started](./guide/getting-started) — installation and setup.
- [Changelog](./changelog) — what changed in each release.
