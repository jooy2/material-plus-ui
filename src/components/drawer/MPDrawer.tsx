import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  hasContent,
  META_TEXT,
  PROSE_TEXT,
  SHEET_GAP,
  SHEET_PAD_X,
  SHEET_PAD_Y,
  SHEET_TITLE
} from '../../internal/scale';
import { FADE, PORTAL_LAYER, SCRIM } from '../../internal/surface';
import type { MPSide, MPSize } from '../../types';

/**
 * How the panel relates to the page, in MD3's own two words for it.
 *
 * - `modal` — it is opened, it floats over the page on a scrim, it holds the
 *   focus, and it is dismissed. The navigation drawer behind a hamburger, the
 *   filter panel beside a table, the bottom sheet a phone raises.
 * - `standard` — it is part of the layout and the page is laid out around it.
 *   No scrim, no portal, no focus trap, nothing to dismiss. The sidebar that is
 *   simply there.
 *
 * A separate axis from `variant`, which is why this component has no `variant`:
 * the five weights answer "how much does this surface assert itself against the
 * page", and a panel that has taken an edge of the window has answered it.
 */
export type MPDrawerMode = 'modal' | 'standard';

/**
 * A drawer takes `side`, `mode` and `size`, and stops there.
 *
 * There is no `variant`, for [MPDialog](../feedback/dialog)'s reason. There is
 * no `color` either: MD3's navigation drawer is `surface-container-low` under
 * neutral ink, and what carries an accent inside one is the *selected row*,
 * which belongs to whatever list the caller puts in it.
 */
export interface MPDrawerProps {
  /**
   * Which edge the panel is attached to.
   *
   * Physical rather than logical, the way `MPSide` is everywhere in this
   * library: a drawer along the top of the window is along the top in every
   * writing direction.
   * @default 'left'
   */
  side?: MPSide;
  /** @default 'modal' */
  mode?: MPDrawerMode;
  /** The drawer is shown. Use with `onOpenChange` for a controlled drawer. */
  open?: boolean;
  /**
   * Whether the drawer starts open, for an uncontrolled one.
   *
   * Defaults to `false` in `modal` mode and `true` in `standard` mode, because a
   * fixed sidebar that had to be opened before it appeared would not be a fixed
   * sidebar.
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * The element that opens the drawer, wired up by Base UI.
   *
   * `modal` only. A `standard` drawer is not opened — it is in the layout — so a
   * trigger there would have nothing to do and is not rendered.
   */
  trigger?: React.ReactElement;
  /** The heading. Rendered as the element that names the drawer. */
  title?: React.ReactNode;
  /** A line under it, and the drawer's accessible description. */
  description?: React.ReactNode;
  /**
   * The bottom row, held against the foot of the panel while the body scrolls.
   * Laid out end-aligned, so a pair of buttons needs no wrapper of its own — and
   * `MPDrawerClose` is what makes one of them dismiss.
   */
  actions?: React.ReactNode;
  /**
   * Draws a hairline between the header, the body and the actions instead of
   * separating them with space. Worth turning on the moment the body scrolls:
   * the lines are what say the header stayed put.
   * @default false
   */
  dividers?: boolean;
  /**
   * Shows the × in the corner.
   *
   * On in `modal` mode, where the panel has taken the page and the way out
   * should not have to be remembered; off in `standard` mode, where a × that
   * closes a fixed sidebar with nothing to reopen it is a one-way door.
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
   * How far the panel reaches in from its edge: a **width** for `left` and
   * `right`, a **height** for `top` and `bottom`. Numbers are pixels.
   *
   * Left alone, a side panel takes the width its `size` implies and a top or
   * bottom panel is as tall as what is in it, up to 85% of the window.
   */
  extent?: number | string;
  /**
   * Rounds the corners on the edge that faces the page — the top and bottom of a
   * side panel, the inner pair of a top or bottom one.
   *
   * The corners against the window edge are always square, because a corner cut
   * off something that has no visible end is a corner cut off nothing.
   * @default true
   */
  rounded?: boolean;
  /**
   * Whether pressing Escape or clicking the scrim closes the drawer. Turn it off
   * for the drawer that has to be answered — and then give it actions that
   * answer it, because there will be no other way out. `modal` only.
   * @default true
   */
  dismissible?: boolean;
  /**
   * How far the panel reaches in by default, and the type scale inside it.
   * `md` is MD3's own 360dp navigation drawer.
   * @default 'md'
   */
  size?: MPSize;
  /** The body. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export type MPDrawerCloseProps = React.ComponentProps<typeof Dialog.Close>;

/**
 * How wide a `left` or `right` panel is when nothing says otherwise.
 *
 * `md` is 360px, which is MD3's own navigation drawer width. Its own ladder
 * rather than the dialog's `MAX_WIDTH`, and deliberately narrower at every step:
 * a dialog is measured by how long a line of text is comfortable inside it, and
 * a drawer is measured by how much of the window it is willing to take away from
 * what it is a drawer *for*.
 *
 * A `top` or `bottom` panel has no entry here on purpose — its extent is its
 * content, capped at 85% of the window, because a bottom sheet holding three
 * rows should be three rows tall.
 */
const EXTENT: Record<MPSize, string> = {
  xs: 'w-60',
  sm: 'w-72',
  md: 'w-90',
  lg: 'w-104',
  xl: 'w-120'
};

/**
 * The corners on the free edge, written out per side because Tailwind only ever
 * sees class names that appear literally in the source.
 *
 * A side panel takes `corner-large`, which is MD3's own navigation drawer
 * corner; a top or bottom one takes `corner-extra-large`, which is the bottom
 * sheet's. Two different objects, two different numbers — and both of them
 * tokens, so a page that has moved its shape scale moves these with it.
 */
const ROUNDED: Record<MPSide, string> = {
  left: 'rounded-r-mp-lg',
  right: 'rounded-l-mp-lg',
  top: 'rounded-b-mp-xl',
  bottom: 'rounded-t-mp-xl'
};

/**
 * The hairline on the free edge only. A border all round would draw a line along
 * the window's own edge, where there is nothing on the other side of it to be
 * separated from.
 */
const EDGE: Record<MPSide, string> = {
  left: 'border-r',
  right: 'border-l',
  top: 'border-b',
  bottom: 'border-t'
};

/** Which end of the viewport the panel is pushed to, and along which axis. */
const VIEWPORT: Record<MPSide, string> = {
  left: 'flex-row justify-start',
  right: 'flex-row justify-end',
  top: 'flex-col justify-start',
  bottom: 'flex-col justify-end'
};

const RULE = 'border-mp-outline-variant border-t';

/**
 * Closes the drawer it is inside.
 *
 * Exported for `MPDialogClose`'s reason: an uncontrolled drawer has no `setOpen`
 * for its Cancel button to call, and making every drawer controlled is a piece
 * of state per drawer that exists only to answer a button.
 *
 * It is a `modal` drawer's button — a `standard` one is not a Base UI dialog and
 * has nothing for this to talk to. `render` is Base UI's own escape hatch, so a
 * real Material Plus button dismisses:
 * `<MPDrawerClose render={<MPButton variant="text">Cancel</MPButton>} />`.
 */
export const MPDrawerClose = Dialog.Close;

/**
 * A panel attached to one edge of the window.
 *
 * Two things in one component, because they are the same panel: `modal` is the
 * drawer you open — a scrim, a focus trap, Escape — and `standard` is the drawer
 * that is simply part of the page. MD3 names both of them, and the reason they
 * are not two components is that a sidebar becoming a hamburger at a breakpoint
 * is one line rather than a swap.
 *
 * The sections are props rather than compound sub-components, as on
 * [MPCard](../layout/card) and [MPDialog](../feedback/dialog): the arrangement
 * is fixed — heading, description, body, actions — and the body is the only part
 * that scrolls, so the heading and the actions stay put.
 *
 * In `modal` mode Base UI owns everything hard about it: the focus trap, the
 * scroll lock, the `aria-labelledby` / `aria-describedby` wiring, restoring
 * focus to the trigger, and the inert page behind.
 *
 * ## The surface, and why it does not slide
 *
 * `surface-container-low` at elevation 1 for the modal panel and `surface` flat
 * for the standard one — MD3's own two answers. The transition is opacity only,
 * exactly as on the dialog: a drawer is nothing but text and controls, and a
 * panel that slid would drag its own sentences across the screen for the length
 * of the animation. What says the panel came from an edge is that it is
 * *attached* to one: square against the window, cut on the free side.
 */
export function MPDrawer({
  side = 'left',
  mode = 'modal',
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  actions,
  dividers = false,
  showClose,
  closeLabel,
  locale: localeProp,
  extent,
  rounded = true,
  dismissible = true,
  size = 'md',
  className,
  style,
  children
}: MPDrawerProps) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages('common', locale);
  const modal = mode === 'modal';
  const along = side === 'left' || side === 'right';
  const withClose = showClose ?? modal;
  const closeName = closeLabel ?? messages.close;

  /*
   * The standard panel's own open state.
   *
   * A modal one has none, because Base UI's Dialog is the thing that remembers
   * whether it is open — `defaultOpen` goes to it and `MPDrawerClose` talks to
   * it. A standard panel is not a Dialog: it is in the flow, so "closed" is
   * "not in the layout", and without this its × had nothing to call and was a
   * button that did nothing at all.
   *
   * Seeded from `defaultOpen`, and `true` when there is none: a fixed sidebar
   * that had to be opened before it appeared would not be a fixed sidebar.
   */
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? true);
  const standardOpen = open ?? uncontrolledOpen;

  const closeStandard = () => {
    if (open === undefined) {
      setUncontrolledOpen(false);
    }

    onOpenChange?.(false);
  };

  const padX = SHEET_PAD_X[size];
  const padY = SHEET_PAD_Y[size];
  // With dividers the lines have to reach both edges, so the sheet gives up its
  // vertical padding and every section takes it on instead — the same trade the
  // dialog and the card make.
  const section = dividers ? `${padX} ${padY}` : padX;

  const hasHeader = hasContent(title) || hasContent(description);
  const hasActions = hasContent(actions);

  const sizeStyle =
    extent === undefined
      ? null
      : { [along ? 'width' : 'height']: typeof extent === 'number' ? `${extent}px` : extent };

  const panel = [
    'mp-drawer relative flex flex-col overflow-hidden box-border',
    'border-mp-outline-variant outline-none',
    modal ? 'bg-mp-surface-container-low shadow-mp-1' : 'bg-mp-surface',
    'text-mp-on-surface',
    PROSE_TEXT[size],
    EDGE[side],
    rounded ? ROUNDED[side] : '',
    modal ? FADE : '',
    along
      ? `h-full max-w-full ${extent === undefined ? EXTENT[size] : ''}`
      : `w-full ${extent === undefined ? 'max-h-[85%]' : ''}`,
    dividers ? '' : `${padY} ${SHEET_GAP[size]}`,
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  // Base UI's parts carry the `aria-labelledby` / `aria-describedby` wiring a
  // modal drawer needs. A standard one is not a dialog and needs none, so it
  // gets the plain tags rather than a dialog's parts outside a dialog.
  const TitleTag = modal ? Dialog.Title : 'h2';
  const DescriptionTag = modal ? Dialog.Description : 'p';

  const closeButton = [
    'group text-mp-on-surface-variant relative flex size-10 shrink-0',
    'rounded-mp-full cursor-pointer items-center justify-center',
    'appearance-none border-0 bg-transparent',
    'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-solid outline-none'
  ].join(' ');

  const contents = (
    <>
      {hasHeader || withClose ? (
        <div className={`flex shrink-0 items-start gap-3 ${section}`}>
          <div className="flex min-w-0 flex-1 flex-col">
            {hasContent(title) ? (
              <TitleTag className={`m-0 ${SHEET_TITLE[size]}`}>{title}</TitleTag>
            ) : null}
            {hasContent(description) ? (
              <DescriptionTag className={`text-mp-on-surface-variant m-0 ${META_TEXT}`}>
                {description}
              </DescriptionTag>
            ) : null}
          </div>

          {withClose ? (
            modal ? (
              <Dialog.Close aria-label={closeName} className={closeButton}>
                <MPStateLayer />
                <MPIcon icon={CloseIcon} size={20} />
              </Dialog.Close>
            ) : (
              <button
                type="button"
                aria-label={closeName}
                className={closeButton}
                onClick={closeStandard}
              >
                <MPStateLayer />
                <MPIcon icon={CloseIcon} size={20} />
              </button>
            )
          ) : null}
        </div>
      ) : null}

      {hasContent(children) ? (
        // The only part that scrolls. `min-h-0` is what lets it: a flex item's
        // default `min-height: auto` refuses to shrink below its content, and the
        // panel would grow past the window instead.
        <div
          className={[
            'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            section,
            dividers && (hasHeader || withClose) ? RULE : '',
            // A scroll container clips at its padding box and a focus ring is
            // drawn outside the control that owns it, so a field at the top or
            // bottom of an unruled body would have its ring sliced off. The
            // padding is room for the ring and the negative margin hands the
            // space straight back, so nothing on the sheet moves.
            dividers ? '' : '-my-1 py-1'
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
            dividers ? RULE : ''
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {actions}
        </div>
      ) : null}
    </>
  );

  if (!modal) {
    // A standard drawer is in the flow, so "closed" is "not in the layout". There
    // is nothing to animate on the way out: what moves is the page around it, and
    // moving the page is not this component's to do.
    if (!standardOpen) {
      return null;
    }

    return (
      <div
        data-mp-size={size}
        data-mp-side={side}
        data-mp-mode={mode}
        className={panel}
        style={{ ...sizeStyle, ...style }}
      >
        {contents}
      </div>
    );
  }

  return (
    <Dialog.Root
      open={open}
      defaultOpen={defaultOpen}
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        // `disablePointerDismissal` covers the click on the scrim; Escape has no
        // prop of its own, so it is cancelled here by the reason it arrives with.
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

        <Dialog.Viewport className={`${PORTAL_LAYER} fixed inset-0 flex ${VIEWPORT[side]}`}>
          <Dialog.Popup
            data-mp-size={size}
            data-mp-side={side}
            data-mp-mode={mode}
            className={panel}
            style={{ ...sizeStyle, ...style }}
          >
            {contents}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
