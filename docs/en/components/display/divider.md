---
title: MPDivider
order: 3
---

# MPDivider

<p class="mp-lede">A rule between two things. With no children it is a real <code>role="separator"</code> and nothing else; with children the line breaks around the label.</p>

<Demo src="divider/hero" />

```tsx
import { MPDivider } from 'material-plus-ui';

<MPDivider />
<MPDivider>OR</MPDivider>
<MPDivider orientation="vertical" />;
```

## Props

<PropsTable name="MPDivider" />

Every native `<div>` attribute passes through, and a `ref` reaches the root.

## `color` has no default, and that is the specification

MD3 gives a divider exactly one colour, `outline-variant`, and it is not an accent at all. It is the quietest line in the token sheet — quieter than `outline`, which is the edge of a _control_ — because a divider's job is to separate two things without becoming a third.

So left unset the rule is `outline-variant`, which is the Material divider. Setting `color` tints it, for the case where the line is carrying meaning rather than structure.

```tsx
<MPDivider />                 // outline-variant — the Material divider
<MPDivider color="error" />   // the accent, for a line that means something
```

## The rule adds no layout

The line is a single border edge on a box with no thickness of its own, so a divider never adds a pixel beyond the rule. That is also why `thickness` is a custom property rather than a `border-2`: a labelled divider draws the rule three times — the root and the two stubs either side of the label — and one property is what keeps all three the same.

## `length`, not `width`

A divider is the one component whose long axis turns with `orientation`, so a `width` that meant height half the time would be a worse name than a longer one.

Left out, a horizontal divider is the full width of its container and a vertical one stretches to the flex row it is in — which is what a rule between two things should already do.

```tsx
<MPDivider length={200} />                        // 200px wide
<MPDivider orientation="vertical" length="4rem" /> // 4rem tall
```

## Examples

### children

A label set into the line. `textAlign` decides where it sits: `center` splits the rule in half, while `start` and `end` leave a short stub on the near side so the label still reads as set _into_ the rule rather than floating above it.

<Demo src="divider/labels">

<<< @/.vitepress/demos/divider/labels.tsx

</Demo>

## Accessibility

`separator` is not a name-from-content role, so a visible label does **not** become the accessible name on its own — a screen reader would announce a bare "separator" and read the word "OR" as loose text somewhere nearby. A string label is therefore copied into `aria-label`.

Anything richer is left alone: only the caller knows which part of it is the name.

```tsx
<MPDivider>OR</MPDivider>                    // named "OR"
<MPDivider><Logo /> OR <Logo /></MPDivider>  // unnamed — say so yourself
```

## No variant, no elevation

A divider is not a surface. It has no container to paint, so four of the five variants would have nothing to say and the fifth would be the line it already is.

## See also

- [MPList](./list) — `dividers` draws this same rule between rows.
- [Colour](../../design/color) — where `outline-variant` comes from.
