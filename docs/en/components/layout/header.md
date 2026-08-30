---
title: MPHeader
order: 14
---

# MPHeader

<p class="mp-lede">The bar across the top of a page. MD3's top app bar, with a site's own three regions on it — the mark, the middle, the actions.</p>

<Demo src="header/hero" :minHeight="220" />

```tsx
import { MPHeader, MPButton } from 'material-plus-ui';

<MPHeader brand="Acme" actions={<MPButton size="sm">Sign in</MPButton>}>
  <nav>…</nav>
</MPHeader>;
```

## Props

<PropsTable name="MPHeader" />

## Why it is a component and not a row of divs

Because a `<header>` at the top level of a document **is** the `banner` landmark.

That tag is what a screen reader's landmark list, a reader mode and a search engine's understanding of the page are all built out of, and it is the one thing a styled `<div>` cannot be. Everything else here — the three regions, the ladder, the surface — is what makes that tag comfortable to use.

## The three slots

`brand`, `children` and `actions`, laid out in that order, and they are props rather than compound sub-components for [MPCard](./card#why-the-sections-are-props)'s reason: the arrangement of a bar is fixed, and what a caller wants to decide is what goes in each region.

There is a second reason here. The middle can only be centred on the bar's own midline if the two ends are the component's to measure — a caller stacking three wrappers by hand has no way to make the ends equal, so their headline sits wherever the brand happens to end.

A slot left empty draws nothing at all: no wrapper, no gap.

Only the **brand** takes a type role — `title-large` at `md`, which is MD3's top app bar headline. The middle is as likely to be a row of links or a search field as a headline, and a scale imposed on it would be one every link had to undo.

## align

<Demo src="header/align" :minHeight="220">

<<< @/.vitepress/demos/header/align.tsx

</Demo>

`center` is MD3's own **center-aligned top app bar**, and it is centred on the _bar_ rather than in the space left over.

The difference is the whole reason this is a prop. Centring in what is left over puts the middle wherever the brand happens to end, so a name one character longer moves the headline — which is exactly what a reader notices between two pages of one site. Both ends are given equal shares instead, and equal ends put the middle on the midline whatever is in them. An end with nothing in it still takes its share.

## variant

<Demo src="header/variant" :minHeight="320">

<<< @/.vitepress/demos/header/variant.tsx

</Demo>

The **container** ladder, because a bar holds somebody else's content and dyeing it would dye theirs — the argument is [MPBox](./box#why-it-is-never-dyed-and-takes-no-color)'s.

| Variant    | What it paints                                   |
| ---------- | ------------------------------------------------ |
| `tonal`    | `surface-container` — MD3's **scrolled** app bar |
| `outlined` | `surface` with a hairline along the bottom edge  |
| `filled`   | `surface-container-highest`                      |
| `elevated` | `surface-container-low` under a level-2 shadow   |
| `text`     | Nothing at all — for a bar over a hero image     |

### Why there is no `divider`

[MPBottomNavigation](./bottom-navigation) has one and this does not, and the difference is that this takes a `variant`.

MD3 separates a bar from the content by **tone**, not by a rule: `surface-container` against `surface`. The one case a hairline is for is the bar that paints the page's own surface — and that bar is `variant="outlined"`. The rule is what `outlined` _means_ here: a container's outline goes all the way round, and a bar has exactly one edge with anything on the other side of it. That is the same specialization [MPDrawer](./drawer) makes for its own free edge.

## position

`sticky` by default. It holds the bar against the top of the window once the page has scrolled to it, while leaving it in the flow — so nothing below has to be padded out of its way.

`fixed` takes it out of the flow entirely. Inside an [MPPageLayout](./page-layout) that is answered for you: the layout measures the bar and reserves its height, so the first paragraph is not underneath it.

`static` lets the bar scroll away, which is right for a marketing page whose header is not navigation you keep reaching for.

## Inside a layout, and outside one

Inside an [MPPageLayout](./page-layout) the bar registers itself, so a column that holds its place knows how far down the window to start and a `fixed` bar has its height reserved.

Outside one it is simply a bar, and everything above still holds. That is deliberate — a landing page with a header and no sidebar should not have to adopt a layout to get one.

## Examples

### The hamburger goes in the brand slot

Ahead of the mark, which is where thirty years of them have taught readers to look:

```tsx
<MPHeader
  brand={
    <>
      <MPSidebarTrigger />
      Acme
    </>
  }
/>
```

An [MPSidebarTrigger](./sidebar#mpsidebartrigger) draws itself only while the sidebar is collapsed, so nothing here needs a condition.

### Lining the bar up with the article under it

```tsx
<MPHeader maxWidth="md" brand="Acme">…</MPHeader>
<MPContainer maxWidth="md">The article.</MPContainer>
```

The sheet still spans the window; only the row of slots is held to the measure. Both read the same ladder, so the two line up on one edge at every width.

### A transparent bar over a hero

```tsx
<MPHeader variant="text" position="absolute" brand="Acme" />
```

`absolute` pins it to the region it is in rather than to the window — see [MPPosition](../../design/prop-conventions).

## Accessibility

- The bar is a `<header>`. At the top level of a document that is the `banner` landmark; nested inside an `<article>` or a `<section>` it is not, which is correct — a card's own header is not the site's.
- Give it a `label` when a page has two. "Banner" twice tells a reader which is which not at all.
- The middle slot is not a `<nav>` on its own. Put one there when what is in it is navigation, so a screen reader can offer it as a region.
- The bar has no tab stop of its own; everything focusable in it is whatever you put in a slot.

## See also

- [MPPageLayout](./page-layout) — the skeleton this is the top of.
- [MPFooter](./footer) — the same decisions at the other end of the page.
- [MPBottomNavigation](./bottom-navigation) — MD3's navigation bar, which is a bar of destinations rather than a bar of regions.
- [MPSidebar](./sidebar) — the column beside the content, and the trigger that belongs in `brand`.
