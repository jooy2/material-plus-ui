---
title: MPIconButton
order: 1
---

# MPIconButton

<p class="mp-lede">A round button with a glyph in it and nothing else. Almost all of it is <code>MPButton</code>; what it adds is the one thing that cannot be defaulted and is always missing — the name.</p>

<Demo src="icon-button/hero" :minHeight="72" />

::: fw react

```tsx
import { ICONS, MPIcon, MPIconButton } from 'material-plus-ui';

<MPIconButton icon={<MPIcon icon={ICONS.more} />} label="More actions" onClick={open} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPIconButton(icon: const MPIcon(icon: MoreGlyph()), label: 'More actions', onPressed: open);
```

:::

## Props

<PropsTable name="MPIconButton" />

## Why `label` is required

Because "an icon button with no `aria-label`" is the single most common accessibility defect a component library ships, and because every other fix fails.

A default would be a name that is right for nobody. A development warning is a thing that gets filtered out of a console on a busy project. Documentation is read by the person who already knew. A **required prop** is the only version of this that survives a code review, because the code does not compile without it.

The name is announced and never drawn — the glyph is the whole of what is on screen.

## Why there is so little here

The shape is not this component's decision. An [`MPButton`](./button) with an icon and no children already goes square, and it is already `corner-full` because a Material button has been a pill since 2021 — a square pill is a circle. MD3's icon button shape falls out of the button's own tokens with no second table to keep in step.

Everything else is the button's too, unchanged and on purpose: the five variants, the four families, the size ladder, the state layer, `loading`, and the values a surrounding [`MPButtonGroup`](./button-group) sets.

Two components drawing the same surface from two copies of one table are two components that will eventually disagree about it.

## Why the default variant differs from the button's

`MPButton` starts at `filled`. This starts at `text`, which is MD3's _standard_ icon button — a glyph with no container at all.

The specification is right about why. A labelled button is usually the one thing on a row worth pressing; an icon button is usually one of several sitting in a toolbar or a card's corner, and five filled discs in a row is a row with no emphasis left in it. Reach for `filled` when the icon button **is** the action on the screen.

<Demo src="icon-button/variants" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/icon-button/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon_button/variants.dart

:::

</Demo>

## No toggle state

MD3 also describes a _toggle_ icon button, which swaps its container and its ink when selected. This is not that, and a `selected` prop would make it half of one.

A toggle needs three things this does not have: a pressed state that survives the press, a group that can enforce one choice out of several, and a **name that changes with the state** — "Add to favourites" and "Remove from favourites" are different sentences, and a toggle that keeps one of them is a control that lies half the time.

For a set of them, that is [`MPSegmentedButton`](./segmented-button). For a single one, it is an `MPIconButton` whose `icon` and `label` both come from your own state:

::: fw react

```tsx
<MPIconButton
  variant={starred ? 'tonal' : 'text'}
  icon={<MPIcon icon={starred ? ICONS.success : ICONS.add} />}
  label={starred ? 'Remove from favourites' : 'Add to favourites'}
  aria-pressed={starred}
  onClick={() => setStarred(!starred)}
/>
```

:::

::: fw flutter

```dart
MPIconButton(
  variant: starred ? MPVariant.tonal : MPVariant.text,
  icon: MPIcon(icon: starred ? const StarGlyph() : const PlusGlyph()),
  label: starred ? 'Remove from favourites' : 'Add to favourites',
  onPressed: () => setState(() => starred = !starred),
);
```

:::

## Examples

### size

Five rungs, the same ones every control is drawn at. An icon button at `xs` is 32px square, which is the smallest this library will draw a target — below it a control stops meeting a 24px touch target.

The glyph does **not** scale with it unless you say so: `icon` is laid out exactly as a button's `startIcon` is, so pass a sized `MPIcon` when the default 24px is wrong for the rung.

### loading

The spinner takes the glyph's place, and the button keeps its footprint and its place in the tab order:

::: fw react

```tsx
<MPIconButton icon={<MPIcon icon={ICONS.upload} />} label="Upload" loading />
```

:::

::: fw flutter

```dart
MPIconButton(icon: const MPIcon(icon: UploadGlyph()), label: 'Upload', loading: true, onPressed: upload);
```

:::

Deliberately not `disabled`. A button that vanishes from the tab order the moment it is pressed takes the keyboard focus with it, and the reader is returned to the top of the document while the request they just made is still in flight.

## Accessibility

::: fw react

- `label` becomes `aria-label`, which is the button's accessible name. There is no way to render one without it.
- `disabled` uses the native attribute and leaves the tab order; `loading` uses `aria-disabled` and does not.
- The focus indicator is `secondary` and sits outside the disc, which is MD3's own rule — a ring drawn inside a filled button is a ring drawn on top of the fill it is meant to be distinguishable from.

:::

::: fw flutter

- `label` is the button's `semanticLabel`, its one name, and the glyph is left out of what is read. There is no way to build one without it: the constructor does not compile.
- `onPressed: null` and `disabled` take it out of the focus order; `loading` keeps it there and swallows the press.
- The focus indicator is `secondary` and sits outside the disc, which is MD3's own rule.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `onClick` | `onPressed` | Flutter’s name. `null` disables the button, as everywhere in Flutter. |
| `label` as `aria-label` | `label` as `semanticLabel` | The same required name, on the semantics node. |
| `aria-pressed` passed through | — | A toggle with a state is `MPToggle`; this has no state to announce. |
| `type` | — | There is no form for a button to submit. |
| `className`, `style`, `ref` | — | There is no class list, no style attribute and no element. |

:::

## See also

- [MPButton](./button) — everything this is made of.
- [MPButtonGroup](./button-group) — sets `size`, `color` and `variant` for a run of them at once.
- [MPTooltip](../feedback/tooltip) — for putting the name on screen as well as in the accessibility tree.
