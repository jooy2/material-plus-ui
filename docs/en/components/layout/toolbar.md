---
title: MPToolbar
order: 24
---

# MPToolbar

<p class="mp-lede">A bar of controls: an application header, a page's action row, the strip along the bottom of an editor. Three slots and a row.</p>

<Demo src="toolbar/hero" :minHeight="220" />

```tsx
import { MPToolbar } from 'material-plus-ui';

<MPToolbar render={<header />} position="sticky" divider start={<Logo />} end={<Actions />}>
  <Title />
</MPToolbar>;
```

## Props

<PropsTable name="MPToolbar" />

## Three slots

`start` and `end` are pinned to their own ends and `children` takes what is left. That is the arrangement every toolbar has ever had, so it is laid out here rather than left to a caller and the spacer `<div>` they have to remember.

The middle stays `flex-1` even when there is nothing in it, or a bar with only a logo and a button would collapse the two together in the centre.

## It takes no height

A toolbar is as tall as the controls in it plus its padding, and that padding is the `size`/`density` pair every other surface uses. So the dense bar is `density={-2}` rather than a second prop meaning the same thing — and the type scale does not move, which is the rule everywhere `density` appears.

## It has no `role="toolbar"`, deliberately

That role is a promise about keyboard behaviour: one tab stop for the whole bar, arrow keys between the controls inside it. A bar that claims it without implementing it is worse for a keyboard reader than one that claimed nothing at all — they are told to press the arrow keys, and nothing happens.

- A page's header wants `render={<header />}`, which is a landmark and is true.
- A genuine roving-focus toolbar wants [MPButtonGroup](../inputs/button-group), which is one.

## Flat until you say otherwise

`elevation` is unset by default, so the bar draws no shadow even when it is pinned. A shadow under a header is a way of saying "there is content beneath this", and that is only true once the page has been scrolled — a bar that arrives already raised has made a claim about a page nobody has moved yet.

Raise it yourself when you are tracking the scroll, or leave it flat and turn on `divider`. The hairline faces the content, so it sits under a `top` bar and over a `bottom` one.

## Pinning

| `position` |  |
| --- | --- |
| `static` | In the flow, scrolling away with the content. |
| `sticky` | In the flow until it reaches the edge, then held there. It takes up its own room, so nothing underneath has to be padded around it. |
| `fixed` | Out of the flow entirely. The page needs padding of its own, or the first screenful sits behind the bar. |
| `absolute` | Pinned to the nearest positioned ancestor rather than to the window — a bar along the edge of a panel. |

A pinned bar drops its corners. A rounded corner against the edge of the screen is a gap with nothing behind it, so only a bar sitting in the flow is a sheet with corners.

## What it is not

Not [MPHeader](./header). That one is [MPPageLayout](./page-layout)'s own slot and knows about the sidebar, the skip link and the drawer that opens on a phone. This is a bar you can put anywhere, including inside a card.
