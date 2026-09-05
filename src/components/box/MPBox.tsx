import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { sheetPad } from '../../internal/density';
import { containerSurface } from '../../internal/elevation';
import { useMPDensity, useMPSize } from '../../internal/config';
import { transitionProps } from '../../internal/transition';
import type { MPDensity, MPElevation, MPSize, MPTransition, MPVariant } from '../../types';

export interface MPBoxProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * How much surface the sheet paints.
   *
   * A container's ladder, so `filled` is MD3's own filled-card surface —
   * `surface-container-highest` — and not the accent. See the note on the
   * component below for why a box is never dyed.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * How far off the page the sheet is lifted, on MD3's own scale.
   *
   * It moves the **tone** as well as the shadow, because Material pairs the two:
   * a level-2 surface is `surface-container` under a level-2 shadow, and a prop
   * that only cast a shadow would raise this into a surface the specification
   * has no name for. Given a level, `variant` is left holding only its hairline.
   *
   * Left unset, `variant` decides — and `variant="elevated"` is this at `1`.
   */
  elevation?: MPElevation;
  /**
   * The room inside.
   *
   * **This is the one component where `size` sets no height and no type scale.**
   * A box is as tall as what it holds, and its children bring their own
   * typography — a container that reset the type scale would make the same
   * paragraph render at two sizes depending on what it happened to be wrapped
   * in. So here the rung is the padding, and nothing else.
   *
   * The *corner* is not on the ladder either, which is where this library and
   * most others part company. A radius in Material is a statement about what
   * kind of object something is rather than a size to taste, and a box is a
   * sheet: `corner-medium` at every rung, exactly as MD3 draws a card.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Takes room out of the padding `size` chose, two pixels a face per step.
   *
   * On a box that is the whole of what density can mean, because padding is the
   * whole of what `size` does here. It is the axis that matters when boxes are
   * being repeated — a grid of tiles, a column of panels — where the room around
   * each one is multiplied by however many there are.
   * @default 0
   */
  density?: MPDensity;
  /**
   * An entrance, run once as the box mounts.
   *
   * `transition="fade"` is the whole of what most callers want; the object form
   * takes a duration, an edge to come from, or a scale to start at. Anything
   * that has to run again — on scroll, on hover, under your own control — is an
   * [MPAnimateFade](../motion/animate-fade) and its siblings, and wrapping is
   * the right answer there.
   */
  transition?: MPTransition;
  /**
   * Inner padding. Turn it off for full-bleed content — a picture, a table, a
   * list that draws its own rows.
   * @default true
   */
  padded?: boolean;
  /**
   * Renders something other than a `<div>`: `render={<section />}`,
   * `render={<li />}`, or a function for full control. Base UI's own escape
   * hatch, so it behaves here exactly as it does on every Base UI primitive.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * A sheet with content on it. The plainest surface in the library: it groups
 * things, and that is all it does.
 *
 * Everything structural — a heading, a footer, dividers, a picture across the
 * top — belongs to [MPCard](./card), which is exactly this box with those
 * sections laid out on it.
 *
 * ## Why a box is never dyed, and takes no `color`
 *
 * Because what it holds is somebody else's content, and that content arrives
 * with its own colours: body text, links, buttons, fields. On an accent fill
 * every one of them would need an on-accent treatment of its own, which is the
 * opposite of what a container is for.
 *
 * So the ladder runs up the **neutral** surface roles. `filled` is
 * `surface-container-highest`, which is MD3's own filled card; `elevated` and
 * `outlined` are the specification's other two card variants to the letter. What
 * separates them is how much light the sheet holds and whether it carries a
 * hairline — never which family it reads.
 *
 * A component that *is* the thing being coloured says so by taking `color`:
 * that is [MPAlert](../feedback/alert) for a message, [MPChip](../display/chip)
 * for a token, [MPButton](../inputs/button) for an action.
 *
 * ## What `elevation` does, and why it took the shape it did
 *
 * MD3 does not treat height as a free axis: an elevated surface is
 * `surface-container-low` **under** a level-1 shadow, and the tone and the
 * shadow are one decision rather than two. A prop that only cast a shadow would
 * raise a `filled` box into a surface the specification has no name for — a
 * lifted object that is somehow still the flattest tone in the system.
 *
 * So a level names both, and `variant="elevated"` is that decision made once, at
 * level 1. The variant stays because it is the answer nearly every raised sheet
 * wants and because the vocabulary is about *emphasis*; the prop is there for
 * the sheet that has a reason to be somewhere else on the ladder.
 */
export const MPBox = React.forwardRef<HTMLDivElement, MPBoxProps>(function MPBox(
  {
    variant = 'outlined',
    elevation,
    size: sizeProp,
    density: densityProp,
    transition,
    padded = true,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);
  const entrance = transitionProps(transition);

  return useRender({
    render,
    ref,
    props: {
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: [
        'mp-box rounded-mp-md block',
        // `box-border` explicitly, for the reason `MPButton` gives: with no page
        // reset an `outlined` box's hairline would be added *outside* its
        // padding and come out two pixels wider than a `filled` one beside it.
        'box-border',
        padded ? sheetPad(size, density) : '',
        containerSurface(variant, elevation),
        'text-mp-on-surface',
        entrance.className,
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      // The entrance first, so a `style` of the caller's own can still move one
      // of its slots — which is the only way to reach a number the prop does
      // not name.
      style: { ...entrance.style, ...style },
      children,
      ...props
    }
  });
});
