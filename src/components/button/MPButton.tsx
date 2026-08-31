import * as React from 'react';
import {
  Button as BaseUIButton,
  type ButtonProps as BaseUIButtonProps
} from '@base-ui/react/button';
import { MPIcon } from '../icon/MPIcon';
import { SpinnerIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { MPButtonGroupContext } from '../../internal/button-group';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_HEIGHT,
  CONTROL_ICON,
  CONTROL_PAD_X,
  CONTROL_SQUARE,
  CONTROL_TEXT,
  hasContent
} from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPStyleProps, MPVariant } from '../../types';

/**
 * What the button is made of, at rest.
 *
 * These are Material's five, and the order they are written in is the order they
 * get louder. Each one is a different answer to the same question — how does this
 * action separate itself from the page — and none of them is a shade of another:
 *
 * - `filled` paints the accent and puts its own ink on top. One per screen.
 * - `tonal` uses the container tone of the same family, which is the accent
 *   diluted rather than the accent dimmed. For the second-most-important action.
 * - `elevated` is a *neutral* surface that separates itself with a shadow instead
 *   of with colour. It is the one to reach for over a busy background, where a
 *   tonal button has nothing quiet enough to sit on.
 * - `outlined` is a hairline and nothing else.
 * - `text` is a label.
 *
 * `bg-transparent` is written out on the two that have no fill. A `<button>`
 * arrives with the browser's own grey background and this library ships no page
 * reset, so nothing else is going to take it off.
 */
const REST: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 hover:shadow-mp-2 bg-mp-surface-container-low text-(--_mp-accent)',
  outlined: 'border-mp-outline border bg-transparent text-(--_mp-accent)',
  text: 'bg-transparent text-(--_mp-accent)'
};

/**
 * The spec's disabled treatment: content at 38%, a container at 12%, both of
 * `on-surface`.
 *
 * The accent goes entirely. That is the point — a disabled button should not
 * look like a quieter version of an available one, because the two would then
 * differ only in saturation, which is exactly the axis a reader cannot judge in
 * isolation.
 */
const DISABLED: Record<MPVariant, string> = {
  filled: 'bg-mp-on-surface/12 text-mp-on-surface/38',
  tonal: 'bg-mp-on-surface/12 text-mp-on-surface/38',
  elevated: 'bg-mp-on-surface/12 text-mp-on-surface/38 shadow-none',
  outlined: 'border-mp-on-surface/12 border bg-transparent text-mp-on-surface/38',
  text: 'bg-transparent text-mp-on-surface/38'
};

export interface MPButtonProps
  extends MPStyleProps, Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  /**
   * How much surface the button paints.
   * @default 'filled'
   */
  variant?: MPVariant;
  /**
   * Which accent family it reads. Not an arbitrary colour: to change what
   * `primary` *is*, set the token.
   * @default 'primary'
   */
  color?: MPColor;
  /** Content placed before the label. */
  startIcon?: React.ReactNode;
  /** Content placed after the label. */
  endIcon?: React.ReactNode;
  /**
   * Swaps `startIcon` for a spinner and stops the button firing, while leaving it
   * focusable and otherwise unchanged.
   *
   * Deliberately not `disabled`. A button that vanishes from the tab order the
   * moment it is pressed takes the keyboard focus with it, and the reader is
   * returned to the top of the document while the request they just made is
   * still in flight.
   * @default false
   */
  loading?: boolean;
  /**
   * The accessible name of the spinner, announced while `loading`. Defaults to
   * the word for "loading" in `locale`.
   */
  loadingLabel?: string;
  /**
   * Which language the spinner's default name is written in. Falls back to the
   * nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * `button`, not `submit`. A native button defaults to submitting the form
   * around it, which turns every unrelated button inside a form into one that
   * submits it.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Renders something other than a `<button>` while keeping every part of the
   * surface. Base UI's own escape hatch, so it behaves here exactly as it does
   * on every Base UI primitive.
   *
   * **A link wearing a button is the reason this exists**, and it is three props
   * rather than one:
   *
   * ```tsx
   * <MPButton render={<a href="/pricing" />} nativeButton={false} role="link">
   *   Pricing
   * </MPButton>
   * ```
   *
   * `nativeButton={false}` tells Base UI the element is not a `<button>`, and
   * `role` puts back the one thing it then assumes — see `nativeButton`. Without
   * the `role` the anchor is announced as a button, which is exactly the lie the
   * "no `href`" rule below exists to prevent.
   */
  render?: BaseUIButtonProps['render'];
  /**
   * Whether `render` produces a real `<button>`.
   *
   * Only meaningful alongside `render`, and then it is not optional: an `<a>` has
   * no `disabled`, is not in a form's submit chain, and is activated by Enter but
   * not by Space, so Base UI has to be told which set of behaviours to supply. It
   * says so in the console when the two disagree, in either direction.
   *
   * What it also does is assume the element is *acting* as a button, and give it
   * `role="button"` and a tab stop to say so. For an anchor that is one assumption
   * too many — a link announced as a button is a link a reader will not expect to
   * open in a new tab — so pass `role="link"` alongside it. Anything else that is
   * genuinely a button (a `<div>`, a `<span>`) wants the role Base UI supplies and
   * should leave it alone.
   * @default true
   */
  nativeButton?: boolean;
  children?: React.ReactNode;
}

/**
 * A Material Design button.
 *
 * Five variants, four accent families and the library's size ladder, drawn from
 * MD3's own component tokens: the container and label colours per variant, the
 * state layer, the spec's disabled opacities, and the shape — `corner-full`,
 * because a Material button has been a pill since 2021 and a rounded rectangle
 * is the single fastest way to make a screen look like it is from 2018.
 *
 * Base UI's `Button` is underneath, which is what makes `disabled` behave: it
 * keeps a disabled button out of the tab order without the composition problems
 * a plain `aria-disabled` brings, and publishes `data-pressed` so a press driven
 * from the keyboard lights the same state layer a pointer press does.
 *
 * ## Two things this does not have
 *
 * **No `href`.** A button that navigates is a link, and the difference is not
 * cosmetic: a link is announced as one, opens in a new tab on the middle button,
 * and shows its destination in the status bar. So a link that looks like a button
 * is written as a link:
 *
 * ```tsx
 * <MPButton render={<a href="/pricing" />} nativeButton={false} role="link">
 *   Pricing
 * </MPButton>
 * ```
 *
 * All three parts matter, and `render`'s own note says why. Teaching the button
 * to take an `href` instead would be teaching it to lie about what it is.
 *
 * **No ripple.** MD3 dropped it: the state layer below is what replaced it, and
 * it says the same thing without an animation that has to finish before the
 * screen it triggered is allowed to change.
 */
export const MPButton = React.forwardRef<HTMLButtonElement, MPButtonProps>(function MPButton(
  {
    variant: variantProp,
    size: sizeProp,
    color: colorProp,
    disabled: disabledProp,
    startIcon,
    endIcon,
    loading = false,
    loadingLabel,
    locale: localeProp,
    fullWidth = false,
    type = 'button',
    render,
    nativeButton = true,
    className,
    style,
    children,
    onClick,
    ...props
  },
  ref
) {
  // A group sets these once for the whole run. The button's own prop still wins —
  // a row of secondary actions with one destructive button in it is a real thing
  // — and with no group around it the defaults are what they always were.
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(COMMON, locale);
  const group = React.useContext(MPButtonGroupContext);
  const variant = variantProp ?? group?.variant ?? 'filled';
  const size = useMPSize(sizeProp ?? group?.size);
  const color = useMPColor(colorProp ?? group?.color);
  const disabled = disabledProp ?? group?.disabled ?? false;

  /*
   * Square when the button holds exactly one thing, which is what "nothing to
   * pad against" actually means.
   *
   * It used to ask only about `children`, and that was one question short: a
   * button given both a `startIcon` and an `endIcon` and no label has two
   * glyphs to lay out and was being drawn in a box the width of its own height,
   * with the inline padding taken away as well. Two glyphs in a square is not an
   * icon button, it is an icon button with something else jammed into it.
   *
   * The leading slot counts as filled while `loading`, because the spinner is
   * standing in it whether or not a `startIcon` was ever given.
   *
   * `false` and `null` count as nothing throughout: they are what
   * `condition && <Icon />` leaves behind.
   */
  const leading = loading || hasContent(startIcon);
  const iconOnly = !hasContent(children) && !(leading && hasContent(endIcon));

  return (
    <BaseUIButton
      ref={ref}
      render={render}
      nativeButton={nativeButton}
      // Withheld from anything that is not a button, where it is not an
      // attribute at all: `<a type="button">` is markup a validator rejects and
      // a browser ignores, and `render` is the whole reason this element might
      // not be a `<button>`.
      type={nativeButton ? type : undefined}
      disabled={disabled}
      // Announced, and honoured: the click below is swallowed while it is set.
      // `disabled` would do both, and would also take the focus off a button the
      // reader is still standing on.
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-mp-size={size}
      data-mp-variant={variant}
      data-loading={loading || undefined}
      className={[
        'mp-button group relative inline-flex shrink-0 items-center justify-center',
        // `box-border` explicitly: this library ships no page reset, so an
        // `outlined` button's hairline would otherwise be added *outside* its
        // height and come out two pixels taller than a `filled` one beside it.
        'rounded-mp-full box-border overflow-hidden align-middle whitespace-nowrap select-none',
        // A native button does not inherit the page's font, and with no reset on
        // the page nothing else will hand it one.
        'cursor-pointer appearance-none font-[inherit]',
        // The focus indicator is `secondary` and sits *outside* the button,
        // which is MD3's own rule — a ring drawn inside a filled button is a ring
        // drawn on top of the fill it is meant to be distinguishable from.
        'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-solid outline-none',
        'transition-[background-color,border-color,box-shadow,color]',
        'duration-(--mp-sys-motion-duration-short4)',
        CONTROL_HEIGHT[size],
        CONTROL_TEXT[size],
        CONTROL_GAP[size],
        iconOnly ? `${CONTROL_SQUARE[size]} px-0` : CONTROL_PAD_X[size],
        // An if/else rather than two sets of stacked `data-*` variants: two
        // Tailwind classes of equal specificity resolve by their order in the
        // generated stylesheet, which is not something a component should depend
        // on.
        disabled ? DISABLED[variant] : REST[variant],
        disabled ? 'cursor-default' : '',
        loading ? 'cursor-progress' : '',
        fullWidth ? 'w-full' : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClick?.(event);
      }}
      {...props}
    >
      {disabled ? null : <MPStateLayer />}

      {loading ? (
        <MPIcon
          icon={SpinnerIcon}
          size={CONTROL_ICON[size]}
          label={loadingLabel ?? messages.loading}
          className="animate-spin"
        />
      ) : (
        startIcon
      )}
      {children}
      {endIcon}
    </BaseUIButton>
  );
});
