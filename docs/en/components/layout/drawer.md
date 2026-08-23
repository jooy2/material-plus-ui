---
title: MPDrawer
order: 8
---

# MPDrawer

<p class="mp-lede">A panel attached to one edge of the window. Two things in one component, because they are the same panel: the drawer you open, and the drawer that is simply part of the page.</p>

<Demo src="drawer/hero" :minHeight="120" />

```tsx
import { MPDrawer, MPDrawerClose, MPButton } from 'material-plus-ui';

<MPDrawer
  trigger={<MPButton>Open the menu</MPButton>}
  title="Material Plus"
  actions={<MPDrawerClose render={<MPButton variant="text">Close</MPButton>} />}
>
  …
</MPDrawer>;
```

## Props

<PropsTable name="MPDrawer" />

## modal and standard

Those are MD3's own two words for the navigation drawer's variants, and they are the whole of what `mode` decides:

|  | `modal` | `standard` |
| --- | --- | --- |
| Where it renders | A portal at the end of `<body>` | In the layout, where you wrote it |
| The page behind | A scrim, inert, scroll locked | Untouched — laid out around the panel |
| Focus | Trapped, and restored to the trigger | Nothing special |
| Escape, click outside | Dismisses | Nothing to dismiss |
| Surface | `surface-container-low` at elevation 1 | `surface`, flat |
| Starts | Closed | Open |
| The × | On | Off |

<Demo src="drawer/standard" :minHeight="260">

<<< @/.vitepress/demos/drawer/standard.tsx

</Demo>

They are one component rather than two because a sidebar that becomes a hamburger at a breakpoint should be **one prop**, not a swap between components with different props:

```tsx
<MPDrawer mode={wide ? 'standard' : 'modal'} open={open} onOpenChange={setOpen} title="Sections">
  …
</MPDrawer>
```

A `standard` drawer that is closed renders **nothing at all**, because "closed" for a panel in the flow is "not in the layout". There is nothing to animate on the way out: what moves is the page around it, and moving the page is not this component's to do.

## The four edges

<Demo src="drawer/sides" :minHeight="120">

<<< @/.vitepress/demos/drawer/sides.tsx

</Demo>

`side` is **physical** — `left`, `right`, `top`, `bottom` — the way `MPSide` is everywhere in this library. A drawer along the top of the window is along the top in every writing direction.

Two different objects come out of it, and MD3 names both:

- **A side panel** is a navigation drawer. It takes the width its `size` implies — 360px at `md`, which is the specification's own — and rounds its free edge at `corner-large`.
- **A top or bottom panel** is a sheet. It is as tall as what is in it, capped at 85% of the window, and rounds at `corner-extra-large`, which is the bottom sheet's corner.

The corners against the **window** are always square, and so is the border: a corner cut off something that has no visible end is a corner cut off nothing, and a hairline along the window's edge has nothing on the other side of it to be separated from.

## Why this one does slide

A `modal` panel comes in from the edge it is attached to — 400ms on `emphasized-decelerate` arriving, 200ms on `emphasized-accelerate` leaving, which is MD3's own pair. It is the one floating surface in this library that travels, and every other one — [MPDialog](../feedback/dialog), [MPMenu](../inputs/menu), [MPPopover](../feedback/popover), [MPSelect](../inputs/select)'s list — still only fades.

The rule those follow is that a box full of text should not move, because a sentence dragged across the screen is a sentence the reader is already trying to read. That rule holds where it was written. A menu opens next to the row the pointer is on; a dialog lands in the middle of the page, over the paragraph the reader was in the middle of.

A drawer is neither. It arrives at an edge — the one part of the window nobody is reading — and it arrives because somebody pressed a button and is waiting for it. Nothing is dragged past anything.

What a fade costs instead is the only thing the panel had left to say while it was arriving. A fade has no direction, so a left drawer and a right one are the same event until they have both finished. The shape says which edge afterwards: square against the window, cut on the free side. The travel is what says it _during_.

A reader who has asked for less motion gets the fade with nowhere to travel from, which is exactly what this panel did before.

A `standard` panel does not animate at all, in or out. It is in the layout rather than over it, so "closed" is "not in the layout" — what moves when one opens is the page around it, and moving the page is the application's to do.

## Why there is no variant or color

`variant` is absent for the dialog's reason: the five weights answer "how much does this surface assert itself against the page", and a panel that has taken an edge of the window has answered it.

`color` is absent because nothing would read it. MD3's navigation drawer is a neutral surface under neutral ink — what carries an accent inside one is the **selected row**, which belongs to whatever [list](../display/list) the caller puts in it:

```tsx
<MPDrawer title="Sections">
  <MPList variant="text">
    <MPListItem selected onClick={…}>Overview</MPListItem>
  </MPList>
</MPDrawer>
```

## Examples

### extent

Overrides the size ladder, and means a different thing per axis — a **width** on a side panel, a **height** on a sheet. Numbers are pixels:

```tsx
<MPDrawer extent={280}>…</MPDrawer>
<MPDrawer side="bottom" extent="40vh">…</MPDrawer>
```

### dividers

Draws a hairline between the header, the body and the actions instead of separating them with space, and moves the vertical padding off the sheet and onto each section so the rules can reach both edges.

Worth turning on the moment the body scrolls: the body is the only part that does, and the lines are what say the header stayed put.

### dismissible

Turn it off for the drawer that has to be answered — and then give it actions that answer it, because there will be no other way out:

```tsx
<MPDrawer open dismissible={false} title="Choose a plan" actions={<MPButton>Continue</MPButton>}>
  …
</MPDrawer>
```

`MPDrawerClose` and an imperative close still work. It is Escape and the click on the scrim that are cancelled.

### MPDrawerClose

An uncontrolled drawer has no `setOpen` for its Cancel button to call, and making every drawer controlled is a piece of state per drawer that exists only to answer a button. `render` is Base UI's own escape hatch, so a real Material Plus button dismisses:

```tsx
<MPDrawerClose render={<MPButton variant="text">Cancel</MPButton>} />
```

It is a `modal` drawer's button — a `standard` one is not a dialog and has nothing for it to talk to.

## Accessibility

- A `modal` drawer is a real dialog: focus is trapped inside it, the page behind is inert, the scroll is locked, and focus returns to the trigger when it closes. All of that is Base UI's.
- `title` and `description` are wired to `aria-labelledby` and `aria-describedby`, so the panel announces itself rather than being read as an unnamed region.
- A `standard` drawer is **not** a dialog and does not pretend to be one. It gets a plain `<h2>` and `<p>`, because a dialog's parts outside a dialog would claim a role the panel does not have.
- The body is the only part that scrolls, so the heading and the actions never leave the screen. Without `dividers` it carries a pixel of padding and gives the space straight back with a negative margin, which is room for a focus ring the scroll container would otherwise clip.

## See also

- [MPDialog](../feedback/dialog) — the same slots on a sheet in the middle of the page.
- [MPOverlay](../feedback/overlay) — for covering a region rather than attaching to an edge.
- [MPPanes](./panes) — for a sidebar the reader resizes rather than opens.
