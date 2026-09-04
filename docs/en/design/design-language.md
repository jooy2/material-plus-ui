---
title: Design language
order: 0
---

# Design language

<p class="mp-lede">Material Plus implements the Material Design specification rather than wrapping somebody's implementation of it. That one decision is where almost everything on this page comes from — the words the props use, the values the tokens hold, and the four places the library knowingly goes past what the spec says.</p>

The rule is: **where the spec has a word, use the spec's word.** A colour role is `primary` or `on-surface-variant`, a corner is `extra-small`, a type role is `body-large`, a density step is `-1`. They are not Material UI's words: MUI's palette is `main`/`light`/`dark`/`contrastText`, which is a different and earlier colour model, and borrowing those names would describe a system this library does not implement.

## The surface

Everything here is drawn on one of Material's neutral surface roles, and never on an accent.

That sounds like a small thing and it decides the look of the whole library. A container holds **somebody else's** content, and that content arrives with its own colours — body text, links, fields, buttons. On an accent fill, every one of them would need an on-accent treatment of its own. So a container's `variant` ladder runs up the neutral roles instead, and the loudest it goes is `surface-container-highest`, which is the specification's own filled card:

| `variant`  | What a container paints                         |
| ---------- | ----------------------------------------------- |
| `filled`   | `surface-container-highest`                     |
| `tonal`    | `surface-container`                             |
| `elevated` | `surface-container-low`, under a level-1 shadow |
| `outlined` | nothing, plus a hairline in `outline-variant`   |
| `text`     | nothing at all                                  |

The same five words mean something different on a component that **is** the thing being coloured — a button, a chip, a badge — where `filled` is the accent under its own ink. That is not an inconsistency, it is the distinction: `filled` is a statement about emphasis, and what it paints depends on whether the component is the subject or the stage.

## Colour is a role, never a value

The scheme is generated from **one source colour**, the way Material generates one. Set `--mp-source-color` and every role follows. No provider, no theme object, no re-render — it is CSS, so a section of a page can differ from the rest of it without either knowing.

That is why `color` takes a family rather than a colour, and why there are four of them: `primary`, `secondary`, `tertiary`, `error`. MD3's colour system has no `success`, `info` or `warning`, and offering them would promise roles the token sheet has no way to derive. An alert that needs green sets a token; it does not get a fifth family that the rest of the library cannot honour.

See [Colour](./color.md) for the roles and how to move one.

## Size is the one place this goes past the spec

Material defines a single size per component. A text field is 56dp, full stop — because it is describing a design system for whole products, where one height per control is the point.

A component library gets used in places a design system does not plan for: a filter bar, a table's inline editor, a dense settings page, a marketing hero. Those need a ladder, and a consumer who cannot get one from the library builds it out of `!important`.

So there are five rungs and **`md` is the spec's**:

| `size` | Control height   |
| ------ | ---------------- |
| `xs`   | 32px             |
| `sm`   | 40px             |
| `md`   | 56px — MD3's own |
| `lg`   | 64px             |
| `xl`   | 72px             |

The ladder is centred rather than starting at the specification's value, and that is the whole trick: `md` is what you get by saying nothing, so nobody has to know the scale exists to be given the Material size. `xs` and `xl` sit at the edges of usable rather than merely smaller and larger — below `xs` a control stops meeting a 24px touch target — and there is no sixth step, because a ladder long enough to need one is a sign the caller wants a custom control.

## Density is a second axis, not a longer ladder

`size` picks which control this is. [`density`](./prop-conventions#density) takes room out of the one that was picked, on Material's own scale of `0` to `-3` at four pixels a step, and it takes it out of the **spacing only** — the type scale does not move.

The two cannot be collapsed into one. `size="sm"` on a list is a small list; `density={-2}` is a normal list with more of it on the screen. A dense screen wants the second: more rows, at the size they could already read. Shrinking the text to fit more of them makes them harder to read at exactly the moment there are more of them.

Only the components that hold things take it, and every step lands on a height the size ladder already has a name for — so a dense list and the button beside it still line up.

## Height moves the tone with it

An [`elevation`](./prop-conventions#elevation) is a surface role **and** a shadow, never one without the other. MD3 does not treat height as a free axis: an elevated surface is `surface-container-low` under a level-1 shadow, and the two are one decision. A prop that only cast a shadow would raise a `filled` box into a surface the specification has no name for.

Shadows are the specification's own two-shadow recipe — a tight key shadow plus a wider ambient one — rather than one blurred box. The pair is what makes a raised surface read as lit from above instead of as a sticker with a halo.

## A corner says what kind of object something is

The radius is not a size to taste. In Material it is a statement about what a thing **is**, so it does not move with `size`:

- `extra-small`, 4px — a row in a list, an option in a menu.
- `medium`, 12px — a sheet. A box and a card are `corner-medium` at every rung.
- `extra-large`, 28px — a dialog. A sheet that has taken the page is allowed to look like an object rather than like a panel.
- `full` — a pill. A button, a chip, a track.

## States are a layer, not a second colour

Hover, focus and press are a translucent wash of the **content** colour over the container: 8% hovered, 10% focused or pressed. One rule covers a filled button, an outlined one and a bare text one, and none of them names a second background.

It has to be a layer rather than a `hover:bg-…` because a background can only be replaced. Replacing one is what makes a text button's hover state opaque and an outlined button's hover state cover its own border. A layer composites, so whatever was underneath — a fill, a hairline, nothing — is still there under the wash.

## Motion is a token, and it has a direction

Every duration and curve is a custom property, so a page that wants everything a little slower sets one value. `MPEasing` takes the specification's names and no arbitrary `cubic-bezier()`, for the same reason `color` takes a family: a curve written into one component's props is a curve the theme cannot reach.

The pairs are how Material describes a transition rather than four interchangeable options. Something **arriving** decelerates into place; something **leaving** accelerates away. That asymmetry is in the defaults, so an exit is quicker than an entrance without anybody having to know the numbers.

`prefers-reduced-motion` is honoured by the components and by the stylesheet, everywhere, with no prop to set.

## It coexists

Nothing here is page-level. No reset, no provider, no global styling — and the components read the `--md-sys-color-*` tokens your page already has if they are there, so a project already running Material keeps its own setup.

This is the reason for a handful of decisions that look odd on their own. Every control writes `box-sizing` explicitly, because with no page reset an outlined box's hairline would land outside its padding and come out two pixels wider than a filled one beside it. `<ul role="list">` is said out loud, because a host reset may take the bullets off and Safari takes the list semantics with them. A table's padding is inline, because `.prose td` and `.vp-doc td` style cells by tag name at a specificity a utility cannot outrank.

A component library that assumed it owned the page would not need any of that. This one does not assume it.

## Next

- [Colour](./color.md) — the roles, and how to theme them.
- [Prop conventions](./prop-conventions.md) — the shared vocabulary, axis by axis.
- [Breakpoints](./breakpoints.md) — the window size classes everything reflows at.
