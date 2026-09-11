# TODO

What is left of the pass that took the browser's own styling off the elements the components draw. Written so the next session can pick it up without this one's context. Delete the file once the table below is empty.

## What is already done

The library ships no reset, so a component has to clear what an element arrives with on the element it owns. Two commits did that for most of the library, each with a test in `test/styles/` that measures a component against a bare element rendered in the same page:

| Commit | What it cleared | Test |
| --- | --- | --- |
| `d30b8e5` | A `<button>`'s or an `<input>`'s border, fill, padding and 13px type | `test/styles/native-controls.test.tsx` |
| `614ad79` | A `<ul>`'s or an `<ol>`'s margin, indent and markers | `test/styles/native-lists.test.tsx` |

## What is left

Four elements, in three places, still keep the browser's block margin, measured on a page with `src/standalone.css` and nothing else:

| Element | Where | What it keeps |
| --- | --- | --- |
| `MPBlockquote`'s `<blockquote>`, drawn every time | `src/components/blockquote/MPBlockquote.tsx`, the `<blockquote cite={cite}>` | `margin: 1em 40px` — 22px and 40px at `md`, so the quote sits forty pixels in from its own rule |
| `MPBlockquote`'s `<figure>`, drawn when there is an attribution | the same file, `shellClasses` | `margin: 1em 40px` |
| The supporting text under a field | `src/internal/SupportingText.tsx`, `classNames` — `Field.Description` renders a `<p>` | `margin-block: 1em`. It reaches every field-shaped component that imports it: `MPTextField`, `MPSelect`, `MPCombobox`, `MPNumberField`, `MPOtpField`, `MPCheckbox`, `MPSwitch`, `MPRadioGroup`, `MPColorPicker` and the pickers through `internal/Picker.tsx` |
| `MPRadio`'s description | `src/components/radio-group/MPRadioGroup.tsx`, the `Field.Description` inside `MPRadio` | `margin-block: 1em` — 12px above and below a 12px line |

Check `Field.Error` as well when fixing the supporting text: it is the other branch of the same `classNames`, and what element it renders was not measured.

## Why none of it shows on the documentation site

`docs/.vitepress/theme/styles/scope.css` zeroes the margin on `p`, `h1`–`h6`, `ul`, `ol`, `li`, `blockquote`, `figure`, `dl` and `dd` inside `.mp-scope`, so every preview is drawn as designed. A consumer who imports `material-plus-ui/styles.css` has no such rule, and that page is the one to measure against.

## How to fix it, and how to check

- Say `m-0` on the element the component owns, the way the two commits above did. Where a variant or a state already sets a margin on the same element, put the zero in the other branches instead, so one element never carries two margins decided by stylesheet order.
- `MPBlockquote` draws nothing on the `<blockquote>` on purpose — its comment explains that a host stylesheet styles that tag by name at a specificity a utility cannot outrank. `m-0` there is still right for a page without a reset; decide whether a host's `.prose blockquote` margin should win, and say so in the comment.
- The supporting text opens and closes through `mp-supporting-text__reveal`, a grid row that animates to nothing. Re-check that animation after the margin goes, since the margin was part of the height it was animating.
- Add a test beside the other two, in the same shape as `native-lists.test.tsx`: a bare `<p>`, `<blockquote>` and `<figure>` measured in the same page, and the margin compared in ems, because the browser's is one em of whatever size the element is set in.
- A `### Fixed` entry under `vNext` in `CHANGELOG.md`.

To look for more of the same, render every file under `docs/.vitepress/demos/` in one Vitest browser test with an error boundary around each, and flag an element whose margin, indent or marker matches a bare element's. Two things that probe missed the first time: it skipped elements with no class, which is how the `<blockquote>` above went unnoticed, and it only sees what a demo draws without being opened — a popup, a tooltip or a dialog has to be opened by hand.
