import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { accentSlots } from '../../internal/accent';
import { MPButtonGroupContext } from '../../internal/button-group';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_HEIGHT,
  CONTROL_PAD_X,
  CONTROL_SQUARE,
  CONTROL_TEXT,
  hasContent
} from '../../internal/scale';
import type { MPColor, MPSize, MPStyleProps, MPVariant } from '../../types';

/**
 * **Off**, on all five weights.
 *
 * The ink is `on-surface-variant` in every one of them, and that is the whole
 * difference between this and [MPButton](./button). A button at rest is an
 * action waiting to be taken; a toggle at rest is *a state that is currently
 * false*, and accent ink on an unpressed toggle would say it was true.
 *
 * The containers are the neutral surface roles rather than the accent ones —
 * `CONTAINER_SURFACE`'s ladder in everything but name — which is what leaves the
 * accent free to mean one thing here: on.
 */
const OFF: Record<MPVariant, string> = {
  filled: 'bg-mp-surface-container-highest text-mp-on-surface-variant',
  tonal: 'bg-mp-surface-container text-mp-on-surface-variant',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-mp-on-surface-variant',
  outlined: 'border-mp-outline border bg-transparent text-mp-on-surface-variant',
  text: 'bg-transparent text-mp-on-surface-variant'
};

/**
 * **On**, and it is the same two answers the chosen segment of an
 * [MPSegmentedButton](./segmented-button) gives, because it is the same claim.
 *
 * `filled` takes the accent and its own ink; the middle three light the
 * container tone and leave the label in `on-accent-container`; `text` has no
 * container to light, so the accent goes into the ink — which is MD3's standard
 * toggle icon button exactly.
 *
 * What does not change is the **depth**. A toggle that is on is not a toggle
 * that has been raised: `elevated` keeps its level-1 shadow in both states, so
 * the only thing that moves is colour.
 */
const ON: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  outlined:
    'border-(--_mp-accent) border bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  text: 'bg-transparent text-(--_mp-accent)'
};

/** The spec's disabled treatment, unchanged from [MPButton](./button)'s. */
const DISABLED: Record<MPVariant, string> = {
  filled: 'bg-mp-on-surface/12 text-mp-on-surface/38',
  tonal: 'bg-mp-on-surface/12 text-mp-on-surface/38',
  elevated: 'bg-mp-on-surface/12 text-mp-on-surface/38 shadow-none',
  outlined: 'border-mp-on-surface/12 border bg-transparent text-mp-on-surface/38',
  text: 'bg-transparent text-mp-on-surface/38'
};

export interface MPToggleProps
  extends MPStyleProps, Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'value'> {
  /**
   * How much surface the toggle paints while it is **off**. On is always the
   * accent asserting itself, whichever weight was asked for.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * Which accent family it turns on in. Not an arbitrary colour: to change what
   * `primary` *is*, set the token.
   * @default 'primary'
   */
  color?: MPColor;
  /** Whether it is on. Use with `onPressedChange` for a controlled toggle. */
  pressed?: boolean;
  /**
   * Whether it starts on, for an uncontrolled one.
   * @default false
   */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Identifies the toggle inside an [MPToggleGroup](./toggle#mptogglegroup). */
  value?: string;
  /** A glyph before the label. */
  startIcon?: React.ReactNode;
  /** A glyph after it. */
  endIcon?: React.ReactNode;
  /**
   * The label. Left out, the toggle goes square around whatever glyph it was
   * given — which is what a toolbar toggle is, and what MD3 calls a *toggle icon
   * button*. An icon-only toggle still needs an `aria-label`.
   */
  children?: React.ReactNode;
}

/**
 * A button that stays down.
 *
 * The difference from an [MPSwitch](./switch) is what the press *is*: a switch
 * changes a setting, and the change is the point. A toggle changes the state of
 * the thing beside it — bold on the selected words, the grid on the canvas, the
 * filter on the list — and the thing beside it is what the reader is looking at.
 *
 * The difference from an [MPCheckbox](./checkbox) is that this is a control
 * rather than an answer, so it never goes in a form. A checkbox's value is
 * submitted; a toggle's state is acted on immediately.
 *
 * Base UI's `Toggle` is underneath, which owns `aria-pressed` and the
 * controlled/uncontrolled pair. What is left here is the surface, and the rule
 * that **off is neutral**.
 *
 * ## Why off is neutral and on is the accent
 *
 * Because a toggle has to be readable at a glance in a row of eight of them, and
 * the axis a reader can actually judge in isolation is hue, not saturation. A
 * set where off is a paler accent and on is a stronger one is a set nobody can
 * read without comparing two of them side by side.
 *
 * It is also what leaves `color` meaning something. On a button the family says
 * *what kind of action this is*; here it says what "on" looks like, and an
 * unpressed toggle that already wore it would have spent the signal.
 *
 * ## Icon only
 *
 * With no children the toggle goes square around its glyph, exactly as
 * [MPButton](./button) does — which for a `corner-full` control is a circle, and
 * is MD3's own toggle icon button. There is no separate component for it, for
 * [MPIconButton](./icon-button)'s reason inverted: the *name* is what an icon
 * button adds, and a toggle already has to be given one.
 */
export const MPToggle = React.forwardRef<HTMLButtonElement, MPToggleProps>(function MPToggle(
  {
    variant: variantProp,
    size: sizeProp,
    color: colorProp,
    disabled: disabledProp,
    pressed,
    defaultPressed,
    onPressedChange,
    value,
    startIcon,
    endIcon,
    fullWidth = false,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  // An `MPToggleGroup` and an `MPButtonGroup` provide the same context, so a
  // toggle picks up the set it is in either way. Its own prop still wins.
  const group = React.useContext(MPButtonGroupContext);
  const variant = variantProp ?? group?.variant ?? 'outlined';
  const size: MPSize = sizeProp ?? group?.size ?? 'md';
  const color: MPColor = colorProp ?? group?.color ?? 'primary';
  const disabled = disabledProp ?? group?.disabled ?? false;

  const iconOnly = !hasContent(children);

  return (
    <Toggle
      ref={ref}
      value={value}
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={(next) => onPressedChange?.(next)}
      disabled={disabled}
      data-mp-size={size}
      data-mp-variant={variant}
      className={(state) =>
        [
          'mp-toggle group relative inline-flex shrink-0 items-center justify-center',
          'rounded-mp-full box-border overflow-hidden align-middle whitespace-nowrap select-none',
          'cursor-pointer appearance-none font-[inherit]',
          'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-solid outline-none',
          'transition-[background-color,border-color,box-shadow,color]',
          'duration-(--mp-sys-motion-duration-short4)',
          CONTROL_HEIGHT[size],
          CONTROL_TEXT[size],
          CONTROL_GAP[size],
          iconOnly ? `${CONTROL_SQUARE[size]} px-0` : CONTROL_PAD_X[size],
          // An if/else rather than stacked `data-*` variants: two Tailwind
          // classes of equal specificity resolve by their order in the generated
          // stylesheet, and "pressed" and "disabled" would collide there.
          disabled ? DISABLED[variant] : state.pressed ? ON[variant] : OFF[variant],
          disabled ? 'cursor-default' : '',
          fullWidth ? 'w-full' : '',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')
      }
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {disabled ? null : <MPStateLayer />}
      {startIcon}
      {children}
      {endIcon}
    </Toggle>
  );
});
