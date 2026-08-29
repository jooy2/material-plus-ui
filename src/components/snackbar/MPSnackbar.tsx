import * as React from 'react';
import { Toast } from '@base-ui/react/toast';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { MPStateLayer } from '../../internal/StateLayer';
import { PORTAL_LAYER } from '../../internal/surface';
import type { MPAlign, MPColor, MPSize } from '../../types';

/**
 * Where the stack sits.
 *
 * Written as two words rather than as a `side` plus an `align`, because they are
 * not independent: a snackbar stack is always pinned to the top or the bottom,
 * never to a side, and offering `left`/`right` as a "side" would invite a column
 * down the middle of the screen that no layout survives. The second half is
 * `MPAlign`, the same word every other component uses.
 */
export type MPSnackbarPosition = `top-${MPAlign}` | `bottom-${MPAlign}`;

/**
 * The per-snackbar overrides, carried in Base UI's own `data` slot.
 *
 * `data` is the field Base UI reserves for exactly this. Shadowing the manager's
 * own option names instead is how a library ends up with two `type` props that
 * mean different things.
 */
export interface MPSnackbarData {
  color?: MPColor;
  icon?: React.ReactNode | false;
}

export interface MPSnackbarOptions extends MPSnackbarData {
  /**
   * Reusing an id updates that snackbar in place and restarts its timer, which
   * is what "uploading… / uploaded" wants: one message that changed its mind,
   * not two stacked on each other.
   */
  id?: string;
  /**
   * What it says.
   *
   * One slot, not a title and a body — MD3's snackbar has a single run of
   * supporting text, up to two lines, and nothing else. A message that needs a
   * heading is not a snackbar; it is a dialog the reader has not been shown yet.
   */
  message?: React.ReactNode;
  /**
   * How long before it dismisses itself, in milliseconds. `0` keeps it up until
   * it is closed — which is the right answer for anything the reader has to act
   * on, because a snackbar that leaves before it is read said nothing.
   */
  timeout?: number;
  /**
   * `high` interrupts a screen reader; `low` waits for a pause. An error is worth
   * interrupting for and a save confirmation is not.
   * @default 'low'
   */
  priority?: 'low' | 'high';
  /** The label of the action. Passing it is what makes the action appear. */
  actionLabel?: React.ReactNode;
  onAction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Called when it closes, however it closed. */
  onClose?: () => void;
  /** Called once it has finished animating out and left the DOM. */
  onRemove?: () => void;
}

export interface MPSnackbarProviderProps {
  /**
   * Which family every snackbar's plate is painted in.
   *
   * **No default**, and it is the same decision `MPTooltip` makes for the same
   * reason. MD3's snackbar is `inverse-surface` under `inverse-on-surface`: the
   * neutral palette read at the *other* end of the scheme, so the plate is dark
   * on a light page and light on a dark one. That is what makes it legible over
   * whatever the reader happened to be looking at, which is the only content a
   * snackbar ever appears over.
   *
   * Setting it swaps in an accent container. Worth doing for an application whose
   * messages are all one kind; wrong as a way of saying "this one is an error",
   * because a snackbar is not where an error belongs.
   */
  color?: MPColor;
  /**
   * Where the stack is pinned.
   *
   * `bottom-start` is MD3's own placement — the snackbar sits above the reading
   * flow's end corner, out of the way of everything except a floating action
   * button, which is the one thing the specification asks it to move.
   * @default 'bottom-start'
   */
  position?: MPSnackbarPosition;
  /**
   * How long a snackbar lasts by default, in milliseconds. `0` keeps every one of
   * them up until it is closed.
   * @default 5000
   */
  timeout?: number;
  /**
   * How many are shown at once. The rest are kept and revealed as the stack
   * drains rather than being thrown away.
   * @default 3
   */
  limit?: number;
  /**
   * How wide a snackbar may get. Numbers are pixels. MD3's own maximum is 600dp
   * and its minimum is 344dp, which is what the two ends of the plate are set to.
   * @default 600
   */
  width?: number | string;
  /**
   * The type scale the plate is drawn at.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Shows the × on every snackbar.
   *
   * On by default. MD3 treats the close affordance as optional, but a snackbar
   * with `timeout: 0` and no action would otherwise have no way out at all —
   * and the stack is what decides that, not the call site.
   * @default true
   */
  showClose?: boolean;
  /**
   * Accessible name of every snackbar's × button. Defaults to the word for
   * "close" in `locale`.
   */
  closeLabel?: string;
  /**
   * Which language the × button's default name is written in. Falls back to the
   * nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  children?: React.ReactNode;
}

/**
 * How a stack is pinned, per position.
 *
 * The viewport is full width in every case and the alignment is done with
 * `items-*` rather than by pinning one edge and nudging the centre back with a
 * translate, so the same three classes serve all six positions. A stack at the
 * bottom is reversed, so the newest message is the one nearest the edge and the
 * older ones move away from the reader rather than towards them.
 */
const VIEWPORT: Record<MPSnackbarPosition, string> = {
  'top-start': 'top-0 items-start',
  'top-center': 'top-0 items-center',
  'top-end': 'top-0 items-end',
  'bottom-start': 'bottom-0 flex-col-reverse items-start',
  'bottom-center': 'bottom-0 flex-col-reverse items-center',
  'bottom-end': 'bottom-0 flex-col-reverse items-end'
};

/**
 * The plate's own motion, in place of the shared `FADE`.
 *
 * A snackbar comes in from the edge its stack is pinned to and goes back out to
 * it, which is what MD3 draws and the same argument `MPDrawer` makes: a message
 * that only faded has no direction, and a stack at the top of the window and one
 * at the bottom are then the same event.
 *
 * `translate` rather than `transform`, which is not a stylistic preference here.
 * Base UI writes a swiped snackbar's offset straight onto the element's inline
 * `transform`, so a travel written the same way would be overwritten by the
 * first flick. The two properties compose.
 *
 * One duration in both directions, unlike the drawer's asymmetric pair. A
 * snackbar is a small plate that often arrives behind two others, and an
 * entrance long enough to read as an arrival is an entrance that makes a queue
 * of three feel like it is buffering.
 *
 * `motion-safe:`, for the reason `MPDrawer`'s `SLIDE` gives: what is left when
 * the travel is not declared is the plain fade this plate used to have.
 */
const PLATE_MOTION = [
  'transition-[opacity,translate] duration-(--mp-sys-motion-duration-short4)',
  'ease-mp-standard',
  'data-starting-style:opacity-0 data-ending-style:opacity-0'
].join(' ');

/** Which way the plate travels, given the edge its stack is pinned to. */
const SLIDE: Record<'top' | 'bottom', string> = {
  top: 'motion-safe:data-starting-style:-translate-y-full motion-safe:data-ending-style:-translate-y-full',
  bottom:
    'motion-safe:data-starting-style:translate-y-full motion-safe:data-ending-style:translate-y-full'
};

/**
 * The supporting text, at MD3's own `body-medium` for `md`.
 *
 * A snackbar does not grow with the control that raised it — it is a message from
 * the application, not part of a form — so the ladder here is narrower than most
 * and exists only so a dense application can run one size down throughout.
 */
const TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-small',
  sm: 'text-mp-body-small',
  md: 'text-mp-body-medium',
  lg: 'text-mp-body-medium',
  xl: 'text-mp-body-large'
};

/** MD3's snackbar is 48dp tall on one line, with 16dp of inline padding. */
const PLATE: Record<MPSize, string> = {
  xs: 'min-h-9 gap-1.5 py-1.5 ps-3 pe-1.5',
  sm: 'min-h-10 gap-2 py-2 ps-3.5 pe-2',
  md: 'min-h-12 gap-2 py-2.5 ps-4 pe-2',
  lg: 'min-h-14 gap-3 py-3 ps-5 pe-2.5',
  xl: 'min-h-16 gap-3 py-3.5 pe-3 ps-6'
};

/** The × in the corner. MD3 draws it at 24dp on the `md` plate. */
const ICON_SIZE: Record<MPSize, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 22,
  xl: 24
};

/**
 * Turns a Material Plus snackbar into the object Base UI's manager stores.
 *
 * `message` becomes the manager's `title`, which is the field Base UI wires to
 * the live region — the whole message is the announcement here, because there is
 * no second line for it to be the heading of.
 */
function toManagerOptions(options: MPSnackbarOptions) {
  const { color, icon, message, actionLabel, onAction, ...rest } = options;

  return {
    ...rest,
    title: message,
    data: { color, icon } satisfies MPSnackbarData,
    actionProps:
      actionLabel === undefined
        ? undefined
        : { children: actionLabel, onClick: onAction as React.MouseEventHandler<HTMLButtonElement> }
  };
}

/**
 * Raises snackbars from anywhere under an `MPSnackbarProvider`.
 *
 * A hook rather than a component, because what a caller has at the moment a
 * message is warranted is a click handler, not a place in the tree — and an
 * `<MPSnackbar open={…}/>` they would have to keep mounted, with a piece of state
 * per message, is the shape this component exists to avoid.
 */
export function useMPSnackbar() {
  const manager = Toast.useToastManager<MPSnackbarData>();

  return React.useMemo(
    () => ({
      /** Raises a snackbar and returns its id. */
      add: (options: MPSnackbarOptions) => manager.add(toManagerOptions(options)),
      /** Closes one snackbar, or every one of them when called with nothing. */
      close: (id?: string) => manager.close(id),
      /** Changes a snackbar already on screen. */
      update: (id: string, options: MPSnackbarOptions) =>
        manager.update(id, toManagerOptions(options)),
      /**
       * One snackbar that follows a promise: the waiting message while it runs,
       * then the success or the failure. Base UI applies `timeout: 0` to the
       * waiting state, so a slow request cannot dismiss its own message.
       */
      promise: <Value,>(
        promise: Promise<Value>,
        options: {
          loading: MPSnackbarOptions;
          success: MPSnackbarOptions | ((value: Value) => MPSnackbarOptions);
          error: MPSnackbarOptions | ((error: unknown) => MPSnackbarOptions);
        }
      ) =>
        manager.promise(promise, {
          loading: toManagerOptions(options.loading),
          success: (value: Value) =>
            toManagerOptions(
              typeof options.success === 'function' ? options.success(value) : options.success
            ),
          error: (error: unknown) =>
            toManagerOptions(
              typeof options.error === 'function' ? options.error(error) : options.error
            )
        }),
      /** Every snackbar currently in the stack, newest first. */
      snackbars: manager.toasts
    }),
    [manager]
  );
}

interface SnackbarItemProps {
  toast: Toast.Root.ToastObject<MPSnackbarData>;
  color?: MPColor;
  size: MPSize;
  showClose: boolean;
  closeLabel: string;
  /** Which way it can be flicked away, derived from where the stack is pinned. */
  swipeDirection: ('up' | 'down' | 'left' | 'right')[];
  /** Which edge the stack is pinned to, and so which way the plate travels. */
  edge: 'top' | 'bottom';
}

function SnackbarItem({
  toast,
  color,
  size,
  showClose,
  closeLabel,
  swipeDirection,
  edge
}: SnackbarItemProps) {
  const family = toast.data?.color ?? color;
  const glyph = toast.data?.icon;

  /*
   * One slot, two answers — the same arrangement `MPTooltip` makes.
   *
   * Left unset the plate is MD3's `inverse-surface` under `inverse-on-surface`,
   * and the action is `inverse-primary`, which is the accent read at the *other*
   * scheme's tone so that it is legible on an inverted plate. Given a family, all
   * three come from that family's container instead.
   */
  const slots = {
    '--_mp-plate': family
      ? `var(--_mp-color-${family}-container)`
      : 'var(--_mp-color-inverse-surface)',
    '--_mp-on-plate': family
      ? `var(--_mp-color-on-${family}-container)`
      : 'var(--_mp-color-inverse-on-surface)',
    '--_mp-plate-action': family
      ? `var(--_mp-color-${family})`
      : 'var(--_mp-color-inverse-primary)',
    ...(family ? accentSlots(family) : null)
  } as React.CSSProperties;

  return (
    <Toast.Root
      toast={toast}
      swipeDirection={swipeDirection}
      data-mp-size={size}
      className={[
        'mp-snackbar rounded-mp-xs shadow-mp-3 pointer-events-auto flex w-full items-center',
        'bg-(--_mp-plate) text-(--_mp-on-plate) outline-none',
        PLATE[size],
        TEXT[size],
        PLATE_MOTION,
        SLIDE[edge],
        // A snackbar pushed out by the limit is kept in the DOM so it can come
        // back; it just has nothing to say while it waits.
        'data-limited:hidden'
      ].join(' ')}
      style={slots}
    >
      {glyph ? <span className="flex shrink-0 items-center">{glyph}</span> : null}

      {/*
        A `<span>`, not the `<h2>` Base UI renders by default.
        
        The element still carries the id the plate is named by — that is what
        `Toast.Title` is for — but a snackbar's message is not a section heading,
        and leaving it as one puts "Draft saved" into the page's outline beside
        the real headings a screen reader navigates by.
        
        The minimum width is MD3's, so a two-word message does not come up as a
        plate the size of the words; the maximum is the viewport's, set on the
        wrapper the stack lays out.
      */}
      <Toast.Title
        render={<span />}
        className="min-w-0 flex-1 py-0.5 ps-1 [min-inline-size:min(280px,100%)]"
      />

      {/*
       * The action, which is a text button in everything but name — and it takes
       * `inverse-primary` rather than `primary` for the reason the token exists:
       * `primary` is derived to contrast with the *page*, so on a plate that
       * inverts the page it is the one colour guaranteed not to read.
       */}
      <Toast.Action
        className={[
          'text-mp-label-large flex shrink-0 cursor-pointer items-center',
          'rounded-mp-full h-8 px-3 text-(--_mp-plate-action)',
          // The one state layer in the library written as a background rather
          // than as an `MPStateLayer`. Base UI drops the action entirely when it
          // has no children of its own — which is exactly what should happen to
          // a snackbar with no action — and a layer element inside it would be a
          // child, so the button would render empty on every snackbar instead.
          'transition-colors duration-(--mp-sys-motion-duration-short4)',
          'hover:bg-(--_mp-plate-action)/8 focus-visible:bg-(--_mp-plate-action)/10',
          'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-solid outline-none'
        ].join(' ')}
      />

      {showClose ? (
        <Toast.Close
          aria-label={closeLabel}
          className={[
            'group rounded-mp-full relative flex size-8 shrink-0 cursor-pointer',
            'items-center justify-center text-(--_mp-on-plate)',
            'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-solid outline-none'
          ].join(' ')}
        >
          <MPStateLayer />
          <MPIcon icon={CloseIcon} size={ICON_SIZE[size]} />
        </Toast.Close>
      ) : null}
    </Toast.Root>
  );
}

/** The stack itself. Rendered by the provider, never by a caller. */
function SnackbarViewport({
  position,
  width,
  ...rest
}: {
  position: MPSnackbarPosition;
  width: number | string;
  color?: MPColor;
  size: MPSize;
  showClose: boolean;
  closeLabel: string;
}) {
  const { toasts } = Toast.useToastManager<MPSnackbarData>();
  // The one fact both of these are derived from: which edge the stack is
  // pinned to. It decides the way a plate is flicked away and the way it
  // arrives, and the two must agree — a snackbar that came down from the top
  // and could only be flicked upwards would be asking to be undone.
  const edge = position.startsWith('top') ? 'top' : 'bottom';
  const swipeDirection: ('up' | 'down' | 'left' | 'right')[] = [
    edge === 'top' ? 'up' : 'down',
    'left',
    'right'
  ];

  return (
    <Toast.Portal>
      <Toast.Viewport
        className={[
          PORTAL_LAYER,
          // Full width and `pointer-events-none`, so the strip across the top or
          // the bottom of the page is not a wall the rest of the application is
          // behind. The snackbars themselves take their events back.
          'pointer-events-none fixed inset-x-0 flex flex-col gap-2 p-4',
          VIEWPORT[position]
        ].join(' ')}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="w-full"
            style={{ maxWidth: typeof width === 'number' ? `${width}px` : width }}
          >
            <SnackbarItem toast={toast} swipeDirection={swipeDirection} edge={edge} {...rest} />
          </div>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

/**
 * Puts the snackbar stack on the page and lets anything under it raise a message.
 *
 * Wrap the application once. Everything about how a snackbar *looks* is decided
 * here — where the stack sits, how wide it is, how long it lasts — so the call
 * site stays the one thing it should be: what happened.
 *
 * Base UI owns the parts that are genuinely hard and invisible when they work:
 * the timers and their pausing on hover and on window blur, the limit, the swipe,
 * the F6 focus hotkey, and the live region that makes a message which appeared
 * out of nowhere reach a screen reader at all.
 *
 * ## Why this is not called Toast
 *
 * Material has a name for this component and it is snackbar. "Toast" is Android's
 * older, non-interactive notification — it has no action, cannot be dismissed and
 * is not part of Material Design 3 — so a `Toast` here would be a different
 * component wearing the name of one the specification still ships.
 */
export function MPSnackbarProvider({
  color,
  position = 'bottom-start',
  timeout = 5000,
  limit = 3,
  width = 600,
  size = 'md',
  showClose = true,
  closeLabel,
  locale: localeProp,
  children
}: MPSnackbarProviderProps) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(COMMON, locale);

  return (
    <Toast.Provider timeout={timeout} limit={limit}>
      {children}
      <SnackbarViewport
        position={position}
        width={width}
        color={color}
        size={size}
        showClose={showClose}
        closeLabel={closeLabel ?? messages.close}
      />
    </Toast.Provider>
  );
}
