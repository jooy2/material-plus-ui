---
title: MPPanes
order: 2
---

# MPPanes

<p class="mp-lede">A set of panes with draggable handles between them. The split is described in fractions, so it survives the window being resized without a single line of JavaScript running.</p>

<Demo src="panes/hero" :minHeight="260" />

::: fw react

```tsx
import { MPPane, MPPanes } from 'material-plus-ui';

<MPPanes>
  <MPPane defaultSize="240px" minSize="160px" maxSize="50%">
    <Sidebar />
  </MPPane>
  <MPPane>
    <Body />
  </MPPane>
</MPPanes>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPanes(
  children: <MPPane>[
    MPPane(
      defaultSize: const MPPaneSize.pixels(240),
      minSize: const MPPaneSize.pixels(160),
      maxSize: const MPPaneSize.percent(50),
      child: sidebar,
    ),
    MPPane(child: body),
  ],
);
```

:::

## Props

<PropsTable name="MPPanes" />

### MPPane

<PropsTable name="MPPane" />

::: fw react

## Fractions, and what follows from them

Every pane is sized as `flex-basis: calc((100% - gutters) * fraction)`. That is the one decision the rest of the component follows from.

A split described in percentages keeps its meaning when the container changes size, so the component **measures itself exactly twice**: once on mount, to turn a `'240px'` default into a fraction, and once at the start of each drag, to know what a pixel of pointer movement is worth. Resizing the window afterwards costs nothing at all — the browser recomputes the `calc()` and no React renders.

The measurement is a `ResizeObserver` rather than a single read, because a split inside a closed disclosure or an unselected tab is zero wide when it mounts, and dividing by that would put every pane at nothing.

:::

::: fw flutter

## Sized in fractions

Every pane is sized as a fraction of what is left once the handles have taken their tracks, and the rest of the widget follows from that. A split described in fractions keeps its meaning when the space changes size. The split is laid out inside a `LayoutBuilder`, which is handed the extent on every layout, so a `MPPaneSize.pixels(240)` default is turned into a fraction against whatever room there is and there is nothing to observe. A split inside a closed panel lays its panes out evenly until it has a width, rather than dividing by nothing.

:::

::: fw react

## Why sizes are numbers _or_ strings

A bare number is a **percentage**. That is what a split is usually described in, and a percentage keeps its meaning when the window changes size.

A string is an **absolute length** — `'240px'`, `'15rem'`, `'20%'`. That is what a sidebar with a minimum actually needs: "at least 200 pixels" does not survive being written down as a fraction of a width nobody knows yet.

A string in a unit this does not read resolves to _no constraint_ rather than to zero. A typo should leave a pane unbounded, not pin it shut.

:::

::: fw flutter

## A percentage or a length

`MPPaneSize.percent(30)` is a share, which is what a split is usually described in and keeps its meaning when the window changes size. `MPPaneSize.pixels(240)` is a length, which is what a sidebar with a minimum needs: "at least 200 pixels" does not survive being written down as a fraction of a width nobody knows yet. Two constructors, because the React `number | string` is a union Dart has no word for.

:::

## What it does not draw

No surface, on either half.

A split is layout, and the moment a pane drew a sheet it would stop being usable as the thing a table, a card or an editor is put _inside_. The accent family reaches exactly three marks, because those are the only marks this component makes: the hairline, the wash under a hovered handle, and the focus ring.

<Demo src="panes/nested" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/panes/nested.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/panes/nested.dart

:::

</Demo>

## Why the handle is wider than the line

A visible line one pixel wide is a target one pixel wide, which is not a target.

MD3 asks for 48dp of touch target and a splitter cannot have that without becoming a gutter, so this is the compromise every implementation makes: the handle is a track several pixels across with the hairline drawn down the middle of it — the same split a scrollbar makes between what is drawn and what can be grabbed. `size` sets the track.

The hairline changes colour and nothing else. The track it sits in has a fixed width, so nothing either side of it moves when the pointer arrives.

::: fw react

## Why there is no Base UI primitive under this

There is nothing to delegate.

A splitter's behaviour is a pointer capture and a clamp. Its accessibility is one ARIA role — `separator` with a value, which is the window-splitter pattern — carried by an element the component has to own anyway because it draws it. What Base UI is here for is the things that are genuinely hard and invisible when they work: a focus trap, a positioner, a typeahead. A rail between two boxes is not one of them.

:::

## Examples

### orientation

`horizontal` puts the panes side by side with upright handles between them; `vertical` stacks them. The arrow keys follow: ← → on a horizontal split, ↑ ↓ on a vertical one.

### resizable

For a split that is a layout rather than a control. The handles keep their hairline, lose their cursor and their hover state, and leave the tab order.

::: fw react

```tsx
<MPPanes resizable={false}>…</MPPanes>
```

:::

::: fw flutter

```dart
MPPanes(resizable: false, children: panes)
```

:::

### onResize and onResizeEnd

Both report every pane's share in **percent**, in the order the panes are drawn — never pixels, because pixels are only true for the width the split happened to have at that moment.

`onResize` fires continuously through a drag; `onResizeEnd` fires once when it is let go, and is the one to persist. An arrow key is a whole gesture on its own, so it fires `onResizeEnd` too.

::: fw react

```tsx
<MPPanes onResizeEnd={(sizes) => localStorage.setItem('split', JSON.stringify(sizes))}>…</MPPanes>
```

:::

::: fw flutter

```dart
MPPanes(onResizeEnd: (List<double> sizes) => preferences.saveSplit(sizes), children: panes)
```

:::

::: fw react

### The children have to be panes

The constraints are read off the direct children's props, so an `MPPane` wrapped in something else is a pane with no minimum. Anything that is not a pane is still laid out — it simply has no share of its own and no handle beside it.

:::

::: fw flutter

### The children are panes

`children` is a list of `MPPane`, so the type says what the React page has to: every child of a split is a pane, and the split reads each one's sizes.

:::

## Accessibility

::: fw react

- Each handle is `role="separator"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` — the window-splitter pattern — and `aria-orientation` set to the orientation of the **separator**, which is the opposite of the split's.
- Arrow keys move a handle 16 pixels at a time and honour the same bounds a drag does. `Home` and `End` go straight to the ends of that boundary's travel — without them, reaching a floor four hundred pixels away is twenty-five presses.
- `aria-controls` names the pane the value is about. `aria-valuenow` is that pane's share, so without it a screen reader reads a percentage with nothing to attach it to.
- A press does not put the focus ring on the handle. The browser focuses it on `pointerdown` by itself and knows a press is not a keystroke; the component takes the page's text selection away for the length of the drag rather than calling `preventDefault`, which would have broken that.
- A drag under RTL moves the boundary the way the pointer went rather than the way the axis is numbered.

:::

::: fw flutter

- Flutter's semantics have no `separator` role, so each handle is what it is to a screen reader: a slider whose value is the share of the pane before it, which a screen reader's increase and decrease gestures move by one key step. Give the split a `semanticLabel` to name the handles.
- Arrow keys along the handle's travel move it 16 pixels at a time and honour the same bounds a drag does; the arrows across its travel are left to the focus system. `Home` and `End` go straight to the ends of that boundary's travel.
- A press does not put the focus ring on the handle; only a focus that arrived from the keyboard does.
- A drag under right-to-left text moves the boundary the way the pointer went rather than the way the axis is numbered.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `defaultSize="240px"`, a bare number as a percentage | `MPPaneSize.pixels(240)`, `MPPaneSize.percent(30)` | Dart has no union of a number and a string. There are no `rem` lengths here. |
| measured with a `ResizeObserver` | laid out in a `LayoutBuilder` | The extent arrives on every layout, so there is nothing to observe. |
| `role="separator"` with `aria-valuenow` | a slider with a value | Flutter's semantics have no separator role. |
| `aria-label` on the root | `semanticLabel`, naming each handle | There is no root element to label. |

:::

## See also

- [MPDivider](../display/divider) — a rule between two things that do not move.
- [MPAspectRatio](./aspect-ratio) — the other layout component here, for a box that holds a proportion.
