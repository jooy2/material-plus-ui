import * as React from 'react';
import { Popover } from '@base-ui/react/popover';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { cssLength } from '../../internal/length';
import { COMMON } from '../../internal/messages/common';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  hasContent,
  META_TEXT,
  PROSE_TEXT,
  SHEET_GAP,
  SHEET_PAD,
  SHEET_TITLE
} from '../../internal/scale';
import { FADE, PORTAL_LAYER } from '../../internal/surface';
import { useMPSize } from '../../internal/config';
import type { MPAlign, MPSide, MPSize } from '../../types';

/**
 * A popover takes `side`, `align` and `size`, and stops there.
 *
 * There is no `variant` — the five weights answer "how much does this surface
 * assert itself against the page", and a popup that had to be asked for has
 * already been asserted. There is no `color` either: MD3's own answer for a
 * surface that floats beside a control is `surface-container` at elevation 2,
 * neutral, and a popover that could be dyed would dye the form somebody put in
 * it.
 */
export interface MPPopoverProps {
  /**
   * The element the popup hangs off and that opens it. Exactly one element, and
   * it must accept a ref and spread props — every Material Plus component does.
   *
   * Optional: a controlled popover anchored from elsewhere needs none, though it
   * then has nothing to position against and will sit against the viewport.
   */
  trigger?: React.ReactElement;
  /** The heading, rendered as the element that names the popup. */
  title?: React.ReactNode;
  /** A line under it, and the popup's accessible description. */
  description?: React.ReactNode;
  /**
   * Which edge of the trigger it appears on. Flips to the opposite side when
   * there is no room, which is Base UI's doing and is the right behaviour.
   * @default 'bottom'
   */
  side?: MPSide;
  /**
   * Where it sits along that edge.
   * @default 'center'
   */
  align?: MPAlign;
  /**
   * Distance from the trigger, in pixels.
   * @default 8
   */
  sideOffset?: number;
  /**
   * Shift along that edge, in pixels.
   * @default 0
   */
  alignOffset?: number;
  /**
   * Draws the little wedge pointing at the trigger.
   *
   * Off by default. MD3 draws no wedge on a menu and none on a rich tooltip: a
   * popup eight pixels from the control that opened it does not need to say what
   * it belongs to. Turn it on where the trigger is far enough away that it does.
   * @default false
   */
  arrow?: boolean;
  /** Whether the popover is open. Use with `onOpenChange` for a controlled one. */
  open?: boolean;
  /** Whether it starts open, for an uncontrolled one. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the page behind is taken away.
   *
   * `false` — the default — leaves the page scrollable and clickable, which is
   * what separates a popover from a [dialog](./dialog): it is a detail *beside*
   * the page, not instead of it. `'trap-focus'` holds focus inside without
   * locking the scroll.
   * @default false
   */
  modal?: boolean | 'trap-focus';
  /**
   * Whether pressing Escape or clicking outside closes the popup. Turn it off
   * only for a popup with its own way out, because there will be no other.
   * @default true
   */
  dismissible?: boolean;
  /**
   * Shows the × in the corner.
   * @default false
   */
  showClose?: boolean;
  /**
   * Accessible name of the × button. Defaults to the word for "close" in
   * `locale`.
   */
  closeLabel?: string;
  /**
   * Which language the × button's default name is written in. Falls back to the
   * nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * A hard cap on the popup's width, overriding the one `size` implies. Numbers
   * are pixels. For the popover whose *content* decides its width — a form, a
   * single line of help — rather than for tuning the scale, which is `size`.
   */
  width?: number | string;
  /**
   * The room inside the popup, the type scale in it, and how wide it may get.
   * @default 'md'
   */
  size?: MPSize;
  /** The body. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export type MPPopoverCloseProps = React.ComponentProps<typeof Popover.Close>;

/**
 * How wide the popup is allowed to get, per `size`.
 *
 * The same axis [MPDialog](./dialog) folds its width into, one rung narrower at
 * every step: a popover is a detail beside a control rather than a sheet in the
 * middle of the page, and a 560px popup hanging off a 40px button is a dialog
 * that forgot to take the page.
 */
const MAX_WIDTH: Record<MPSize, string> = {
  xs: 'max-w-56',
  sm: 'max-w-64',
  md: 'max-w-80',
  lg: 'max-w-96',
  xl: 'max-w-lg'
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
 * Closes the popover it is inside.
 *
 * Exported for `MPDialogClose`'s reason: an uncontrolled popover has no
 * `setOpen` for its Cancel button to call, and making every popover controlled
 * is a piece of state per popover that exists only to answer a button.
 *
 * `render` is Base UI's own escape hatch, so a real Material Plus button
 * dismisses: `<MPPopoverClose render={<MPButton variant="text">Cancel</MPButton>} />`.
 */
export const MPPopoverClose = Popover.Close;

/**
 * A sheet that opens beside the thing that opened it.
 *
 * The difference from a [tooltip](./tooltip) is that this one can be *reached*:
 * it stays up until it is dismissed, it can be entered with the pointer or the
 * keyboard, and what is inside it can be clicked and typed into. The difference
 * from a [dialog](./dialog) is that it does not take the page — it is anchored
 * to a control, and the page behind goes on working.
 *
 * Base UI owns everything hard about it: the anchoring and the flip at the
 * window's edge, the click outside and Escape, returning focus to the trigger,
 * and the `aria-labelledby` / `aria-describedby` wiring. What is left here is
 * the surface, the width ladder and the header.
 *
 * ## The surface
 *
 * `surface-container` at elevation 2 and `corner-medium`, which is what MD3
 * gives a menu and a rich tooltip — the two things in the specification that are
 * this: a small sheet anchored to a control. It is deliberately *not* the
 * dialog's `surface-container-high` at elevation 3, because a popover has not
 * taken the page and should not sit above the menus that did not either.
 */
export function MPPopover({
  trigger,
  title,
  description,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset = 0,
  arrow = false,
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
  dismissible = true,
  showClose = false,
  closeLabel,
  locale: localeProp,
  width,
  size: sizeProp,
  className,
  style,
  children
}: MPPopoverProps) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(COMMON, locale);
  const hasHeader = hasContent(title) || hasContent(description);
  const arrowSize = ARROW_SIZE[size];

  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={(next, details) => {
        // Base UI has no `disablePointerDismissal` on a popover, so all three
        // ways out are cancelled here by the reason the change arrives with. An
        // imperative close and an `MPPopoverClose` press still get through,
        // which is what keeps `dismissible={false}` from being a trap.
        if (
          !dismissible &&
          !next &&
          (details.reason === 'escape-key' ||
            details.reason === 'outside-press' ||
            details.reason === 'focus-out')
        ) {
          details.cancel();

          return;
        }

        onOpenChange?.(next);
      }}
    >
      {trigger ? <Popover.Trigger render={trigger} /> : null}

      <Popover.Portal>
        <Popover.Positioner
          className={PORTAL_LAYER}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          <Popover.Popup
            data-mp-size={size}
            className={[
              'mp-popover rounded-mp-md relative flex flex-col outline-none',
              'bg-mp-surface-container text-mp-on-surface shadow-mp-2',
              'box-border',
              SHEET_PAD[size],
              SHEET_GAP[size],
              PROSE_TEXT[size],
              width === undefined ? MAX_WIDTH[size] : '',
              FADE,
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              // The escape hatch, and it has to be an inline style rather than a
              // class: Tailwind finds classes by scanning source text, so an
              // arbitrary `max-w-[720px]` built from a prop generates no rule.
              ...(width === undefined ? null : { maxWidth: cssLength(width) }),
              ...style
            }}
          >
            {arrow ? (
              <Popover.Arrow
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
              </Popover.Arrow>
            ) : null}

            {hasHeader || showClose ? (
              <div className="flex shrink-0 items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  {hasContent(title) ? (
                    <Popover.Title className={`m-0 ${SHEET_TITLE[size]}`}>{title}</Popover.Title>
                  ) : null}
                  {hasContent(description) ? (
                    <Popover.Description className={`text-mp-on-surface-variant m-0 ${META_TEXT}`}>
                      {description}
                    </Popover.Description>
                  ) : null}
                </div>

                {showClose ? (
                  <Popover.Close
                    aria-label={closeLabel ?? messages.close}
                    className={[
                      'group text-mp-on-surface-variant relative flex size-8 shrink-0',
                      'rounded-mp-full -m-1 cursor-pointer items-center justify-center',
                      'appearance-none border-0 bg-transparent',
                      'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
                      'focus-visible:outline-solid outline-none'
                    ].join(' ')}
                  >
                    <MPStateLayer />
                    <MPIcon icon={CloseIcon} size={18} />
                  </Popover.Close>
                ) : null}
              </div>
            ) : null}

            {hasContent(children) ? <div className="min-w-0">{children}</div> : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
