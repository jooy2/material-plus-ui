import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';

export interface MPVisuallyHiddenProps extends React.ComponentPropsWithoutRef<'span'> {
  /** Renders something other than a `<span>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Text for a screen reader and nobody else.
 *
 * The sentence behind a bare number on a badge, the "opens in a new tab" after a
 * link's label, the name an avatar's initials stand in for, the direction a
 * sorted column is sorted in. In every one of those the visible mark is a
 * shorthand a reader who can see it expands instantly and a reader who cannot
 * gets nothing at all from.
 *
 * ```tsx
 * <button>
 *   <MPIcon icon={ICONS.close} />
 *   <MPVisuallyHidden>Close this dialog</MPVisuallyHidden>
 * </button>
 * ```
 *
 * Nine components in this library were already drawing themselves with it —
 * `MPPagination`'s live region, `MPRating`'s radios, `MPShortcut`'s key names,
 * `MPCarousel`'s slide announcement — and an application putting a bare glyph in
 * a button of its own had no way to reach the same treatment. It had the rule,
 * not the name.
 *
 * ## Not `hidden`, not `display: none`, not `opacity: 0`
 *
 * The first two take the text off the accessibility tree along with the screen,
 * which is the opposite of what is wanted, and the third leaves a clickable ghost
 * the size of the words. A 1px clipped box is the one form that is invisible to
 * a sighted reader and present to every other kind.
 *
 * ## Why not `sr-only`
 *
 * Which is Tailwind's own utility for this, and it is what the rule below is
 * written out from. It is written out because `sr-only` is *generated*: a
 * project running its own Tailwind build with a `prefix` configured generates it
 * under a different name, and a component that hardcoded `sr-only` would come
 * out visible on their page. The arbitrary properties survive any prefix.
 *
 * ## It stays in the layout
 *
 * `position: absolute`, so it takes no room — but it is still *in* the document,
 * which is the whole point: it is read in the order it is written. Put it where
 * the sentence belongs rather than at the end of the block.
 *
 * ## Sharp edges
 *
 * - **A focusable thing inside this stays focusable**, and a reader tabbing into
 *   it lands somewhere they cannot see. Anything that can take focus wants
 *   `aria-label` on the control instead.
 * - **It is not a live region.** Text swapped inside it is not announced unless
 *   the element also carries `aria-live` — which is exactly what the components
 *   above pass through.
 */
export const MPVisuallyHidden = React.forwardRef<HTMLSpanElement, MPVisuallyHiddenProps>(
  function MPVisuallyHidden({ render, className, children, ...props }, ref) {
    return useRender({
      render: render ?? <span />,
      ref,
      props: {
        ...props,
        // Concatenated rather than merged, the way every `className` in this
        // library is — but note that a utility setting `position` or `clip-path`
        // after these would make the content visible again, which is the one
        // override that turns this component into nothing.
        className: [VISUALLY_HIDDEN, className].filter(Boolean).join(' '),
        children
      }
    });
  }
);
