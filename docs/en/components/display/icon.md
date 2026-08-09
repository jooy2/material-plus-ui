---
title: MPIcon
order: 1
---

# MPIcon

<p class="mp-lede">A wrapper that gives an icon glyph a size and a colour. Material Plus draws no icons of its own, so the glyph comes from whichever set you chose — <code>lucide-react</code> ships with the package, and anything else works just as well.</p>

<Demo src="icon/hero" />

```tsx
import { MPIcon, ICONS } from 'material-plus-ui';

<MPIcon icon={ICONS.success} size={24} color="green" label="Deployed" />;
```

## Props

<PropsTable name="MPIcon" />

Every native `<span>` attribute passes through, and a `ref` reaches the box.

## The glyph is a prop, not children

```tsx
<MPIcon icon={ICONS.search} />       // ✅
<MPIcon>{<SearchIcon />}</MPIcon>    // ✗ — there is no children prop
```

The reason is that the two things you always want to decide about an icon — how big it is and what colour it is — are the two things you cannot reach once it is a child of something. As a prop it is content `MPIcon` _sizes_, not content it merely wraps.

## Examples

### icon

Two forms are accepted, because icon sets hand back two different things.

<Demo src="icon/custom">

<<< @/.vitepress/demos/icon/custom.tsx

</Demo>

**A component** is what `lucide-react`, `react-icons` and most sets export, and it is the form that lets `MPIcon` pass the size and the colour _into_ the glyph rather than trying to style an element from the outside.

```tsx
<MPIcon icon={ICONS.close} size={20} />
```

**An element** is a drawing of your own, a glyph already constructed by some other set, or an `<img>`. It is scaled by the box it is laid into.

```tsx
<MPIcon icon={<svg viewBox="0 0 24 24">…</svg>} size={20} />
<MPIcon icon={<DeleteIcon />} size={20} />
```

The distinction is made with `React.isValidElement` and nothing else, which is why a `forwardRef` object — what every modern icon set actually exports — is correctly treated as a component rather than as something already drawn.

### size

A number is CSS pixels; a string is any CSS length, so `size="1em"` tracks the surrounding text.

<Demo src="icon/sizes">

<<< @/.vitepress/demos/icon/sizes.tsx

</Demo>

There is no size ladder — no `sm`/`md`/`lg`. Icon sets are drawn on a pixel grid at specific sizes, and a wrapper inventing five steps of its own would be a second opinion about a decision the set already made. Left unset, the glyph draws at whatever size it was authored at.

The length is written to the box **and** to its `font-size`, which is what makes an `<svg>` carrying its own `width` and an `<svg>` sized in `em` come out the same.

### color

Any CSS colour. Left unset the icon inherits the colour of whatever it sits in, which is right far more often than a colour of its own — an icon in a button label, a muted caption or an `Alert` should be that element's colour.

<Demo src="icon/colors">

<<< @/.vitepress/demos/icon/colors.tsx

</Demo>

The glyph is told `currentColor` even when no colour is given, so a set whose own default is a fixed colour still follows the text it sits in.

### label

Without `label` the icon is `aria-hidden` and leaves the accessibility tree. That is the default because most icons sit beside text that already says the same thing, and reading both aloud is worse than reading one.

```tsx
// The text next to it already says "Delete".
<Button startIcon={<MPIcon icon={ICONS.close} />}>Delete</Button>

// There is nothing but the glyph, so it needs a name.
<MPIcon icon={ICONS.close} label="Dismiss" />
```

With a `label` the box becomes `role="img"` with that name.

## The bundled icon set

`lucide-react` is a dependency of this package, and every glyph the library's own components draw is named in one file — `src/constants/icons.ts`. There are two ways to reach it.

```tsx
import { ICONS, SearchIcon } from 'material-plus-ui';

<MPIcon icon={ICONS.search} />     // by role name
<MPIcon icon={SearchIcon} />       // as a named import
```

The keys are the roles the components ask for (`visibility`), not the drawings lucide happens to ship (`Eye`). A component asks for the idea, so the drawing behind it can be swapped without touching a component.

::: tip Which one to use `ICONS` is an object literal, so a bundler cannot tree-shake it property by property — importing it pulls in every glyph in the table. Reach for the named imports when you only need one or two, and for `ICONS` when you want a name-keyed registry. :::

You are not limited to this set. `MPIcon` takes anything shaped like an icon component, so `react-icons`, `@material-symbols`, another Material icon package or your own SVGs all work without a wrapper.
