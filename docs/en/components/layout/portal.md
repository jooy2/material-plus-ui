---
title: MPPortal
order: 21
---

# MPPortal

<p class="mp-lede">Children rendered somewhere else in the DOM, usually the end of <code>&lt;body&gt;</code>. For a subtree that has to escape a clipping or stacking context its own position would trap it in.</p>

<Demo src="portal/hero" :minHeight="220" />

```tsx
import { MPPortal } from 'material-plus-ui';

<MPPortal>
  <div className="fixed inset-x-0 bottom-0">…</div>
</MPPortal>;
```

## Props

<PropsTable name="MPPortal" />

## The two traps it gets out of

Neither is visible from reading the markup, which is what makes them worth a component.

**Clipping.** An `overflow: hidden` anywhere above an element clips it, however far above. A panel drawn from inside a scrolling card is cut off at the card's edge no matter what its own position says.

**Containing blocks.** A `transform`, a `filter`, a `backdrop-filter` or an `opacity` below `1` on an ancestor makes a new containing block, and a `position: fixed` descendant is then measured against _that_ rather than against the viewport. So a fixed overlay inside an animated card lands somewhere unrelated to the window, and only while the animation is running.

## Most components here do not need it

Every popup in this library already portals itself — a select's list, a dialog, a tooltip, a menu, a drawer's panel. A component whose whole job is to sit over the page cannot leave that to a caller.

This is for a caller's **own** overlay, in a page whose structure it does not control.

## It does not trap focus, and does not manage the stack

A portal moves an element in the DOM. That is all it does.

Focus, Escape, an inert background, a scrim and a `z-index` are the _dialog's_ concerns, and a hand-built overlay in a portal has none of them. Reach for [MPDialog](./drawer) or [MPDrawer](./drawer) before this — the accessibility they carry is most of what they are.

## Nothing on the first render, and never on a server

A portal needs a real DOM node and there is none while the server renders. So it draws nothing on the server and nothing on the first client render, and opens on the render after that.

That is what keeps hydration honest: markup that appeared in one pass and not the other is exactly the mismatch React warns about. The practical consequence is that **a portal's content is never in the HTML a crawler reads**, so anything that has to be indexed does not belong in one.

## `container` takes a ref, and waits for it

```tsx
const panel = React.useRef<HTMLDivElement>(null);

<div ref={panel} />
<MPPortal container={panel}>…</MPPortal>
```

A ref is `null` on the first render and filled in during the commit that draws the element. This looks for the container after **every** render rather than only on mount, so one that appears later is picked up — and it renders nothing while there is none, rather than falling back to the body and moving the content a frame later.

## Events still bubble through React

A click inside a portal reaches an `onClick` on the element that rendered it, even though the DOM says the two are unrelated. That is React's own behaviour rather than anything added here, and it catches people both ways: a menu inside a portal inside a clickable card still opens the card.

## `disabled` saves the branch, not the state

Changing it **remounts** the children, exactly as `{escape ? <MPPortal>{x}</MPPortal> : x}` would — React sees a portal and an inline subtree as different elements, and everything below loses its state, its scroll position and the focus in it.

So decide once, per mount. The prop is there for the component that is portalled in one context and inline in another, not for something to toggle.
