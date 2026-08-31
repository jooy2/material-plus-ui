import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { useMPSize } from '../../internal/config';
import type { MPSize } from '../../types';

/**
 * How the media inside is fitted to the box, spelled the way CSS spells it.
 *
 * These are `object-fit`'s own values rather than a nicer set of words, and for
 * the same reason `MPSide` keeps `top`/`right`/`bottom`/`left`: inventing
 * `fill-the-box` would only make a reader look up which CSS it maps to.
 */
export type MPAspectFit = 'cover' | 'contain' | 'fill' | 'none';

/**
 * The corner, when `rounded` asks for one.
 *
 * `md` lands on `medium`, which is MD3's own card corner — a photograph inside a
 * card should have the card's corner, not one of its own. `lg` shares it because
 * [there is no `large` rung](../design/color): the token sheet stops at
 * `medium` and jumps to `extra-large`, and inventing a step here would be this
 * component holding a number the rest of the library cannot see.
 */
const CORNER: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-sm',
  md: 'rounded-mp-md',
  lg: 'rounded-mp-md',
  xl: 'rounded-mp-xl'
};

/**
 * The media a `fit` reaches, stretched to the box first.
 *
 * Written out one selector at a time rather than as a comma list, because
 * Tailwind only ever sees class names that appear literally in the source and a
 * grouped arbitrary variant is one string it has to parse rather than match.
 *
 * `iframe` takes the sizing and not the fit: an embed lays its own content out
 * and `object-fit` has nothing to act on.
 */
const STRETCH = [
  '[&>img]:size-full',
  '[&>video]:size-full',
  '[&>canvas]:size-full',
  '[&>svg]:size-full',
  '[&>iframe]:size-full',
  '[&>picture]:size-full',
  '[&>picture>img]:size-full'
].join(' ');

const FIT: Record<MPAspectFit, string> = {
  cover: '[&>img]:object-cover [&>video]:object-cover [&>picture>img]:object-cover',
  contain: '[&>img]:object-contain [&>video]:object-contain [&>picture>img]:object-contain',
  fill: '[&>img]:object-fill [&>video]:object-fill [&>picture>img]:object-fill',
  none: '[&>img]:object-none [&>video]:object-none [&>picture>img]:object-none'
};

export interface MPAspectRatioProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * The proportion the box holds, written the way CSS writes it — a number
   * (`1.5`) or a ratio (`'16 / 9'`). Both reach `aspect-ratio` untouched.
   * @default 1
   */
  ratio?: number | string;
  /**
   * How a single piece of media inside is fitted.
   *
   * Applies to an `img`, a `video`, a `canvas`, an `svg`, a `picture` or an
   * `iframe` that is a *direct* child; those are stretched to the full box and
   * then fitted. Anything else is laid out normally and this prop does not reach
   * it.
   * @default 'cover'
   */
  fit?: MPAspectFit;
  /**
   * Rounds the corners to the `size` rung.
   *
   * Off by default. A layout component draws nothing, and a photograph with its
   * corners cut is a decision about the photograph — but it is such a common one
   * that making the caller reach for a `className` would be perverse.
   * @default false
   */
  rounded?: boolean;
  /**
   * Which corner `rounded` uses. There is no height and no type scale on a box
   * whose whole job is a proportion, so this is the one axis `size` has here.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Renders something other than a `<div>`: `render={<figure />}`,
   * `render={<a href="…" />}`. Base UI's own escape hatch.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * A box that keeps a proportion whatever width it is given.
 *
 * It draws nothing — no surface, no border, no shadow, no colour — which is what
 * makes it layout rather than a component in the Material sense. What it does is
 * *reserve* the space: a card whose image arrives late does not reflow the page
 * around it, and a row of thumbnails is a row of one shape.
 *
 * That is worth more than it sounds. Material's layout guidance is built on a
 * grid whose rows line up, and the single most common way a real page stops
 * lining up is media of unknown height arriving after the text around it has
 * already been laid out.
 *
 * The proportion is CSS's own `aspect-ratio`, so a caller who already knows
 * `16 / 9` has nothing to translate. `fit` is the one convenience on top: the
 * media inside is stretched to the box and then fitted, which is the pair of
 * declarations every use of this component would otherwise start with.
 */
export const MPAspectRatio = React.forwardRef<HTMLDivElement, MPAspectRatioProps>(
  function MPAspectRatio(
    {
      ratio = 1,
      fit = 'cover',
      rounded = false,
      size: sizeProp,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const classNames = [
      // `overflow-hidden` is not decoration: without it a `cover` image spills
      // out of the proportion it was just given, and the box would only be
      // reserving space rather than holding anything to it.
      'mp-aspect-ratio relative block w-full overflow-hidden',
      STRETCH,
      FIT[fit],
      rounded ? CORNER[size] : '',
      className ?? ''
    ]
      .filter(Boolean)
      .join(' ');

    return useRender({
      render,
      ref,
      props: {
        'data-mp-size': size,
        className: classNames,
        style: { aspectRatio: ratio, ...style },
        children,
        ...props
      }
    });
  }
);
