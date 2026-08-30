import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon, ErrorIcon, InfoIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { ALERT } from '../../internal/messages/alert';
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
  /** Passing it is what makes the dismiss button appear. */
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
    color = 'primary',
    size = 'md',
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
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(ALERT, locale);
  const accent = ACCENT[variant];
  const titled = hasContent(title);
  const glyph =
    icon === undefined ? (
      <MPIcon icon={color === 'error' ? ErrorIcon : InfoIcon} size={CONTROL_ICON[size]} />
    ) : (
      icon
    );

  return (
    <div
      ref={ref}
      role={ROLE[live ?? DEFAULT_LIVE[color]]}
      data-mp-size={size}
      data-mp-variant={variant}
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
            onClick={onClose}
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
});
