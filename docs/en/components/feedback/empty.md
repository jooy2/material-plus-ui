---
title: MPEmpty
order: 2
---

# MPEmpty

<p class="mp-lede">What stands where content would have been: a glyph, a headline, a sentence and a way out. It is the other half of <a href="./skeleton">MPSkeleton</a> — that is the shape of something on its way, this is the shape of something that is not coming.</p>

<Demo src="empty/hero" :minHeight="280" />

::: fw react

```tsx
import { MPEmpty, MPButton } from 'material-plus-ui';

<MPEmpty title="No results for “oklch”" action={<MPButton size="sm">Clear filters</MPButton>}>
  Nothing in this repository matches that.
</MPEmpty>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPEmpty(
  title: const Text('No results for “oklch”'),
  action: MPButton(size: MPSize.sm, onPressed: clear, child: const Text('Clear filters')),
  child: const Text('Nothing in this repository matches that.'),
);
```

:::

## Props

<PropsTable name="MPEmpty" />

::: fw react

Every native `<div>` attribute passes through, and a `ref` reaches the root.

:::

## The headline has a default, and that is deliberate

It is the only text in the library a component invents at full size. It is defaulted rather than required for one reason: the version that says nothing useful is the version that gets shipped.

`Nothing here` is a floor, and every slot above it — the glyph, the sentence, the action — is there to be filled with what is actually missing. A search with no matches, an inbox nobody has written to and a folder before the first file are three different things, and only the caller knows which one this is.

<Demo src="empty/slots" :minHeight="720">

::: fw react

<<< @/.vitepress/demos/empty/slots.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/empty/slots.dart

:::

</Demo>

`title={false}`, or `showTitle: false` in Flutter, drops it entirely, for a state that is a glyph and a sentence with no heading over them. The sentence then _is_ the state, and stays reading text rather than dropping to `on-surface-variant`.

## The tray, and why it is a tray

It has to sit over every _reason_ a thing is empty. A folder, a magnifying glass and a document each name one — nothing filed, nothing found, nothing written — and this component is used for all three.

::: fw react

```tsx
<MPEmpty />                                 // the tray
<MPEmpty icon={false} />                    // nothing
<MPEmpty icon={<MyIllustration />} />       // yours
```

The glyph is sized in `em` rather than as a box, so whatever the caller hands over is measured against the type around it and an icon from another set lands at the same weight as ours.

:::

::: fw flutter

```dart
const MPEmpty();                            // the tray
const MPEmpty(showIcon: false);             // nothing
const MPEmpty(icon: MyIllustration());      // yours
```

The glyph slot sets an `IconTheme` at the state's glyph size, 36 at `md`, in `onSurfaceVariant`, so an `Icon` from any set lands at the same size and ink as the tray. A picture keeps whatever size it was given.

:::

## `variant` defaults to `text`

Here and nowhere else in the library. An empty state is nearly always already inside something — a card's body, a table below its header, a panel — and a second rectangle drawn inside the first is one rectangle too many. The other four are for the case where it is not.

Whichever it is, the sheet stays **neutral**. `action` is somebody else's button and it arrived with its own colours.

## There is no `color`

Deliberately absent, where nearly every other component here has one. An empty state in the accent colour is making a claim about content that does not exist. The way to say "this is a problem" is a `color="error"` button in `action` — which is the thing that can actually be pressed about it.

## It announces itself

A list that empties under the reader has to say so, and it has no other way to: nothing was removed from the page, something was **added** to it.

::: fw react

`role="status"` announces rather than interrupts, because "no results" is the answer to a question that was just asked. Pass `role={undefined}` to turn it off for a state that is simply part of the page on arrival.

:::

::: fw flutter

The state is a polite live region, so it announces rather than interrupts, because "no results" is the answer to a question that was just asked. Pass `liveRegion: false` to turn it off for a state that is simply part of the screen on arrival.

:::

::: fw react

## `render`

The most useful case is a table cell:

```tsx
<tr>
  <MPEmpty render={<td colSpan={5} />} title="No builds yet" />
</tr>
```

[MPTable](../display/table)'s `empty` prop takes the whole component, which is usually easier.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `children` | `child` | Flutter's name. |
| `title={false}`, `icon={false}` | `showTitle: false`, `showIcon: false` | Dart has no value that is neither `null` nor a widget. |
| `action` takes a fragment of buttons and wraps them | `action` takes one widget | Pass a `Wrap` with `alignment: WrapAlignment.center` and a spacing of 8 for a set that should wrap together. |
| `role={undefined}` | `liveRegion: false` | There is no role attribute to clear; the live region is the part that announces. |
| `render` | — | There is no element to swap. A table cell is whatever widget the state is put in. |
| `transition` | — | An entrance is an `MPAnimateFade` or one of its siblings round the state. |
| `className`, `style`, native attributes | — | There is nothing to pass them through to. |

:::

## See also

- [MPSkeleton](./skeleton) — the other half.
- [MPTable](../display/table) — where `empty` takes one of these.
