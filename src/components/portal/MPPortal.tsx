import * as React from 'react';
import { createPortal } from 'react-dom';

export interface MPPortalProps {
  /**
   * Where to render. An element, a ref to one, or nothing for `document.body`.
   *
   * A ref is the useful form for a container this same page renders — it is
   * `null` on the first render, and the portal waits rather than falling back to
   * the body and moving afterwards.
   */
  container?: Element | React.RefObject<Element | null> | null;
  /**
   * Renders in place instead, as though the portal were not there.
   *
   * For the component that is portalled in one context and not in another — a
   * panel that escapes a clipping ancestor on a page and belongs inline in a
   * printed view.
   *
   * It saves the branch and not the state: React sees a portal and an inline
   * subtree as different elements, so changing this **remounts** the children
   * exactly as `{escape ? <MPPortal>{x}</MPPortal> : x}` would. Anything below
   * it loses its state, its scroll position and the focus in it. Decide once,
   * per mount, rather than toggling.
   */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Children rendered somewhere else in the DOM, usually the end of `<body>`.
 *
 * For a subtree that has to escape a clipping or stacking context its own
 * position would trap it in. Both of those are real and neither is obvious from
 * looking at the markup: an `overflow: hidden` anywhere above an element clips
 * it, and a `transform`, a `filter` or an `opacity` below 1 makes a new
 * containing block that a `position: fixed` child is measured against rather
 * than the viewport.
 *
 * ```tsx
 * <MPPortal>
 *   <div className="fixed inset-x-0 bottom-0">…</div>
 * </MPPortal>
 * ```
 *
 * ## Most components here do not need it
 *
 * Every popup in this library already portals itself — a select's list, a
 * dialog, a tooltip, a menu, a drawer's panel — because a component whose whole
 * job is to sit over the page cannot leave that to a caller. This is for a
 * caller's **own** overlay, in a page whose structure it does not control.
 *
 * ## Nothing on the first render, and never on a server
 *
 * A portal needs a real DOM node and there is none while the server renders, so
 * this returns `null` there and again on the first client render. That is what
 * keeps hydration honest: markup that appeared in one pass and not the other is
 * exactly the mismatch React warns about, and the alternative — rendering to a
 * placeholder and moving it — is a flash.
 *
 * The practical consequence is that a portal's content is never in the HTML a
 * crawler reads. Anything that has to be indexed does not belong in one.
 *
 * ## It does not trap focus, and does not manage the stack
 *
 * A portal moves an element in the DOM and nothing else. Focus, Escape, an inert
 * background, a scrim and a z-index are the *dialog's* concerns —
 * [MPDialog](./dialog) and [MPDrawer](./drawer) are those, and a hand-built
 * overlay in a portal has none of it. Reach for them before this.
 *
 * ## Events still bubble through React
 *
 * A click inside a portal reaches an `onClick` on the element that rendered it,
 * even though the DOM says the two are unrelated. That is React's own behaviour
 * rather than something added here, and it catches people both ways: a menu
 * inside a portal inside a clickable card still opens the card.
 */
export function MPPortal({ container, disabled = false, children }: MPPortalProps) {
  /*
   * The target as state, found in a commit rather than during a render.
   *
   * Two things make that necessary, and they are the two ways a naive portal
   * goes wrong.
   *
   * A render has no DOM to reach for. On a server there is no `document` at all,
   * and on the client the first render has to produce the markup the server did
   * or hydration is a mismatch React warns about. So the first pass renders
   * nothing and the portal opens on the pass after it.
   *
   * And a ref is filled in *during* the commit that renders the element it
   * points at. Reading `container.current` while rendering therefore misses a
   * container this same page draws — every time, not intermittently — and the
   * portal would wait forever for a node that is already there.
   *
   * No dependency array, so this runs after every render and picks the
   * container up whenever it appears. `setTarget` with the value it already
   * holds is a bail-out rather than a second render, which is what keeps that
   * from being a loop.
   */
  const [target, setTarget] = React.useState<Element | null>(null);

  React.useEffect(() => {
    setTarget((now) => {
      const next = resolve(container);

      return next === now ? now : next;
    });
  });

  if (disabled) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return target ? createPortal(children, target) : null;
}

function resolve(container: MPPortalProps['container']): Element | null {
  if (!container) {
    return typeof document === 'undefined' ? null : document.body;
  }

  return 'current' in container ? container.current : container;
}
