---
title: MPButton
order: 1
---

# MPButton

<p class="mp-lede">Material Design's five buttons — filled, tonal, elevated, outlined and text — across four accent families and the library's size ladder. The state layer, the disabled opacities and the pill shape all come from Material Design 3's own component tokens.</p>

<Demo src="button/hero" :minHeight="64" />

```tsx
import { MPButton } from 'material-plus-ui';

<MPButton onClick={save}>Save</MPButton>;
```

## Props

<PropsTable name="MPButton" />

## Examples

### variant

Five, and they are not five shades of one thing. Each is a different answer to the same question — how does this action separate itself from the page.

<Demo src="button/variants" :minHeight="300">

<<< @/.vitepress/demos/button/variants.tsx

</Demo>

`elevated` is the one worth knowing about. It is a **neutral** surface that separates itself with a shadow rather than with colour, which is what makes it the one to reach for over a photograph or a coloured panel — the two tonal variants have nothing quiet enough to sit on there.

::: tip One filled button per screen

Material's rule, and it survives contact with real screens: `filled` is the single thing this view is for. A screen with three filled buttons on it has told the reader nothing about which one to press.

:::

### color

Four accent families: `primary`, `secondary`, `tertiary` and `error`. Not Material UI's six — the specification's colour system has no `info`, `success` or `warning`, and offering them would promise roles [the token sheet](../../design/color) has no way to derive.

```tsx
<MPButton color="error">Delete account</MPButton>
```

`error` is a family like any other here, deliberately. A destructive button and a primary one differ only in which palette they read, and a component that special-cased the error colour would need a second code path for the one case that most needs to look like all the others.

Arbitrary colour values are not accepted. To change what `primary` _is_, set the token — that way one change reaches every component at once instead of every call site.

### loading

Swaps `startIcon` for a spinner and stops the button firing.

<Demo src="button/states" :minHeight="64">

<<< @/.vitepress/demos/button/states.tsx

</Demo>

It is deliberately **not** `disabled`. A button that leaves the tab order the moment it is pressed takes the keyboard focus with it, and the reader is returned to the top of the document while the request they just made is still in flight. So the button keeps its place, says `aria-busy` and `aria-disabled`, and swallows the click.

### startIcon and endIcon

Content placed either side of the label, sized from the same rung the button is.

```tsx
<MPButton startIcon={<MPIcon icon={ICONS.check} size={20} />}>Save</MPButton>
```

With no `children` at all the button goes square and becomes an icon button. Give it an `aria-label` when it does — there is no text left to name it.

```tsx
<MPButton aria-label="Search" startIcon={<MPIcon icon={ICONS.search} size={20} />} />
```

### size

Five rungs, sharing the library's control ladder: 32, 40, 56, 64 and 72 pixels. The first three are Material's own extra-small, small and medium button heights; `lg` and `xl` are this library's, because the spec's are 96 and 136 and a 96px button beside a 64px field is not a row. See [Prop conventions](../../design/prop-conventions#size).

<Demo src="button/sizes" :minHeight="330">

<<< @/.vitepress/demos/button/sizes.tsx

</Demo>

The label's type scale and the padding around it come off the same rung, which is why a taller button is not simply a taller pill.

## What this does not have

**No `href`.** A button that navigates is a link, and the difference is not cosmetic: a link is announced as one, opens in a new tab on the middle button, and shows its destination in the status bar. Pass `render={<a href="…" />}` — Base UI's own escape hatch — rather than teaching a button to lie about what it is.

**No ripple.** MD3 dropped it. The state layer replaced it, and it says the same thing without an animation that has to finish before the screen it triggered is allowed to change.

## Accessibility

- The focus indicator is `secondary` and drawn **outside** the button, which is MD3's own rule: a ring drawn inside a filled button is a ring drawn on top of the fill it is meant to be distinguishable from.
- `type` defaults to `button` rather than the native `submit`, so an unrelated button inside a form does not submit it.
- `loading` announces itself with `aria-busy` and keeps the button focusable.
- An icon-only button needs an `aria-label`. Nothing else can name it.

## See also

- [MPButtonGroup](./button-group) — for a run of them.
- [MPSegmentedButton](./segmented-button) — for one-of-a-set, which is not what a group of buttons is.
- [Base UI Button](https://base-ui.com/react/components/button) — the behaviour underneath.
