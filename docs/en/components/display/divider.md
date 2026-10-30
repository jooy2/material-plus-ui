---
title: MPDivider
order: 3
---

# MPDivider

<p class="mp-lede">A rule between two things. With no label it is the line and nothing else; with a label the line breaks around it.</p>

<Demo src="divider/hero" />

::: fw react

```tsx
import { MPDivider } from 'material-plus-ui';

<MPDivider />
<MPDivider>OR</MPDivider>
<MPDivider orientation="vertical" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPDivider();
const MPDivider(child: Text('OR'));
const MPDivider(orientation: MPOrientation.vertical);
```

:::

## Props

<PropsTable name="MPDivider" />

::: fw react

Every native `<div>` attribute passes through, and a `ref` reaches the root.

:::

## `color` has no default, and that is the specification

MD3 gives a divider exactly one colour, `outline-variant`, and it is not an accent at all. It is the quietest line in the token sheet — quieter than `outline`, which is the edge of a _control_ — because a divider's job is to separate two things without becoming a third.

So left unset the rule is `outline-variant`, which is the Material divider. Setting `color` tints it, for the case where the line is carrying meaning rather than structure.

::: fw react

```tsx
<MPDivider />                 // outline-variant — the Material divider
<MPDivider color="error" />   // the accent, for a line that means something
```

:::

::: fw flutter

```dart
const MPDivider()                      // outlineVariant — the Material divider
const MPDivider(color: MPColor.error)  // the accent, for a line that means something
```

:::

## The rule adds no layout

::: fw react

The line is a single border edge on a box with no thickness of its own, so a divider never adds a pixel beyond the rule. That is also why `thickness` is a custom property rather than a `border-2`: a labelled divider draws the rule three times — the root and the two stubs either side of the label — and one property is what keeps all three the same.

:::

::: fw flutter

A horizontal divider is exactly `thickness` tall and a vertical one exactly `thickness` wide, so it adds nothing beyond the rule. A labelled divider draws the rule twice, once either side of the label, at the same thickness.

:::

## `length`, not `width`

A divider is the one component whose long axis turns with `orientation`, so a `width` that meant height half the time would be a worse name than a longer one.

Left out, a horizontal divider is the full width of its container and a vertical one stretches to the flex row it is in — which is what a rule between two things should already do.

::: fw react

```tsx
<MPDivider length={200} />                        // 200px wide
<MPDivider orientation="vertical" length="4rem" /> // 4rem tall
```

:::

::: fw flutter

```dart
const MPDivider(length: 200)                                     // 200 wide
const MPDivider(orientation: MPOrientation.vertical, length: 64) // 64 tall
```

A vertical divider takes the height its `Row` gives it. A `Row` with no height of its own gives it none to take, so give the row a height, wrap it in an `IntrinsicHeight`, or give the divider a `length`.

:::

## Examples

### children

A label set into the line. `textAlign` decides where it sits: `center` splits the rule in half, while `start` and `end` leave a short stub on the near side so the label still reads as set _into_ the rule rather than floating above it.

<Demo src="divider/labels">

::: fw react

<<< @/.vitepress/demos/divider/labels.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/divider/labels.dart

:::

</Demo>

## Accessibility

::: fw react

`separator` is not a name-from-content role, so a visible label does **not** become the accessible name on its own — a screen reader would announce a bare "separator" and read the word "OR" as loose text somewhere nearby. A string label is therefore copied into `aria-label`.

Anything richer is left alone: only the caller knows which part of it is the name.

```tsx
<MPDivider>OR</MPDivider>                    // named "OR"
<MPDivider><Logo /> OR <Logo /></MPDivider>  // unnamed — say so yourself
```

:::

::: fw flutter

Flutter has no separator role. A divider with a `Text` label is one node named by that label, read once; a divider with a richer label takes its name from `semanticLabel`; and a divider with neither is decoration, left out of the semantics tree.

```dart
const MPDivider(child: Text('OR'))                                // named "OR"
const MPDivider(semanticLabel: 'OR', child: Row(children: <Widget>[Logo(), Text(' OR '), Logo()]))
```

:::

## No variant, no elevation

A divider is not a surface. It has no container to paint, so four of the five variants would have nothing to say and the fifth would be the line it already is.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `role="separator"` | no role | Flutter has no separator role. A named divider is a labelled node; an unnamed one is left out. |
| a string label as `aria-label` | `semanticLabel` | Defaults to the label when it is a `Text`, and is the way to name a divider with a richer label. |
| `length`, `thickness` as CSS lengths | `double` | There are no CSS lengths. |
| `children` | `child` | Flutter's name. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPList](./list) — `dividers` draws this same rule between rows.
- [Colour](../../design/color) — where `outline-variant` comes from.
