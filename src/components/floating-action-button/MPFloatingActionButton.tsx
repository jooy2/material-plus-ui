import * as React from 'react';
import { Button as BaseUIButton } from '@base-ui/react/button';
import { accentSlots } from '../../internal/accent';
import { cssLength } from '../../internal/length';
import { MPStateLayer } from '../../internal/StateLayer';
import { hasContent } from '../../internal/scale';
import type { MPColor, MPCorner, MPPosition, MPSize } from '../../types';

/**
 * The three containers MD3 gives a floating button, and the reason there are not
 * five of them.
 *
 * - `tonal` is the specification's own default: the accent *container* under its
 *   own ink, which is `primary-container` on `on-primary-container` before any
 *   colour is chosen.
 * - `filled` is the accent itself, for the one screen where the button has to
 *   carry more weight than the content behind it.
 * - `elevated` is MD3's *surface* FAB: a neutral container with the accent as
 *   the glyph, for a button floating over something colourful enough that a
 *   tonal one has nothing quiet to sit on.
 *
 * `outlined` and `text` are absent because a floating button *is* its container.
 * A hairline disc over a scrolling page is a shape with the page moving through
 * it, and a text one is a glyph with nothing to press.
 */
export type MPFloatingActionButtonVariant = 'filled' | 'tonal' | 'elevated';

/**
 * The container, per variant, and the ink on it.
 *
 * A table of its own rather than the button's, because the ladders genuinely
 * differ: a button's `elevated` is a surface that separates itself with a level-1
 * shadow that deepens on hover, and a floating button is at level 3 whatever
 * variant it is — it is already off the page, and a hover that raised it further
 * would be saying something the press has not earned.
 */
const SURFACE: Record<MPFloatingActionButtonVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'bg-mp-surface-container-high text-(--_mp-accent)'
};

/**
 * The size ladder.
 *
 * MD3 names three floating buttons — small at 40dp, the plain one at 56dp and
 * large at 96dp — and all three are on this ladder: `xs`, `md` and `xl`. The two
 * rungs between them are this library's, for the reason `MPSize` gives.
 *
 * The height is the rung, and it is the one dimension the button always has.
 * The width is whatever the label needs, which is why extending is a thing that
 * can be *watched* rather than a second component.
 */
const FAB_HEIGHT: Record<MPSize, string> = {
  xs: 'h-10',
  sm: 'h-12',
  md: 'h-14',
  lg: 'h-18',
  xl: 'h-24'
};

/**
 * What makes it a disc: no room beside the glyph, and a floor under the width
 * at the same rung as the height.
 *
 * `min-width` rather than `width`, which is what lets the button travel between
 * this and `FAB_EXTENDED`. A definite width cannot be interpolated towards one
 * that is `auto`; a floor can be raised, and the label's own track carries the
 * rest of the distance.
 */
const FAB_SQUARE: Record<MPSize, string> = {
  xs: 'min-w-10 gap-0 px-0',
  sm: 'min-w-12 gap-0 px-0',
  md: 'min-w-14 gap-0 px-0',
  lg: 'min-w-18 gap-0 px-0',
  xl: 'min-w-24 gap-0 px-0'
};

/**
 * **The one component in this library where the corner is on the size ladder**,
 * and it is on it because the specification puts it there: a small floating
 * button is `corner-medium`, the plain one is `corner-large`, and the large one
 * is `corner-extra-large`.
 *
 * Everywhere else a radius is a statement about what kind of object something is
 * rather than a size to taste — see [MPBox](../layout/box) — and it stays fixed
 * across the rungs. Here the *object* changes with the rung, which is MD3's own
 * reading of it: a 96dp disc and a 40dp one are two different pieces of
 * furniture, not one at two sizes.
 */
const FAB_CORNER: Record<MPSize, string> = {
  xs: 'rounded-mp-md',
  sm: 'rounded-mp-lg',
  md: 'rounded-mp-lg',
  lg: 'rounded-mp-xl',
  xl: 'rounded-mp-xl'
};

/** The glyph, in CSS pixels: MD3's 24dp, growing only on the large button. */
const FAB_ICON: Record<MPSize, number> = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 30,
  xl: 36
};

/**
 * An extended button's label.
 *
 * `label-large` rather than the `title-medium` a button of the same rung takes,
 * because that is what MD3 sets an extended FAB in — the label is doing the work
 * of a glyph, and a heading-weight word on a floating pill reads as a banner.
 */
const FAB_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-large',
  sm: 'text-mp-label-large',
  md: 'text-mp-label-large',
  lg: 'text-mp-title-medium',
  xl: 'text-mp-title-medium'
};

/** The room beside an extended button's label, and the gap before its glyph. */
const FAB_EXTENDED: Record<MPSize, string> = {
  xs: 'min-w-16 gap-1.5 px-3',
  sm: 'min-w-18 gap-2 px-4',
  md: 'min-w-20 gap-2 px-4',
  lg: 'min-w-24 gap-2.5 px-5',
  xl: 'min-w-28 gap-3 px-6'
};

/**
 * `static` is absent because it is not written: a floating button that is back
 * in the flow takes `relative` instead, so that the state layer still has a
 * positioning context to fill. See the note beside the class list.
 */
const POSITION: Record<Exclude<MPPosition, 'static'>, string> = {
  absolute: 'absolute z-30',
  sticky: 'sticky z-30',
  fixed: 'fixed z-40'
};

/**
 * The two insets a corner is, both read off one slot so `offset` is written
 * once. Logical properties, so a `bottom-end` button is bottom-left under RTL.
 */
const CORNER: Record<MPCorner, string> = {
  'top-start': 'top-(--_mp-fab-offset) start-(--_mp-fab-offset)',
  'top-end': 'top-(--_mp-fab-offset) end-(--_mp-fab-offset)',
  'bottom-start': 'bottom-(--_mp-fab-offset) start-(--_mp-fab-offset)',
  'bottom-end': 'bottom-(--_mp-fab-offset) end-(--_mp-fab-offset)'
};

export interface MPFloatingActionButtonProps extends Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'color'
> {
  /**
   * The glyph.
   *
   * Wrap it in an [MPIcon](../display/icon) when it needs a size of its own;
   * passed bare it is drawn at the rung's own glyph size.
   */
  icon?: React.ReactNode;
  /**
   * What the button does, in words.
   *
   * Required, and the one prop here that is. A button whose whole label is a
   * drawing has no accessible name at all, and "a floating button with no
   * `aria-label`" is a defect that ships precisely because the control looks
   * finished without one. With `extended` this is also the word written on the
   * button, so the two can never say different things.
   */
  label: string;
  /**
   * Writes `label` beside the glyph, which turns the disc into a stadium — MD3's
   * extended floating button, for the one action a screen is about.
   * @default false
   */
  extended?: boolean;
  /**
   * Which container it paints.
   * @default 'tonal'
   */
  variant?: MPFloatingActionButtonVariant;
  /**
   * Which accent family it reads. Not an arbitrary colour: to change what
   * `primary` *is*, set the token.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * The button's size. `md` is MD3's own 56dp; `xs` and `xl` are the
   * specification's small and large floating buttons at 40 and 96dp.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * How it sits in the page. `fixed` — the default, against the `static`
   * everything else in this library defaults to — is what a floating button *is*:
   * held against a corner of the window whatever the page under it does.
   *
   * `absolute` pins it to the nearest positioned ancestor instead, which is what
   * a button floating over a card or a map wants. `static` puts it back in the
   * flow — drawn as `position: relative`, because the state layer still needs
   * something to fill.
   * @default 'fixed'
   */
  position?: MPPosition;
  /**
   * Which corner it is pinned to. Logical, so `bottom-end` is bottom-left under
   * RTL. No effect while `position` is `static`.
   * @default 'bottom-end'
   */
  corner?: MPCorner;
  /**
   * How far in from both edges, as a CSS length or a number of pixels. MD3's own
   * is 16dp.
   * @default 16
   */
  offset?: number | string;
  /** Unavailable. Keeps its place, stops answering, and stops floating. */
  disabled?: boolean;
  /**
   * `button`, not `submit`. A native button defaults to submitting the form
   * around it.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * The one action a screen is about, floating over it.
 *
 * MD3's floating action button, drawn from the specification's own component
 * tokens: the three containers, the three sizes with the corner each of them
 * takes, level-3 elevation, the state layer, and the extended shape. The default
 * — `tonal` on `primary` — is the specification's default FAB exactly:
 * `primary-container` under `on-primary-container`.
 *
 * ## Why there is no speed dial
 *
 * A floating button that fans out into three or four smaller ones is a Material
 * **2** pattern, and MD3 dropped it. It was never good: the actions are
 * unlabelled discs in the corner of the screen, they cover the content the
 * reader was looking at, and a fan of buttons that claims `role="menu"` without
 * the keyboard contract of one is worse for a keyboard reader than something
 * that never claimed anything.
 *
 * When there genuinely are several actions, they belong in an
 * [MPMenu](../inputs/menu) — which *is* a menu, with the roving focus, the
 * typeahead and the escape behaviour that word promises — opened from this
 * button.
 *
 * ## Why it is `fixed` by default
 *
 * Because that is the component. Everything else in this library sits in the
 * page's flow and would be wrong to take out of it; this one is defined by not
 * being part of the page. `position="absolute"` is the escape hatch for a button
 * that belongs to a region rather than to the window, and `static` puts it back
 * in the flow entirely.
 */
export const MPFloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  MPFloatingActionButtonProps
>(function MPFloatingActionButton(
  {
    icon,
    label,
    extended = false,
    variant = 'tonal',
    color = 'primary',
    size = 'md',
    position = 'fixed',
    corner = 'bottom-end',
    offset = 16,
    disabled = false,
    type = 'button',
    className,
    style,
    ...props
  },
  ref
) {
  return (
    <BaseUIButton
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={label}
      data-mp-size={size}
      data-mp-variant={variant}
      className={[
        'mp-fab group inline-flex shrink-0 items-center justify-center',
        'box-border overflow-hidden align-middle whitespace-nowrap select-none',
        'cursor-pointer appearance-none font-[inherit]',
        // The focus indicator is `secondary` and sits outside the button, which
        // is MD3's own rule — a ring drawn inside a filled container is a ring
        // drawn on top of the fill it is meant to be distinguishable from.
        'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-solid outline-none',
        // `min-width`, `padding` and `gap` are here because extending is
        // something a caller *changes*, most often on a scroll — MD3 draws the
        // disc becoming a stadium rather than being replaced by one. The three
        // of them are the button's own share of that distance; the label's
        // track carries the rest, and the two are given the same numbers so
        // they arrive together.
        'transition-[background-color,box-shadow,color,min-width,padding,gap]',
        'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
        FAB_CORNER[size],
        FAB_HEIGHT[size],
        // Applied at both widths rather than only when there is a label to set,
        // so the type scale is not a second thing changing while the button is
        // already travelling.
        FAB_TEXT[size],
        extended ? FAB_EXTENDED[size] : FAB_SQUARE[size],
        // An if/else rather than stacked variants: two Tailwind classes of equal
        // specificity resolve by their order in the generated stylesheet.
        disabled
          ? // MD3's disabled treatment, and the shadow goes with the colour: a
            // button that is still floating while it cannot be pressed is a
            // button still claiming to be the thing to do.
            'bg-mp-on-surface/12 text-mp-on-surface/38 cursor-default shadow-none'
          : `${SURFACE[variant]} shadow-mp-3`,
        // A floating button in the flow is not floating: the corner offsets are
        // meaningless without a positioning context, and applying them would
        // move it by inheriting somebody else's.
        //
        // `relative` is added only there, and that is not a tidiness: it is a
        // `position` utility like the other three, and two of those on one
        // element resolve by their order in the generated stylesheet — where
        // `relative` sorts after `fixed` and quietly wins. The state layer needs
        // a positioning context, and the other three values already are one.
        position === 'static' ? 'relative' : `${POSITION[position]} ${CORNER[corner]}`,
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          ...accentSlots(color),
          '--_mp-fab-offset': cssLength(offset),
          ...style
        } as React.CSSProperties
      }
      {...props}
    >
      {disabled ? null : <MPStateLayer />}

      {hasContent(icon) ? (
        <span
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: FAB_ICON[size], height: FAB_ICON[size] }}
        >
          {icon}
        </span>
      ) : null}

      {/*
       * The label, and the track it sits in.
       *
       * It is the same string the button is named by either way. `aria-hidden`
       * on the drawn copy would be wrong — it *is* the name, and `aria-label`
       * above simply repeats it so that a disc with no words still has one.
       *
       * The track is a grid column that travels between `0fr` and `1fr`, which
       * is the one way to interpolate towards a width nobody knows: `1fr` of a
       * single-column grid resolves to exactly what the label needs, and `0fr`
       * to nothing at all, so the two ends are the real widths rather than a
       * guess big enough to cover them. A `max-width` would have to name a
       * number large enough for the longest label anyone might pass, and every
       * shorter one would then finish arriving in the first fraction of the
       * duration and sit still for the rest.
       *
       * `min-w-0` on the label, or a grid item's automatic minimum size would
       * hold the track open at the width of the word inside it and there would
       * be nothing to travel.
       *
       * The label stays mounted while the button is a disc. It has to: an
       * element that is not there has no width to animate from. It is clipped
       * to nothing by a zero-width track inside a button that already carries
       * `overflow-hidden`, and it is not read twice, because `aria-label` names
       * the button and a name replaces its contents rather than adding to them.
       */}
      <span
        className={[
          'relative grid transition-[grid-template-columns]',
          'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
          extended ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
        ].join(' ')}
      >
        <span className="min-w-0 truncate">{label}</span>
      </span>
    </BaseUIButton>
  );
});
