import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import type { MPColor, MPOrientation, MPSize } from '../../types';

/**
 * A pane's share of the split, as a percentage of the container or as a CSS
 * length.
 *
 * A bare number is a percentage — that is what a split is usually described in,
 * and a percentage keeps its meaning when the window changes size. A string is
 * an absolute length (`'240px'`, `'15rem'`, `'20%'`), which is what a sidebar
 * with a minimum actually needs: "at least 200 pixels" does not survive being
 * written down as a percentage of a width nobody knows yet.
 */
export type MPPaneSize = number | string;

/** What a pane is told by the split around it. */
interface PaneContextValue {
  /** The `flex-basis` this pane has been given, or `null` before measurement. */
  basis: string | null;
  /**
   * The id the handle beside it points `aria-controls` at, or `null` for a pane
   * rendered outside a split.
   *
   * It comes from the split rather than from the pane because the split is what
   * numbers them — and because a caller's own `id` has to be able to win, which
   * it does: the pane spreads its rest props after this.
   */
  id: string | null;
}

const MPPaneContext = React.createContext<PaneContextValue>({ basis: null, id: null });

/**
 * The width of a handle, and the width of the target the pointer has to hit.
 *
 * A visible line one pixel wide is a target one pixel wide, which is not a
 * target — MD3 asks for 48dp and a splitter cannot have that without becoming a
 * gutter, so this is the compromise every implementation makes: the handle is a
 * track several pixels across with the hairline drawn down the middle of it, the
 * same split a scrollbar makes between what is drawn and what can be grabbed.
 */
const TRACK: Record<MPSize, string> = {
  xs: 'basis-1',
  sm: 'basis-1.5',
  md: 'basis-2',
  lg: 'basis-2.5',
  xl: 'basis-3'
};

/** The same numbers, as the total the panes have to give up to the handles. */
const TRACK_PX: Record<MPSize, number> = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12
};

/** How far one arrow key press moves a handle. */
const KEYBOARD_STEP = 16;

/**
 * A CSS length, in pixels.
 *
 * Only the four units a split is ever written in are accepted; anything else
 * resolves to `undefined`, which every caller here reads as "no constraint"
 * rather than as zero. A bad string should leave a pane unbounded, not pin it
 * shut.
 */
function toPixels(value: MPPaneSize | undefined, extent: number, root: Element | null) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number') {
    return (extent * value) / 100;
  }

  const match = /^\s*(-?[\d.]+)\s*(px|rem|em|%)\s*$/.exec(value);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);

  if (Number.isNaN(amount)) {
    return undefined;
  }

  switch (match[2]) {
    case 'px':
      return amount;
    case '%':
      return (extent * amount) / 100;
    case 'rem':
      return (
        amount * Number.parseFloat(getComputedStyle(document.documentElement).fontSize || '16')
      );
    case 'em':
      return amount * Number.parseFloat((root && getComputedStyle(root).fontSize) || '16');
    default:
      return undefined;
  }
}

/** Every pane's share of the space, summing to 1. */
function initialFractions(
  constraints: MPPaneProps[],
  extent: number,
  root: Element | null
): number[] {
  const sizes = constraints.map((pane) => toPixels(pane.defaultSize, extent, root));
  const named = sizes.reduce<number>((total, size) => total + (size ?? 0), 0);
  const unnamed = sizes.filter((size) => size === undefined).length;
  // Whatever is left after the named panes, split evenly. Negative when the
  // caller asked for more than there is, which the clamp below turns into zero.
  const share = unnamed > 0 ? Math.max(0, extent - named) / unnamed : 0;

  const resolved = sizes.map((size) => Math.max(0, size ?? share));
  const total = resolved.reduce((sum, size) => sum + size, 0);

  if (total <= 0) {
    return resolved.map(() => 1 / Math.max(1, resolved.length));
  }

  return resolved.map((size) => size / total);
}

export interface MPPanesProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * Which way the panes run. `horizontal` puts them side by side with upright
   * handles between them; `vertical` stacks them.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * Whether the handles between the panes can be dragged. Turn it off for a
   * split that is a layout rather than a control.
   * @default true
   */
  resizable?: boolean;
  /**
   * Which accent family the handles light up in.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * How thick a handle is, and how far it reaches.
   * @default 'md'
   */
  size?: MPSize;
  /** Fires with every pane's share, in percent, while a handle is dragged. */
  onResize?: (sizes: number[]) => void;
  /** Fires once, with the same shape, when the handle is let go. */
  onResizeEnd?: (sizes: number[]) => void;
  /** The panes. Anything that is not an `MPPane` is laid out but has no size. */
  children?: React.ReactNode;
}

export interface MPPaneProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * The share this pane starts with. Panes with no `defaultSize` split whatever
   * is left over equally.
   */
  defaultSize?: MPPaneSize;
  /**
   * How small it may be dragged.
   * @default 0
   */
  minSize?: MPPaneSize;
  /** How large it may be dragged. Unbounded when left out. */
  maxSize?: MPPaneSize;
  /** What is inside the pane. */
  children?: React.ReactNode;
}

/**
 * A set of panes with draggable handles between them.
 *
 * The panes are sized in **fractions**, written out as
 * `flex-basis: calc((100% - gutters) * fraction)`. That is the one decision the
 * rest of this file follows from: a split described in percentages survives the
 * window being resized without a single line of JavaScript running, so the
 * component measures itself only twice — once on mount, to turn a `'240px'`
 * default into a fraction, and once at the start of each drag, to know what a
 * pixel of pointer movement is worth.
 *
 * The handles are interleaved here rather than written by the caller, so the
 * children of an `MPPanes` are just panes. That does mean the direct children
 * have to *be* panes: the constraints are read off their props, and an `MPPane`
 * wrapped in something else is a pane with no minimum.
 *
 * ## Why there is no Base UI primitive under this
 *
 * There is nothing to delegate. A splitter's behaviour is a pointer capture and
 * a clamp, and its accessibility is one ARIA role — `separator` with a value,
 * which is the window-splitter pattern — carried by an element the component has
 * to own anyway because it draws it. What Base UI is here for is the things that
 * are genuinely hard and invisible when they work: a focus trap, a positioner, a
 * typeahead. A rail between two boxes is not one of them.
 *
 * ## What it does not draw
 *
 * No surface, on either half. A split is layout, and the moment a pane drew a
 * sheet it would stop being usable as the thing a table, a card or an editor is
 * put *inside*. The family reaches exactly three places — the hairline, the wash
 * under a hovered handle, and the focus ring — because those are the only marks
 * this component makes.
 */
export const MPPanes = React.forwardRef<HTMLDivElement, MPPanesProps>(function MPPanes(
  {
    orientation = 'horizontal',
    resizable = true,
    color = 'primary',
    size = 'md',
    onResize,
    onResizeEnd,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const items = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<MPPaneProps>[];
  const count = items.length;

  // One stem for every pane's id, so a handle can name the pane its value is
  // about without the panes having to be told what they are called.
  const paneIds = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  /*
   * The constraints, read inside pointer handlers that outlive the render they
   * were created in — so they go through a ref rather than through the closure.
   *
   * Written in a layout effect rather than during the render itself. A render
   * may be thrown away: React can start one, abandon it and start again, and a
   * ref assigned in the body would keep whatever the discarded attempt wrote.
   * A layout effect only runs for the render that was actually committed, and it
   * runs before the browser can deliver an event against that commit — which is
   * the whole window these have to be correct in.
   */
  const constraintsRef = React.useRef<MPPaneProps[]>([]);
  const constraints = items.map((item) => item.props);

  const [stored, setFractions] = React.useState<number[] | null>(null);
  // A pane added or removed leaves the stored split a render behind the children
  // — the effect below re-splits, but the render in between would be reading a
  // share off the end of the list. Until the two agree, nobody has a size and
  // every pane falls back to an even share.
  const fractions = stored && stored.length === count ? stored : null;
  const fractionsRef = React.useRef<number[] | null>(null);

  React.useLayoutEffect(() => {
    constraintsRef.current = constraints;
    fractionsRef.current = fractions;
  });

  /**
   * What `document.body` had before a drag took its text selection away, or
   * `null` when no drag is in flight.
   *
   * The page's selection is not this component's property, so a split that
   * disappears mid-drag — a route change, a closed panel — has to give it back.
   * Without this it stays `none` and the whole page is unselectable, with
   * nothing left on screen to suggest why.
   */
  const heldSelection = React.useRef<string | null>(null);

  React.useEffect(
    () => () => {
      if (heldSelection.current !== null) {
        document.body.style.userSelect = heldSelection.current;
        heldSelection.current = null;
      }
    },
    []
  );

  const horizontal = orientation === 'horizontal';
  const gutter = TRACK_PX[size] * Math.max(0, count - 1);

  /*
   * One measurement, for one purpose: turning a `defaultSize` written as a
   * length into a fraction. It is an observer rather than a single read because
   * a split inside a closed disclosure or an unselected tab is zero wide when it
   * mounts, and dividing by that would put every pane at nothing.
   */
  React.useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const extent = (horizontal ? rect.width : rect.height) - gutter;

      if (extent <= 0) {
        return;
      }

      setFractions((previous) =>
        previous && previous.length === count
          ? previous
          : initialFractions(constraintsRef.current, extent, root)
      );
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(root);

    return () => observer.disconnect();
  }, [count, horizontal, gutter]);

  /**
   * Everything a drag needs to know, measured at the moment it starts.
   *
   * A drag only ever moves the boundary between two panes, so their total is
   * fixed and one pane's floor is the other's ceiling. Folding all four bounds
   * into a single range on the first of the pair is what keeps every move to one
   * clamp and one division.
   */
  function grip(index: number) {
    const root = rootRef.current;
    const current = fractionsRef.current;

    if (!resizable || !root || !current || current[index + 1] === undefined) {
      return null;
    }

    const rect = root.getBoundingClientRect();
    const extent = (horizontal ? rect.width : rect.height) - gutter;

    if (extent <= 0) {
      return null;
    }

    const before = constraintsRef.current[index];
    const after = constraintsRef.current[index + 1];
    const start = current[index] * extent;
    const pair = start + current[index + 1] * extent;

    const lower = Math.max(
      toPixels(before?.minSize, extent, root) ?? 0,
      pair - (toPixels(after?.maxSize, extent, root) ?? pair)
    );
    const upper = Math.min(
      toPixels(before?.maxSize, extent, root) ?? pair,
      pair - (toPixels(after?.minSize, extent, root) ?? 0)
    );

    if (upper < lower) {
      return null;
    }

    return {
      root,
      current,
      // The two ends of the boundary's travel, so `Home` and `End` can go
      // straight to them rather than nudging sixteen pixels at a time toward a
      // limit whose distance nobody knows.
      lower,
      upper,
      start,
      resize(delta: number) {
        const sized = Math.min(upper, Math.max(lower, start + delta));
        const next = [...current];

        next[index] = sized / extent;
        next[index + 1] = (pair - sized) / extent;

        setFractions(next);
        onResize?.(next.map((fraction) => fraction * 100));

        return next;
      }
    };
  }

  function beginDrag(index: number, event: React.PointerEvent<HTMLDivElement>) {
    const held = grip(index);

    if (!held) {
      return;
    }

    const handle = event.currentTarget;

    /*
     * Capture is what keeps the drag alive once the pointer leaves the handle —
     * the listeners below are on the handle rather than on the window, so
     * without it a boundary stops following a pointer that has moved off it.
     *
     * It is still allowed to fail. `setPointerCapture` throws `NotFoundError`
     * for a `pointerId` that is not an active pointer, which is reachable
     * whenever the press is over before React's handler runs — a flicked tap, a
     * synthesised event — and an exception here would abandon the rest of this
     * function: no `data-dragging`, no listeners, and the page's own selection
     * taken away with nothing left to hand it back. A drag that only works while
     * the pointer is over the handle is worse than one that works everywhere and
     * far better than a page that cannot be selected.
     */
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Nothing to do about it, and nothing that follows depends on it.
    }

    handle.dataset.dragging = 'true';

    /*
     * A drag across a page selects the text it passes over, and the obvious cure
     * — `preventDefault` on the press — also stops the browser focusing the
     * handle, which leaves the component focusing it by hand and every mouse
     * press wearing a keyboard focus ring. Taking the selection off the document
     * for the length of the drag fixes the selection without touching the focus.
     *
     * Held in a ref as well as in this closure, because the thing being changed
     * is not ours: a split unmounted mid-drag never reaches `end`, and would
     * leave the whole page unselectable with nothing left on screen to explain
     * why. The unmount effect below hands it back.
     */
    const selection = document.body.style.userSelect;

    heldSelection.current = selection;
    document.body.style.userSelect = 'none';

    const origin = horizontal ? event.clientX : event.clientY;
    // Positive is always "toward the end", so a drag under RTL moves the
    // boundary the way the pointer went rather than the way the axis is
    // numbered.
    const towardsEnd = horizontal && getComputedStyle(held.root).direction === 'rtl' ? -1 : 1;

    let latest = held.current;

    const move = (moveEvent: PointerEvent) => {
      const position = horizontal ? moveEvent.clientX : moveEvent.clientY;

      latest = held.resize((position - origin) * towardsEnd);
    };

    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      delete handle.dataset.dragging;
      document.body.style.userSelect = selection;
      heldSelection.current = null;
      onResizeEnd?.(latest.map((fraction) => fraction * 100));
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function nudge(index: number, pixels: number) {
    const held = grip(index);

    if (!held) {
      return;
    }

    const next = held.resize(pixels);

    // A key press is a whole gesture on its own — there is no "let go" to wait
    // for, so the settled callback fires with it.
    onResizeEnd?.(next.map((fraction) => fraction * 100));
  }

  /**
   * `Home` and `End`, which the window-splitter pattern asks for and which are
   * the only way to reach a bound without knowing how far away it is.
   *
   * They travel to the ends of *this boundary's* range rather than to the ends
   * of the split: what a handle can do is bounded by both neighbours' `minSize`
   * and `maxSize`, and those are already folded into one range by `grip`.
   */
  function nudgeToEnd(index: number, edge: 'lower' | 'upper') {
    const held = grip(index);

    if (!held) {
      return;
    }

    const next = held.resize(held[edge] - held.start);

    onResizeEnd?.(next.map((fraction) => fraction * 100));
  }

  const handleClassNames = [
    'mp-panes__handle group/handle relative z-1 flex shrink-0 grow-0 items-center justify-center',
    TRACK[size],
    'transition-colors duration-(--mp-sys-motion-duration-short4)',
    // Offset zero rather than the library's usual 2px: a handle is a few pixels
    // wide, and a ring drawn outside it is a ring drawn on both panes.
    'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-0',
    'focus-visible:outline-solid outline-none',
    resizable
      ? [
          horizontal ? 'cursor-col-resize' : 'cursor-row-resize',
          // Material's state layer opacities, written as a background rather
          // than as an `MPStateLayer`: the layer element is `absolute inset-0`
          // and would have to be the handle's only child, which is where the
          // hairline already is.
          'hover:bg-(--_mp-accent)/8 data-[dragging]:bg-(--_mp-accent)/10'
        ].join(' ')
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setRootRef}
      data-mp-size={size}
      className={[
        'mp-panes flex h-full w-full',
        horizontal ? 'flex-row' : 'flex-col',
        // A flex item refuses to go below its content's intrinsic size unless it
        // is told to, which is what turns a pane holding a long line into a pane
        // that cannot be dragged narrower.
        'min-h-0 min-w-0',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.key ?? index}>
          {index > 0 ? (
            <div
              role="separator"
              aria-orientation={horizontal ? 'vertical' : 'horizontal'}
              aria-valuenow={fractions ? Math.round(fractions[index - 1] * 100) : undefined}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-disabled={!resizable || undefined}
              // The pane the value is *about*. `aria-valuenow` is that pane's
              // share, so without this a screen reader reads a percentage with
              // nothing to attach it to.
              aria-controls={`${paneIds}-${index - 1}`}
              tabIndex={resizable ? 0 : -1}
              className={handleClassNames}
              // No `preventDefault` and no explicit focus: the browser focuses
              // the handle on a press by itself, and it knows that a press is
              // not a keystroke — which is what keeps the focus ring off a
              // handle somebody merely dragged. `beginDrag` takes the page's
              // text selection away for the length of the drag instead.
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }

                beginDrag(index - 1, event);
              }}
              onKeyDown={(event) => {
                const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
                const forward = horizontal ? 'ArrowRight' : 'ArrowDown';

                if (event.key === back || event.key === forward) {
                  event.preventDefault();
                  nudge(index - 1, event.key === forward ? KEYBOARD_STEP : -KEYBOARD_STEP);

                  return;
                }

                // `Home` and `End` go to the ends of this boundary's travel.
                // Without them the only way to reach a bound is to hold an arrow
                // key down and watch, which for a pane whose minimum is four
                // hundred pixels away is twenty-five presses.
                if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  nudgeToEnd(index - 1, event.key === 'Home' ? 'lower' : 'upper');
                }
              }}
            >
              {/*
                The hairline, drawn down the middle of the track. It changes
                colour and nothing else — the track it sits in has a fixed width,
                so nothing either side of it moves when the pointer arrives.
              */}
              <span
                aria-hidden="true"
                className={[
                  'bg-mp-outline-variant pointer-events-none',
                  'transition-colors duration-(--mp-sys-motion-duration-short4)',
                  horizontal ? 'h-full w-px' : 'h-px w-full',
                  resizable
                    ? [
                        'group-hover/handle:bg-(--_mp-accent)',
                        'group-focus-visible/handle:bg-(--_mp-accent)',
                        'group-data-[dragging]/handle:bg-(--_mp-accent)'
                      ].join(' ')
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            </div>
          ) : null}

          <MPPaneContext.Provider
            value={{
              basis: fractions
                ? `calc((100% - ${gutter}px) * ${fractions[index].toFixed(6)})`
                : null,
              id: `${paneIds}-${index}`
            }}
          >
            {item}
          </MPPaneContext.Provider>
        </React.Fragment>
      ))}
    </div>
  );
});

/**
 * One region of a split.
 *
 * `defaultSize`, `minSize` and `maxSize` are read by the `MPPanes` around it
 * rather than used here — a pane cannot know what "half" is, only the split can.
 */
export const MPPane = React.forwardRef<HTMLDivElement, MPPaneProps>(function MPPane(
  // The three sizing props are named here only so they are taken *out* of the
  // rest, which is spread onto a `<div>`: `defaultSize` on a div is an attribute
  // React does not know and would hand straight to the DOM.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { defaultSize, minSize, maxSize, className, style, children, ...props },
  ref
) {
  const { basis, id } = React.useContext(MPPaneContext);

  return (
    <div
      ref={ref}
      id={id ?? undefined}
      className={['mp-pane relative min-h-0 min-w-0 overflow-auto', className ?? '']
        .filter(Boolean)
        .join(' ')}
      // `1 1 0%` before the split has measured itself, so a pane renders at an
      // even share on the first paint instead of at nothing and then jumping.
      style={{ flex: basis ? `0 0 ${basis}` : '1 1 0%', ...style }}
      {...props}
    >
      {children}
    </div>
  );
});
