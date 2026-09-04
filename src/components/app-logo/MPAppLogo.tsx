import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { accentSlots } from '../../internal/accent';
import { initialsOf } from '../../internal/initials';
import { cssLength } from '../../internal/length';
import { CONTROL_GAP, CONTROL_HEIGHT, CONTROL_SQUARE, hasContent } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPSize, MPVariant } from '../../types';

/**
 * How the artwork is **framed**, which is the one question this component
 * exists to answer.
 *
 * - `bare` — drawn as it was given, at the height `size` asks for and whatever
 *   width that comes to. No tile, no crop, no inset. The default, and the only
 *   one that is right for a logo drawn with its own background, its own margin,
 *   or the product's name set into it.
 * - `app` — an app icon: a filled tile with the artwork inset in it and the
 *   corners cut off. What a mark drawn as a bare glyph needs before it can sit
 *   beside anything else.
 * - `circle` — the same tile, round, for the products whose icon is a disc.
 *
 * There is no `square`. A tile with the corners left on is the one shape MD3
 * does not draw, and an `app` icon at `xs` is already close enough to a square
 * that a fourth value would be one nobody could see.
 */
export type MPAppLogoShape = 'bare' | 'app' | 'circle';

export interface MPAppLogoProps extends Omit<
  React.ComponentPropsWithoutRef<'a'>,
  'color' | 'href'
> {
  /**
   * The artwork, as an image. Beaten by `children`, so a project that inlines
   * its SVG and a project that links a PNG use the same component.
   */
  src?: string;
  /** Candidate images at other resolutions, as on any `<img>`. */
  srcSet?: string;
  /**
   * What the artwork says for a reader who cannot see it. Defaults to `name`,
   * which is almost always right: a logo means the product.
   */
  alt?: string;
  /**
   * The product's name.
   *
   * One prop doing three jobs, as on `MPAvatar`: it names the artwork, its
   * initials are what a tile falls back to, and it is drawn as the logotype
   * when there is no artwork at all. That last one is what makes
   * `<MPAppLogo name="Acme" />` — no file, no glyph, no markup — still a logo.
   */
  name?: string;
  /** The initials on a tile, written out, for when the rule derived the wrong ones. */
  initials?: string;
  /**
   * Draws the name beside the artwork, as the words half of a lockup.
   *
   * Off by default, because the common case is a file that already says the
   * name. Turn it on for a bare mark — the icon in a header with the product
   * beside it — and the name stops being read out twice: what is drawn *is* the
   * accessible name from then on.
   *
   * Ignored when the name is already the whole logo, which is what a `bare`
   * logo with no artwork is.
   * @default false
   */
  showName?: boolean;
  /** @default 'bare' */
  shape?: MPAppLogoShape;
  /**
   * How much surface the tile paints. Nothing at all on `bare`, which draws no
   * tile.
   * @default 'filled'
   */
  variant?: MPVariant;
  /**
   * How tall the mark is — the control heights, so a logo and the button beside
   * it in a header line up. On `bare` only the height is set and the width is
   * whatever the artwork's proportions come to; on a tile both are, because a
   * tile is square.
   * @default 'md'
   */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
  /**
   * Insets the artwork from the tile's edge, the way an app icon's glyph is
   * held off its own corners. Turn it off for a mark drawn to fill the tile — a
   * favicon, a photograph.
   *
   * No effect on `bare`, which has no tile to be inset from, and none on a tile
   * showing initials, which are sized by their own type scale.
   * @default true
   */
  padded?: boolean;
  /**
   * An exact height for the mark, overriding `size`. A number is pixels.
   *
   * The one escape hatch this component needs. A brand's artwork is drawn at a
   * height somebody chose, and rounding it to the nearest rung of a ladder is
   * how a logo ends up half a pixel off the type beside it.
   */
  height?: number | string;
  /**
   * Makes the whole lockup a link. A logo in a header is nearly always the way
   * back to the front page, and a `<span>` inside an `<a>` the caller wrote is
   * the same thing with one more element in it.
   */
  href?: string;
  /** Anything else the `<img>` needs — `loading`, `decoding`, `crossOrigin`. */
  imageProps?: Omit<React.ComponentPropsWithoutRef<'img'>, 'src' | 'srcSet' | 'alt'>;
  /**
   * Renders something other than a `<span>`, or than the `<a>` an `href` makes
   * it. `render={<Link to="/" />}` for a router's own link, `render={<h1 />}`
   * for the one page where the product's name is the page's heading.
   */
  render?: useRender.RenderProp;
  /**
   * The artwork, as markup. An inline `<svg>` is the usual one, and it is worth
   * preferring to `src`: a mark that is part of the document takes the page's
   * own colours, needs no second request, and cannot arrive late.
   */
  children?: React.ReactNode;
}

/**
 * The logotype — the name, when the name is the whole logo.
 *
 * Its own ladder rather than a step off the Material type scale, because this
 * is not type. A heading is measured against the paragraph under it; a logotype
 * is measured against the row it sits in, and roughly 55% of the mark's height
 * at every rung is where a word set in the page's own face reads as a mark
 * rather than as a sentence that happens to be bold.
 */
const LOGOTYPE: Record<MPSize, string> = {
  xs: 'text-[0.75rem]',
  sm: 'text-[0.875rem]',
  md: 'text-[1.0625rem]',
  lg: 'text-[1.375rem]',
  xl: 'text-[1.625rem]'
};

/**
 * The letter on a tile, and deliberately larger than `MPAvatar`'s initials at
 * the same rung — about 55% of the tile rather than 40%.
 *
 * They look like the same problem and are not. An avatar's initials stand in
 * for a face and are read as letters; an app icon's letter *is* the icon, drawn
 * to fill the tile the way a glyph would. Sized like initials it becomes a
 * small letter marooned in the middle of a square, which reads as a fallback
 * rather than as a mark.
 */
const TILE_LETTER: Record<MPSize, string> = {
  xs: 'text-[0.75rem]',
  sm: 'text-[0.875rem]',
  md: 'text-[1.0625rem]',
  lg: 'text-[1.3125rem]',
  xl: 'text-[1.5625rem]'
};

/**
 * The tile's corner.
 *
 * MD3's own corner sizes, which are absolute rather than a fraction of the box,
 * and it stops climbing at `md` for the reason `MPAvatar`'s squared crop does:
 * past 12px on a box this small the corners meet, and `shape` stops having two
 * values that look different.
 */
const TILE_RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-sm',
  md: 'rounded-mp-md',
  lg: 'rounded-mp-md',
  xl: 'rounded-mp-md'
};

/**
 * The five weights.
 *
 * A logo tile *is* the thing being coloured — as on chip, badge and avatar — so
 * it takes the tint rather than staying neutral. `filled` is the default here
 * against `MPAvatar`'s `text`, and the difference is what the two are for: a
 * directory is a page of avatars and a page of saturated circles is unreadable,
 * while a product has one logo on the screen and an app icon that is not filled
 * is not an app icon.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-(--_mp-accent)',
  outlined: 'border-mp-outline border bg-transparent text-(--_mp-accent)',
  text: 'text-mp-on-surface-variant bg-transparent'
};

/**
 * A product's mark, at a known size, that is never an empty box.
 *
 * ```tsx
 * <MPAppLogo name="Acme" shape="app" href="/" showName />
 * ```
 *
 * Four things can be the mark and exactly one of them is at a time: markup
 * handed to `children`, an image at `src`, the initials of `name` on a tile, or
 * — with no tile to put them on — the name itself, set as the logotype. The
 * last of those is the point of the component: a product that has not drawn a
 * logo yet still has one, and swapping it for the real file later is one prop.
 *
 * ## What it adds over an `<img>`
 *
 * The framing. A mark drawn as a bare glyph and a mark drawn with its own
 * background need opposite treatment, and which of the two a given file is
 * cannot be worked out from the file. So `shape` is a decision the caller makes
 * once and everything else follows: `bare` keeps the artwork's own proportions
 * and draws nothing behind it, `app` and `circle` inset it into a tile of the
 * page's own colour.
 *
 * ## The name is in the document exactly once
 *
 * Which element carries it depends on what the mark turned out to be. A
 * logotype *is* the name; an image can carry it as `alt`; a glyph and a pair of
 * initials say nothing at all, so those are the cases a clipped copy is for.
 * And whenever the words are drawn beside the mark, the mark becomes decoration
 * rather than a second reading of the same thing — "AC" read out is two
 * letters, not a product.
 *
 * ## What it does not carry
 *
 * No tagline, no version, no elevation. A logo with a line of text under it is
 * a logo next to an `MPTypography`, and a second spelling for that would give
 * the library two. Elevation is left out for a sharper reason: the prop moves
 * tone as well as shadow everywhere else it appears, and a logo tile's tone is
 * the accent — there is nothing for it to move to. An app icon is a sticker on
 * the page rather than a thing hovering over it.
 */
export const MPAppLogo = React.forwardRef<HTMLElement, MPAppLogoProps>(function MPAppLogo(
  {
    src,
    srcSet,
    alt,
    name,
    initials,
    showName = false,
    shape = 'bare',
    variant = 'filled',
    size: sizeProp,
    color: colorProp,
    padded = true,
    height,
    href,
    imageProps,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);

  const tile = shape !== 'bare';
  const artwork = hasContent(children) ? children : src ? 'image' : null;

  /*
   * How much of the tile the artwork is allowed to take.
   *
   * Stated as a share of the **artwork's** own size rather than as padding on
   * the tile, and that is the whole point: a percentage padding resolves against
   * the containing block's width, which here is the lockup — so the same icon
   * would be inset by 4px on its own and by 11px with the product's name beside
   * it, and the inset would grow with the length of the name. A percentage
   * height on the artwork resolves against the tile, which is the box it is
   * actually being held off the edges of, and it stays right at any `height`.
   */
  const inset = tile && padded;

  // With no artwork the name *is* the mark: the logotype on a bare logo, its
  // initials on a tile. Which of the two decides whether `showName` has anything
  // left to do — a bare logotype with the name drawn beside it is the name twice.
  const lettering = artwork === null;
  const logotype = lettering && !tile;
  const drawName = showName && !logotype && hasContent(name);

  const label = alt ?? name;
  const letters = initials ?? (name ? initialsOf(name) : '');

  const imageSpeaks = artwork === 'image' && !drawName && hasContent(label);
  const markSpeaks = logotype || imageSpeaks;
  const needsClippedName = !markSpeaks && !drawName && hasContent(label);

  const box = cssLength(height);
  const boxStyle = box ? { height: box, width: tile ? box : undefined } : null;

  const mark = (
    <span
      aria-hidden={markSpeaks ? undefined : true}
      className={[
        'mp-app-logo__mark flex shrink-0 items-center justify-center overflow-hidden',
        'font-semibold tracking-tight whitespace-nowrap',
        box ? '' : CONTROL_HEIGHT[size],
        tile
          ? [
              box ? '' : CONTROL_SQUARE[size],
              shape === 'circle' ? 'rounded-mp-full' : TILE_RADIUS[size],
              TILE_LETTER[size],
              SURFACE[variant]
            ]
              .filter(Boolean)
              .join(' ')
          : ['text-mp-on-surface w-auto', LOGOTYPE[size]].join(' '),
        // A glyph handed to `children` is drawn against the tile rather than
        // against a word, so it is sized off the box the way the letter is
        // rather than off the `1.2em` an icon riding on a label takes.
        '[&_svg]:w-auto [&_svg]:shrink-0',
        // Written out both ways rather than assembled, because Tailwind only
        // ever sees class names that appear literally in the source.
        inset ? '[&_svg]:h-[72%] [&_svg]:max-w-[72%]' : '[&_svg]:h-full [&_svg]:max-w-full'
      ]
        .filter(Boolean)
        .join(' ')}
      style={boxStyle ?? undefined}
    >
      {artwork === 'image' ? (
        <img
          src={src}
          srcSet={srcSet}
          // Empty rather than absent whenever the name is being said somewhere
          // else. `alt` left off is what makes a screen reader read the file
          // name out instead, which is the worst of the three options.
          alt={imageSpeaks ? (label ?? '') : ''}
          className={[
            'w-auto object-contain',
            inset ? 'h-[72%] max-w-[72%]' : 'h-full max-w-full'
          ].join(' ')}
          // Before the spread, so a caller can still say otherwise. Never
          // `loading="lazy"` here: a logo is the top of the page by
          // construction, and deferring it defers the thing a reader looks at
          // first.
          decoding="async"
          {...imageProps}
        />
      ) : (
        (artwork ?? (logotype ? name : letters))
      )}
    </span>
  );

  return useRender({
    render: render ?? (href ? <a /> : <span />),
    ref,
    props: {
      href,
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: [
        'mp-app-logo inline-flex max-w-full min-w-0 items-center align-middle',
        'text-mp-on-surface no-underline select-none',
        CONTROL_GAP[size],
        href ? 'rounded-mp-xs cursor-pointer' : '',
        href
          ? 'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid outline-none'
          : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      style: { ...accentSlots(color), ...style },
      children: (
        <React.Fragment>
          {mark}

          {drawName ? (
            <span className={`mp-app-logo__name min-w-0 truncate font-semibold ${LOGOTYPE[size]}`}>
              {name}
            </span>
          ) : null}

          {needsClippedName ? <span className={VISUALLY_HIDDEN}>{label}</span> : null}
        </React.Fragment>
      ),
      ...props
    }
  });
});
