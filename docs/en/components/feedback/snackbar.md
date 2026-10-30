---
title: MPSnackbar
order: 9
---

# MPSnackbar

<p class="mp-lede">A short message about something that has already happened, raised from anywhere in the application. Wrap the tree once in <code>MPSnackbarProvider</code>; every call site is then one line saying what happened.</p>

<Demo src="snackbar/hero" :minHeight="80" />

::: fw react

```tsx
import { MPSnackbarProvider, useMPSnackbar } from 'material-plus-ui';

// once, around the application
<MPSnackbarProvider>
  <App />
</MPSnackbarProvider>;

// anywhere under it
const snackbar = useMPSnackbar();

snackbar.add({ message: 'Message archived', actionLabel: 'Undo', onAction: restore });
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

// once, inside the app
WidgetsApp(
  // …
  builder: (BuildContext context, Widget? child) => MPSnackbarProvider(child: child!),
);

// anywhere under it
MPSnackbarProvider.of(context).add(
  MPSnackbarOptions(
    message: const Text('Message archived'),
    actionLabel: const Text('Undo'),
    onAction: restore,
  ),
);
```

The provider goes inside the app rather than around it, because around the app there is no `Directionality` yet. It draws its stack over whatever it wraps and needs no `Overlay`, so in `builder` it sits above the navigator, and every page and every dialog the navigator opens is under its stack.

:::

## Why this is not called Toast

Material has a name for this component and it is snackbar. "Toast" is Android's older, non-interactive notification — it has no action, cannot be dismissed and is not part of Material Design 3 — so a `Toast` here would be a different component wearing the name of one the specification still ships.

::: fw react

## A hook, not a component

What a caller has at the moment a message is warranted is a click handler, not a place in the tree. An `<MPSnackbar open={…}/>` they would have to keep mounted, with a piece of state per message, is the shape this component exists to avoid.

:::

::: fw flutter

## A controller, not a widget

What a caller has at the moment a message is warranted is a callback, not a place in the tree. An `MPSnackbar(open: …)` they would have to keep mounted, with a piece of state per message, is the shape this component exists to avoid.

`MPSnackbarProvider.of(context)` hands back an `MPSnackbarController`, the same kind of lookup `Navigator.of` is. It asserts when there is no provider above the context; `MPSnackbarProvider.maybeOf` returns `null` instead.

:::

## `MPSnackbarProvider`

<PropsTable name="MPSnackbarProvider" />

::: fw react

## `useMPSnackbar()`

| Method | What it does |
| --- | --- |
| `add(options)` | Raises a snackbar and returns its id. |
| `update(id, options)` | Changes one already on screen. |
| `close(id?)` | Closes one, or every one of them. |
| `promise(promise, { loading, success, error })` | One snackbar that follows a promise. |
| `snackbars` | Every snackbar currently in the stack, newest first. |

### `add(options)`

:::

::: fw flutter

## `MPSnackbarController`

| Method | What it does |
| --- | --- |
| `add(options)` | Raises a snackbar and returns its id. |
| `update(id, options)` | Changes one already on screen. Fields left out keep their value. |
| `close([id])` | Closes one, or every one of them. |
| `promise(future, loading:, success:, error:)` | One snackbar that follows a future, and hands its value or error on. |
| `snackbars` | Every snackbar in the stack now, newest first, read when it is asked. |

`success` and `error` are functions that turn the outcome into options. `snackbars` is a snapshot: reading it does not rebuild anything as the stack changes.

### `MPSnackbarOptions`

`add` and `update` both take one. It describes the message; it is not a widget and is never put in the tree by the caller.

:::

<PropsTable name="MPSnackbarOptions" />

## Examples

### message

One slot, not a title and a body. MD3's snackbar has a single run of supporting text, up to two lines, and nothing else. A message that needs a heading is not a snackbar; it is a dialog the reader has not been shown yet.

### actionLabel and onAction

One action, at most. It is a text button in everything but name, and it reads `inverse-primary` rather than `primary` for the reason the token exists: `primary` is derived to contrast with the **page**, so on a plate that inverts the page it is the one colour guaranteed not to read.

::: fw react

```tsx
snackbar.add({ message: 'Message archived', actionLabel: 'Undo', onAction: restore });
```

:::

::: fw flutter

```dart
snackbar.add(
  MPSnackbarOptions(
    message: const Text('Message archived'),
    actionLabel: const Text('Undo'),
    onAction: restore,
  ),
);
```

:::

Pressing the action does not close the snackbar. An action that wants it gone closes it with its id.

### timeout

<Fw react="`0`" flutter="`Duration.zero`" /> keeps a snackbar up until it is closed, which is the right answer for anything the reader has to act on — a snackbar that leaves before it is read said nothing.

The clock stops while the pointer rests on a snackbar, while the keyboard focus is on its action or its ×, and while the application is in the background or its window has lost the focus. It carries on from where it stopped.

### id

Reusing an id updates that snackbar in place and restarts its timer, which is what "uploading… / uploaded" wants: one message that changed its mind, not two stacked on each other.

### position

<Demo src="snackbar/position" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/snackbar/position.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/snackbar/position.dart

:::

</Demo>

<Fw react="`bottom-start`" flutter="`MPSnackbarPosition.bottomStart`" /> is MD3's own placement. The two halves are written as one word because they are not independent: a snackbar stack is always pinned to the top or the bottom, never to a side.

It also decides which way the plate travels. A snackbar comes in from the edge its stack is pinned to and goes back out to it, over 200ms.

::: fw react

That is the same fact that decides which way it can be flicked away, and the two have to agree: a plate that came down from the top and could only be flicked upwards would be asking to be undone.

A reader who has asked for less motion gets the fade with nowhere to travel from.

:::

::: fw flutter

A snackbar can be flicked away sideways. A reader who has asked for less motion gets the snackbar at once, with no fade and no travel.

:::

One snackbar can leave the stack the provider chose, which is the same prop on `add`:

::: fw react

```tsx
snackbar.add({ message: 'Could not save', position: 'top-center' });
```

:::

::: fw flutter

```dart
snackbar.add(
  const MPSnackbarOptions(
    message: Text('Could not save'),
    position: MPSnackbarPosition.topCenter,
  ),
);
```

:::

For the message that has to be somewhere else _because of what it is_ — an error at the top of a page whose bottom corner is a toolbar. Not for a preference: an application whose snackbars all appear in the same wrong place should move the provider.

::: fw react

The six stacks share one `aria-live` region, and it is on the page from the first render whether or not anything is in it — that is not an implementation detail worth hiding. A region that arrives in the document at the same instant as the message inside it is a region a screen reader has nothing to compare against and does not read out. The region covers the window and lets every pointer through, and a corner's stack is drawn inside it once that corner has a message. One region rather than six also means a high-priority message is read out once.

:::

::: fw flutter

The stacks let every press beside a plate through to the application, and each message is a live region of its own (see Accessibility).

:::

### color

**No default**, and it is the same decision [MPTooltip](./tooltip) makes for the same reason. MD3's snackbar is `inverse-surface` under `inverse-on-surface`: the neutral palette read at the _other_ end of the scheme, so the plate is dark on a light page and light on a dark one.

Setting it swaps in an accent container. Worth doing for an application whose messages are all one kind; wrong as a way of saying "this one is an error", because a snackbar is not where an error belongs.

## Accessibility

::: fw react

- Base UI owns the live region, the timers and their pausing on hover and on window blur, the limit, the swipe, and the F6 hotkey that moves focus into the stack.
- `priority: 'high'` interrupts a screen reader; `low` waits for a pause. An error is worth interrupting for and a save confirmation is not.
- The × is `aria-hidden` until the stack is focused, so that a reader hearing a live region does not hear a close button for every message that goes past. It is still a real button for a pointer.

:::

::: fw flutter

- The message is a live region, and only the message: a screen reader announces it without the reader moving there, and does not read "Close" after every message that goes past.
- The action and the × are separate nodes and ordinary focus stops on the plate. The × is named by `closeLabel`, or the word for "close" in `locale`.
- Both priorities are read when the reader pauses. Flutter's live region has one politeness level, so `high` cannot interrupt the way it does in the React build.
- The clock pauses for a pointer resting on a plate, a finger held on one, the keyboard focus inside the stack, and the application leaving the foreground.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `useMPSnackbar()` | `MPSnackbarProvider.of(context)` | Flutter's own way of reaching something above you. |
| `MPSnackbarData` | part of `MPSnackbarOptions` | Base UI keeps the look in a `data` slot beside its own fields; here there is one class. |
| `timeout` in milliseconds | `Duration` | Dart's type for a length of time. |
| `promise(…, { success, error })` objects | functions only | Dart has no union of a value and a function; `(_) => options` says the same thing. |
| `className` on a snackbar | not offered | There is no stylesheet to hook a class into. |
| `priority: 'high'` interrupts | read politely | Flutter's live region has one politeness level. |
| F6 moves focus into the stack | not offered | The action and the × are ordinary focus stops, reached by traversal like everything else. |
| flicked towards its edge or sideways | sideways only | A `Dismissible` takes one axis, and across is the one a thumb reaches for. |
| a fade under reduced motion | no motion at all | Flutter's `disableAnimations` asks for none, and every component here honours it that way. |
| `width` as a number or a CSS length | `double` | Logical pixels are the only length there is. |

:::

## See also

- [MPDialog](./dialog) — when there is something to decide rather than something that happened.
- [MPTooltip](./tooltip) — the other component with no default `color`, for the same reason.
