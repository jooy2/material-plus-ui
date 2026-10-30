---
title: useMPConfirm
order: 1
---

# useMPConfirm

<p class="mp-lede">“Are you sure?”, as a promise. A click handler asks, and gets a boolean back.</p>

<Demo src="confirm/hero" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/confirm/hero.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/confirm/hero.dart

:::

</Demo>

::: fw react

```tsx
import { MPConfirmProvider, useMPConfirm } from 'material-plus-ui';

// once, around the application
<MPConfirmProvider>
  <App />
</MPConfirmProvider>;

// anywhere under it
const { confirm } = useMPConfirm();

async function remove() {
  const sure = await confirm({
    title: 'Delete this project?',
    description: 'Everything in it goes too, and it cannot be undone.',
    confirmLabel: 'Delete',
    color: 'error'
  });

  if (sure) {
    await api.delete(id);
  }
}
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

// once, inside the application, under an Overlay of its own
WidgetsApp(
  // …
  builder: (BuildContext context, Widget? child) =>
      Overlay.wrap(child: MPConfirmProvider(child: child!)),
);

// anywhere under it
Future<void> remove(BuildContext context) async {
  final bool sure = await MPConfirmProvider.of(context).confirm(
    const MPConfirmOptions(
      title: Text('Delete this project?'),
      description: Text('Everything in it goes too, and it cannot be undone.'),
      confirmLabel: Text('Delete'),
      color: MPColor.error,
    ),
  );

  if (sure) {
    await api.delete(id);
  }
}
```

Flutter has no hooks, so the lookup is `MPConfirmProvider.of(context)`, which hands back the same two methods, `confirm` and `alert`. It is meant for a callback, and calling it does not make the widget rebuild when the provider does.

The provider goes inside the app rather than around it, because around the app there is no `Directionality` yet. In `builder` it sits above the navigator and the navigator's `Overlay`, so it needs one of its own, or the first question fails with "No Overlay widget found".

:::

## Props

<PropsTable name="MPConfirmProvider" />

### Options

<PropsTable name="MPConfirmOptions" />

## Why this rather than a dialog of your own

Because the dialog is not the hard part. "Are you sure" needs a piece of open state, a second piece of state for _what_ is being confirmed, two handlers, and an [`MPDialog`](../feedback/dialog.md) kept mounted somewhere it does not belong — **per call site**. What the caller actually has at that moment is a click handler, and what they want back is a boolean.

It is the same trade [`useMPSnackbar`](../feedback/snackbar.md) makes, run the other way: a snackbar is something to say, this is something to ask.

## `false` is every other answer

| What the reader does       | What resolves |
| -------------------------- | ------------- |
| Presses the confirm button | `true`        |
| Presses cancel             | `false`       |
| Escape                     | `false`       |
| Presses outside the dialog | `false`       |

There is no third outcome and **the promise never rejects**, so a caller writes an `if` and not a `try` with a default. That is the whole reason the shape is a boolean: a confirmation that could also throw would be a confirmation every call site had to handle twice.

::: fw flutter

The system back answers `false` too. The future never completes with an error.

:::

## `alert` is the one-button form

::: fw react

```tsx
const { alert } = useMPConfirm();

await alert({ title: 'Saved', description: 'Your changes are on the server.' });
```

:::

::: fw flutter

```dart
await MPConfirmProvider.of(context).alert(
  const MPConfirmOptions(
    title: Text('Saved'),
    description: Text('Your changes are on the server.'),
  ),
);
```

:::

It resolves <Fw react="`void`" flutter="a `Future<void>`" /> once it has been acknowledged. An acknowledgement has nothing to refuse, and a boolean nobody can vary is a value a caller would have to learn to ignore. Escape resolves it too, for the same reason.

## Defaults for the whole application

::: fw react

```tsx
<MPConfirmProvider defaults={{ size: 'sm', cancelLabel: 'Not now' }}>
  <App />
</MPConfirmProvider>
```

:::

::: fw flutter

```dart
MPConfirmProvider(
  defaults: const MPConfirmOptions(size: MPSize.sm, cancelLabel: Text('Not now')),
  child: child!,
);
```

`defaults` is an `MPConfirmOptions` of its own. Its `title`, `description`, `child` and `semanticLabel` are never used, since a question is about one thing and the provider does not know what.

:::

Each call still says whatever it needs to, and wins.

## Colour is a decision, not a default

`color` paints the confirm button, and <Fw react="`'error'`" flutter="`MPColor.error`" /> is what a **destructive** confirmation wants. It is deliberately not the default: most confirmations are not destructive, and a red button on every one of them stops being a warning.

The same goes for the labels. _Confirm_ and _Cancel_ are what is drawn when nobody says otherwise, and they are translated into eighteen languages — but a button that says **Delete** tells the reader what they are about to do, and a button that says _Confirm_ asks them to remember.

## Sharp edges

- **It needs an `MPConfirmProvider` above it.** Without one <Fw react="the hook" flutter="`MPConfirmProvider.of`" /> **throws**<Fw flutter=" a `FlutterError`" />, rather than returning a function that silently never resolves. A promise that never settles is the hardest possible way to be told about a missing provider.
- **One at a time.** A second <Fw react="`confirm()`" flutter="`confirm`" /> raised while one is open **replaces** it, and the first promise resolves `false`. Not a queue, deliberately: a queue would ask a question about something the reader has already moved on from, and the answer to a stale question is not information.
- **`dismissible: false` makes a dialog with two ways out**, and both of them are your buttons. Be sure the question genuinely has to be answered.
- **Do not `await` it during a <Fw react="render" flutter="`build`" />.** It is a click handler's tool.

::: fw flutter

## Accessibility

- A screen reader announces the question as an alert dialog (`SemanticsRole.alertDialog`), WAI-ARIA's name for a dialog that breaks into what the reader was doing and waits for an answer. The title names it; give the question a `semanticLabel` when the title is not a plain `Text`.
- Cancel holds the focus as the dialog opens, so an Enter pressed out of habit answers no. An `alert` puts it on its one button. A question that replaces an open one places the focus again.
- The focus is held inside the dialog and goes back to whatever held it before once the question is answered.

## Differences from the React build

- **`MPConfirmProvider.of(context)` in place of `useMPConfirm()`.** Flutter has no hooks. The lookup hands back an `MPConfirmResult` with the same `confirm` and `alert`.
- **The question is an alert dialog.** The React build's is a plain `role="dialog"`. Here the layer is announced as `SemanticsRole.alertDialog`, which is what a question that waits for an answer is.
- **Cancel always takes the first focus.** Base UI focuses the first thing in the sheet that can take it, which is a field in `children` when the question holds one.
- **A provider that leaves the tree answers its open question `false`.** In React the promise stays pending. A Flutter callback waiting on a future that never completes never runs its `finally`, so a route change would leave a button spinning.
- **`semanticLabel` is new.** A Flutter title is a widget with no text to hand over unless it is a plain `Text`, and this names the dialog when it is not.

:::

## Next

- [MPDialog](../feedback/dialog.md) — the component underneath, for the questions this shape does not fit.
- [MPSnackbar](../feedback/snackbar.md) — the same idea for something to say rather than ask.
