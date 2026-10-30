import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { OVERLAY } from '../../internal/messages/overlay';
import { FADE, PORTAL_LAYER, SCRIM } from '../../internal/surface';
import { SHEET_PAD } from '../../internal/scale';
import { useMPSize } from '../../internal/config';
import type { MPAlign, MPSize } from '../../types';

/**
 * How much of the page the overlay takes away.
 *
 * One axis, four steps — how legible is what is behind — and they are tuned with
 * the blur radius as much as with the alpha, because past about 16px a backdrop
 * smears into flat colour and the sheet reads opaque however low its alpha goes.
 *
 * - `scrim` — MD3's own scrim, and exactly what `MPDialog` puts behind itself.
 *   The page is still there and still readable; it has only stopped being
 *   reachable.
 * - `blur` — frosted. A lighter dim over a real blur, so the page is present as
 *   shape and colour but not as words. For "this is being replaced".
 * - `solid` — the page's own `surface`, opaque. For a screen that is genuinely
 *   gone.
 * - `clear` — nothing drawn at all. Still blocks the pointer, which is the whole
 *   reason to reach for it: an invisible sheet that catches a click.
 */
export type MPOverlayTone = 'scrim' | 'blur' | 'solid' | 'clear';

/**
 * An overlay takes `size`, `align` and `tone` and stops there.
 *
 * There is no `variant` — the five weights answer "how much of a surface does
 * this paint", and an overlay has taken the page. There is no `color` either: an
 * accent is what a control uses to say which of several things it is, and there
 * is only ever one overlay.
 */
export interface MPOverlayProps {
  /** The overlay is shown. Use with `onOpenChange` for a controlled overlay. */
  open?: boolean;
  /** Whether the overlay starts shown, for an uncontrolled one. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * How much of the page is taken away.
   * @default 'scrim'
   */
  tone?: MPOverlayTone;
  /**
   * Whether clicking the overlay or pressing Escape closes it.
   *
   * Off by default, which is the other way round from `MPDialog`. A dialog asks a
   * question and Escape is the universal "no"; an overlay is not asking anything
   * — it is saying *wait* — and a save that can be dismissed by a stray click is
   * a save the reader will believe finished. Turn it on for the overlay whose job
   * is to catch a click outside something.
   * @default false
   */
  dismissible?: boolean;
  /**
   * Whether the page behind is taken away for the keyboard too. `'trap-focus'`
   * leaves the page scrollable and clickable while still holding focus inside,
   * which is usually what a `clear` overlay wants.
   * @default true
   */
  modal?: boolean | 'trap-focus';
  /**
   * Where the content sits down the viewport.
   * @default 'center'
   */
  align?: MPAlign;
  /**
   * The room between the content and the edge of the viewport. The one thing
   * `size` decides here — an overlay has no surface of its own to scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * The accessible name of the overlay.
   *
   * It has a default rather than being optional, which almost nothing else in
   * this library does: an overlay that holds nothing readable — a bare spinner, a
   * `clear` sheet — still has to say what it is, and the alternative is a modal
   * region a screen reader announces as nothing at all.
   *
   * Defaults to the word for it in `locale`.
   */
  label?: string;
  /**
   * Which language that default is written in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** What sits on top — a spinner, a line of text, a small card. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TONE: Record<MPOverlayTone, string> = {
  scrim: SCRIM,
  blur: 'bg-mp-scrim/20 [backdrop-filter:blur(14px)_saturate(1.4)]',
  solid: 'bg-mp-surface',
  clear: ''
};

const ALIGN: Record<MPAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end'
};

/**
 * A sheet over the whole page that stops it being used.
 *
 * What separates this from `MPDialog` is what is *not* here: no surface, no
 * outline, no title, no actions. An overlay is the scrim on its own, with
 * whatever the caller puts on top of it — most often an `MPProgressCircular` and
 * a line saying what is being waited for.
 *
 * `dismissible` is the one prop worth reading twice, and it is off. Everything
 * else Base UI owns: the portal, the scroll lock, the focus held inside, the page
 * behind going inert, and focus returning to wherever it came from on close.
 */
export function MPOverlay({
  open,
  defaultOpen,
  onOpenChange,
  tone = 'scrim',
  dismissible = false,
  modal = true,
  align = 'center',
  size: sizeProp,
  label,
  locale: localeProp,
  className,
  style,
  children
}: MPOverlayProps) {
  const size = useMPSize(sizeProp);
  const messages = useMPMessages(OVERLAY, useMPLocale(localeProp));

  return (
    <Dialog.Root
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        // `disablePointerDismissal` covers the click; Escape has no prop of its
        // own, so it is cancelled here by the reason the change arrives with.
        if (!dismissible && !next && details.reason === 'escape-key') {
          details.cancel();

          return;
        }

        onOpenChange?.(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={`${PORTAL_LAYER} fixed inset-0 ${FADE} ${TONE[tone]}`} />

        {/* The viewport is what the content is centred in, and it is also what
            makes `dismissible` mean anything: it covers the scrim, so a click
            that misses the content is an outside press rather than a click on
            the overlay itself. */}
        <Dialog.Viewport
          className={[
            PORTAL_LAYER,
            'fixed inset-0 flex justify-center',
            ALIGN[align],
            SHEET_PAD[size]
          ].join(' ')}
        >
          <Dialog.Popup
            aria-label={label ?? messages.label}
            data-mp-size={size}
            className={[
              'mp-overlay flex max-h-full max-w-full flex-col items-center justify-center',
              'text-mp-on-surface outline-none',
              FADE,
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={style}
          >
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
