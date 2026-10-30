---
title: MPPill
order: 13
---

# MPPill

<p class="mp-lede">A floating lozenge holding a small amount of live information — a call in progress, an upload that is still going, a recording, a train two minutes away.</p>

<Demo src="pill/hero" :minHeight="200" />

::: fw react

```tsx
import { MPPill } from 'material-plus-ui';

<MPPill
  title="On a call"
  description="04:12"
  expanded={expanded}
  onClick={() => setExpanded(!expanded)}
  details="Ada, Grace and two others."
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPill(
  title: const Text('On a call'),
  description: const Text('04:12'),
  expanded: expanded,
  onPressed: () => setState(() => expanded = !expanded),
  details: const Text('Ada, Grace and two others.'),
);
```

:::

## Props

<PropsTable name="MPPill" />

## This is not in the specification

MD3 does not describe this shape, and the library ships it for the reason it ships [MPProgressBox](../feedback/progress-box): there is a real thing here that the specification's own parts can draw, and no component in the set draws it.

What it is _for_ is the state a page has that is not about any one control. A [snackbar](../feedback/snackbar) says something happened and leaves; an [alert](../feedback/alert) belongs to the flow of the page; a [badge](./badge) counts something on a control. A pill is none of those: it is a thing that is **still going on**, and it stays until it stops.

## The shape, and the one house rule it bends

A collapsed pill is a stadium — `corner-full`, which every other sheet in this library is deliberately held back from.

That is allowed here for the same reason the rule exists. A radius in Material says what kind of object something is, and this is not a sheet lying on the page: it is an object hovering over it, and an object hovering over the page should not look like it was cut from the same material.

Opening `details` moves the corner to `corner-extra-large`, and the move is transitioned. That is not decoration either — `corner-full` on a box that has grown to six lines is a corner a third of its height, which eats the first two words of every line. The pill morphs from a lozenge into a rounded rectangle with the loudest corner the sheet ladder has, which is the shape it should have had all along at that size.

Both numbers are tokens, so a page that has moved its shape scale moves these with it: [`data-mp-shape`](../../guide/getting-started#shape) in React, `MPTheme(shapes: …)` in Flutter.

## Every variant carries a shadow

<Demo src="pill/variants" :minHeight="140">

::: fw react

<<< @/.vitepress/demos/pill/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/pill/variants.dart

:::

</Demo>

That is not the `elevated` rung leaking into the others. Height is part of what this shape **is** — a lozenge floating flat on the content it is floating over reads as a mistake — so what `elevated` adds here is the neutral surface, not the lift.

`variant` is the **control** ladder rather than the container one, because a pill is the thing being coloured: `filled` takes the accent under its own ink, exactly as it does on a [button](../inputs/button) or a [chip](./chip).

## details, and why the height is observed

::: fw react

`details` is revealed by animating a measured height, the way an [accordion](../layout/accordion) panel is — but the measurement is a `ResizeObserver` rather than a one-shot one.

Live information is the kind of content that changes while it is on screen. A pill whose details grew after they opened would otherwise be clipped at the height they had when they arrived.

While it is closed the panel is `inert`, which takes its content out of the tab order, off the accessibility tree and out of the page's text selection in one attribute. `aria-hidden` alone would leave a keyboard reader tabbing into a link their screen reader has been told is not there.

:::

::: fw flutter

`details` is revealed by folding its height open over `short4`, the way an [accordion](../layout/accordion) panel is. The fold is a fraction of whatever height the details have, so details that grow after they open grow with it rather than being clipped.

While it is closed the panel is out of the focus order and out of the semantics tree, so a keyboard reader cannot tab into something they cannot see.

:::

## Examples

::: fw react

### position

`static` by default. `sticky` holds it against an edge of its scroll container; `fixed` pins it to the viewport and centres it, which is the arrangement this shape exists for:

```tsx
<MPPill position="fixed" side="bottom" title="Recording" description="00:42" />
```

Centred with `mx-auto` on a box stretched across the viewport, rather than by translating it half its own width — auto margins are direction-agnostic, so the lozenge stays centred under RTL, and nothing about the surface is transformed.

### onClick and endIcon

Passing `onClick` makes the **middle** a real `<button>`; `endIcon` stays outside it, so it can hold a control of its own:

```tsx
<MPPill
  title="On a call"
  onClick={expand}
  endIcon={<MPIconButton size="xs" variant="text" icon={…} label="Hang up" />}
/>
```

That is the shape [MPChip](./chip) uses, for the same two reasons: a `<div>` carrying a click handler is invisible to a keyboard, and a `<button>` inside a `<button>` is markup the browser rewrites on parse.

:::

::: fw flutter

### Where it sits

Where a pill floats is the layout's decision, so there is no `position`. Lay it over the page in a `Stack` with a `Positioned`, or in an `Overlay` entry, and centre it with an `Align`, which is direction-agnostic in the same way auto margins are:

```dart
Stack(children: <Widget>[
  page,
  const Positioned(
    left: 0,
    right: 0,
    bottom: 12,
    child: Center(child: MPPill(title: Text('Recording'), description: Text('00:42'))),
  ),
])
```

### onPressed and endIcon

Passing `onPressed` makes the **middle** a button, one focus stop activated by pointer, <kbd>Enter</kbd> or <kbd>Space</kbd>; `endIcon` stays outside it, so it can hold a control of its own:

```dart
MPPill(
  title: const Text('On a call'),
  onPressed: expand,
  endIcon: MPIconButton(
    size: MPSize.xs,
    variant: MPVariant.text,
    icon: const MPIcon(icon: CloseGlyph()),
    label: 'Hang up',
    onPressed: hangUp,
  ),
)
```

That is the shape [MPChip](./chip) uses: a press on `endIcon` reaches the control there and not the middle.

:::

### children

Anything the middle needs that `title` and `description` cannot say — a pair of small readouts, a live counter, a progress indicator. It is rendered under them, in the same centred column.

## Accessibility

::: fw react

- The pressable part is a real `<button>` with the pill's own text as its name, and it takes Material's state layer rather than a second background.
- The focus ring traces the lozenge's own corners, because the button's radius is `inherit`.
- A closed `details` panel is `inert`, so nothing inside it is tabbable while it is invisible.

:::

::: fw flutter

- The pressable part is one button node with the pill's own text as its name, which says whether `details` are showing, and it takes Material's state layer rather than a second background.
- The focus ring is drawn just inside the lozenge's own corners.
- A closed `details` panel is excluded from focus and from the semantics tree.

:::

- A floating pill is not a live region. If the information in it is worth announcing when it changes, put the announcement in `children` — or say it with a [snackbar](../feedback/snackbar), which is the component for a message.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `position`, `side` | — | Sticky and fixed are CSS positioning. A `Stack` with a `Positioned`, or an `Overlay`, says the same. |
| `onClick` | `onPressed` | Flutter's name. |
| a measured, observed height | a fold of the details' own height | Flutter lays the details out at their own height every frame, so there is nothing to observe. |
| `inert` while closed | `ExcludeFocus` and `ExcludeSemantics` | The two halves of what `inert` does. |
| `children` | `child` | Flutter's name. |
| `className`, `style`, `ref` | — | There is no class list, style attribute or element to pass through. |

:::

## See also

- [MPChip](./chip) — for a token in a row of them, rather than one object floating over the page.
- [MPSnackbar](../feedback/snackbar) — for something that happened, rather than something still happening.
- [MPBadge](./badge) — for a count on a control.
