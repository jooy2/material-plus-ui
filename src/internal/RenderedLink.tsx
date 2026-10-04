import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';

/**
 * An `<a>`, or whatever a caller's `render` makes of it — a router's `Link`.
 *
 * A component rather than a `useRender` call where the link is drawn, because
 * the link is one branch of a ternary and a hook cannot sit in one. The same
 * shape as the control inside an `MPListItem`, which was the first `render` in
 * the library to replace an inner link rather than a component's root.
 *
 * Under App Router a plain `<a>` to a page of the same site is a full page
 * load: no client-side navigation, and no prefetch while the link is on
 * screen. A router owns both through its own `Link`, which takes the same
 * `href`, so `render={<Link />}` keeps the URL written once — on the
 * component — and lets the router draw the element.
 */
export function RenderedLink({
  render,
  props
}: {
  render: useRender.RenderProp | undefined;
  props: Record<string, unknown>;
}) {
  return useRender({ render: render ?? <a />, props });
}
