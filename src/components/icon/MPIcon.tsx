import * as React from 'react';
import type { MPIconGlyph, MPIconGlyphProps } from '../../types';

export interface MPIconProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  /**
   * The glyph to draw: a component from an icon set, or an element of your own.
   *
   * It is a prop rather than `children` because the two things you always want
   * to decide about an icon — how big it is and what colour it is — are the two
   * things you cannot reach once it is a child. As a prop it is content this
   * component *sizes*, not content it merely wraps.
   *
   * ```tsx
   * <MPIcon icon={ICONS.search} />          // a component from an icon set
   * <MPIcon icon={<MySvgLogo />} />         // an element of your own
   * ```
   */
  icon: MPIconGlyph;
  /**
   * The box the glyph is drawn in. A number is CSS pixels; a string is any CSS
   * length, so `'1em'` tracks the surrounding text.
   *
   * Left unset the glyph draws at its own natural size — 24px for a lucide
   * icon, whatever the artwork says for an element. That default is deliberate:
   * an icon set already agrees with itself about size, and a wrapper that
   * overrode it would be a second opinion nobody asked for.
   */
  size?: number | string;
  /**
   * The glyph's colour, as any CSS colour. Left unset the icon inherits the
   * colour of whatever it sits in — a button's label, a muted caption, an
   * error message — which is right far more often than a colour of its own.
   */
  color?: string;
  /**
   * Stroke width, forwarded to glyphs given as a component. Ignored by an
   * element, which is already drawn.
   */
  strokeWidth?: number | string;
  /**
   * Centres the icon in its grid or flex track. Carried over from the pattern
   * this component replaces, where an icon in a table cell or a form row is
   * laid out by its parent and has no other way to say where it sits.
   */
  center?: boolean;
  /**
   * What the icon says, for a reader who cannot see it.
   *
   * Without it the icon is hidden from the accessibility tree, which is the
   * right default: most icons sit beside a word that already says the same
   * thing, and reading both aloud is worse than reading one. Pass this only
   * when the glyph carries the meaning on its own.
   */
  label?: string;
}

/**
 * Whether a glyph is a component to render or an element already rendered.
 *
 * `React.isValidElement` is the whole test. An element is an object tagged
 * `react.element`; every other form a component takes — a plain function, a
 * `forwardRef` object, a `memo` object — is not, and all of them can be handed
 * straight to `createElement`. Checking for a function alone would miss the
 * `forwardRef` objects that most icon sets, `lucide-react` included, actually
 * export.
 */
function isGlyphComponent(icon: MPIconGlyph): icon is React.ComponentType<MPIconGlyphProps> {
  return !React.isValidElement(icon);
}

/**
 * An icon at a known size, in a known colour.
 *
 * Material Plus draws no icons of its own. Which set an application uses is its
 * decision, and one it has usually already made — so this component takes
 * whatever that set hands back and gives it the size and colour axes the rest
 * of the library has.
 *
 * The glyph goes in a box, and the box is what does the work: it is
 * `inline-flex`, so an icon lines up with text rather than sitting on the
 * baseline like an image; it carries the `font-size` as well as the width and
 * height, so an `<svg>` sized in `em` comes out the same as one sized in `px`;
 * and it owns the accessibility, so a decorative glyph leaves the tree entirely
 * instead of being announced as "graphic".
 *
 * A component glyph is *also* handed the size and colour directly, because a
 * set like lucide draws to its `size` prop and would otherwise render at its
 * own 24px inside a 16px box.
 */
export const MPIcon = React.forwardRef<HTMLSpanElement, MPIconProps>(function MPIcon(
  { icon, size, color, strokeWidth, center = false, label, className, style, ...props },
  ref
) {
  const classNames = [
    'mp-icon inline-flex shrink-0 items-center justify-center align-middle',
    // Whatever was drawn fills the box, however the set authored it — an `<svg>`
    // carrying its own `width`, or one sized in `em`. Only when a `size` was
    // asked for: without one the box is sized by its content, so a percentage
    // on the content would have nothing to resolve against.
    size === undefined ? '' : '[&>svg]:block [&>svg]:size-full [&>img]:block [&>img]:size-full',
    center ? 'justify-self-center' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={ref}
      className={classNames}
      style={{
        // The length is written twice on purpose. `width`/`height` are what an
        // `<svg>` with its own attributes is scaled into; `fontSize` is what an
        // `<svg>` drawn in `em` measures itself against. Setting only one of
        // them gets exactly half of the icon sets right.
        ...(size === undefined ? {} : { width: size, height: size, fontSize: size }),
        ...(color === undefined ? {} : { color }),
        ...style
      }}
      // An icon with something to say is an image with a name; one without is
      // furniture. There is no third case, and `role="img"` on a decorative
      // glyph is the most common way a screen reader ends up saying "graphic".
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {isGlyphComponent(icon)
        ? React.createElement(icon, {
            size,
            // `currentColor` rather than nothing, so a set whose own default is
            // a fixed colour still answers the box's `color`.
            color: color === undefined ? 'currentColor' : color,
            strokeWidth
          })
        : icon}
    </span>
  );
});
