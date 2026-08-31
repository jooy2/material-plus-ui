import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { accentSlots } from '../../internal/accent';
import type { MPColor } from '../../types';

/**
 * What a piece of text *is*, which decides both its type scale and the element
 * it renders as.
 *
 * This is deliberately not called `variant`. In this library `variant` means how
 * much of a surface a component paints — `filled` / `tonal` / `elevated` /
 * `outlined` / `text` — and a second meaning for the same word is exactly what
 * the prop conventions forbid.
 *
 * The names are the document's rather than the specification's, and that is the
 * one place this component's vocabulary is not MD3's. The reason is that these
 * values pick an **element**: `h2` has to be spelled `h2` because what it emits
 * is an `<h2>`, and a caller who wrote `level="headline-large"` would have no
 * way to say which heading level they meant. The Material role each one is set
 * in is in the table on `LEVEL_TEXT` below, and is what a reader actually sees.
 */
export type MPTypographyLevel =
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'lead' | 'caption' | 'overline';

/**
 * How the text is set against its measure.
 *
 * `start` and `end` rather than `left` and `right` — the same rule `MPAlign`
 * follows — plus `justify`, which is the one value that is about the paragraph
 * rather than about which edge it hangs off, and so has no place in the shared
 * type.
 */
export type MPTypographyAlign = 'start' | 'center' | 'end' | 'justify';

export type MPTypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface MPTypographyProps extends Omit<
  React.ComponentPropsWithoutRef<'p'>,
  'color' | 'children'
> {
  /**
   * The type scale, and the element that carries it. `h1`–`h6` render the
   * matching heading, `lead`/`body` a `<p>`, `caption`/`overline` a `<span>`.
   * @default 'body'
   */
  level?: MPTypographyLevel;
  /**
   * Which accent family the text reads. Unlike every control in the library this
   * has **no default**: prose inherits the surface's own ink unless a role is
   * asked for, because the common case for a paragraph is to look like the
   * paragraphs around it.
   *
   * No default means no declaration, not a quiet one. Nothing here writes a
   * `color` until this prop is passed, so a `text-white` on the dark section
   * above wins by simply being the only thing that spoke — and a role outside
   * the four accents is a `className` away: `className="text-mp-on-surface-variant"`
   * on a `caption` is the muted line this component used to hand out whether or
   * not it was wanted.
   */
  color?: MPColor;
  /**
   * Overrides the weight the level would otherwise pick.
   *
   * Worth knowing before reaching for it: **Material headings are not bold.**
   * Every display, headline and `title-large` role in MD3 is weight 400, and
   * that is what `level` hands out. A heading set in 600 is the single fastest
   * way to make a Material page look like it belongs to some other system.
   */
  weight?: MPTypographyWeight;
  align?: MPTypographyAlign;
  /**
   * Clamps the text to this many lines with an ellipsis. `1` is a single-line
   * truncation. Omit it and the text wraps as far as it needs to.
   */
  lines?: number;
  /**
   * Adds the space below that a run of prose expects. Off by default: a library
   * component that injects margins is one a layout has to fight.
   * @default false
   */
  gutter?: boolean;
  /**
   * Renders a different element without changing the type scale — an `h2`-sized
   * line that is semantically a `<p>`, or the other way round. Base UI's own
   * escape hatch.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * The scale, and the whole point of the component: **every level is one of
 * MD3's own type roles**, at the specification's size, leading, tracking and
 * weight. Nothing here is interpolated and nothing is invented.
 *
 * | `level`    | Material role     | Size / leading |
 * | ---------- | ----------------- | -------------- |
 * | `h1`       | `display-small`   | 36 / 44        |
 * | `h2`       | `headline-large`  | 32 / 40        |
 * | `h3`       | `headline-medium` | 28 / 36        |
 * | `h4`       | `headline-small`  | 24 / 32        |
 * | `h5`       | `title-large`     | 22 / 28        |
 * | `h6`       | `title-medium`    | 16 / 24        |
 * | `lead`     | `title-large`     | 22 / 28        |
 * | `body`     | `body-large`      | 16 / 24        |
 * | `caption`  | `body-small`      | 12 / 16        |
 * | `overline` | `label-small`     | 11 / 16        |
 *
 * Two rows share a role on purpose. `h5` and `lead` are both `title-large`
 * because MD3 has exactly one role at that size and a lead paragraph is what it
 * is for — they differ in the element they emit, which is the thing that
 * actually matters to a document outline. `h6` and `body` are both 16px for the
 * same reason the specification puts them there: `title-medium` *is*
 * `body-large` at weight 500, and that weight is the whole difference between a
 * subheading and the paragraph under it.
 *
 * `display-large` and `display-medium` are not offered. At 57px and 45px they
 * are hero type for a marketing page, and a component whose smallest job is a
 * caption should not also be the thing that sets a billboard.
 *
 * ## Why every utility here is written through `[&.mp-typography]`
 *
 * It doubles the component's own class into the selector and takes it to two
 * classes, which is the same defence `MPTextLink` puts up and for the same
 * reason. `h1`–`h6` and `p` are the tags a host stylesheet is *most* likely to
 * style by name — `.prose h2`, `.vp-doc h2`, every CSS framework ever — and all
 * of those are a class plus a type, which outranks a plain utility.
 *
 * A component whose entire subject is the type scale, losing its type scale
 * inside a `.prose` block, would have lost the only thing it is. So the size,
 * the leading, the tracking, the weight, the colour and the margins are all
 * written above whatever the page says about a heading.
 */
const LEVEL_TEXT: Record<MPTypographyLevel, string> = {
  h1: '[&.mp-typography]:text-mp-display-small',
  h2: '[&.mp-typography]:text-mp-headline-large',
  h3: '[&.mp-typography]:text-mp-headline-medium',
  h4: '[&.mp-typography]:text-mp-headline-small',
  h5: '[&.mp-typography]:text-mp-title-large',
  h6: '[&.mp-typography]:text-mp-title-medium',
  lead: '[&.mp-typography]:text-mp-title-large',
  body: '[&.mp-typography]:text-mp-body-large',
  caption: '[&.mp-typography]:text-mp-body-small',
  overline: '[&.mp-typography]:text-mp-label-small [&.mp-typography]:tracking-[0.08em] uppercase'
};

/**
 * The weight each role carries, resolved in JS so that exactly **one** `font-*`
 * class is ever emitted.
 *
 * Emitting the role's weight and an override together would leave two utilities
 * of equal specificity on the element, and which of them wins is decided by
 * their order in the generated stylesheet — `font-semibold` beats `font-normal`
 * there no matter which one was asked for.
 *
 * These are the specification's weights. The headings being `regular` is not an
 * oversight; see `weight`.
 */
const LEVEL_WEIGHT: Record<MPTypographyLevel, MPTypographyWeight> = {
  h1: 'regular',
  h2: 'regular',
  h3: 'regular',
  h4: 'regular',
  h5: 'regular',
  h6: 'medium',
  lead: 'regular',
  body: 'regular',
  caption: 'regular',
  overline: 'medium'
};

/** The element each level renders as when `render` is not given. */
const LEVEL_ELEMENT: Record<MPTypographyLevel, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  lead: 'p',
  body: 'p',
  caption: 'span',
  overline: 'span'
};

/**
 * How much room a level leaves under itself when `gutter` is on.
 *
 * The other three sides are zeroed by `MARGIN` below rather than here, so the
 * two never set the same property: two utilities of equal specificity resolve by
 * their order in the generated stylesheet, and `mb-3` against `m-0` is exactly
 * that trap.
 */
const GUTTER: Record<MPTypographyLevel, string> = {
  h1: '[&.mp-typography]:mb-4',
  h2: '[&.mp-typography]:mb-3.5',
  h3: '[&.mp-typography]:mb-3',
  h4: '[&.mp-typography]:mb-2.5',
  h5: '[&.mp-typography]:mb-2',
  h6: '[&.mp-typography]:mb-2',
  lead: '[&.mp-typography]:mb-4',
  body: '[&.mp-typography]:mb-3',
  caption: '[&.mp-typography]:mb-2',
  overline: '[&.mp-typography]:mb-2'
};

/**
 * The margins the component owns.
 *
 * A heading and a `<p>` arrive with margins from the browser's own stylesheet
 * and, on most pages, larger ones from the host's. `gutter` promises that the
 * default is *no* space below, and that promise is only true if the component
 * resets what it did not ask for — the same rule that has a `<button>` reset its
 * browser-default background.
 */
const MARGIN = '[&.mp-typography]:mt-0 [&.mp-typography]:ms-0 [&.mp-typography]:me-0';
const MARGIN_BOTTOM = '[&.mp-typography]:mb-0';

const WEIGHT: Record<MPTypographyWeight, string> = {
  regular: '[&.mp-typography]:font-normal',
  medium: '[&.mp-typography]:font-medium',
  semibold: '[&.mp-typography]:font-semibold',
  bold: '[&.mp-typography]:font-bold'
};

const ALIGN: Record<MPTypographyAlign, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
  justify: 'text-justify'
};

/**
 * Clamping is two different mechanisms. One line is `text-overflow: ellipsis`,
 * which keeps the text on its own baseline; more than one needs the line-clamp
 * box, which only ellipsises because WebKit says so.
 */
const CLAMP: Record<number, string> = {
  1: 'truncate',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6'
};

/**
 * Text at one of Material's type roles.
 *
 * The type scale is the one thing in a design system that everything else is
 * measured against, and until now it only existed inside the components that
 * happened to need it — a text field's label, a button's. This is that ladder on
 * its own, so a page can set a heading in the same `headline-large` its
 * components are built out of without wrapping it in a control.
 *
 * `level` sets the scale *and* the element, which is the common case. When they
 * have to differ — a subheading that should not enter the document outline, a
 * `<p>` that has to look like an `h3` — `render` breaks the tie.
 *
 * ## It is not on the size ladder
 *
 * There is no `size` prop, and that is the same call `MPIcon` makes. `MPSize` is
 * a *control* ladder: `md` means 56px tall, and a paragraph has no height to
 * pick from a scale. `level` is this component's scale, and it is the Material
 * one rather than five steps of the library's own.
 */
export const MPTypography = React.forwardRef<HTMLElement, MPTypographyProps>(function MPTypography(
  {
    level = 'body',
    color,
    weight,
    align,
    lines,
    gutter = false,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const classNames = [
    // Both a style hook and the specificity — see `LEVEL_TEXT`.
    'mp-typography',
    LEVEL_TEXT[level],
    WEIGHT[weight ?? LEVEL_WEIGHT[level]],
    MARGIN,
    gutter ? GUTTER[level] : MARGIN_BOTTOM,
    align ? ALIGN[align] : '',
    // Past six the clamp box is doing nothing a scroll container would not do
    // better, so the table stops there rather than growing a row per number.
    lines ? (CLAMP[lines] ?? 'line-clamp-6') : '',
    // Nothing at all without a `color`, which is the whole of what "no default"
    // means. A colour written here would be a `[&.mp-typography]` — two classes
    // — and would therefore outrank the `text-white` on the dark section the
    // prose was dropped into, which is not a default, it is a decision.
    color ? '[&.mp-typography]:text-(--_mp-accent)' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return useRender({
    render: render ?? React.createElement(LEVEL_ELEMENT[level]),
    ref,
    props: {
      className: classNames,
      // The slots only when a family was asked for: four custom properties on
      // every paragraph on a page is four properties the page did not need.
      style: color ? { ...accentSlots(color), ...style } : style,
      children,
      ...props
    }
  });
});
