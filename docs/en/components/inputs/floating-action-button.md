---
title: MPFloatingActionButton
order: 9
---

# MPFloatingActionButton

<p class="mp-lede">The one action a screen is about, floating over it. Material's three containers, its three sizes with the corner each of them takes, level-3 elevation and the extended shape — the default is the specification's own FAB exactly: <code>primary-container</code> under <code>on-primary-container</code>.</p>

<Demo src="floating-action-button/hero" :minHeight="140" />

```tsx
import { ICONS, MPFloatingActionButton, MPIcon } from 'material-plus-ui';

<MPFloatingActionButton icon={<MPIcon icon={ICONS.add} />} label="Compose" />;
```

## Props

<PropsTable name="MPFloatingActionButton" />

## label is required

A button whose whole label is a drawing has no accessible name at all, and "a floating button with no `aria-label`" is a defect that ships precisely because the control looks finished without one.

Making it required is the only fix that survives review: a default would be a name that is right for nobody, and a warning is a thing that gets filtered out of a console. With `extended` the same string is also the word written on the button, so the two can never say different things.

## The corner is on the size ladder here

**This is the one component in the library where it is**, and it is on it because the specification puts it there:

| `size` | Height | Corner               | MD3       |
| ------ | ------ | -------------------- | --------- |
| `xs`   | 40dp   | `corner-medium`      | Small FAB |
| `sm`   | 48dp   | `corner-large`       | —         |
| `md`   | 56dp   | `corner-large`       | FAB       |
| `lg`   | 72dp   | `corner-extra-large` | —         |
| `xl`   | 96dp   | `corner-extra-large` | Large FAB |

Everywhere else a radius is a statement about what kind of object something is rather than a size to taste — see [MPBox](../layout/box) — and it stays fixed across the rungs. Here the _object_ changes with the rung, which is MD3's own reading of it: a 96dp disc and a 40dp one are two different pieces of furniture, not one at two sizes.

## The three containers

| `variant`  | Container                | Ink                    | MD3         |
| ---------- | ------------------------ | ---------------------- | ----------- |
| `tonal`    | `primary-container`      | `on-primary-container` | The default |
| `filled`   | The accent               | `on-primary`           | —           |
| `elevated` | `surface-container-high` | The accent             | Surface FAB |

`outlined` and `text` are absent because a floating button **is** its container. A hairline disc over a scrolling page is a shape with the page moving through it, and a text one is a glyph with nothing to press.

`color` moves all three onto another family. It is not an arbitrary colour: to change what `primary` is, set the token.

## position

`fixed` by default — against the `static` everything else in this library defaults to — because that is the component. Everything else sits in the page's flow and would be wrong to take out of it; this one is defined by not being part of the page.

<Demo src="floating-action-button/anchored" :minHeight="260">

<<< @/.vitepress/demos/floating-action-button/anchored.tsx

</Demo>

`absolute` pins it to the nearest positioned ancestor instead, which is what a button floating over a card, a map or a preview wants. `static` puts it back in the flow — drawn as `position: relative`, because the state layer still needs something to fill.

`corner` is logical, so `bottom-end` is bottom-left under RTL, and `offset` is the distance from both edges. Material's own is 16dp, which is the default.

## Why there is no speed dial

A floating button that fans out into three or four smaller ones is a Material **2** pattern, and MD3 dropped it.

It was never good. The actions are unlabelled discs in the corner of the screen, they cover the content the reader was looking at, and a fan of buttons that claims `role="menu"` without the keyboard contract of one is worse for a keyboard reader than something that never claimed anything.

When there genuinely are several actions, they belong in an [MPMenu](./menu) — which _is_ a menu, with the roving focus, the typeahead and the escape behaviour that word promises — opened from this button:

```tsx
<MPMenu trigger={<MPFloatingActionButton icon={<MPIcon icon={ICONS.add} />} label="Create" />}>
  <MPMenuItem>Document</MPMenuItem>
  <MPMenuItem>Spreadsheet</MPMenuItem>
</MPMenu>
```

## When this is the wrong component

**When it is not the one action the screen is about.** A FAB is a promise that there is exactly one thing worth doing here; two of them on a screen is a screen with no primary action at all. Everything else is an [MPButton](./button).

**For an action about one row or one card**, use an [MPIconButton](./icon-button) in that row. A floating button belongs to the screen.

## Accessibility

- `label` is the accessible name, and it is required. There is no way to render this component without one.
- Base UI's button is underneath, so `disabled` keeps it out of the tab order without the composition problems a bare `aria-disabled` brings, and a keyboard press lights the same state layer a pointer press does.
- A disabled floating button loses its shadow as well as its colour. A button still floating while it cannot be pressed is a button still claiming to be the thing to do.
- `type` is `button`, not `submit`. A native button defaults to submitting the form around it.

## See also

- [MPButton](./button) — every other action on the screen.
- [MPIconButton](./icon-button) — a glyph with a name, in a row or a card.
- [MPMenu](./menu) — what several actions behind one press should actually be.
