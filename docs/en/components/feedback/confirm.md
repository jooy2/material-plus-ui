---
title: useMPConfirm
order: 12
---

# useMPConfirm

<p class="mp-lede">“Are you sure?”, as a promise. A click handler asks, and gets a boolean back.</p>

<Demo src="confirm/hero" :minHeight="200">

<<< @/.vitepress/demos/confirm/hero.tsx

</Demo>

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

## Props

<PropsTable name="MPConfirmProvider" />

### Options

<PropsTable name="MPConfirmOptions" />

## Why this rather than a dialog of your own

Because the dialog is not the hard part. "Are you sure" needs a piece of open state, a second piece of state for _what_ is being confirmed, two handlers, and an [`MPDialog`](./dialog.md) kept mounted somewhere it does not belong — **per call site**. What the caller actually has at that moment is a click handler, and what they want back is a boolean.

It is the same trade [`useMPSnackbar`](./snackbar.md) makes, run the other way: a snackbar is something to say, this is something to ask.

## `false` is every other answer

| What the reader does       | What resolves |
| -------------------------- | ------------- |
| Presses the confirm button | `true`        |
| Presses cancel             | `false`       |
| Escape                     | `false`       |
| Presses outside the dialog | `false`       |

There is no third outcome and **the promise never rejects**, so a caller writes an `if` and not a `try` with a default. That is the whole reason the shape is a boolean: a confirmation that could also throw would be a confirmation every call site had to handle twice.

## `alert` is the one-button form

```tsx
const { alert } = useMPConfirm();

await alert({ title: 'Saved', description: 'Your changes are on the server.' });
```

It resolves `void` once it has been acknowledged. An acknowledgement has nothing to refuse, and a boolean nobody can vary is a value a caller would have to learn to ignore. Escape resolves it too, for the same reason.

## Defaults for the whole application

```tsx
<MPConfirmProvider defaults={{ size: 'sm', cancelLabel: 'Not now' }}>
  <App />
</MPConfirmProvider>
```

Each call still says whatever it needs to, and wins.

## Colour is a decision, not a default

`color` paints the confirm button, and `'error'` is what a **destructive** confirmation wants. It is deliberately not the default: most confirmations are not destructive, and a red button on every one of them stops being a warning.

The same goes for the labels. _Confirm_ and _Cancel_ are what is drawn when nobody says otherwise, and they are translated into eighteen languages — but a button that says **Delete** tells the reader what they are about to do, and a button that says _Confirm_ asks them to remember.

## Sharp edges

- **It needs an `MPConfirmProvider` above it.** Without one the hook **throws**, rather than returning a function that silently never resolves. A promise that never settles is the hardest possible way to be told about a missing provider.
- **One at a time.** A second `confirm()` raised while one is open **replaces** it, and the first promise resolves `false`. Not a queue, deliberately: a queue would ask a question about something the reader has already moved on from, and the answer to a stale question is not information.
- **`dismissible: false` makes a dialog with two ways out**, and both of them are your buttons. Be sure the question genuinely has to be answered.
- **Do not `await` it during a render.** It is a click handler's tool.

## Next

- [MPDialog](./dialog.md) — the component underneath, for the questions this shape does not fit.
- [MPSnackbar](./snackbar.md) — the same idea for something to say rather than ask.
