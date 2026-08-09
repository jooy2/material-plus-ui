import * as React from 'react';
import { Tooltip as BaseUITooltip } from '@base-ui/react/tooltip';
import { accentSlots } from '../../internal/accent';
import type { MPAlign, MPColor, MPSide, MPSize } from '../../types';

export interface MPTooltipProps {
  /**
   * What the tooltip says.
   *
   * A short phrase. A tooltip is not a container — it cannot be reached by a
   * pointer on a touch screen, it disappears the moment attention moves, and
   * anything inside it that could be clicked cannot be. Content that needs
   * either of those wants a popover, not this.
   */
  content: React.ReactNode;
  /**
   * The element the tooltip hangs off. Exactly one element, which must accept a
   * ref and spread props — every Material Plus component does.
   */
  children: React.ReactElement;
  /**
   * Which edge of the trigger it appears on. May flip to the opposite side when
   * there is no room, which is Base UI's doing and is the right behaviour.
   * @default 'top'
   */
  side?: MPSide;
  /**
   * Where it sits along that edge.
   * @default 'center'
   */
  align?: MPAlign;
  /**
   * Distance from the trigger, in pixels.
   * @default 6
   */
  sideOffset?: number;
  /**
   * How long the pointer has to rest before it opens, in milliseconds.
   */
  delay?: number;
  /** How long it waits before closing once the pointer leaves. */
  closeDelay?: number;
  /**
   * Draws the little wedge pointing at the trigger.
   * @default true
   */
  arrow?: boolean;
  /** Whether the tooltip is open. Use with `onOpenChange` for a controlled one. */
  open?: boolean;
  /** Whether it starts open, for an uncontrolled one. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Stops the tooltip from opening at all, without disabling the trigger. For
   * the tooltip that only exists while a label is truncated.
   * @default false
   */
  disabled?: boolean;
  /**
   * @default 'sm'
   */
  size?: MPSize;
  /**
   * Which accent family the plate is painted in.
   *
   * **No default**, and this is the third component in the library with none —
   * for the strongest reason of the three. MD3's plain tooltip is
   * `inverse-surface` under `inverse-on-surface`: the neutral palette read at
   * the *other* end of the scheme, so the plate is dark on a light page and
   * light on a dark one. That is what makes a tooltip legible over content it
   * was never designed against, which is the only content a tooltip ever
   * appears over.
   *
   * Setting it swaps in an accent fill. Worth doing for a tooltip that is itself
   * a warning; wrong for the other ninety-nine, because a red tooltip on a
   * delete button is saying something the tooltip does not know.
   */
  color?: MPColor;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Shares one delay across a group of tooltips: once any of them has opened, its
 * neighbours open instantly, and the wait comes back after a pause.
 *
 * Worth wrapping a toolbar in. Without it, moving along a row of icon buttons
 * means waiting out the full delay at every stop, which is what makes tooltips
 * feel like they are fighting the pointer.
 */
export const MPTooltipProvider = BaseUITooltip.Provider;

export type MPTooltipProviderProps = React.ComponentProps<typeof BaseUITooltip.Provider>;

/**
 * A row's vertical padding, against the horizontal track below it. MD3's plain
 * tooltip is 24dp tall with a `body-small` label, which is `py-1` on a 16px line
 * box — the `md` rung here.
 */
const PAD_Y: Record<MPSize, string> = {
  xs: 'py-0.5',
  sm: 'py-1',
  md: 'py-1',
  lg: 'py-1.5',
  xl: 'py-2'
};

const PAD_X: Record<MPSize, string> = {
  xs: 'px-1.5',
  sm: 'px-2',
  md: 'px-2',
  lg: 'px-3',
  xl: 'px-4'
};

/**
 * `body-small` is MD3's own plain-tooltip label role — 12px, and the same role a
 * field's supporting text takes. A tooltip that grew with the control it
 * describes would be a tooltip that shouted on a large button.
 */
const TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-small',
  sm: 'text-mp-body-small',
  md: 'text-mp-body-small',
  lg: 'text-mp-body-medium',
  xl: 'text-mp-body-medium'
};

/** The wedge, at roughly a third of the plate's corner radius per step. */
const ARROW_SIZE: Record<MPSize, number> = {
  xs: 6,
  sm: 7,
  md: 8,
  lg: 9,
  xl: 10
};

/**
 * A short label that appears when the pointer rests on something.
 *
 * The whole component is a wrapper:
 * `<MPTooltip content="Copy"><MPButton …/></MPTooltip>`. Base UI's trigger merges
 * itself onto the child rather than rendering a box of its own, so the tooltip
 * adds no element to the layout and the child stays whatever it was — a button,
 * a chip, a truncated cell.
 *
 * Base UI owns the parts that are genuinely hard: the delay and the group
 * timeout, opening on focus but not on a focus that came from a click, closing
 * on Escape, and keeping the popup off the edges of the window.
 *
 * The one thing it deliberately leaves open is the part that makes a tooltip
 * mean anything to a screen reader — `role="tooltip"` on the plate and an
 * `aria-describedby` pointing at it from the trigger — because a popup can be
 * many things and only the caller knows which. Here it is always a tooltip, so
 * this component wires both, and drops the reference while it is closed rather
 * than pointing at an element that is not in the document.
 *
 * ## No shadow
 *
 * MD3 puts a plain tooltip at elevation 0, and this follows it. What separates
 * the plate from the page is that it is the *inverse* surface — a dark card on a
 * light page — and a shadow under something already that far from its background
 * reads as a second, softer edge rather than as height.
 */
export function MPTooltip({
  content,
  children,
  size = 'sm',
  color,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  delay,
  closeDelay,
  arrow = true,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  className,
  style
}: MPTooltipProps) {
  const arrowSize = ARROW_SIZE[size];
  const popupId = React.useId();

  // Mirrored rather than owned: `open` still drives a controlled tooltip and
  // Base UI still drives an uncontrolled one. This copy exists only so the
  // trigger knows whether the plate it describes is on the page yet.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;

  // One slot, two answers — see `color`. The arrow reads the same property, so
  // the wedge cannot end up a different colour from the plate it points off.
  const slots = {
    '--_mp-tooltip': color ? `var(--_mp-color-${color})` : 'var(--_mp-color-inverse-surface)',
    '--_mp-on-tooltip': color
      ? `var(--_mp-color-on-${color})`
      : 'var(--_mp-color-inverse-on-surface)',
    ...(color ? accentSlots(color) : null)
  } as React.CSSProperties;

  return (
    <BaseUITooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      <BaseUITooltip.Trigger
        render={children}
        delay={delay}
        closeDelay={closeDelay}
        disabled={disabled}
        aria-describedby={isOpen ? popupId : undefined}
      />

      <BaseUITooltip.Portal>
        {/* `mp-portal` is a hook, not a style: a portalled popup leaves the
            subtree a host may have scoped its CSS to. */}
        <BaseUITooltip.Positioner
          className="mp-portal z-50 outline-none"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseUITooltip.Popup
            id={popupId}
            role="tooltip"
            data-mp-size={size}
            className={[
              'mp-tooltip rounded-mp-xs max-w-64 outline-none',
              'bg-(--_mp-tooltip) text-(--_mp-on-tooltip)',
              // Opacity only, and fast: a tooltip that slides in has moved its
              // own text while the reader was already looking at it.
              'transition-opacity duration-(--mp-sys-motion-duration-short4)',
              'data-starting-style:opacity-0 data-ending-style:opacity-0',
              // Base UI sets this while the pointer is moving between grouped
              // tooltips. Fading in a tooltip that is meant to appear instantly
              // is worse than not fading at all — it reads as lag.
              'data-instant:duration-0',
              PAD_X[size],
              PAD_Y[size],
              TEXT[size],
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ ...slots, ...style }}
          >
            {arrow ? (
              <BaseUITooltip.Arrow
                // Base UI positions the arrow and reports which side it ended up
                // on. The wedge is drawn pointing down and turned to match — a
                // rotation of a glyph, which is allowed because nothing with
                // text in it moves.
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
                  <path d="M0 0h10L5 5z" fill="var(--_mp-tooltip)" />
                </svg>
              </BaseUITooltip.Arrow>
            ) : null}
            {content}
          </BaseUITooltip.Popup>
        </BaseUITooltip.Positioner>
      </BaseUITooltip.Portal>
    </BaseUITooltip.Root>
  );
}
