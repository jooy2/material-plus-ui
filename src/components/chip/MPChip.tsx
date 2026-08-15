import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CloseIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { hasContent } from '../../internal/scale';
import { MPStateLayer } from '../../internal/StateLayer';
import type { MPColor, MPSize, MPVariant } from '../../types';

export interface MPChipProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  /**
   * How much surface the chip paints.
   *
   * `outlined` is the default because it is MD3's: an assist, filter and input
   * chip are all outlined at rest, and the outlined chip is the one that stays
   * legible in a row of twenty.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * @default 'md'
   */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
  /** Content placed before the label — an icon, a status dot, an avatar. */
  startIcon?: React.ReactNode;
  /** Content placed after the label, before any `count`. */
  endIcon?: React.ReactNode;
  /**
   * A number set into the end of the chip. Rendered on its own small plate, so
   * "Errors 12" reads as one token with a count rather than as two words.
   */
  count?: React.ReactNode;
  /**
   * Called when the chip's delete affordance is pressed. Passing it is what
   * makes the affordance appear.
   */
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Accessible name of the delete button. Defaults to the word for "remove" in
   * `locale`.
   */
  deleteLabel?: string;
  /**
   * Which language the delete button's default name is written in. Falls back
   * to the nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * Marks the chip as chosen — a filter that is on.
   *
   * MD3's selected filter chip fills with the container tone of its own family
   * rather than changing family, which is what this does: a filter that is on is
   * still the same filter.
   *
   * Deliberately **without a default**, which is the one thing about it worth
   * knowing. Passing it — either way round — is what says this chip is a toggle,
   * and only then is it announced as one. A chip that merely has an `onClick`
   * is an action, and an action announced as "not pressed" is a screen reader
   * describing a state the chip does not have.
   */
  selected?: boolean;
  /** Unavailable. Drops the accent family, as everywhere else in the library. */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * A chip's height, and the one ladder in the library that is **not** a step off
 * `CONTROL_HEIGHT`.
 *
 * MD3 draws a chip at 32dp, full stop, and 32 is `CONTROL_HEIGHT`'s `xs` — so
 * reusing the control ladder would put the spec's chip three rungs below the
 * spec's button and leave `md` at 56px, which is a button with rounded corners.
 * A chip is a token *inside* a row of content, not a control the row lines up
 * against.
 *
 * So `md` is 32, the specification's number, and the ladder is centred on it the
 * same way every other one is centred on its own spec value.
 */
const HEIGHT: Record<MPSize, string> = {
  xs: 'h-6',
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12'
};

/**
 * `label-large` at `md` — MD3's own chip label role — and one step down at the
 * two rungs where 14px would fill the whole 24px box.
 */
const TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-medium',
  md: 'text-mp-label-large',
  lg: 'text-mp-label-large',
  xl: 'text-mp-title-medium'
};

/**
 * MD3's chip padding is 16dp at the ends, and the ladder walks out from there.
 * It grows more slowly than a button's, because a chip's label is the whole chip
 * and a wide gutter around a one-word tag reads as a button that lost its verb.
 */
const PAD_X: Record<MPSize, string> = {
  xs: 'px-2',
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-5',
  xl: 'px-6'
};

const GAP: Record<MPSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
  xl: 'gap-2.5'
};

/**
 * The corner, and the one place a chip visibly refuses to be a button.
 *
 * MD3 shapes a chip at `corner-small` — 8dp — while every button in the system
 * is `corner-full`. That difference is the whole reason a row of chips under a
 * search field does not read as a row of buttons, and it is why this table does
 * not reach for `rounded-mp-full` at any rung.
 */
const RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-sm',
  md: 'rounded-mp-sm',
  lg: 'rounded-mp-sm',
  xl: 'rounded-mp-md'
};

/**
 * The five weights. A chip *is* the thing being coloured, so — unlike a
 * container — its surface takes the tint.
 *
 * `outlined` reads `on-surface-variant` rather than the accent, which is MD3's
 * own choice for an unselected chip: the label of a filter that is off is not
 * making a claim, and twenty accent-coloured labels in a row is a filter bar
 * that looks like it is all switched on.
 */
const REST: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-mp-on-surface-variant',
  outlined: 'border-mp-outline text-mp-on-surface-variant border bg-transparent',
  text: 'text-mp-on-surface-variant bg-transparent'
};

/**
 * Selected fills with the family's container tone and takes its `on-` ink —
 * MD3's selected filter chip exactly. `filled` has nowhere louder to go, so it
 * stays where it is and lets the state layer and the tick say it.
 */
const SELECTED: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  outlined: 'border-mp-outline bg-(--_mp-accent-container) text-(--_mp-on-accent-container) border',
  text: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)'
};

/**
 * The spec's disabled treatment — content at 38%, a container at 12%, both of
 * `on-surface`. The accent goes entirely, for the reason `MPButton` gives: a
 * disabled control that is a paler version of an available one differs from it
 * only in saturation, which is the one axis a reader cannot judge in isolation.
 */
const DISABLED: Record<MPVariant, string> = {
  filled: 'bg-mp-on-surface/12 text-mp-on-surface/38',
  tonal: 'bg-mp-on-surface/12 text-mp-on-surface/38',
  elevated: 'bg-mp-on-surface/12 text-mp-on-surface/38 shadow-none',
  outlined: 'border-mp-on-surface/12 text-mp-on-surface/38 border bg-transparent',
  text: 'bg-transparent text-mp-on-surface/38'
};

/**
 * The × that removes a chip.
 *
 * Sized in `em` so it tracks the chip's label at every rung, and it is the one
 * place in the library where `opacity` carries a resting state: this is not a
 * control changing what it is, it is an affordance staying out of the way of the
 * word beside it until the pointer is on it.
 */
const REMOVE = [
  'ms-0.5 -me-1 inline-flex shrink-0 cursor-pointer items-center justify-center',
  'rounded-mp-full size-[1.35em] opacity-70',
  'transition-opacity duration-(--mp-sys-motion-duration-short4)',
  'hover:opacity-100 focus-visible:opacity-100',
  'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
  'focus-visible:outline-solid outline-none',
  'disabled:cursor-default disabled:opacity-38'
].join(' ');

/**
 * The label, when the chip is pressable, is its own `<button>` inside the shell
 * rather than the shell itself.
 *
 * That looks like indirection and is not: a chip can carry a delete affordance,
 * which has to be a button too, and a `<button>` inside a `<button>` is invalid
 * HTML that browsers un-nest on parse. Keeping the shell a `<span>` is what lets
 * "activate this chip" and "remove this chip" both be real, focusable buttons.
 *
 * `self-stretch` so its hit area is the full height of the chip rather than the
 * height of the words, and `rounded-[inherit]` so the focus ring traces the
 * shell's corners rather than drawing a second, squarer rectangle inside them.
 */
const LABEL_BUTTON = [
  'group relative flex min-w-0 flex-1 cursor-pointer items-center justify-center',
  'self-stretch rounded-[inherit] font-[inherit] text-[inherit]',
  'appearance-none border-0 bg-transparent',
  'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-solid outline-none'
].join(' ');

/**
 * A compact token: a tag, a filter, a status, an entity plucked out of a list.
 *
 * The shell is always a `<span>`. What changes is what is inside it: a plain run
 * of content, or — when `onClick` is given — a real `<button>` wrapping that
 * content, plus a second button for `onDelete`. Both are reachable by keyboard,
 * and neither is nested inside the other.
 *
 * An inert `<span>` carrying a click handler is the single most common way a
 * component library loses its keyboard users, and a `<button>` inside a
 * `<button>` is the most common way one invents a chip that Chrome silently
 * rewrites. This shape avoids both.
 */
export const MPChip = React.forwardRef<HTMLSpanElement, MPChipProps>(function MPChip(
  {
    variant = 'outlined',
    size = 'md',
    color = 'primary',
    startIcon,
    endIcon,
    count,
    onDelete,
    deleteLabel,
    locale: localeProp,
    selected,
    disabled = false,
    className,
    style,
    children,
    onClick,
    ...props
  },
  ref
) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages('common', locale);
  const interactive = Boolean(onClick) && !disabled;

  const shellClasses = [
    'mp-chip relative inline-flex max-w-full shrink-0 items-center',
    'box-border overflow-hidden align-middle leading-none whitespace-nowrap select-none',
    'transition-[background-color,border-color,box-shadow,color]',
    'duration-(--mp-sys-motion-duration-short4)',
    HEIGHT[size],
    TEXT[size],
    GAP[size],
    RADIUS[size],
    // An if/else rather than stacked variants: two Tailwind classes of equal
    // specificity resolve by their order in the generated stylesheet.
    disabled ? DISABLED[variant] : selected ? SELECTED[variant] : REST[variant],
    // With a pressable label the padding belongs to the button, so its hit area
    // covers the whole chip rather than just the words.
    interactive ? 'ps-0' : PAD_X[size],
    // The delete button brings its own room; stacking the chip's on top would
    // leave the × floating in the middle of a gap.
    onDelete ? 'pe-2' : interactive ? 'pe-0' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const label = (
    <>
      {startIcon}
      {hasContent(children) ? <span className="min-w-0 truncate">{children}</span> : null}
      {endIcon}
      {hasContent(count) ? (
        <span
          className={[
            'rounded-mp-full ms-0.5 inline-flex shrink-0 items-center justify-center px-1.5 py-px',
            'text-[0.85em] leading-none font-medium tabular-nums',
            // On a painted chip the plate is a hole punched in the fill; on a
            // bare or outlined one it is the container tone showing through.
            variant === 'filled'
              ? 'bg-(--_mp-on-accent)/20 text-(--_mp-on-accent)'
              : 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)'
          ].join(' ')}
        >
          {count}
        </span>
      ) : null}
    </>
  );

  return (
    <span
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      data-selected={selected || undefined}
      className={shellClasses}
      style={{ ...accentSlots(color), ...style }}
      aria-disabled={disabled && !interactive ? true : undefined}
      {...props}
    >
      {interactive ? (
        <button
          type="button"
          // Only for a chip that is actually a toggle — which is what passing
          // `selected` at all is the statement of. An action chip announced as
          // "not pressed" is a screen reader describing a state it does not have.
          aria-pressed={selected}
          className={`${LABEL_BUTTON} ${GAP[size]} ${PAD_X[size]}`}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        >
          <MPStateLayer />
          {label}
        </button>
      ) : (
        label
      )}

      {onDelete ? (
        <button
          type="button"
          aria-label={deleteLabel ?? messages.remove}
          disabled={disabled}
          className={REMOVE}
          onClick={onDelete}
        >
          <MPIcon icon={CloseIcon} size="1em" />
        </button>
      ) : null}
    </span>
  );
});
