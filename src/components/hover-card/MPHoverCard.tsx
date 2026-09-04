import * as React from 'react';
import { PreviewCard } from '@base-ui/react/preview-card';
import { cssLength } from '../../internal/length';
import { sheetPad } from '../../internal/density';
import { hasContent, META_TEXT, PROSE_TEXT, SHEET_GAP, SHEET_TITLE } from '../../internal/scale';
import { FADE, PORTAL_LAYER } from '../../internal/surface';
import { useMPDensity, useMPSize } from '../../internal/config';
import type { MPAlign, MPDensity, MPSide, MPSize } from '../../types';

/**
 * The same axes an `MPPopover` takes, and for the same reasons.
 *
 * No `variant`, because the five weights answer "how much does this surface
 * assert itself against the page" and a card that arrives uninvited has already
 * been answered for. No `color`, because MD3's answer for a small sheet
 * anchored to something is `surface-container`, neutral — and a card that could
 * be dyed would dye whatever preview somebody put in it. No `elevation`,
 * because a card floating over the page is the whole idea and a prop that could
 * sit it flat would undo it.
 */
export interface MPHoverCardProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'title' | 'children'
> {
  /**
   * What the card hangs off. Exactly one element, which must accept a ref and
   * spread props — every Material Plus component does.
   *
   * Usually an `MPTextLink` or an `MPAvatar`: the two things a reader wants to
   * know more about without leaving the sentence they are in.
   */
  trigger: React.ReactElement;
  /** The heading, rendered as the element that names the card. */
  title?: React.ReactNode;
  /** A line under it, and the card's accessible description. */
  description?: React.ReactNode;
  /** The body. */
  children?: React.ReactNode;
  /**
   * Which edge of the trigger it appears on. Flips when there is no room.
   * @default 'bottom'
   */
  side?: MPSide;
  /** Where it sits along that edge. @default 'center' */
  align?: MPAlign;
  /** Distance from the trigger, in pixels. @default 8 */
  sideOffset?: number;
  /** Shift along that edge, in pixels. @default 0 */
  alignOffset?: number;
  /**
   * Draws the wedge pointing at the trigger.
   *
   * Off by default, as on `MPPopover`: a sheet eight pixels from what opened it
   * does not need to say what it belongs to.
   * @default false
   */
  arrow?: boolean;
  /** Whether the card is open. Use with `onOpenChange` for a controlled one. */
  open?: boolean;
  /** Whether it starts open, for an uncontrolled one. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * How long the pointer has to rest on the trigger before the card opens, in
   * milliseconds. Base UI's own default is long enough that crossing a
   * paragraph of links does not open four of them.
   */
  delay?: number;
  /**
   * How long the card stays after the pointer has left, in milliseconds. This
   * is what makes the gap between the trigger and the card crossable.
   */
  closeDelay?: number;
  /** A hard cap on the card's width, overriding the one `size` implies. */
  width?: number | string;
  /** The type scale and the room inside. @default 'md' */
  size?: MPSize;
  /** Takes room out of that padding, two pixels a face per step. @default 0 */
  density?: MPDensity;
}

/**
 * One rung wider than a popover's ladder at every step: this is a preview, not
 * a note. What goes in it is a picture and two lines, or a heading and a
 * paragraph, and a popover's measure would break both across too many lines.
 */
const MAX_WIDTH: Record<MPSize, string> = {
  xs: 'max-w-64',
  sm: 'max-w-72',
  md: 'max-w-96',
  lg: 'max-w-md',
  xl: 'max-w-xl'
};

/** The wedge, at roughly a third of the sheet's corner per step. */
const ARROW_SIZE: Record<MPSize, number> = {
  xs: 8,
  sm: 9,
  md: 10,
  lg: 11,
  xl: 12
};

/**
 * A card that opens when the pointer rests on something, holding a preview of
 * what is on the other side of it.
 *
 * ```tsx
 * <MPHoverCard trigger={<MPTextLink href="/people/priya">Priya Raman</MPTextLink>} title="Priya Raman">
 *   Platform team. Joined 2023.
 * </MPHoverCard>
 * ```
 *
 * ## Where it sits between the other two popups
 *
 * A tooltip is a **label**: one line, no interaction, and the pointer never
 * reaches it. A popover is a panel that was **asked for** by a press, so it can
 * hold a form. This one is uninvited like a tooltip and reachable like a
 * popover — the pointer can cross into it, and a link inside it can be
 * followed.
 *
 * ## Because it is uninvited, it is never the only way to anything
 *
 * A keyboard with no hover, a touchscreen with no pointer, and a screen reader
 * all arrive by the trigger's own route instead. So whatever is in here has to
 * exist on the page the trigger leads to as well. Treat it as a shortcut for
 * the reader who has a pointer, never as the place a fact lives.
 *
 * That is also why there is no keyboard equivalent bolted on. A card that
 * opened on focus would interrupt every keyboard reader tabbing through a
 * paragraph of links, which is a worse answer than not opening at all.
 */
export function MPHoverCard({
  trigger,
  title,
  description,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset = 0,
  arrow = false,
  open,
  defaultOpen,
  onOpenChange,
  delay,
  closeDelay,
  width,
  size: sizeProp,
  density: densityProp,
  className,
  style,
  ...props
}: MPHoverCardProps) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);
  const hasHeader = hasContent(title) || hasContent(description);
  const arrowSize = ARROW_SIZE[size];

  /*
   * The card's own name, wired by hand.
   *
   * Base UI's preview card has no `Title` or `Description` part the way its
   * popover does — the popup is a sheet and nothing in it is announced as its
   * name. So the two ids are generated here and pointed at from the popup,
   * which is what makes a screen reader that lands in the card say what it is
   * rather than reading the paragraph inside it cold.
   */
  const id = React.useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <PreviewCard.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <PreviewCard.Trigger render={trigger} delay={delay} closeDelay={closeDelay} />

      <PreviewCard.Portal>
        <PreviewCard.Positioner
          className={PORTAL_LAYER}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          <PreviewCard.Popup
            data-mp-size={size}
            aria-labelledby={hasContent(title) ? titleId : undefined}
            aria-describedby={hasContent(description) ? descriptionId : undefined}
            className={[
              'mp-hover-card rounded-mp-md relative flex flex-col outline-none',
              'bg-mp-surface-container text-mp-on-surface shadow-mp-2',
              'box-border',
              sheetPad(size, density),
              SHEET_GAP[size],
              PROSE_TEXT[size],
              width === undefined ? MAX_WIDTH[size] : '',
              FADE,
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              // An inline style rather than a class, for `MPPopover`'s reason:
              // Tailwind finds classes by scanning source text, so an arbitrary
              // `max-w-[720px]` built from a prop generates no rule at all.
              ...(width === undefined ? null : { maxWidth: cssLength(width) }),
              ...style
            }}
            {...props}
          >
            {arrow ? (
              <PreviewCard.Arrow
                // Base UI positions the wedge and reports which side it ended up
                // on. It is drawn pointing down once and turned to match — a
                // rotation of a glyph, which is the one allowance the rule
                // against moving a surface makes.
                className={[
                  'data-[side=top]:bottom-[-1px]',
                  'data-[side=bottom]:top-[-1px] data-[side=bottom]:rotate-180',
                  'data-[side=left]:right-[-1px] data-[side=left]:-rotate-90',
                  'data-[side=right]:left-[-1px] data-[side=right]:rotate-90'
                ].join(' ')}
              >
                <svg
                  width={arrowSize}
                  height={arrowSize / 2}
                  viewBox="0 0 10 5"
                  aria-hidden="true"
                  className="block"
                >
                  <path d="M0 0h10L5 5z" fill="var(--_mp-color-surface-container)" />
                </svg>
              </PreviewCard.Arrow>
            ) : null}

            {hasHeader ? (
              <div className="flex min-w-0 flex-col">
                {hasContent(title) ? (
                  <div id={titleId} className={`mp-hover-card__title m-0 ${SHEET_TITLE[size]}`}>
                    {title}
                  </div>
                ) : null}
                {hasContent(description) ? (
                  <div
                    id={descriptionId}
                    className={`mp-hover-card__description text-mp-on-surface-variant m-0 ${META_TEXT}`}
                  >
                    {description}
                  </div>
                ) : null}
              </div>
            ) : null}

            {hasContent(children) ? <div className="min-w-0">{children}</div> : null}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
