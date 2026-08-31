import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { cssLength } from '../../internal/length';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { MPStateLayer } from '../../internal/StateLayer';
import { SHEET_GAP, hasContent } from '../../internal/scale';
import { FADE, PORTAL_LAYER, SCRIM, SHEET_MOTION } from '../../internal/surface';
import type { MPColor, MPControlEventProps, MPSize } from '../../types';

/**
 * A dialog takes `size` and `color` and stops there.
 *
 * There is no `variant`: the five weights answer "how much of a surface does this
 * paint against the page around it", and a modal has already taken the page.
 * There is no `elevation` prop either — see the note on the sheet below.
 */
/**
 * A dialog's sheet, which is where an event handler lands.
 *
 * The same rule the eight controls follow, applied to the one component that had
 * no element a caller could reach at all: a class describes the whole dialog and
 * lands on its outermost element, an event came from somewhere inside the sheet
 * and lands on the sheet. So `onKeyDown` is a keystroke inside the dialog and
 * never one on the trigger that opened it, and never one on the page behind.
 *
 * It is the popup rather than the backdrop deliberately. A key pressed while the
 * dialog holds focus reaches the popup by bubbling; a click on the scrim does
 * not, which is `dismissible`'s job and not this one's.
 */
export interface MPDialogProps extends MPControlEventProps<HTMLElement> {
  /** The dialog is shown. Use with `onOpenChange` for a controlled dialog. */
  open?: boolean;
  /** Whether the dialog starts open, for an uncontrolled one. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * The element that opens the dialog, wired up by Base UI. Optional — a
   * controlled dialog opened from elsewhere in the application needs no trigger
   * at all, and passing one here is a convenience for the common case.
   */
  trigger?: React.ReactElement;
  /**
   * A glyph above the headline.
   *
   * MD3's own hero icon, and passing one is what centres the header: a dialog
   * with an icon is announcing something, and a dialog without one is asking
   * something. Both are correct; they are two different dialogs.
   */
  icon?: React.ReactNode;
  /** The headline. Rendered as the `<h2>` that names the dialog. */
  title?: React.ReactNode;
  /** The supporting text under it, and the dialog's accessible description. */
  description?: React.ReactNode;
  /**
   * The bottom row. Laid out end-aligned, so a pair of buttons needs no wrapper
   * of its own — and `MPDialogClose` is what makes one of them dismiss.
   */
  actions?: React.ReactNode;
  /**
   * Draws a hairline between the header, the body and the actions instead of
   * separating them with space. Worth turning on the moment the body scrolls: the
   * lines are what say the header stayed put.
   * @default false
   */
  dividers?: boolean;
  /**
   * Shows the × in the corner.
   *
   * Defaults to whatever `fullScreen` is, which is MD3's own split: a basic
   * dialog is answered by its actions and has no ×, while a full-screen dialog
   * carries one at the start of its top bar because there is no scrim left to
   * click. Set it explicitly to disagree with either.
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
   * A hard cap on the sheet's width, overriding the one `size` implies. Numbers
   * are pixels. For the dialog whose *content* decides its width — a wide table,
   * a narrow confirmation — rather than for tuning the scale, which is `size`.
   */
  width?: number | string;
  /**
   * The sheet takes the full width its `size` allows.
   *
   * On by default, which is the other way round from every other component in the
   * library. Elsewhere `fullWidth` means "fill the container"; a dialog's
   * container is the viewport, and a dialog that shrank to fit two words would be
   * a tooltip.
   * @default true
   */
  fullWidth?: boolean;
  /** Fills the viewport edge to edge. For a phone-sized screen, or an editor. */
  fullScreen?: boolean;
  /**
   * Whether the page behind is taken away. `'trap-focus'` keeps the page
   * scrollable and clickable while still holding focus inside.
   * @default true
   */
  modal?: boolean | 'trap-focus';
  /**
   * Whether Escape or a click outside closes the dialog. Turn it off for the
   * dialog that has to be answered — and then give it actions that answer it,
   * because there will be no other way out.
   * @default true
   */
  dismissible?: boolean;
  /**
   * The type scale the sheet is drawn at, and how wide it is allowed to get.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the hero icon reads.
   *
   * The sheet itself stays neutral, exactly as MD3's does — a dialog is already
   * the only thing on the screen, and painting it in an accent would be shouting
   * at a reader who is not looking anywhere else. The icon is the one part that
   * carries a family, and `secondary` is the spec's own choice for it.
   * @default 'secondary'
   */
  color?: MPColor;
  /** The body. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export type MPDialogCloseProps = React.ComponentProps<typeof Dialog.Close>;

/**
 * How wide the sheet is allowed to get, per `size`.
 *
 * `md` is MD3's own 560dp maximum. `size` and the width are one axis rather than
 * the two some libraries split them into: a second five-value scale spelled
 * `maxWidth` would be a second spelling of an idea the library already has a word
 * for, and the case it would exist for — "small type, wide sheet" — is exactly
 * what the `width` escape hatch is.
 *
 * The steps are further apart than the control ladder because they answer a
 * different question: not how big is this thing, but how long a line of text is
 * comfortable inside it.
 */
const MAX_WIDTH: Record<MPSize, string> = {
  xs: 'max-w-[320px]',
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]'
};

/** The sheet timings, plus the property the grow needs. */
const POPUP_MOTION = `transition-[opacity,scale] ${SHEET_MOTION}`;

/**
 * The grow, and the argument for it.
 *
 * `internal/surface.ts` says a floating surface should not move, and it is
 * right about the surfaces it was written for: a menu, a popover, a select's
 * list all open *at* something the reader is already looking at, and moving one
 * moves the target out from under a pointer that is already travelling towards
 * it. A dialog opens at nothing. It takes the page, it is announced by the
 * scrim arriving under it, and there is no row underneath it to displace.
 *
 * So MD3's own answer applies: the container grows as it fades. What that adds
 * over a bare fade is a **direction** — outwards, from a centre — which is the
 * difference between a sheet that arrived and a sheet that was always there and
 * has only now been noticed.
 *
 * 95% rather than the specification's 80%. Growing is the one transition in this
 * library that resamples text while it plays, and 80% of a 560px dialog starts
 * it 56px narrower than it ends — far enough that the words visibly travel
 * outwards and are soft for most of the way. At 95% the box moves 14px, which
 * reads as the sheet settling rather than as the sentence inside it moving. The
 * shape of the specification's motion, at a strength a box full of text can
 * carry.
 *
 * `motion-safe:` for the reason `MPDrawer`'s `SLIDE` gives: negating four
 * `data-*` utilities would need four more of equal specificity, where declining
 * to declare them needs none. What is left is the plain fade this sheet had.
 */
const GROW = [
  'motion-safe:data-starting-style:scale-95',
  'motion-safe:data-ending-style:scale-95'
].join(' ');

/**
 * The room inside the sheet, and deliberately not `SHEET_PAD`.
 *
 * That ladder is centred on MD3's 16dp card padding; a dialog's is 24dp, because
 * a card sits in a column of other cards and a dialog is alone on the screen with
 * the scrim as its margin.
 */
const PAD: Record<MPSize, string> = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-7',
  xl: 'p-8'
};

/**
 * The same track split in two, because the sheet and its sections do not always
 * pad the same way.
 *
 * Without `dividers` the sheet carries the vertical room and each section
 * carries only the horizontal, so the gaps between sections are the sheet's.
 * With them each section carries both, so a rule can reach the sheet's edges.
 *
 * Written out rather than derived from `PAD`. Tailwind finds classes by scanning
 * source text, so a `p-6` turned into a `py-6` at runtime generates no rule at
 * all — the padding would simply not exist.
 */
const PAD_X: Record<MPSize, string> = {
  xs: 'px-3',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-7',
  xl: 'px-8'
};

const PAD_Y: Record<MPSize, string> = {
  xs: 'py-3',
  sm: 'py-4',
  md: 'py-6',
  lg: 'py-7',
  xl: 'py-8'
};

/**
 * The headline, at MD3's own `headline-small` for `md`.
 *
 * A headline rather than a title role, which is the opposite of what a card takes
 * — and it is the right way round. A card's first line names one thing among
 * many; a dialog's names the only thing on the screen, which is what a headline
 * role is for.
 */
const TITLE: Record<MPSize, string> = {
  xs: 'text-mp-title-medium',
  sm: 'text-mp-title-large',
  md: 'text-mp-headline-small',
  lg: 'text-mp-headline-medium',
  xl: 'text-mp-headline-large'
};

/** Supporting text: MD3's `body-medium` at `md`. */
const BODY: Record<MPSize, string> = {
  xs: 'text-mp-body-small',
  sm: 'text-mp-body-small',
  md: 'text-mp-body-medium',
  lg: 'text-mp-body-large',
  xl: 'text-mp-body-large'
};

/** The glyph in the hero slot. MD3 draws it at 24dp. */
const ICON_SIZE: Record<MPSize, number> = {
  xs: 20,
  sm: 22,
  md: 24,
  lg: 28,
  xl: 32
};

/**
 * Closes the dialog it is inside.
 *
 * Exported because an uncontrolled dialog has no `setOpen` for its Cancel button
 * to call, and the alternative — making every dialog controlled — is a piece of
 * state per dialog that exists only to answer a button.
 *
 * `render` is Base UI's own escape hatch, so a real Material Plus button
 * dismisses: `<MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />`.
 */
export const MPDialogClose = Dialog.Close;

/**
 * A sheet that takes the page away until it is answered.
 *
 * The sections are props rather than compound sub-components: the arrangement of
 * a dialog is fixed — icon, headline, supporting text, body, actions — and what a
 * caller wants to decide is what goes in each slot, not what order they come in.
 *
 * Base UI owns everything hard about it: the focus trap, the scroll lock, the
 * `aria-labelledby` / `aria-describedby` wiring, restoring focus to the trigger,
 * and the inert page behind. What is left here is the surface, the width ladder
 * and the scroll behaviour — the header and the actions stay put while only the
 * body scrolls, which is why `dividers` matters more here than on a list.
 *
 * ## The sheet
 *
 * `surface-container-high` at `corner-extra-large`, elevation 3 — MD3's own three
 * choices for a dialog, and the only surface in this library that carries the
 * third elevation level. There is no `elevation` prop for the same reason there
 * is no `variant`: a dialog that could be told to sit flat on the page would be a
 * dialog that could be told to stop being a dialog.
 */
export function MPDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  actions,
  dividers = false,
  showClose,
  closeLabel,
  locale: localeProp,
  width,
  fullWidth = true,
  fullScreen = false,
  modal = true,
  dismissible = true,
  size = 'md',
  color = 'secondary',
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onClick,
  onDoubleClick,
  onContextMenu,
  className,
  style,
  children
}: MPDialogProps) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(COMMON, locale);
  const withClose = showClose ?? fullScreen;
  const hasIcon = hasContent(icon);
  const hasHeader = hasContent(title) || hasContent(description) || hasIcon;
  const hasActions = hasContent(actions);
  // With dividers the lines have to reach both edges, so the sheet gives up its
  // vertical padding and every section takes it on instead.
  const section = dividers ? PAD[size] : PAD_X[size];
  const rule = 'border-mp-outline-variant border-t';

  return (
    <Dialog.Root
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        // `disablePointerDismissal` covers the click outside; Escape has no prop
        // of its own, so it is cancelled here by the reason it arrives with.
        if (!dismissible && !next && details.reason === 'escape-key') {
          details.cancel();

          return;
        }

        onOpenChange?.(next);
      }}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}

      <Dialog.Portal>
        <Dialog.Backdrop className={`${PORTAL_LAYER} fixed inset-0 ${FADE} ${SCRIM}`} />

        <Dialog.Viewport
          className={[
            PORTAL_LAYER,
            'fixed inset-0 flex justify-center',
            // `items-center` alone would clip the top of a dialog taller than the
            // viewport, because a centred flex item cannot scroll past its own
            // container's start edge. The sheet caps its height instead and
            // scrolls its body, so the header and the actions stay put.
            fullScreen ? 'items-stretch' : 'items-center p-4'
          ].join(' ')}
        >
          <Dialog.Popup
            data-mp-size={size}
            // The caller's, on the sheet. Base UI's own handling of the keys it
            // owns — Escape, the focus trap's Tab — runs alongside rather than
            // being replaced, so a dialog stays dismissible whatever is written
            // here.
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            className={[
              'mp-dialog relative flex w-full flex-col overflow-hidden',
              'bg-mp-surface-container-high text-mp-on-surface shadow-mp-3 outline-none',
              fullScreen
                ? 'h-full max-w-none rounded-none'
                : `rounded-mp-xl max-h-full ${width === undefined ? MAX_WIDTH[size] : ''}`,
              !fullScreen && !fullWidth ? 'w-auto' : '',
              dividers ? '' : `${PAD_Y[size]} ${SHEET_GAP[size]}`,
              POPUP_MOTION,
              // A full-screen dialog has no middle to grow out of — it *is* the
              // window — so it only fades. Growing one would mean scaling the
              // whole page's worth of content by the same fraction, and its
              // edges are already the window's edges to begin with.
              fullScreen ? '' : GROW,
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              ...accentSlots(color),
              // The escape hatch, and it has to be an inline style rather than a
              // class: Tailwind finds classes by scanning source text, so an
              // arbitrary `max-w-[720px]` built from a prop generates no rule.
              ...(width === undefined || fullScreen ? null : { maxWidth: cssLength(width) }),
              ...style
            }}
          >
            {hasHeader || withClose ? (
              <div
                className={[
                  'flex shrink-0 items-start gap-3',
                  section,
                  // A hero icon centres the header, which is MD3's own rule: the
                  // icon, the headline and the supporting text stack on one axis
                  // and the whole block is announcing rather than asking.
                  hasIcon && !withClose ? 'flex-col items-center text-center' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {hasIcon ? (
                  <span className="flex shrink-0 items-center justify-center text-(--_mp-accent)">
                    {icon}
                  </span>
                ) : null}

                <div className={`flex min-w-0 flex-1 flex-col ${SHEET_GAP[size]}`}>
                  {hasContent(title) ? (
                    <Dialog.Title className={`m-0 ${TITLE[size]}`}>{title}</Dialog.Title>
                  ) : null}
                  {hasContent(description) ? (
                    <Dialog.Description className={`text-mp-on-surface-variant m-0 ${BODY[size]}`}>
                      {description}
                    </Dialog.Description>
                  ) : null}
                </div>

                {withClose ? (
                  <Dialog.Close
                    aria-label={closeLabel ?? messages.close}
                    className={[
                      'group text-mp-on-surface-variant relative flex size-10 shrink-0',
                      'rounded-mp-full cursor-pointer items-center justify-center',
                      'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
                      'focus-visible:outline-solid outline-none'
                    ].join(' ')}
                  >
                    <MPStateLayer />
                    <MPIcon icon={CloseIcon} size={ICON_SIZE[size]} />
                  </Dialog.Close>
                ) : null}
              </div>
            ) : null}

            {hasContent(children) ? (
              // The only part that scrolls. `min-h-0` is what lets it: a flex
              // item's default `min-height: auto` refuses to shrink below its
              // content, and the sheet would grow past the viewport instead.
              <div
                className={[
                  'min-h-0 flex-1 overflow-y-auto overscroll-contain',
                  BODY[size],
                  section,
                  dividers && (hasHeader || withClose) ? rule : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {children}
              </div>
            ) : null}

            {hasActions ? (
              <div
                className={[
                  'flex shrink-0 flex-wrap items-center justify-end gap-2',
                  section,
                  dividers ? rule : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {actions}
              </div>
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
