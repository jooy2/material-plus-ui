import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon, ErrorIcon, InfoIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { ALERT } from '../../internal/messages/alert';
import { inertProps } from '../../internal/inert';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_ICON,
  hasContent,
  PROSE_TEXT,
  SHEET_GAP,
  SHEET_PAD,
  SHEET_TITLE,
  STACK_GAP
} from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPSize, MPVariant } from '../../types';

/**
 * What the alert is made of, at rest.
 *
 * The library's five, in the order they get louder, and the same words they have
 * everywhere else — a `filled` alert and a `filled` button are the same statement
 * about emphasis made by two different components.
 *
 * Unlike a card or an empty state, an alert takes the accent onto its *own*
 * surface rather than staying neutral, and that is the whole difference between
 * the two kinds of container. A card is a box holding somebody else's content,
 * so dyeing it would dye their content's background; an alert *is* the message,
 * and which family it reads is the message's main claim.
 *
 * `bg-transparent` is written out on the two that have no fill: this library
 * ships no page reset, so nothing else is going to take a browser default off.
 */
const REST: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-mp-on-surface',
  outlined: 'border-mp-outline border bg-transparent text-mp-on-surface',
  text: 'bg-transparent text-mp-on-surface'
};

/**
 * Where the family shows up when the surface is not already carrying it.
 *
 * On `filled` and `tonal` the container *is* the accent, so the glyph and the
 * heading ride on it as one ink and colouring them again would be painting the
 * accent onto itself. On the three neutral surfaces the accent has nowhere else
 * to go, so it is spent on exactly the two things that say which kind of alert
 * this is — and the message stays ordinary reading text.
 */
const ACCENT: Record<MPVariant, string> = {
  filled: '',
  tonal: '',
  elevated: 'text-(--_mp-accent)',
  outlined: 'text-(--_mp-accent)',
  text: 'text-(--_mp-accent)'
};

/**
 * The detail line under a heading.
 *
 * On a neutral surface it steps back to `on-surface-variant`, the same role a
 * field's supporting text takes. On an accent one there is nothing to step back
 * *to* — the neutral grey is derived to sit on the page, and on a saturated fill
 * it reads as damaged rather than quiet — so the ink stays and the heading does
 * the separating with its weight.
 */
const DETAIL: Record<MPVariant, string> = {
  filled: '',
  tonal: '',
  elevated: 'text-mp-on-surface-variant',
  outlined: 'text-mp-on-surface-variant',
  text: 'text-mp-on-surface-variant'
};

/**
 * How loudly an alert announces itself.
 *
 * - `assertive` — interrupts whatever a screen reader is in the middle of
 *   saying. `role="alert"`.
 * - `polite` — waits for a pause. `role="status"`.
 * - `off` — announces nothing, and is read only by somebody who walks into it.
 *
 * The third is the one worth knowing about. A live region is for content that
 * *arrives*, and an alert that was on the page when it loaded did not arrive —
 * it is part of the page, and interrupting to read it is interrupting to say
 * something the reader was going to reach anyway. A form's list of errors on a
 * server-rendered page is exactly that case.
 */
export type MPAlertLive = 'assertive' | 'polite' | 'off';

/**
 * Which live region an alert belongs in when nobody said.
 *
 * "This failed" is worth interrupting for and "saved" is not, so the family
 * decides. It is a default rather than a rule for the reason `live` exists.
 */
const DEFAULT_LIVE: Record<MPColor, MPAlertLive> = {
  primary: 'polite',
  secondary: 'polite',
  tertiary: 'polite',
  error: 'assertive'
};

const ROLE: Record<MPAlertLive, 'alert' | 'status' | undefined> = {
  assertive: 'alert',
  polite: 'status',
  off: undefined
};

export interface MPAlertProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'title'
> {
  /**
   * How much surface the alert paints.
   *
   * `tonal` rather than `filled`, which is the one place this component's default
   * differs from a button's. A container tone is MD3's own answer for a message
   * set into a page — it separates itself from the surface without competing
   * with the primary action that is usually sitting right beside it, and a page
   * with three saturated alerts on it has no emphasis left to spend.
   * @default 'tonal'
   */
  variant?: MPVariant;
  /**
   * Which accent family it reads.
   *
   * Four roles, not a severity ladder — there is no `info`, `success` or
   * `warning` here, because [the specification's colour
   * system](../design/color) has no way to derive them and a library that
   * invented three more families would be promising tokens the sheet cannot
   * produce. `error` is the one severity Material does name, and the rest is an
   * emphasis decision: `primary` for a notice, `secondary` or `tertiary` for one
   * that should sit further back.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * The room inside, and the type scale of the text in it.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * The heading line. With it the alert is two-part — a headline and the detail
   * under it; without it the whole thing is one line.
   */
  title?: React.ReactNode;
  /**
   * The glyph at the start.
   *
   * Defaults to the one that goes with `color`; pass `false` to drop it, or a
   * node to replace it. Only two defaults exist because only two are honest: the
   * error family gets the error glyph and everything else gets the informational
   * one. An alert that means "this worked" should say so with an `icon` of its
   * own rather than by having the library guess from a colour.
   */
  icon?: React.ReactNode | false;
  /**
   * Content pinned to the end of the row — a "Retry" button, a link. Kept out of
   * `children` so it stays on the first line while the message wraps.
   */
  action?: React.ReactNode;
  /**
   * How loudly it announces itself.
   *
   * Defaults to `assertive` for the `error` family and `polite` for the other
   * three, which is the right split for a message that *appeared*. Reach for
   * `off` when the alert was on the page before the reader was: an error summary
   * rendered by the server is not news, and a screen reader interrupting itself
   * to read it is interrupting to say something the reader was about to reach on
   * their own.
   */
  live?: MPAlertLive;
  /**
   * Passing it is what makes the dismiss button appear.
   *
   * **It fires when the alert has finished leaving, not when the × is
   * pressed.** An alert is in the flow of the page, so taking one out moves
   * everything under it — and the caller owns the mount, which means an alert
   * whose callback fired on the press had already been unmounted by the time
   * there was anything to animate. So the press starts the exit and this is the
   * end of it, roughly 200ms later, which is the moment `{open && <MPAlert/>}`
   * wants to hear about.
   *
   * The event is the press that started it, held rather than re-created.
   */
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * The accessible name of the dismiss button. Defaults to the word for
   * "dismiss" in `locale`.
   */
  closeLabel?: string;
  /**
   * Which language the dismiss button's default name is written in. Falls back
   * to the nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** The message. */
  children?: React.ReactNode;
}

/**
 * A message about something that happened, set into the page it is about.
 *
 * The three shapes people mean by "an alert" are one component with different
 * slots filled rather than three components: a bare line (`<MPAlert icon={false}>`),
 * a line with a glyph (the default), and a glyph with a headline and the detail
 * under it (`title` plus `children`). Nothing about the surface changes between
 * them — only how much of it is used.
 *
 * There is no Base UI primitive under this, and there should not be: an alert has
 * no interaction to delegate. It is a live region with a layout, and the only
 * interactive parts it can grow — the action and the dismiss button — are real
 * buttons that the caller either passes in or gets by passing `onClose`.
 *
 * ## Why this is not a snackbar
 *
 * An alert belongs to the flow of the page it interrupts; a snackbar floats over
 * it and leaves on a timer. That is not a styling difference: a message the
 * reader has to act on must not be able to disappear before it has been read,
 * and a message about the page's *current* state has to still be there when they
 * look back at it. If it can be missed without consequence, it is
 * [MPSnackbar](../feedback/snackbar).
 */
export const MPAlert = React.forwardRef<HTMLDivElement, MPAlertProps>(function MPAlert(
  {
    variant = 'tonal',
    color: colorProp,
    size: sizeProp,
    title,
    icon,
    action,
    live,
    onClose,
    closeLabel,
    locale: localeProp,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const color = useMPColor(colorProp);
  const size = useMPSize(sizeProp);
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(ALERT, locale);

  /*
   * The exit, and why the alert has to run it itself.
   *
   * Everything else in this library that leaves is portalled and Base UI holds
   * it open for the length of its own animation. An alert is not: it sits in
   * the flow of the page, the caller owns whether it is mounted, and a callback
   * that fired on the press had already taken the element away before there was
   * anything to animate. So the press starts the exit and `onClose` is the end
   * of it -- which is also the moment the caller actually wants, since what it
   * does with it is stop rendering the alert.
   *
   * The press is held rather than re-created. React has not pooled events since
   * 17, so the object is still the one the reader produced 200ms later.
   */
  const [leaving, setLeaving] = React.useState(false);
  const press = React.useRef<React.MouseEvent<HTMLButtonElement> | null>(null);
  const reveal = React.useRef<HTMLDivElement | null>(null);

  const finish = React.useCallback(() => {
    const event = press.current;

    press.current = null;

    if (event) {
      onClose?.(event);
    }
  }, [onClose]);

  /*
   * The alert that has no exit to wait for, which is two alerts rather than an
   * edge case: a reader who asked for reduced motion, and a page whose own
   * stylesheet has taken the transition off. Neither will ever fire a
   * `transitionend`, and an alert waiting for one would sit there dismissed and
   * still on the page. The same question `MPAccordion` asks of its panel, in
   * the same words.
   */
  React.useLayoutEffect(() => {
    const element = reveal.current;

    if (!leaving || !element) {
      return;
    }

    if (parseFloat(getComputedStyle(element).transitionDuration) === 0) {
      finish();
    }
  }, [leaving, finish]);

  const accent = ACCENT[variant];
  const titled = hasContent(title);
  const glyph =
    icon === undefined ? (
      <MPIcon icon={color === 'error' ? ErrorIcon : InfoIcon} size={CONTROL_ICON[size]} />
    ) : (
      icon
    );

  const box = (
    <div
      ref={ref}
      role={ROLE[live ?? DEFAULT_LIVE[color]]}
      data-mp-size={size}
      data-mp-variant={variant}
      // Unreachable the moment it starts leaving, rather than when it is gone.
      // A caller that ignores `onClose` leaves a dismissed alert on the page at
      // no height, and a live region nobody can see is still one a screen
      // reader can walk into.
      {...inertProps(leaving)}
      className={[
        'mp-alert rounded-mp-md flex w-full items-start',
        // `box-border` explicitly, for the reason `MPButton` gives: with no page
        // reset an `outlined` alert's hairline would be added *outside* its
        // padding and come out two pixels taller than a `tonal` one beside it.
        'box-border',
        SHEET_PAD[size],
        SHEET_GAP[size],
        PROSE_TEXT[size],
        REST[variant],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {hasContent(glyph) ? (
        // `h-[1lh]` rather than a margin: the glyph centres on the first *line*
        // of text whatever the type scale turns out to be, so a one-line alert
        // looks centred and a three-line one still has its glyph at the top.
        <span className={['flex h-[1lh] shrink-0 items-center', accent].filter(Boolean).join(' ')}>
          {glyph}
        </span>
      ) : null}

      <div className={`flex min-w-0 flex-1 flex-col ${STACK_GAP[size]}`}>
        {titled ? (
          <div className={[SHEET_TITLE[size], accent].filter(Boolean).join(' ')}>{title}</div>
        ) : null}
        {hasContent(children) ? (
          // Under a heading the message is supporting detail and steps back to
          // the muted ink. On its own it *is* the alert, and stays reading text.
          <div className={titled ? DETAIL[variant] : undefined}>{children}</div>
        ) : null}
      </div>

      {hasContent(action) ? (
        <div className="flex h-[1lh] shrink-0 items-center">{action}</div>
      ) : null}

      {onClose ? (
        <span className="flex h-[1lh] shrink-0 items-center">
          <button
            type="button"
            aria-label={closeLabel ?? messages.dismiss}
            // Once. A second press during the exit would hold the same event
            // again and call back twice for one dismissal, and the alert is
            // `inert` by then only for a reader who is not holding a mouse.
            disabled={leaving}
            onClick={(event) => {
              press.current = event;
              setLeaving(true);
            }}
            className={[
              // `group` on the button rather than on the alert: the state layer
              // reads its ancestor's hover, and an alert-wide group would light
              // the × whenever the pointer was anywhere in the message.
              'group rounded-mp-full relative -m-1 flex size-8 cursor-pointer items-center',
              'justify-center bg-transparent text-inherit',
              'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-solid outline-none'
            ].join(' ')}
          >
            <MPStateLayer />
            <MPIcon icon={CloseIcon} size={CONTROL_ICON[size]} />
          </button>
        </span>
      ) : null}
    </div>
  );

  /*
   * The collapse, and why it is a wrapper rather than a height on the alert.
   *
   * A dismissed alert that only faded would leave a hole where it was, and
   * everything under it would jump the moment the caller unmounted it -- the
   * same jolt as before, moved 200ms later and now detached from the press that
   * caused it. So the space goes with it.
   *
   * The track travels between `1fr` and `0fr`, which is the one way to
   * interpolate towards a height nobody knows: `1fr` of a single-row grid is
   * exactly what the message needs and `0fr` is nothing at all, so the two ends
   * are the real heights rather than a guess. It is the same move
   * `MPFloatingActionButton` makes across its label, one axis over -- and it
   * needs no measurement, which is what keeps this out of a layout effect that
   * would have to run before every paint of every alert on the page.
   *
   * Only when there is a `×`. An alert that cannot be dismissed has nothing to
   * collapse, and it keeps the markup it has always had.
   */
  if (!onClose) {
    return box;
  }

  return (
    <div
      ref={reveal}
      className={[
        'mp-alert__reveal grid transition-[grid-template-rows,opacity]',
        'duration-(--mp-sys-motion-duration-short4)',
        // Accelerating, which is what `SHEET_MOTION` gives everything else in
        // the library on its way out: something leaving has already said what it
        // had to say and should get out of the way.
        'ease-(--mp-sys-motion-easing-emphasized-accelerate)',
        'motion-reduce:transition-none',
        leaving ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'
      ].join(' ')}
      // The row rather than the opacity, which finishes at the same moment and
      // would call back twice. `currentTarget` because a transition anywhere
      // inside the message -- a state layer under a pointer that is still on
      // the × -- bubbles to here as well.
      onTransitionEnd={(event) => {
        if (
          leaving &&
          event.propertyName === 'grid-template-rows' &&
          event.target === event.currentTarget
        ) {
          finish();
        }
      }}
    >
      {/*
       * The alert is *inside* the grid item rather than being it, and that is
       * the whole of what makes the collapse reach nothing. A box with
       * `box-sizing: border-box` cannot be shorter than its own padding, so an
       * alert asked to be the zero-height row bottomed out at `SHEET_PAD`'s two
       * tracks — 32px of empty container at `md`, held open for good. An item
       * with no padding of its own has nothing to bottom out at, and clips the
       * alert inside it instead.
       *
       * `min-h-0` always: a grid item's automatic minimum size is its
       * content's, which would hold the row open at the height of the message.
       *
       * `overflow-hidden` only while it is leaving, and that is the point.
       * Clipping is the *animation's*, not the alert's — one that went on
       * clipping would cut the focus ring off its own dismiss button, which is
       * the bug `MPAccordion` writes up at length about its panel.
       */}
      <div className={`min-h-0 ${leaving ? 'overflow-hidden' : ''}`}>{box}</div>
    </div>
  );
});
