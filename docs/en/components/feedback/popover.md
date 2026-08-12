---
title: MPPopover
order: 10
---

# MPPopover

<p class="mp-lede">A sheet that opens beside the thing that opened it — and, unlike a tooltip, one you can reach: it stays up until it is dismissed, and what is inside it can be clicked and typed into.</p>

<Demo src="popover/hero" :minHeight="140" />

```tsx
import { MPPopover, MPPopoverClose, MPButton } from 'material-plus-ui';

<MPPopover trigger={<MPButton variant="outlined">Rename</MPButton>} title="Rename this view">
  <MPTextField label="Name" value={name} onChange={setName} fullWidth />
  <MPPopoverClose render={<MPButton>Save</MPButton>} />
</MPPopover>;
```

## Props

<PropsTable name="MPPopover" />

## Which of the three you want

A popover, a [tooltip](./tooltip) and a [dialog](./dialog) all put a small sheet on the screen. They are not interchangeable, and the difference is about what the reader can _do_ next:

|  | [Tooltip](./tooltip) | **Popover** | [Dialog](./dialog) |
| --- | --- | --- | --- |
| Opens on | Hover or focus | A press | A press |
| Can be entered | No — it leaves as you approach | Yes | Yes |
| Holds controls | No | Yes | Yes |
| The page behind | Works | Works | Taken away |
| Dismissed by | Moving away | Escape, a click outside | Escape, the scrim, an action |

A tooltip is a **label** for something that is already there. A popover is a **detail beside** the page. A dialog is a question **instead of** it.

## The surface

`surface-container` at elevation 2 and `corner-medium`, which is what MD3 gives a menu and a rich tooltip — the two things in the specification that are this: a small sheet anchored to a control.

Deliberately **not** the dialog's `surface-container-high` at elevation 3. A popover has not taken the page, and should not sit above the menus that did not take it either.

There is no `variant` and no `color`, for the reasons the dialog gives: the five weights answer "how much does this surface assert itself against the page", and a popup that had to be asked for has already answered; and a popover that could be dyed would dye the form somebody put in it.

## Placement

<Demo src="popover/placement" :minHeight="120">

<<< @/.vitepress/demos/popover/placement.tsx

</Demo>

`side` is a **preference**, not an instruction. Base UI flips the popup to the opposite edge when there is no room, which is the right behaviour — a popup half off the screen is worse than one on the other side of its trigger.

`side` is physical (`top`, `right`, `bottom`, `left`) because it is the axis a popup travels along: a popover above its trigger is above it in every writing direction. `align` is logical (`start`, `center`, `end`) because it is a position along an edge, and that edge runs the other way under RTL.

### arrow

Off by default, which is what MD3 does with both the menu and the rich tooltip: a popup eight pixels from the control that opened it does not need to say what it belongs to. Turn it on where the trigger is far enough away that it does.

## Examples

### MPPopoverClose

An uncontrolled popover has no `setOpen` for its Cancel button to call, and making every popover controlled is a piece of state per popover that exists only to answer a button:

```tsx
<MPPopoverClose render={<MPButton variant="text">Cancel</MPButton>} />
```

### modal

`false` by default, and that is what separates a popover from a dialog: the page behind stays scrollable and clickable, because a detail beside the page should not stop the page.

`'trap-focus'` holds focus inside the popup without locking the scroll, which is what a popover full of form controls usually wants.

### dismissible

Turn it off only for a popup with its own way out, because there will be no other. Escape, the click outside and focus leaving are all cancelled; `MPPopoverClose` and an imperative close still work, which is what keeps `dismissible={false}` from being a trap.

### width

Overrides the cap `size` implies, for the popover whose _content_ decides its width — a form, a single line of help:

```tsx
<MPPopover width={420} title="Rename">
  …
</MPPopover>
```

An inline style rather than a class, because Tailwind finds classes by scanning source text and a `max-w-[420px]` built from a prop generates no rule at all.

## Accessibility

- `title` and `description` are wired to `aria-labelledby` and `aria-describedby`, so the popup announces itself rather than being read as an unnamed group.
- Focus returns to the trigger when the popup closes, whichever way it was closed.
- The trigger carries `aria-expanded` and the popup's id. All of that is Base UI's.
- The × is a real button with a name, and it is the last thing in the header rather than the first, so a reader hears what the popup is about before the way out of it.
- A popover is **not** a live region. It appears because somebody pressed something, and a reader who did that already knows.

## See also

- [MPTooltip](./tooltip) — for a label the reader cannot enter.
- [MPDialog](./dialog) — for a question that has to be answered first.
- [MPMenu](../inputs/menu) — for a list of actions, which has keyboard behaviour of its own.
