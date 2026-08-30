---
title: MPAlert
order: 1
---

# MPAlert

<p class="mp-lede">A message about something that happened, set into the page it is about. One component with different slots filled — a bare line, a line with a glyph, or a glyph with a headline and the detail under it.</p>

<Demo src="alert/hero" :minHeight="180" />

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

<<< @/.vitepress/demos/alert/variants.tsx

</Demo>

Note what changes between them. On `filled` and `tonal` the container _is_ the accent, so the glyph and the heading ride on it as one ink. On the three neutral surfaces the accent has nowhere else to go, so it is spent on exactly the two things that say which kind of alert this is — and the message stays ordinary reading text.

## Four families, not a severity ladder

There is no `info`, `success` or `warning`.

The specification's colour system does not have them, and [the token sheet](../../design/color) has no way to derive them — offering three more families would be promising roles the theme cannot produce, and an application that themed `primary` would find its "success" alerts unchanged.

What there is instead: `error`, which is the one severity Material does name, and an emphasis choice for everything else. A message that means something the palette has no word for says so with a **glyph** rather than by borrowing a colour.

<Demo src="alert/colors" :minHeight="320">

<<< @/.vitepress/demos/alert/colors.tsx

</Demo>

## Which live region it lands in

The family decides by default, because it is the only thing that knows how urgent the message is:

| `color` | `live` | What that does |
| --- | --- | --- |
| `error` | `assertive` | Interrupts whatever a screen reader is in the middle of |
| `primary`, `secondary`, `tertiary` | `polite` | Waits for a pause |

"This failed" is worth interrupting for and "Saved" is not.

`live` overrides it, and the value worth knowing about is the third one. **A live region is for content that _arrives_.** An alert that was in the markup when the page loaded did not arrive — it is part of the page, and interrupting to read it is interrupting to say something the reader was going to reach anyway:

```tsx
// An error summary the server rendered. Still an alert on the screen; not an
// announcement.
<MPAlert color="error" live="off">
  Three fields need attention.
</MPAlert>
```

And the other way, for a message that is quiet by family and urgent in fact:

```tsx
<MPAlert live="assertive">Your session ends in one minute.</MPAlert>
```

## Examples

### title

With a heading the alert is two-part; without one the whole thing is a single line. Under a heading the message steps back to `on-surface-variant`, the same role a field's supporting text takes — on its own it _is_ the alert, and stays reading text.

```tsx
<MPAlert>One line.</MPAlert>

<MPAlert title="Two parts">And the detail under it.</MPAlert>
```

### icon

Defaults to the glyph that goes with `color`. Only two defaults exist because only two are honest: the error family gets the error glyph and everything else gets the informational one.

```tsx
<MPAlert icon={false}>No glyph at all.</MPAlert>

<MPAlert icon={<MPIcon icon={ICONS.success} size={20} />}>Something more specific.</MPAlert>
```

The glyph is centred on the **first line** of text rather than on the whole message, so a one-line alert looks centred and a three-line one still has its glyph at the top.

### action and onClose

`action` is kept out of `children` so it stays on the first line while the message wraps. `onClose` is what makes the × appear at all — there is no `dismissible` boolean, because a dismiss button with nothing to call is a button that does nothing.

```tsx
<MPAlert action={<MPButton variant="text">Retry</MPButton>} onClose={() => setShown(false)}>
  Upload failed.
</MPAlert>
```

### locale

The × has no text of its own, so its accessible name is a word this library has to invent. It comes from `locale`, or from the nearest [`MPLocaleProvider`](../../design/localization), or from `closeLabel` when neither is right.

```tsx
<MPAlert locale="ko" onClose={dismiss}>
  저장했습니다.
</MPAlert>
```

## Accessibility

- The whole alert is a live region, so a message that appears after the page has loaded is announced. See the table above for which kind.
- The × is a real button with a name, and it is the last thing in the row rather than the first, so a reader hears the message before the way out of it.
- The default glyph is decorative and hidden from the accessibility tree — the family it stands for is already in the words.

## See also

- [MPSnackbar](./snackbar) — for a message that may be missed.
- [MPDialog](./dialog) — for one that has to be answered before anything else can happen.
- [MPEmpty](./empty) — for a region with nothing in it, which is a different problem.
