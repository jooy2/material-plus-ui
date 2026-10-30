---
title: MPDrawer
order: 8
---

# MPDrawer

<p class="mp-lede">A panel attached to one edge of the window. Two things in one component, because they are the same panel: the drawer you open, and the drawer that is simply part of the page.</p>

<Demo src="drawer/hero" :minHeight="120" />

::: fw react

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

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPDrawer(
  trigger: (BuildContext context, VoidCallback open) =>
      MPButton(onPressed: open, child: const Text('Open the menu')),
  title: const Text('Material Plus'),
  actions: <Widget>[
    MPDrawerClose(
      builder: (BuildContext context, VoidCallback close) =>
          MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Close')),
    ),
  ],
  child: …,
);
```

A modal drawer lifts itself out of the tree, so it needs an `Overlay` above it, which `WidgetsApp` with a navigator provides. Where it is written is where its trigger is laid out; the panel itself takes up no room there.

:::

## Props

<PropsTable name="MPDrawer" />

::: fw flutter

### MPDrawerClose

<PropsTable name="MPDrawerClose" />

:::

## modal and standard

Those are MD3's own two words for the navigation drawer's variants, and they are the whole of what `mode` decides:

|  | `modal` | `standard` |
| --- | --- | --- |
| Where it renders | <Fw react="A portal at the end of `<body>`" flutter="Lifted into the nearest `Overlay`" /> | In the layout, where you wrote it |
| The page behind | <Fw react="A scrim, inert, scroll locked" flutter="A scrim, unreachable by pointer, keyboard and screen reader" /> | Untouched — laid out around the panel |
| Focus | Trapped, and restored to the trigger | Nothing special |
| Escape, click outside | Dismisses | Nothing to dismiss |
| Surface | `surface-container-low` at elevation 1 | `surface`, flat |
| Starts | Closed | Open |
| The × | On | Off |

<Demo src="drawer/standard" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/drawer/standard.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/drawer/standard.dart

:::

</Demo>

They are one component rather than two because a sidebar that becomes a hamburger at a breakpoint should be **one prop**, not a swap between components with different props:

::: fw react

```tsx
<MPDrawer mode={wide ? 'standard' : 'modal'} open={open} onOpenChange={setOpen} title="Sections">
  …
</MPDrawer>
```

:::

::: fw flutter

```dart
MPDrawer(
  mode: wide ? MPDrawerMode.standard : MPDrawerMode.modal,
  open: open,
  onOpenChange: (bool next) => setState(() => open = next),
  title: const Text('Sections'),
  child: …,
);
```

:::

A `standard` drawer that is closed renders **nothing at all**, because "closed" for a panel in the flow is "not in the layout". There is nothing to animate on the way out: what moves is the page around it, and moving the page is not this component's to do.

::: fw react

### Kept in the page while closed

A closed `modal` drawer is taken out of the page, contents and all. `keepMounted` leaves its contents in the document, hidden, which is what a drawer of site links on a narrow screen wants: a crawler rendering the page finds them. The drawer is a portal, which no server renders, so the contents arrive with hydration — links a site needs indexed should also be in the server's markup somewhere.

:::

## The four edges

<Demo src="drawer/sides" :minHeight="120">

::: fw react

<<< @/.vitepress/demos/drawer/sides.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/drawer/sides.dart

:::

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

<Fw react="A reader who has asked for less motion gets the fade with nowhere to travel from, which is exactly what this panel did before." flutter="With animations turned off at the OS, the panel and the scrim are simply there, with no travel and no fade." />

A `standard` panel does not animate at all, in or out. It is in the layout rather than over it, so "closed" is "not in the layout" — what moves when one opens is the page around it, and moving the page is the application's to do.

## Why there is no variant or color

`variant` is absent for the dialog's reason: the five weights answer "how much does this surface assert itself against the page", and a panel that has taken an edge of the window has answered it.

`color` is absent because nothing would read it. MD3's navigation drawer is a neutral surface under neutral ink — what carries an accent inside one is the **selected row**, which belongs to whatever [list](../display/list) the caller puts in it:

::: fw react

```tsx
<MPDrawer title="Sections">
  <MPList variant="text">
    <MPListItem selected onClick={…}>Overview</MPListItem>
  </MPList>
</MPDrawer>
```

:::

## Examples

### extent

Overrides the size ladder, and means a different thing per axis — a **width** on a side panel, a **height** on a sheet. <Fw react="Numbers are pixels:" flutter="It is a number of logical pixels:" />

::: fw react

```tsx
<MPDrawer extent={280}>…</MPDrawer>
<MPDrawer side="bottom" extent="40vh">…</MPDrawer>
```

:::

::: fw flutter

```dart
MPDrawer(extent: 280, child: …);
MPDrawer(side: MPSide.bottom, extent: 320, child: …);
```

:::

### dividers

Draws a hairline between the header, the body and the actions instead of separating them with space, and moves the vertical padding off the sheet and onto each section so the rules can reach both edges.

Worth turning on the moment the body scrolls: the body is the only part that does, and the lines are what say the header stayed put.

### dismissible

Turn it off for the drawer that has to be answered — and then give it actions that answer it, because there will be no other way out:

::: fw react

```tsx
<MPDrawer open dismissible={false} title="Choose a plan" actions={<MPButton>Continue</MPButton>}>
  …
</MPDrawer>
```

`MPDrawerClose` and an imperative close still work. It is Escape and the click on the scrim that are cancelled.

:::

::: fw flutter

```dart
MPDrawer(
  open: true,
  dismissible: false,
  title: const Text('Choose a plan'),
  actions: <Widget>[MPButton(onPressed: next, child: const Text('Continue'))],
  child: …,
);
```

The × and `MPDrawerClose` still work. It is Escape, the system back and the press on the scrim that are refused, and the system back does not go on to the page under the drawer either.

:::

### MPDrawerClose

An uncontrolled drawer has no state of the caller's for its Cancel button to set, and making every drawer controlled is a piece of state per drawer that exists only to answer a button.

::: fw react

`render` is Base UI's own escape hatch, so a real Material Plus button dismisses:

```tsx
<MPDrawerClose render={<MPButton variant="text">Cancel</MPButton>} />
```

It is a `modal` drawer's button — a `standard` one is not a dialog and has nothing for it to talk to.

:::

::: fw flutter

Its `builder` is handed the call that closes the drawer round it:

```dart
MPDrawerClose(
  builder: (BuildContext context, VoidCallback close) =>
      MPButton(variant: MPVariant.text, onPressed: close, child: const Text('Cancel')),
);
```

It works in a `standard` drawer too, where it closes the panel as the × does.

:::

## Accessibility

::: fw react

- A `modal` drawer is a real dialog: focus is trapped inside it, the page behind is inert, the scroll is locked, and focus returns to the trigger when it closes. All of that is Base UI's.
- `title` and `description` are wired to `aria-labelledby` and `aria-describedby`, so the panel announces itself rather than being read as an unnamed region.
- A `standard` drawer is **not** a dialog and does not pretend to be one. It gets a plain `<h2>` and `<p>`, because a dialog's parts outside a dialog would claim a role the panel does not have.

:::

::: fw flutter

- A `modal` drawer says it is a dialog (`SemanticsRole.dialog`) and names the route it opens with `title`'s words when `title` is a `Text`, or with `semanticLabel`. A title built from anything else has no words to hand over, so give that drawer a `semanticLabel`.
- Focus goes into the layer and stays there: it is a focus scope of its own, so <kbd>Tab</kbd> cannot reach the page under it, and a screen reader cannot either. When the drawer closes, focus goes back to whatever had it, which is usually the trigger.
- The system back (Android's back button and gesture, TalkBack's back, VoiceOver's escape scrub) closes a `dismissible` drawer as <kbd>Escape</kbd> does.
- `title` is announced as a level-2 heading in both modes. `description` is read after it as text; Flutter's semantics have no `aria-describedby` to wire it to.
- A `standard` drawer is **not** a dialog and claims none of that.

:::

- The body is the only part that scrolls, so the heading and the actions never leave the screen. Without `dividers` it carries a little padding and gives the space straight back, which is room for a focus ring the scroll container would otherwise clip.

::: fw flutter

## Differences from the React build

- **`trigger` is a builder.** Base UI merges its click handler onto the element it is given. A Flutter widget cannot be reached into, so `trigger` is handed the call that opens the drawer, and `MPDrawerClose` takes a `builder` in place of `render`.
- **`defaultOpen` is `initialOpen`**, Flutter's word for a starting value.
- **`actions` is a list of widgets**, laid out in a `Wrap` at the end of the line.
- **`extent` is a number of logical pixels**, without React's CSS strings such as `'40vh'`.
- **`semanticLabel` is new.** React names the drawer with whatever the title renders; a Flutter widget other than `Text` has no text to hand over.
- **No `keepMounted`.** It keeps a closed drawer's links in the markup a crawler reads, and a Flutter screen has no markup for one to read.
- **The panel fades with its scrim.** The layer under the panel fades on the scrim's 300ms both ways, so the panel's own opacity follows that rather than the slide's timings. The slide itself is MD3's pair.
- **The modal panel keeps out from under the system bars and the soft keyboard.** It runs under the bars on the three sides it touches and pads its content inside them, and it ends above an open keyboard.
- **No `classNames`, `className` or `style`.** There is no class list or style attribute to pass through.

:::

## See also

- [MPDialog](../feedback/dialog) — the same slots on a sheet in the middle of the page.
- [MPOverlay](../feedback/overlay) — for covering a region rather than attaching to an edge.
- [MPPanes](./panes) — for a sidebar the reader resizes rather than opens.
