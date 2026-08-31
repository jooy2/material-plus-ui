---
title: MPSnackbar
order: 9
---

# MPSnackbar

<p class="mp-lede">A short message about something that has already happened, raised from anywhere in the application. Wrap the tree once in <code>MPSnackbarProvider</code>; every call site is then one line saying what happened.</p>

<Demo src="snackbar/hero" :minHeight="80" />

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

## Why this is not called Toast

Material has a name for this component and it is snackbar. "Toast" is Android's older, non-interactive notification — it has no action, cannot be dismissed and is not part of Material Design 3 — so a `Toast` here would be a different component wearing the name of one the specification still ships.

## A hook, not a component

What a caller has at the moment a message is warranted is a click handler, not a place in the tree. An `<MPSnackbar open={…}/>` they would have to keep mounted, with a piece of state per message, is the shape this component exists to avoid.

## `MPSnackbarProvider`

<PropsTable name="MPSnackbarProvider" />

## `useMPSnackbar()`

| Method | What it does |
| --- | --- |
| `add(options)` | Raises a snackbar and returns its id. |
| `update(id, options)` | Changes one already on screen. |
| `close(id?)` | Closes one, or every one of them. |
| `promise(promise, { loading, success, error })` | One snackbar that follows a promise. |
| `snackbars` | Every snackbar currently in the stack, newest first. |

### `add(options)`

<PropsTable name="MPSnackbarOptions" />

## Examples

### message

One slot, not a title and a body. MD3's snackbar has a single run of supporting text, up to two lines, and nothing else. A message that needs a heading is not a snackbar; it is a dialog the reader has not been shown yet.

### actionLabel and onAction

One action, at most. It is a text button in everything but name, and it reads `inverse-primary` rather than `primary` for the reason the token exists: `primary` is derived to contrast with the **page**, so on a plate that inverts the page it is the one colour guaranteed not to read.

```tsx
snackbar.add({ message: 'Message archived', actionLabel: 'Undo', onAction: restore });
```

### timeout

`0` keeps a snackbar up until it is closed, which is the right answer for anything the reader has to act on — a snackbar that leaves before it is read said nothing.

### id

Reusing an id updates that snackbar in place and restarts its timer, which is what "uploading… / uploaded" wants: one message that changed its mind, not two stacked on each other.

### position

<Demo src="snackbar/position" :minHeight="120">

<<< @/.vitepress/demos/snackbar/position.tsx

</Demo>

`bottom-start` is MD3's own placement. The two halves are written as one word because they are not independent: a snackbar stack is always pinned to the top or the bottom, never to a side.

It also decides which way the plate travels. A snackbar comes in from the edge its stack is pinned to and goes back out to it, over 200ms — the same fact that decides which way it can be flicked away, and the two have to agree: a plate that came down from the top and could only be flicked upwards would be asking to be undone.

A reader who has asked for less motion gets the fade with nowhere to travel from.

One snackbar can leave the stack the provider chose, which is the same prop on `add`:

```tsx
snackbar.add({ message: 'Could not save', position: 'top-center' });
```

For the message that has to be somewhere else _because of what it is_ — an error at the top of a page whose bottom corner is a toolbar. Not for a preference: an application whose snackbars all appear in the same wrong place should move the provider.

All six stacks are on the page from the first render whether or not anything is in them, and that is not an implementation detail worth hiding. Each stack is its own `aria-live` region, and a region that arrives in the document at the same instant as the message inside it is a region a screen reader has nothing to compare against and does not read out. An empty stack is a `pointer-events-none` flex column with no children, so the five nobody is using cost a `<div>` each.

### color

**No default**, and it is the same decision [MPTooltip](./tooltip) makes for the same reason. MD3's snackbar is `inverse-surface` under `inverse-on-surface`: the neutral palette read at the _other_ end of the scheme, so the plate is dark on a light page and light on a dark one.

Setting it swaps in an accent container. Worth doing for an application whose messages are all one kind; wrong as a way of saying "this one is an error", because a snackbar is not where an error belongs.

## Accessibility

- Base UI owns the live region, the timers and their pausing on hover and on window blur, the limit, the swipe, and the F6 hotkey that moves focus into the stack.
- `priority: 'high'` interrupts a screen reader; `low` waits for a pause. An error is worth interrupting for and a save confirmation is not.
- The × is `aria-hidden` until the stack is focused, so that a reader hearing a live region does not hear a close button for every message that goes past. It is still a real button for a pointer.

## See also

- [MPDialog](./dialog) — when there is something to decide rather than something that happened.
- [MPTooltip](./tooltip) — the other component with no default `color`, for the same reason.
