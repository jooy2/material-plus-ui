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
 * Each avatar is drawn under the one before it, so a stack read from the start
 * is read front to back and the person the group is *about* comes first rather
 * than last. Under RTL the whole thing flips on its own, because the overlap is
 * a logical margin.
 *
 * That is the opposite of what the document order gives — later siblings paint
 * over earlier ones — so it has to be **said**, and every avatar carries a
 * `z-index` for it. Leaving it implicit would also mean the order held only
 * until something in the stack acquired one of its own.
 *
 * The count is the last card in the pile rather than a label on top of it. It
 * is part of the run, and a stack whose final item floated clear of the stacking
 * it belongs to would be a stack with an exception in it.
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

    const items = React.Children.toArray(children);
    const shown = max === undefined ? items : items.slice(0, Math.max(0, max));
    const counted = total ?? items.length;
    const hidden = Math.max(0, counted - shown.length);
    const drawn = shown.length + (hidden > 0 ? 1 : 0);

    /*
     * One context value per card, rather than one for the stack.
     *
     * They differ only in `depth`, and the memo is what keeps that from costing
     * anything: a new object per avatar on every render would re-render every
     * face in the group whenever anything above it moved, which is exactly what
     * the single memoized value used to prevent.
     *
     * Counting down from `drawn` leaves the deepest card at 1 rather than at 0,
     * so every avatar in a stack is above a `z-index: 0` sibling drawn beside
     * it — the stack is one object and it is in front.
     */
    const cards = React.useMemo<MPAvatarGroupContextValue[]>(
      () =>
        Array.from({ length: drawn }, (_, index) => ({
          size,
          shape,
          variant,
          color,
          depth: drawn - index
        })),
      [size, shape, variant, color, drawn]
    );

    return (
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
        {/*
         * A provider per child rather than one around the run, because what
         * each of them is being handed differs. It writes no element, so the
         * avatars are still the group's own element children and the two
         * `[&>*]` rules above still reach them.
         *
         * Keyed by the child's own key — `React.Children.toArray` has already
         * given every element a stable one — so a face leaving the middle of
         * the stack does not remount the faces after it.
         */}
        {shown.map((child, index) => (
          <MPAvatarGroupContext.Provider
            key={(React.isValidElement(child) ? child.key : null) ?? index}
            value={cards[index]!}
          >
            {child}
          </MPAvatarGroupContext.Provider>
        ))}
        {/*
         * The remainder, as an avatar rather than as a bare number: it is the
         * last thing in the stack and it has to be the same circle at the same
         * size, or the run ends in something that is not part of it.
         */}
        {hidden > 0 ? (
          <MPAvatarGroupContext.Provider value={cards[drawn - 1]!}>
            <MPAvatar initials={`+${hidden}`} />
          </MPAvatarGroupContext.Provider>
        ) : null}
      </div>
    );
  }
);
