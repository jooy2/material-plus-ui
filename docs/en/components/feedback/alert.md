---
title: MPAlert
order: 1
---

# MPAlert

<p class="mp-lede">A message about something that happened, set into the page it is about. One component with different slots filled — a bare line, a line with a glyph, or a glyph with a headline and the detail under it.</p>

<Demo src="alert/hero" :minHeight="180" />

::: fw react

```tsx
import { MPAlert, MPButton } from 'material-plus-ui';

<MPAlert
  color="error"
  title="We could not charge your card"
  action={<MPButton variant="text">Retry</MPButton>}
  onClose={dismiss}
>
  The bank declined the payment. Nothing has been billed.
</MPAlert>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPAlert(
  color: MPColor.error,
  title: const Text('We could not charge your card'),
  action: MPButton(variant: MPVariant.text, onPressed: retry, child: const Text('Retry')),
  onClose: dismiss,
  child: const Text('The bank declined the payment. Nothing has been billed.'),
);
```

:::

## Props

<PropsTable name="MPAlert" />

## Why this is not a snackbar

An alert belongs to the flow of the page it interrupts. A [snackbar](./snackbar) floats over it and leaves on a timer.

That is not a styling difference, and it is the whole of how to choose between them:

- A message the reader has to **act on** must not be able to disappear before it has been read.
- A message about the page's **current state** has to still be there when they look back at it.
- If it can be missed without consequence, it is a snackbar.

An alert is also the only one of the two a reader can arrive at. A snackbar raised before the page was open is a snackbar nobody saw.

## Why the default variant is `tonal`

Every other component in this library defaults to the loudest sensible surface, and a button defaults to `filled`. An alert does not.

A container tone is MD3's own answer for a message set into a page: it separates itself from the surface without competing with the primary action that is usually sitting right beside it. A page with three saturated alerts on it has no emphasis left to spend on the thing it actually wants pressed.

<Demo src="alert/variants" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/alert/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/alert/variants.dart

:::

</Demo>

Note what changes between them. On `filled` and `tonal` the container _is_ the accent, so the glyph and the heading ride on it as one ink. On the three neutral surfaces the accent has nowhere else to go, so it is spent on exactly the two things that say which kind of alert this is — and the message stays ordinary reading text.

## Four families, not a severity ladder

There is no `info`, `success` or `warning`.

The specification's colour system does not have them, and [the token sheet](../../design/color) has no way to derive them — offering three more families would be promising roles the theme cannot produce, and an application that themed `primary` would find its "success" alerts unchanged.

What there is instead: `error`, which is the one severity Material does name, and an emphasis choice for everything else. A message that means something the palette has no word for says so with a **glyph** rather than by borrowing a colour.

<Demo src="alert/colors" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/alert/colors.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/alert/colors.dart

:::

</Demo>

## Which live region it lands in

The family decides by default, because it is the only thing that knows how urgent the message is:

| `color` | `live` | What that does |
| --- | --- | --- |
| `error` | `assertive` | Interrupts whatever a screen reader is in the middle of |
| `primary`, `secondary`, `tertiary` | `polite` | Waits for a pause |

"This failed" is worth interrupting for and "Saved" is not.

`live` overrides it, and the value worth knowing about is the third one. **A live region is for content that _arrives_.** An alert that was in the markup when the page loaded did not arrive — it is part of the page, and interrupting to read it is interrupting to say something the reader was going to reach anyway:

::: fw react

```tsx
// An error summary the server rendered. Still an alert on the screen; not an
// announcement.
<MPAlert color="error" live="off">
  Three fields need attention.
</MPAlert>
```

:::

::: fw flutter

```dart
// An error summary that was on the screen when it was built. Still an alert;
// not an announcement.
const MPAlert(
  color: MPColor.error,
  live: MPAlertLive.off,
  child: Text('Three fields need attention.'),
);
```

:::

And the other way, for a message that is quiet by family and urgent in fact:

::: fw react

```tsx
<MPAlert live="assertive">Your session ends in one minute.</MPAlert>
```

:::

::: fw flutter

```dart
const MPAlert(live: MPAlertLive.assertive, child: Text('Your session ends in one minute.'));
```

Flutter's live region has one politeness level, and it is polite. So off the web an assertive alert is announced at the next pause, as a polite one is. On the web the engine also reads a node's role, and there an assertive alert is `role="alert"`, as the React build's is. `MPAlertLive.off` is no live region on either.

:::

## Examples

### title

With a heading the alert is two-part; without one the whole thing is a single line. Under a heading the message steps back to `on-surface-variant`, the same role a field's supporting text takes — on its own it _is_ the alert, and stays reading text.

::: fw react

```tsx
<MPAlert>One line.</MPAlert>

<MPAlert title="Two parts">And the detail under it.</MPAlert>
```

:::

::: fw flutter

```dart
const MPAlert(child: Text('One line.'));

const MPAlert(title: Text('Two parts'), child: Text('And the detail under it.'));
```

:::

### icon

Defaults to the glyph that goes with `color`. Only two defaults exist because only two are honest: the error family gets the error glyph and everything else gets the informational one.

::: fw react

```tsx
<MPAlert icon={false}>No glyph at all.</MPAlert>

<MPAlert icon={<MPIcon icon={ICONS.success} size={20} />}>Something more specific.</MPAlert>
```

:::

::: fw flutter

```dart
const MPAlert(showIcon: false, child: Text('No glyph at all.'));

MPAlert(icon: MPIcon(icon: mySet.success, size: 20), child: const Text('Something more specific.'));
```

Dart has no value that is neither `null` nor a widget, so "take it away" is `showIcon: false` rather than a third value of `icon`.

:::

The glyph is centred on the **first line** of text rather than on the whole message, so a one-line alert looks centred and a three-line one still has its glyph at the top.

### action and onClose

`action` is kept out of `children` so it stays on the first line while the message wraps. `onClose` is what makes the × appear at all — there is no `dismissible` boolean, because a dismiss button with nothing to call is a button that does nothing.

::: fw react

```tsx
<MPAlert action={<MPButton variant="text">Retry</MPButton>} onClose={() => setShown(false)}>
  Upload failed.
</MPAlert>
```

:::

::: fw flutter

```dart
MPAlert(
  action: MPButton(variant: MPVariant.text, onPressed: retry, child: const Text('Retry')),
  onClose: () => setState(() => shown = false),
  child: const Text('Upload failed.'),
);
```

:::

`onClose` fires once the alert has finished leaving, not on the press. The alert sits in the flow of the page, so the press folds its height away first and everything under it closes the gap; `onClose` is the moment to stop rendering it. With reduced motion, or `MediaQuery.disableAnimations` in Flutter, it fires at once.

### locale

The × has no text of its own, so its accessible name is a word this library has to invent. It comes from `locale`, or from the nearest [`MPLocaleProvider`](../../design/localization), or from `closeLabel` when neither is right.

::: fw react

```tsx
<MPAlert locale="ko" onClose={dismiss}>
  저장했습니다.
</MPAlert>
```

:::

::: fw flutter

```dart
MPAlert(locale: 'ko', onClose: dismiss, child: const Text('저장했습니다.'));
```

:::

## Accessibility

::: fw react

- The whole alert is a live region, so a message that appears after the page has loaded is announced. See the table above for which kind.
- The × is a real button with a name, and it is the last thing in the row rather than the first, so a reader hears the message before the way out of it.
- The default glyph is decorative and hidden from the accessibility tree — the family it stands for is already in the words.

:::

::: fw flutter

- The alert is one semantics node and, unless `live` is `MPAlertLive.off`, a live region, so a message that appears after the screen is built is announced.
- The × is a button node of its own with a name, after the message, so a reader hears the message before the way out of it. <kbd>Tab</kbd> reaches it and <kbd>Enter</kbd> or <kbd>Space</kbd> presses it. The focus ring is `secondary`, drawn outside it, on keyboard focus only.
- From the press until it is gone, the alert is out of the semantics tree, the focus order and the pointer's reach, so nothing can walk into an alert that is leaving.
- The default glyph says nothing to a screen reader: the family it stands for is already in the words.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `children` | `child` | Flutter's name. |
| `icon={false}` | `showIcon: false` | Dart has no value that is neither `null` nor a widget. |
| `live`, a string | `live`, an `MPAlertLive` | The same three values. Off the web an assertive alert is announced politely, because Flutter's live region has one level. |
| `onClose(event)` | `onClose()` | There is no event object to hand back. It still fires once the alert has finished leaving. |
| `transition` | — | An entrance is an `MPAnimateFade` or one of its siblings round the alert. |
| `className`, `style`, native attributes | — | There is nothing to pass them through to. |

:::

## See also

- [MPSnackbar](./snackbar) — for a message that may be missed.
- [MPDialog](./dialog) — for one that has to be answered before anything else can happen.
- [MPEmpty](./empty) — for a region with nothing in it, which is a different problem.
