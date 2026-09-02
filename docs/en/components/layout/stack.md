---
title: MPStack
order: 18
---

# MPStack

<p class="mp-lede">Things laid over each other in a pile. A stack of avatars, a deck of cards, a heap of documents, a run of overlapped thumbnails — one component, because "several of these, overlapping" is one idea.</p>

<Demo src="stack/hero" :minHeight="360" />

```tsx
import { MPStack } from 'material-plus-ui';

<MPStack ring max={4} total={people.length} overflow={(n) => <MPAvatar initials={`+${n}`} />}>
  {people.slice(0, 4).map((person) => (
    <MPAvatar key={person.id} name={person.name} src={person.avatar} />
  ))}
</MPStack>;
```

## Props

<PropsTable name="MPStack" />

## Replacing MPAvatarGroup

`MPAvatarGroup` is **gone**, and this is what it was: a special case of overlapping that happened to be about faces. The stacking, the count and the ring are all here and none of them were ever about avatars.

```tsx
// Before
<MPAvatarGroup max={4} total={40} size="sm" shape="square" variant="filled">
  {faces}
</MPAvatarGroup>

// After
<MPStack ring max={4} total={40} overflow={(n) => <MPAvatar initials={`+${n}`} />}>
  {faces}
</MPStack>
```

Three things to know before you migrate.

**The count is now yours to draw.** `overflow` is a **function** of the number that did not fit, because that number is the whole of what the last item has to say — and because a generic stack has no idea what the other items look like, so it cannot make a matching one. Leave it out and the remainder is simply not drawn.

**`ring` is off by default.** A hairline in the page's own `surface` is what puts an edge between two circles of similar tone, and it is exactly wrong on a deck of cards that already has one.

**The shared appearance is gone, and this is the real cost.** `MPAvatarGroup` set `size`, `shape`, `variant` and `color` once for the whole run; `MPStack` does not know what its children _are_, so it cannot. `size` here picks the default overlap and is not passed on.

Set what your items share on [MPConfigProvider](../../guide/config) — which covers `size` and `color` for the whole page — and put `shape` and `variant` on the avatars:

```tsx
<MPConfigProvider size="sm">
  <MPStack ring>
    {faces.map((face) => (
      <MPAvatar key={face.id} {...face} shape="square" variant="filled" />
    ))}
  </MPStack>
</MPConfigProvider>
```

## Why the overlap is a margin and not a `translate`

This is the detail nearly every implementation of a pile gets wrong, and it is invisible until something is put next to one.

Move the items with `translate` and each one still **occupies its full width**. The box stays the size of all of them laid end to end, the pile is drawn outside it, and everything after the stack on the page is positioned against a measurement that is wrong. It cannot go in a sentence.

A negative margin takes the space back, so the box is exactly the size of what is drawn. Five 32px items at a 10px overlap:

| direction    | box    |
| ------------ | ------ |
| `horizontal` | 120×32 |
| `vertical`   | 32×120 |
| `diagonal`   | 120×72 |

The margin is **logical**, so a horizontal pile overlaps the other way under RTL without being asked to.

## Why `diagonal` is a horizontal flow

Because a flow only overlaps items on the axis it flows along. `diagonal` is `flex-row` — the X advance is the flow's, exactly as it is for `horizontal` — and the vertical offset is written per item as a margin multiplied by that item's **index**.

A fixed `margin-block-start` in a row does not accumulate. It puts every item at the same offset, and the fan does not happen.

## It is not 45°, and it does not pretend to be

The horizontal advance is `item width − overlap`, and a library does not have the item's width: it is whatever you put in. So the vertical fall is a separate prop, `drop`, and its default is `overlap` — a shallow fan rather than a true diagonal.

If you want 45° you know your item's width and can say `drop={width - overlap}`.

## Two layers per item

Each item is wrapped twice. The outer span carries the offset, the `z-index` and the entrance; the inner one carries the static `scale` and `opacity` that make `scaleStep` and `opacityStep`.

They are separate because the `grow` and `zoom` keyframes animate the individual `scale` property, and an animation and a resting depth on the same element means the keyframe wins — the depth would vanish the moment anything was animated.

The wrappers are also what keeps this off your children. Cloning them to add a `className` would require **every** child to accept one, and a face wrapped in a router's link or a tooltip trigger has no obligation to. Your elements come through untouched.

`ring` is the one exception and it is honest about the cost: it is a fixed-depth descendant selector, so it lands on the element this stack wrapped. A child that is itself a wrapper gets the ring on the wrapper, which for a circular avatar inside a `<span>` means a square ring.

## Examples

### front

Which end of the pile is nearest the reader. `first` by default, so a pile read from the start is read front to back and the item it is _about_ comes first.

It is said with a `z-index` rather than left to the document, which paints later siblings on top. An implicit order would also hold only until something in the pile acquired a `z-index` of its own.

### scaleStep and opacityStep

Multiplied against the item in front, so the front item is never touched and the fifth card at `scaleStep={0.94}` is at about three quarters.

Both change what is **drawn** and not what is measured, so the spacing of the pile is the same either way. A scaled card does not pull the ones behind it closer, which is what keeps the layout stable while a deck is being tuned.

### transition

An entrance for each item, from the same seven the `MPAnimate*` components run, with `stagger`, `durationStep` and `reverse` over the pile. `reverse` deals it from the back.

This is on the stack rather than composed from outside for one reason: the items are inside wrappers this component builds, so nothing outside can reach them.

It is also why `MPStack` is 2.1 kB rather than the 0.9 kB the layout alone would come to — it reads the same effect table `MPAnimateFade` does. That is a real cost and it is written down here rather than left to be found: a stack of four faces with no `transition` is paying for six effects it will never run.

## Accessibility

- The stack has **no role**. A pile of faces beside a project's title is decoration for the sentence next to it; wrap it in something that names it when it is not.
- The wrappers are plain `<span>`s with no semantics, so a list of links inside a stack is still a list of links.
- `front` changes the painting order and nothing about the document order, so what a screen reader reads is the order you wrote.

```tsx
<div role="group" aria-label="On this project">
  <MPStack ring max={4} total={12}>
    …
  </MPStack>
</div>
```

## See also

- [MPAvatar](../display/avatar) — the thing this is most often a pile of.
- [MPConfigProvider](../../guide/config) — for the `size` and `color` the group used to set.
- [MPAnimateAppear](../motion/animate-appear) — for a set arriving that is not overlapping.
