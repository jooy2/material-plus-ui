import * as React from 'react';
import { MPAvatar, type MPAvatarShape } from '../avatar/MPAvatar';
import { MPAvatarGroupContext, type MPAvatarGroupContextValue } from '../../internal/avatar-group';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPSize, MPVariant } from '../../types';

export interface MPAvatarGroupProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * How many avatars are drawn before the rest become a count. Left out, every
   * one of them is drawn.
   */
  max?: number;
  /**
   * How many there are altogether, when the group was handed only the first few.
   *
   * Without it the count is worked out from the children, which is right only
   * when all of them were passed — and a list of forty faces that ships four
   * `<img>`s and a number is exactly why this prop exists.
   */
  total?: number;
  /**
   * How far each avatar sits under the one before it — a number in pixels, or
   * any CSS length. Left out it is a fraction of `size`, which keeps the overlap
   * looking the same at every rung.
   */
  overlap?: number | string;
  /**
   * Passed to every avatar in the group.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Passed to every avatar in the group.
   * @default 'circle'
   */
  shape?: MPAvatarShape;
  /**
   * Passed to every avatar in the group.
   * @default 'tonal'
   */
  variant?: MPVariant;
  /**
   * Passed to every avatar in the group.
   * @default 'primary'
   */
  color?: MPColor;
  /** The avatars. */
  children?: React.ReactNode;
}

/**
 * How far one avatar sits under the last, per rung.
 *
 * Roughly a third of the box at every size: enough that the stack reads as a
 * stack, and not so much that a face is hidden behind the next one. Its own
 * ladder rather than a fraction computed at runtime, because the value is a
 * length in an inline custom property and a third of 56 is not a number anybody
 * would have written down.
 */
const OVERLAP: Record<MPSize, string> = {
  xs: '0.625rem',
  sm: '0.75rem',
  md: '1.125rem',
  lg: '1.25rem',
  xl: '1.5rem'
};

/**
 * A stack of avatars, overlapping, with the ones that did not fit as a count.
 *
 * `size`, `shape`, `variant` and `color` are set once here rather than on every
 * avatar — a stack whose fourth face is a rung out is not a stack — and an
 * avatar's own prop still wins, which is what lets one of them be marked out
 * from the rest.
 *
 * ## The ring is not decoration
 *
 * Two circles of similar tone laid over each other have no edge between them at
 * all, and the stack reads as one smeared shape. The ring is drawn in the page's
 * own `surface`, so it is the background showing through rather than a colour of
 * its own — which is what puts the near avatar in front instead of putting a
 * white line on it.
 *
 * `isolate` on the group is the other half: it makes the first avatar's ring
 * paint against the page rather than against whatever the group happens to be
 * stacked over.
 *
 * ## The first avatar is on top
 *
 * The order is the DOM order, and each avatar is drawn under the one before it.
 * A stack read from the start is therefore read front to back, so the person the
 * group is *about* comes first rather than last — and under RTL the whole thing
 * flips on its own, because the overlap is a logical margin.
 */
export const MPAvatarGroup = React.forwardRef<HTMLDivElement, MPAvatarGroupProps>(
  function MPAvatarGroup(
    {
      max,
      total,
      overlap,
      size: sizeProp,
      shape = 'circle',
      variant = 'tonal',
      color: colorProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const color = useMPColor(colorProp);
    const context = React.useMemo<MPAvatarGroupContextValue>(
      () => ({ size, shape, variant, color }),
      [size, shape, variant, color]
    );

    const items = React.Children.toArray(children);
    const shown = max === undefined ? items : items.slice(0, Math.max(0, max));
    const counted = total ?? items.length;
    const hidden = Math.max(0, counted - shown.length);

    return (
      <MPAvatarGroupContext.Provider value={context}>
        <div
          ref={ref}
          data-mp-size={size}
          className={[
            'mp-avatar-group isolate inline-flex items-center align-middle',
            // A logical margin, so the stack overlaps the other way under RTL
            // without anything being asked to.
            '[&>*:not(:first-child)]:[margin-inline-start:calc(var(--_mp-avatar-overlap)*-1)]',
            'ring-mp-surface [&>*]:ring-2',
            className ?? ''
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--_mp-avatar-overlap':
                overlap === undefined
                  ? OVERLAP[size]
                  : typeof overlap === 'number'
                    ? `${overlap}px`
                    : overlap,
              ...style
            } as React.CSSProperties
          }
          {...props}
        >
          {shown}
          {/*
           * The remainder, as an avatar rather than as a bare number: it is the
           * last thing in the stack and it has to be the same circle at the same
           * size, or the run ends in something that is not part of it.
           */}
          {hidden > 0 ? <MPAvatar initials={`+${hidden}`} /> : null}
        </div>
      </MPAvatarGroupContext.Provider>
    );
  }
);
