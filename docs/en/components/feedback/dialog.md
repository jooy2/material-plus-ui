---
title: MPDialog
order: 4
---

# MPDialog

<p class="mp-lede">A sheet that takes the page away until it is answered. The sections are props rather than sub-components to compose: the arrangement of a dialog is fixed — icon, headline, supporting text, body, actions — and what a caller wants to decide is what goes in each slot.</p>

<Demo src="dialog/hero" :minHeight="80" />

::: fw react

```tsx
import { MPButton, MPDialog, MPDialogClose } from 'material-plus-ui';

<MPDialog
  trigger={<MPButton>Delete project</MPButton>}
  title="Delete “Aurora”?"
  description="Everything in it goes too."
  actions={
    <>
      <MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />
      <MPDialogClose render={<MPButton color="error">Delete</MPButton>} />
    </>
  }
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPDialog(
  trigger: (BuildContext context, VoidCallback open) =>
      MPButton(onPressed: open, child: const Text('Delete project')),
  title: const Text('Delete “Aurora”?'),
  description: const Text('Everything in it goes too.'),
  actions: <Widget>[
    MPDialogClose(
      builder: (BuildContext context, VoidCallback close) =>
          MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
    ),
    MPDialogClose(
      builder: (BuildContext context, VoidCallback close) =>
          MPButton(color: MPColor.error, onPressed: close, child: const Text('Delete')),
    ),
  ],
);
```

The dialog lifts itself into the nearest `Overlay`, which a `WidgetsApp` with a navigator provides.

:::

## Props

<PropsTable name="MPDialog" />

## The sheet

`surface-container-high` at `corner-extra-large`, elevation 3 — MD3's own three choices for a dialog, and the only surface in this library that carries the third elevation level.

There is no `elevation` prop, for the same reason there is no `variant`: a dialog that could be told to sit flat on the page would be a dialog that could be told to stop being a dialog.

It **grows** as it fades in — 400ms on `emphasized-decelerate` arriving, 200ms on `emphasized-accelerate` leaving, which is MD3's own pair and the same timing [MPDrawer](../layout/drawer) travels on.

That makes it one of only two surfaces here that move. The rule the rest follow — a box full of text should not travel — is about opening _at_ something: a menu opens beside the row the pointer is on, a select's list covers the field that was just pressed, and moving either one moves the target out from under a pointer already travelling towards it. A dialog opens at nothing. What the grow adds over a bare fade is a direction, which is the difference between a sheet that arrived and a sheet that was always there and has only now been noticed.

From 95% rather than the specification's 80%. Growing is the one transition in this library that resamples text while it plays, and 80% of a 560dp dialog starts it 56px narrower than it ends — far enough that the words visibly travel outwards and are soft most of the way. At 95% the box moves 14px, which reads as the sheet settling rather than as the sentence inside it moving.

`fullScreen` only fades: a dialog that is already the window has no middle to grow out of. So does any dialog for a reader who has asked for less motion.

## The scrim

MD3's scrim at 32%, with a 2px blur that takes the edge off text directly under the sheet.

::: fw react

The blur is the one part of it with a cost: a backdrop filter re-blurs the whole window behind it on every frame the scrim fades and every frame anything under it changes, which a low-end phone feels. `--mp-scrim-blur` turns it down or off for every dialog, drawer and command palette on the page, keeping the tint:

```css
:root {
  --mp-scrim-blur: 0px;
}

@media (prefers-reduced-transparency: reduce) {
  :root {
    --mp-scrim-blur: 0px;
  }
}
```

:::

## `MPDialogClose`

An uncontrolled dialog has no `setOpen` for its Cancel button to call, and the alternative — making every dialog controlled — is a piece of state per dialog that exists only to answer a button.

::: fw react

```tsx
<MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />
```

`render` is Base UI's own escape hatch, so a real Material Plus button dismisses rather than a bare one wearing dialog styling.

:::

::: fw flutter

```dart
MPDialogClose(
  builder: (BuildContext context, VoidCallback close) =>
      MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
)
```

`builder` is handed the call that closes the dialog round it, so a real Material Plus button dismisses. A controlled dialog hears the close through its `onOpenChange`, as it hears the ×. It closes whether or not the dialog is `dismissible`: that switch is about the ways out a reader stumbles into, and this is one the dialog offers.

<PropsTable name="MPDialogClose" />

:::

## Examples

### icon

A hero icon centres the header, which is MD3's own rule — and it is a real distinction rather than a decoration. A dialog with an icon is **announcing** something; a dialog without one is **asking** something.

<Demo src="dialog/icon" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/dialog/icon.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/dialog/icon.dart

:::

</Demo>

### dividers

Only the body scrolls; the header and the actions stay put. Turn `dividers` on the moment a body does scroll — space alone stops explaining why the heading did not move with it.

<Demo src="dialog/scrolling" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/dialog/scrolling.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/dialog/scrolling.dart

:::

</Demo>

### size and width

`size` sets the type scale and how wide the sheet is allowed to get — `md` is MD3's own 560dp maximum. They are one axis rather than two, because a second five-value scale spelled `maxWidth` would be a second spelling of an idea the library already has a word for.

`width` is the escape hatch for the dialog whose _content_ decides its width: a wide table, a narrow confirmation.

<Demo src="dialog/sizes" :minHeight="80">

::: fw react

<<< @/.vitepress/demos/dialog/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/dialog/sizes.dart

:::

</Demo>

### fullWidth

On by default, which is the other way round from every other component in the library. Elsewhere `fullWidth` means "fill the container"; a dialog's container is the viewport, and a dialog that shrank to fit two words would be a tooltip.

### fullScreen

Fills the viewport edge to edge, for a phone-sized screen or an editor. `showClose` follows it, because a full-screen dialog has no scrim left to click.

::: fw flutter

The sheet runs under the system's bars and keeps its content out from under them, as a `SafeArea` does. Every other dialog keeps 16px clear of the bars, the notch and a soft keyboard.

:::

### dismissible

Turn it off for the dialog that has to be answered — and then give it actions that answer it, because there will be no other way out.

::: fw react

```tsx
<MPDialog
  dismissible={false}
  title="Session expired"
  actions={<MPButton>Sign in again</MPButton>}
/>
```

:::

::: fw flutter

```dart
MPDialog(
  open: expired,
  dismissible: false,
  title: const Text('Session expired'),
  actions: <Widget>[MPButton(onPressed: signIn, child: const Text('Sign in again'))],
);
```

Escape, the system back and a press on the scrim all stop working. While `modal` is on, the system back is refused rather than let through to the page under the dialog.

:::

## Accessibility

::: fw react

- The title names the dialog and the description describes it, both wired by Base UI — there is no `aria-labelledby` to write.
- Base UI owns the focus trap, the scroll lock, the inert page behind, and returning focus to the trigger on close.
- Escape closes unless `dismissible` is off, in which case the reason for the change is cancelled rather than the key being swallowed — so a dialog inside a dialog still closes the right one.

:::

::: fw flutter

- A screen reader announces the layer as a dialog (`SemanticsRole.dialog`) and as a route of its own, named by the title when the title is a plain `Text`, and by `semanticLabel` otherwise. The title is announced as a heading.
- Focus goes into the sheet as it opens and Tab cannot leave it. When it closes, the focus goes back to whatever held it before, which is the trigger when the dialog was opened from the keyboard.
- The page behind is taken off the semantics tree while the dialog is open, so a screen reader cannot reach it either.
- Escape and the system back close the dialog unless `dismissible` is off. Only the dialog on top answers, so a dialog opened from a dialog closes alone.

:::

::: fw flutter

## Differences from the React build

- **`trigger` is a builder.** React's Base UI merges its click handler onto the element it is given. A Flutter widget cannot be reached into, so `trigger` is handed the call that opens the dialog, and `MPDialogClose` takes a `builder` in place of `render`.
- **`modal` is a `bool`.** `false` is React's `'trap-focus'`: the page stays usable by pointer and the focus stays in the sheet. React's `false`, which lets the focus leave as well, has no counterpart here, because the layer is always a focus scope of its own.
- **`width` is a number of logical pixels**, without React's CSS strings.
- **The description is not wired as the dialog's description.** Flutter's semantics have no `aria-describedby`; a screen reader reads the description straight after the title instead.
- **No scrim knob.** `--mp-scrim-blur` is a CSS custom property, and the blur here is fixed at 2px.
- **No `classNames`, `className`, `style` or raw event props.** A key pressed inside the sheet reaches a `Focus` or `Shortcuts` the caller puts in the body.

:::

## See also

- [MPOverlay](./overlay) — the scrim on its own, with no sheet and nothing to answer.
- [MPSnackbar](./snackbar) — for something that happened, rather than something to decide.
