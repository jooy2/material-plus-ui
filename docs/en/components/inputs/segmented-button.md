---
title: MPSegmentedButton
order: 3
---

# MPSegmentedButton

<p class="mp-lede">Two to five choices in one pill. A hairline container with the segments divided by more of the same, and the chosen one filled with `secondary-container` — Material's own colour for a control that changes what you are looking at rather than doing something.</p>

<Demo src="segmented-button/hero" :minHeight="64" />

::: fw react

```tsx
import { MPSegmentedButton } from 'material-plus-ui';

const [view, setView] = useState(['week']);

<MPSegmentedButton
  aria-label="Calendar view"
  items={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ]}
  value={view}
  onValueChange={setView}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

List<String> view = <String>['week'];

MPSegmentedButton(
  semanticLabel: 'Calendar view',
  items: const <MPSegment>[
    MPSegment(value: 'day', label: Text('Day')),
    MPSegment(value: 'week', label: Text('Week')),
    MPSegment(value: 'month', label: Text('Month')),
  ],
  value: view,
  onChanged: (List<String> next) => setState(() => view = next),
);
```

:::

## Props

<PropsTable name="MPSegmentedButton" />

::: fw flutter

### MPSegment

<PropsTable name="MPSegment" />

:::

## Why the value is always an array

Even in single-select, where it holds at most one entry.

A segmented button is genuinely the same control either way — MD3 documents one component with a multi-select option, not two — and a `value` whose **type** changed with a boolean prop would be a union every caller has to narrow before they can read it. One shape, learned once.

<Demo src="segmented-button/multiple" :minHeight="240">

::: fw react

<<< @/.vitepress/demos/segmented-button/multiple.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/segmented_button/multiple.dart

:::

</Demo>

## showCheck

A chosen segment shows a tick, and the slot is reserved whether or not anything is chosen.

That reservation is the point. A tick that appeared from nothing would push the label sideways at the exact moment the reader is looking at it, which is the one moment a control should not move. Turn it off for a set of icon-only segments, where the fill already says which one is on.

An `icon` on an item shares the same slot: it is what the segment shows until it is chosen, and the tick replaces it. So the width never changes either way.

## size

A ladder of its own, centred on MD3's 40dp the way [MPChip](../display/chip)'s is centred on its 32dp:

| `size`   | Height   |
| -------- | -------- |
| `xs`     | 32px     |
| `sm`     | 36px     |
| **`md`** | **40px** |
| `lg`     | 48px     |
| `xl`     | 56px     |

The control ladder a button walks would put the specification's segmented button at `sm` and make the default a 56px pill. `xs`, `md` and `xl` are that ladder's `xs`, `sm` and `md` exactly — height, type, padding and glyph — so a set lines up with a button or a field drawn at those rungs.

## When this is the wrong component

**At more than five segments**, use [MPSelect](../inputs/select). The labels stop fitting and the set starts wrapping, and a segmented button that has wrapped to two lines has lost the one thing it was for.

**For choosing something in a form**, use [MPRadioGroup](../inputs/radio-group). That is the control a form's value comes from, and it scales down the page rather than across it. A segmented button is for switching what a screen is showing.

## Accessibility

::: fw react

- Underneath it is Base UI's toggle group: one tab stop for the set, arrow keys inside it, and `aria-pressed` on each segment.
- Built out of plain buttons instead, a four-way switch would announce itself as four unrelated actions — three of which happen to be off.
- With no visible label, pass `aria-label`. The set needs a name; the segments only name themselves.

:::

::: fw flutter

- One focus stop for the set, with the left and right arrows moving it between segments in the writing direction and <kbd>Home</kbd> and <kbd>End</kbd> going to the ends. <kbd>Enter</kbd> and <kbd>Space</kbd> press the segment holding it.
- Each segment is a button announced as toggled on or off, which is what `aria-pressed` says on the web.
- There is no ring: the segments live inside a pill that clips, and the state layer at 10% is what shows where the keyboard is, as in the React build.
- In less room than its labels need, the set gives up width in proportion and truncates the labels rather than running off the edge.
- With no visible label, pass `semanticLabel`. The set needs a name; the segments only name themselves.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `defaultValue` | `initialValue` | `initialX` is the name Flutter gives a starting value. |
| `onValueChange` | `onChanged` | Flutter’s name for a control’s value changing. |
| `items` of plain objects | `List<MPSegment>` | A typed class in place of an object literal. |
| `aria-label` | `semanticLabel` | Flutter’s name. |
| — | `focusNode`, `autofocus` | Flutter’s focus is driven by nodes; the node moves with the stop. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPRadioGroup](../inputs/radio-group) — the same question, asked in a form.
- [MPButtonGroup](./button-group) — a run of actions rather than a choice.
- [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group) — the behaviour underneath.
