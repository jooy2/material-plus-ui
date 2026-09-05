import * as React from 'react';
import { Popover } from '@base-ui/react/popover';
import { MPButton } from '../button/MPButton';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPColor, useMPSize } from '../../internal/config';
import { fillMessage } from '../../internal/i18n';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { TOUR } from '../../internal/messages/tour';
import {
  CONTROL_ICON,
  META_TEXT,
  PROSE_TEXT,
  SHEET_GAP,
  SHEET_PAD,
  SHEET_TITLE,
  hasContent
} from '../../internal/scale';
import { MPStateLayer } from '../../internal/StateLayer';
import { FADE, PORTAL_LAYER } from '../../internal/surface';
import type { MPAlign, MPColor, MPSide, MPSize, MPSlots } from '../../types';

/** One stop on the tour. */
export interface MPTourStep {
  /**
   * A CSS selector for what this step is about.
   *
   * Left out, the card is centred over the page with nothing cut out of the
   * dimming — which is what a welcome step and a closing step are.
   */
  target?: string;
  /** The step's heading. */
  title?: React.ReactNode;
  /** What it says. */
  content?: React.ReactNode;
  /** Which edge of the target the card sits on. @default 'bottom' */
  side?: MPSide;
  /** Where along that edge. @default 'center' */
  align?: MPAlign;
  /**
   * How far the hole is inflated past the target, in pixels. A control with a
   * focus ring wants a couple; a whole panel wants none.
   * @default 6
   */
  padding?: number;
}

/**
 * The parts an `MPTour` draws around its card.
 *
 * `className` is the card — the sheet the steps are written on — and `scrim` is
 * the dimming behind it, which is a sibling of the card rather than a descendant
 * and so has no other way in.
 */
export type MPTourSlot = 'scrim' | 'title' | 'content' | 'close' | 'footer';

export interface MPTourProps {
  /** The stops, in order. */
  steps: readonly MPTourStep[];
  /** Whether the tour is running. Use with `onOpenChange` for a controlled one. */
  open?: boolean;
  /** Whether it starts running, for an uncontrolled one. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which stop, from `0`. Use with `onStepChange` for a controlled one. */
  step?: number;
  /** Which one it starts on. @default 0 */
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Called when the last step's button is pressed, before the tour closes. */
  onFinish?: () => void;
  /**
   * Dims the page and cuts the target out of the dimming. Off, the card is the
   * only thing the tour draws.
   * @default true
   */
  scrim?: boolean;
  /** Offers the Skip button beside the counter. @default true */
  skippable?: boolean;
  /** Whether Escape and the × end the tour. @default true */
  dismissible?: boolean;
  /** Scrolls each target into view as the tour reaches it. @default true */
  scrollIntoView?: boolean;
  /**
   * Which language the buttons and the counter are written in. Falls back to the
   * nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** Individual overrides for the five words the tour says on its own behalf. */
  labels?: Partial<{
    previous: string;
    next: string;
    done: string;
    skip: string;
    position: string;
  }>;
  /** @default 'md' */
  size?: MPSize;
  /** Which accent family the buttons read. @default 'primary' */
  color?: MPColor;
  /** Class names for the card. */
  className?: string;
  style?: React.CSSProperties;
  /**
   * Class names for the parts around it. `className` is the card, so the dimming
   * behind it is `classNames.scrim`.
   */
  classNames?: MPSlots<MPTourSlot>;
}

/** Where the target is, in viewport coordinates. */
interface Spot {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** How wide the card is allowed to get, so the prose keeps a measure. */
const MAX_WIDTH: Record<MPSize, string> = {
  xs: 'max-w-56',
  sm: 'max-w-64',
  md: 'max-w-80',
  lg: 'max-w-96',
  xl: 'max-w-md'
};

/**
 * What the card's buttons are drawn at: one rung under the card itself.
 *
 * The same table the pickers' footers keep, for the same reason. A `md` card's
 * footer sitting at the control ladder's 56px would be taller than the sentence
 * above it.
 */
const BUTTON_SIZE: Record<MPSize, MPSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
  xl: 'md'
};

/**
 * The dimming, with a hole in it.
 *
 * **One element the size of the target carrying a shadow larger than any
 * screen**, rather than four rectangles around it. The corners of a four-piece
 * scrim never quite meet, and the seams show as hairlines across the page the
 * moment the dimming is anything but opaque — which MD3's scrim, at 32%, is not.
 *
 * `pointer-events: none` throughout, and that is the component's whole argument.
 * A tour that blocked the page would be a dialog wearing a cut-out; the point of
 * the cut-out is that the thing it is pointing at can still be used.
 *
 * It also does not blur. `SCRIM` carries a 2px blur because a dialog is saying
 * "you cannot use this right now", and a tour is saying the opposite.
 */
function Scrim({ spot, className }: { spot: Spot | null; className?: string }) {
  if (spot === null) {
    return (
      <div
        aria-hidden="true"
        className={[
          'mp-tour__scrim bg-mp-scrim/32 pointer-events-none fixed inset-0 z-40',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={[
        'mp-tour__scrim rounded-mp-xs pointer-events-none fixed z-40',
        // The same 32% `SCRIM` paints, mixed here rather than taken from the
        // utility: a box shadow's colour is one value, so the alpha has to be
        // in it. Written against `--_mp-color-scrim` and not `--mp-sys-*`,
        // which is the input a consumer sets and is undefined on a page that
        // has not.
        'shadow-[0_0_0_9999px_color-mix(in_oklab,var(--_mp-color-scrim)_32%,transparent)]',
        // The transition is what makes the hole travel between two steps rather
        // than teleport, and it is the one thing on screen that moves during a
        // tour: everything else is already where it was.
        'transition-[top,left,width,height] duration-(--mp-sys-motion-duration-medium1)',
        'ease-mp-standard motion-reduce:transition-none',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
    />
  );
}

/**
 * A guided walk over a page that already exists.
 *
 * ```tsx
 * <MPTour
 *   defaultOpen
 *   steps={[{ target: '#search', title: 'Find anything', content: 'Press ⌘K.' }]}
 * />
 * ```
 *
 * It is [MPStepper](../display/stepper) turned inside out. That component puts
 * the instructions *in* the page and the reader follows them; this one leaves
 * the page exactly as it is and stands over it. The steps are therefore given by
 * selector rather than as content: what a tour is about is already on screen,
 * and describing it a second time inside the card would be two copies to keep in
 * step.
 *
 * ## The dimming never takes the pointer
 *
 * A reader can use the control being pointed at while the card is up, and that
 * is the difference between a tour and a sequence of dialogs. Nothing outside
 * the card is blocked, no focus is trapped, and neither a press outside nor the
 * focus leaving ends the tour — only Escape, the ×, and the card's own buttons
 * do.
 *
 * ## What it is not
 *
 * It is not documentation, and it is not a place to put anything a reader will
 * need twice. A tour is shown once, to somebody who has not asked for it, over
 * a page they are trying to get on with — so three or four steps is the shape,
 * and anything that has to be found again belongs on the page.
 */
export function MPTour({
  steps,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onFinish,
  scrim = true,
  skippable = true,
  dismissible = true,
  scrollIntoView = true,
  locale: localeProp,
  labels,
  size: sizeProp,
  color: colorProp,
  className,
  style,
  classNames
}: MPTourProps) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(TOUR, locale, labels);
  const common = useMPMessages(COMMON, locale);

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [uncontrolledStep, setUncontrolledStep] = React.useState(defaultStep);

  const running = openProp ?? uncontrolledOpen;
  const index = Math.min(stepProp ?? uncontrolledStep, Math.max(0, steps.length - 1));
  const current: MPTourStep | undefined = steps[index];

  /**
   * The measurement, tagged with the selector it belongs to.
   *
   * Tagged rather than bare, because the step changes a frame before the effect
   * re-measures: an untagged rect would draw the *last* step's hole around the
   * next step's card for one paint, which is exactly the flicker a tour is
   * supposed to be too calm for.
   */
  const [measured, setMeasured] = React.useState<{ selector: string; spot: Spot } | null>(null);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      setUncontrolledOpen(next);
    }

    onOpenChange?.(next);
  };

  const goTo = (next: number) => {
    if (stepProp === undefined) {
      setUncontrolledStep(next);
    }

    onStepChange?.(next);
  };

  const selector = current?.target;
  const padding = current?.padding ?? 6;

  /**
   * Where the current target is, re-read every frame the tour is up.
   *
   * **Nothing in the platform reports that an element has moved.** A
   * `ResizeObserver` fires when it changes *size*; `scroll` and `resize` fire
   * when the window does. A banner loading above the target, an image arriving
   * with no reserved height, a panel expanding beside it — every one of those
   * moves the target and none of them says so, and what the reader sees is a
   * hole sitting over a piece of empty background beside the thing it was
   * pointing at.
   *
   * So it polls, which is the same answer a positioning library gives to the
   * same question. The cost is one `getBoundingClientRect` per frame, and it is
   * bounded by the thing that makes it acceptable: a tour is up for seconds, one
   * at a time, over a page the reader is looking at rather than working in. The
   * rect is compared before any state is set, so a page that is holding still
   * costs a read and nothing else — no render, no paint.
   */
  React.useEffect(() => {
    if (!running || !selector) {
      return undefined;
    }

    const target = document.querySelector(selector);

    if (!(target instanceof HTMLElement)) {
      return undefined;
    }

    if (scrollIntoView) {
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }

    let frame = 0;
    let last = '';

    const tick = () => {
      const rect = target.getBoundingClientRect();
      const key = `${rect.top} ${rect.left} ${rect.width} ${rect.height}`;

      if (key !== last) {
        last = key;

        setMeasured({
          selector,
          spot: {
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
          }
        });
      }

      frame = requestAnimationFrame(tick);
    };

    tick();

    return () => cancelAnimationFrame(frame);
  }, [running, selector, padding, scrollIntoView]);

  if (steps.length === 0) {
    return null;
  }

  const spot = running && selector && measured?.selector === selector ? measured.spot : null;
  const first = index === 0;
  const last = index === steps.length - 1;

  const finish = () => {
    onFinish?.();
    setOpen(false);
  };

  const buttonSize = BUTTON_SIZE[size];
  const titled = hasContent(current?.title) || hasContent(current?.content);

  return (
    <Popover.Root
      open={running}
      onOpenChange={(next, details) => {
        if (next) {
          setOpen(true);

          return;
        }

        /*
         * Using the page is exactly what a tour is for, so neither a press
         * outside the card nor the focus leaving it ends one — and Escape only
         * does while the tour says it may be dismissed. What is left is the ×
         * and the card's own buttons, which call `setOpen` directly.
         */
        if (
          details.reason === 'outside-press' ||
          details.reason === 'focus-out' ||
          (details.reason === 'escape-key' && !dismissible)
        ) {
          details.cancel();

          return;
        }

        setOpen(false);
      }}
    >
      {running && scrim ? <Scrim spot={spot} className={classNames?.scrim} /> : null}

      <Popover.Portal>
        <Popover.Positioner
          className={PORTAL_LAYER}
          side={current?.side ?? 'bottom'}
          align={current?.align ?? 'center'}
          sideOffset={selector ? 10 : 0}
          collisionPadding={12}
          /*
           * A getter rather than an element: the target is found on whatever the
           * page looks like right now, and it is a different element every step.
           *
           * A step with no `target` gets a **point in the middle of the window**
           * rather than nothing. Nothing is not the same as no preference — Base
           * UI has no anchor to measure against, so it holds the popup at the
           * top-left corner at `opacity: 0`, and a welcome step drawn that way is
           * a step nobody sees. A zero-size rect is the one anchor that needs no
           * element, and the card hangs from the centre line of the window.
           */
          anchor={() =>
            selector
              ? document.querySelector(selector)
              : {
                  getBoundingClientRect: () =>
                    new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0)
                }
          }
        >
          <Popover.Popup
            data-mp-size={size}
            className={[
              'mp-tour rounded-mp-md relative box-border flex flex-col outline-none',
              'bg-mp-surface-container text-mp-on-surface shadow-mp-3',
              SHEET_PAD[size],
              SHEET_GAP[size],
              PROSE_TEXT[size],
              MAX_WIDTH[size],
              FADE,
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ ...accentSlots(color), ...style }}
          >
            {titled ? (
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {hasContent(current?.title) ? (
                    <Popover.Title
                      className={[
                        'text-mp-on-surface m-0 font-medium',
                        SHEET_TITLE[size],
                        classNames?.title ?? ''
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {current?.title}
                    </Popover.Title>
                  ) : null}

                  {hasContent(current?.content) ? (
                    <Popover.Description
                      className={[
                        'text-mp-on-surface-variant m-0 min-w-0',
                        classNames?.content ?? ''
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {current?.content}
                    </Popover.Description>
                  ) : null}
                </div>

                {dismissible ? (
                  <button
                    type="button"
                    aria-label={common.close}
                    onClick={() => setOpen(false)}
                    className={[
                      'group/close rounded-mp-full text-mp-on-surface-variant relative -me-1 -mt-1',
                      'flex size-8 shrink-0 cursor-pointer items-center justify-center',
                      'appearance-none border-0 bg-transparent font-[inherit]',
                      'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
                      'focus-visible:outline-solid outline-none',
                      classNames?.close ?? ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <MPStateLayer className="group-hover/close:opacity-8 group-focus-visible/close:opacity-10" />
                    <MPIcon icon={CloseIcon} size={CONTROL_ICON[size]} />
                  </button>
                ) : null}
              </div>
            ) : null}

            <div
              className={['flex items-center gap-2', classNames?.footer ?? '']
                .filter(Boolean)
                .join(' ')}
            >
              {/*
                Where the reader is, drawn rather than only announced: a tour is
                an interruption, and the first thing anybody wants to know about
                one is how long it goes on for.
              */}
              <span className={`text-mp-on-surface-variant shrink-0 tabular-nums ${META_TEXT}`}>
                {fillMessage(messages.position, {
                  index: String(index + 1),
                  total: String(steps.length)
                })}
              </span>

              <div className="ms-auto flex items-center gap-1">
                {skippable && !last ? (
                  <MPButton
                    size={buttonSize}
                    variant="text"
                    color="secondary"
                    onClick={() => setOpen(false)}
                  >
                    {messages.skip}
                  </MPButton>
                ) : null}

                {!first ? (
                  <MPButton
                    size={buttonSize}
                    variant="outlined"
                    color={color}
                    onClick={() => goTo(index - 1)}
                  >
                    {messages.previous}
                  </MPButton>
                ) : null}

                <MPButton
                  size={buttonSize}
                  color={color}
                  onClick={() => (last ? finish() : goTo(index + 1))}
                >
                  {last ? messages.done : messages.next}
                </MPButton>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
