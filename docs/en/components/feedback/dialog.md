---
title: MPDialog
order: 4
---

# MPDialog

<p class="mp-lede">A sheet that takes the page away until it is answered. The sections are props rather than sub-components to compose: the arrangement of a dialog is fixed — icon, headline, supporting text, body, actions — and what a caller wants to decide is what goes in each slot.</p>

<Demo src="dialog/hero" :minHeight="80" />

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

## Props

<PropsTable name="MPDialog" />

## The sheet

`surface-container-high` at `corner-extra-large`, elevation 3 — MD3's own three choices for a dialog, and the only surface in this library that carries the third elevation level.

There is no `elevation` prop, for the same reason there is no `variant`: a dialog that could be told to sit flat on the page would be a dialog that could be told to stop being a dialog.

## `MPDialogClose`

An uncontrolled dialog has no `setOpen` for its Cancel button to call, and the alternative — making every dialog controlled — is a piece of state per dialog that exists only to answer a button.

```tsx
<MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />
```

`render` is Base UI's own escape hatch, so a real Material Plus button dismisses rather than a bare one wearing dialog styling.

## Examples

### icon

A hero icon centres the header, which is MD3's own rule — and it is a real distinction rather than a decoration. A dialog with an icon is **announcing** something; a dialog without one is **asking** something.

<Demo src="dialog/icon" :minHeight="80">

<<< @/.vitepress/demos/dialog/icon.tsx

</Demo>

### dividers

Only the body scrolls; the header and the actions stay put. Turn `dividers` on the moment a body does scroll — space alone stops explaining why the heading did not move with it.

<Demo src="dialog/scrolling" :minHeight="80">

<<< @/.vitepress/demos/dialog/scrolling.tsx

</Demo>

### size and width

`size` sets the type scale and how wide the sheet is allowed to get — `md` is MD3's own 560dp maximum. They are one axis rather than two, because a second five-value scale spelled `maxWidth` would be a second spelling of an idea the library already has a word for.

`width` is the escape hatch for the dialog whose _content_ decides its width: a wide table, a narrow confirmation.

```tsx
<MPDialog size="sm" title="Rename" />
<MPDialog width={880} title="Pick a file" />
```

### fullWidth

On by default, which is the other way round from every other component in the library. Elsewhere `fullWidth` means "fill the container"; a dialog's container is the viewport, and a dialog that shrank to fit two words would be a tooltip.

### fullScreen

Fills the viewport edge to edge, for a phone-sized screen or an editor. `showClose` follows it, because a full-screen dialog has no scrim left to click.

### dismissible

Turn it off for the dialog that has to be answered — and then give it actions that answer it, because there will be no other way out.

```tsx
<MPDialog
  dismissible={false}
  title="Session expired"
  actions={<MPButton>Sign in again</MPButton>}
/>
```

## Accessibility

- The title names the dialog and the description describes it, both wired by Base UI — there is no `aria-labelledby` to write.
- Base UI owns the focus trap, the scroll lock, the inert page behind, and returning focus to the trigger on close.
- Escape closes unless `dismissible` is off, in which case the reason for the change is cancelled rather than the key being swallowed — so a dialog inside a dialog still closes the right one.

## See also

- [MPOverlay](./overlay) — the scrim on its own, with no sheet and nothing to answer.
- [MPSnackbar](./snackbar) — for something that happened, rather than something to decide.
