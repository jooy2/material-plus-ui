import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { HIDDEN_BELOW, HIDDEN_FROM } from '../../internal/visibility';
import { WINDOW_CLASSES } from '../../internal/window-class';
import type { MPWindowClass } from '../../types';

/** The class above this one, or `undefined` at the top of the ladder. */
function above(windowClass: MPWindowClass): MPWindowClass | undefined {
  return WINDOW_CLASSES[WINDOW_CLASSES.indexOf(windowClass) + 1];
}

export interface MPShowProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * The narrowest window this is shown in. `from="medium"` is 600dp up, so it is
   * absent on a phone and present everywhere else.
   */
  from?: MPWindowClass;
  /**
   * The class this stops being shown at, exclusive. `until="expanded"` is every
   * window under 840dp — the mirror of `from="expanded"`, and the two of them
   * over the same class cover every width exactly once.
   */
  until?: MPWindowClass;
  /**
   * One class and no other, which is `from` and `until` said together:
   * `only="medium"` is 600dp to 839dp.
   *
   * `from` and `until` still override their own half, so
   * `only="medium" until="large"` is 600dp to 1199dp. That is the same range
   * `from="medium" until="large"` is, and which of the two to write is a
   * question of which one reads like the intention.
   */
  only?: MPWindowClass;
  /**
   * Renders something other than a `<div>`: `render={<li />}`,
   * `render={<td />}` — for the places where a bare `<div>` would not be allowed
   * to sit. Base UI's own escape hatch.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content at some window sizes and not others.
 *
 * ```tsx
 * <MPShow from="expanded">
 *   <MPSidebar>{nav}</MPSidebar>
 * </MPShow>
 * <MPShow until="expanded">
 *   <MPBottomNavigation items={nav} />
 * </MPShow>
 * ```
 *
 * The two halves of that pair are exclusive and exhaustive over the same class,
 * which is the shape worth writing: one of them is on screen at every width, and
 * never both.
 *
 * ## It is `display: none`, not a condition
 *
 * Both branches are rendered and one of them is hidden by CSS, which is a
 * deliberate trade rather than a shortcut. A media query is resolved by the
 * browser before it paints anything, including on the server's markup — so the
 * first frame is already right. [useMPWindowClass](../../guide/hooks) answers
 * the same question in JavaScript, and cannot answer it until the page has
 * hydrated: the first paint is a guess and the correction is a second render,
 * which on a phone is a desktop navigation drawn and thrown away.
 *
 * So this is the one to reach for when what changes is *which* of two
 * arrangements is on screen. The hook is the one to reach for when the subtree
 * that is not on screen is expensive — a chart, a map, a table of a thousand
 * rows — because hidden is not unmounted: it is built, laid out and skipped at
 * paint, and its effects run.
 *
 * `display: none` also takes the content off the accessibility tree, which is
 * the point. A screen reader on a narrow window reads the compact arrangement
 * and not both of them.
 *
 * ## It is not a box
 *
 * The wrapper is `display: contents` while it is shown, so it takes no part in
 * the layout: an `MPShow` inside a flex row makes its children the flex items,
 * exactly as if it were not there. That declaration is written at zero
 * specificity, so a `className` of your own that sets a display wins over it
 * without a fight — and the hiding, which is a real class, still wins over both.
 */
export const MPShow = React.forwardRef<HTMLDivElement, MPShowProps>(function MPShow(
  { from, until, only, render, className, children, ...props },
  ref
) {
  const lower = from ?? only;
  const upper = until ?? (only ? above(only) : undefined);

  return useRender({
    render,
    ref,
    props: {
      className: [
        'mp-show',
        lower ? HIDDEN_BELOW[lower] : '',
        upper ? HIDDEN_FROM[upper] : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      children,
      ...props
    }
  });
});
