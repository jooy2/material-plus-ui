---
title: MPVisuallyHidden
order: 21
---

# MPVisuallyHidden

<p class="mp-lede">Text for a screen reader and nobody else. The sentence behind a bare number, a lone glyph, or a sort arrow.</p>

<Demo src="visually-hidden/hero" :minHeight="220" />

```tsx
import { MPVisuallyHidden } from 'material-plus-ui';

<button>
  <MPIcon icon={ICONS.close} />
  <MPVisuallyHidden>Close this dialog</MPVisuallyHidden>
</button>;
```

## Props

<PropsTable name="MPVisuallyHidden" />

## Why it is a component and not advice

Nine components here were already drawing themselves with this rule — `MPPagination`'s live region, `MPRating`'s radios, `MPShortcut`'s key names, `MPCarousel`'s slide announcement, `MPProgressLinear`'s label. An application putting a bare glyph in a button of its own had no way to reach the same treatment. The library had the rule; it did not have the name.

The cases are all the same shape: a visible mark that a reader who can see it expands instantly and a reader who cannot gets **nothing at all** from.

| What is drawn        | What is read       |
| -------------------- | ------------------ |
| `3` on a badge       | 3 unread messages  |
| `↑` in a column head | Sorted ascending   |
| `↗` after a link     | Opens in a new tab |
| `JM` in an avatar    | Jo Min-jun         |

## Not `hidden`, not `display: none`, not `opacity: 0`

The first two take the text off the accessibility tree along with the screen, which is the opposite of what is wanted. The third leaves a **clickable ghost** the size of the words, sitting over whatever is underneath.

A 1px clipped box is the one form that is invisible to a sighted reader and present to every other kind:

```css
position: absolute;
width: 1px;
height: 1px;
overflow: hidden;
white-space: nowrap;
clip-path: inset(50%);
```

### Why not `sr-only`

Which is Tailwind's own utility for exactly this, and it is what the rule above is written out from.

It is written out because `sr-only` is **generated**. A project running its own Tailwind build with a `prefix` configured generates it under a different name, and a component that hardcoded `sr-only` would come out visible on their page. The arbitrary properties survive any prefix — the same reason [the stylesheet ships no Preflight](../../guide/getting-started.md#it-contains-no-reset).

## It stays in the layout

`position: absolute` means it takes no room. It is still **in the document**, which is the whole point: it is read in the order it is written.

```tsx
<p>
  Sent <MPVisuallyHidden>on</MPVisuallyHidden> Tuesday
</p>
```

reads as _Sent on Tuesday_. Put it where the sentence belongs rather than at the end of the block.

## Something other than a `<span>`

`render` is Base UI's escape hatch, and a hidden heading is the usual reason — a landmark that gives a section a name in the accessibility tree without putting a title on the screen:

```tsx
<nav>
  <MPVisuallyHidden render={<h2 />}>Pagination</MPVisuallyHidden>
  {/* … */}
</nav>
```

## Sharp edges

- **A focusable thing inside this stays focusable**, and a reader tabbing into it lands somewhere they cannot see. Anything that can take focus wants `aria-label` on the control instead — which is what [`MPIconButton`](../inputs/icon-button.md) does, and why its `label` is required.
- **It is not a live region.** Text swapped inside it is not announced unless the element also carries `aria-live` — which is passed straight through, and is how the components above use it.
- **A `className` that sets `position` or `clip-path` undoes it.** Class names here are concatenated rather than merged, so a utility landing later in the stylesheet wins and the content comes back into view. See [Class names and styles](../../guide/getting-started.md#class-names-and-styles).

## Next

- [MPIconButton](../inputs/icon-button.md) — a glyph button that names itself.
- [MPIcon](./icon.md) — the glyph that goes beside it.
