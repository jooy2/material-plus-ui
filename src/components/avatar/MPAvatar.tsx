import * as React from 'react';
import { Avatar as BaseUIAvatar } from '@base-ui/react/avatar';
import { accentSlots } from '../../internal/accent';
import { CONTROL_SQUARE, hasContent } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPColor, MPSize, MPVariant } from '../../types';

/** What Base UI reports about the picture as it loads. */
export type MPAvatarLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * The crop.
 *
 * `circle` is the default and is what Material draws: MD3's avatar is a circle,
 * and a round crop is what a portrait has been for as long as there have been
 * portraits.
 *
 * `square` cuts the corners off instead, which is what a logo or a repository
 * icon wants — those are drawn to the edges of a rectangle and a round crop eats
 * them.
 */
export type MPAvatarShape = 'circle' | 'square';

export interface MPAvatarProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  /**
   * The picture. Until it loads — and forever, if it fails — the fallback is
   * what is drawn, so an avatar is never an empty box.
   */
  src?: string;
  /** Candidate images at other resolutions, as on any `<img>`. */
  srcSet?: string;
  /**
   * What the picture says, for a reader who cannot see it. Defaults to `name`,
   * and to nothing at all when there is no name — an avatar next to the person's
   * own name in the row is decoration, and reading it out says the name twice.
   */
  alt?: string;
  /**
   * Who or what this is. One prop doing three jobs: it names the picture, the
   * initials are derived from it, and it is the sentence a screen reader hears
   * instead of those initials.
   *
   * The initials are the first character of the first word plus the first
   * character of the last — "Jane Doe" is `JD`, "홍길동" is `홍`. That rule is
   * wrong for some names, which is what `initials` is for.
   */
  name?: string;
  /** The initials, written out, for when the rule derived the wrong ones. */
  initials?: string;
  /**
   * The crop.
   * @default 'circle'
   */
  shape?: MPAvatarShape;
  /**
   * How much surface is painted behind the fallback. Invisible once a picture
   * has loaded, apart from the edge `outlined` keeps.
   *
   * `tonal` is the default because it is what MD3 draws a monogram on: the
   * container tone of the accent family, with the matching `on-` ink. A page of
   * `filled` avatars is a page of saturated circles nobody can read a name off.
   * @default 'tonal'
   */
  variant?: MPVariant;
  /**
   * The box the picture is drawn in — the control heights, so an avatar and the
   * button beside it in a toolbar are the same height.
   * @default 'md'
   */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
  /**
   * How long to wait before drawing the fallback, in milliseconds. Set it to
   * roughly the time a cached image takes and the initials stop flashing up in
   * front of a picture that was about to arrive anyway.
   */
  delay?: number;
  /** Anything else the `<img>` needs — `loading`, `crossOrigin`, `referrerPolicy`. */
  imageProps?: Omit<React.ComponentPropsWithoutRef<'img'>, 'src' | 'srcSet' | 'alt'>;
  /** Called as the picture moves between `idle`, `loading`, `loaded` and `error`. */
  onLoadingStatusChange?: (status: MPAvatarLoadingStatus) => void;
  /**
   * The fallback, drawn instead of the initials. An icon, a logo, a single emoji
   * — whatever stands in for this particular thing when there is no picture of
   * it.
   */
  children?: React.ReactNode;
}

/**
 * The initials, sized off the box rather than off the row.
 *
 * Its own ladder and not `CONTROL_TEXT`, because a control's label is measured
 * against the words next to it and this one is measured against the circle
 * around it: roughly 40% of the diameter at every step, which is where two
 * characters fill the width without touching the edge. The steps are still
 * Material roles rather than interpolated sizes — the rule the whole library
 * follows.
 */
const INITIALS_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-large',
  md: 'text-mp-title-large',
  lg: 'text-mp-headline-small',
  xl: 'text-mp-headline-medium'
};

/**
 * The corner of a squared avatar.
 *
 * A shape statement rather than a fraction of the box: MD3's corner sizes are
 * absolute, and `corner-medium` on a 56px avatar is the same 12px it is on a
 * dropzone. It stops climbing at `md` because past 12px on a square box the
 * corners meet and the `shape` prop stops having two values.
 */
const SQUARE_RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-sm',
  md: 'rounded-mp-md',
  lg: 'rounded-mp-md',
  xl: 'rounded-mp-md'
};

/**
 * The five weights. An avatar *is* the thing being coloured, so — as on chip and
 * badge — its container takes the tint rather than staying neutral.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-(--_mp-accent)',
  outlined: 'border-mp-outline border bg-transparent text-(--_mp-accent)',
  text: 'text-mp-on-surface-variant bg-transparent'
};

/**
 * The default fallback: a shoulders-and-head silhouette, drawn here rather than
 * taken from the icon set because an avatar's silhouette has to fill its circle
 * edge to edge and a lucide glyph is drawn with a stroke and a margin.
 *
 * It exists so that `<MPAvatar />` with nothing at all is still an avatar. A box
 * with no picture, no name and no glyph in it is indistinguishable from a
 * component that failed to render.
 */
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[60%]">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
      <path d="M12 14.25c-4.28 0-7.75 2.42-7.75 5.4 0 .75.6 1.35 1.35 1.35h12.8c.75 0 1.35-.6 1.35-1.35 0-2.98-3.47-5.4-7.75-5.4Z" />
    </svg>
  );
}

/**
 * The first character of the first word, plus the first of the last.
 *
 * `Array.from` rather than `[0]`, so a name that starts with an emoji or with
 * any character outside the basic plane is not cut in half between its two code
 * units. `normalize('NFC')` first, so a name whose accents arrived decomposed —
 * which is what a macOS filename and a good many APIs hand you — yields `Ä`
 * rather than a bare `A`.
 *
 * One word gives one character on purpose. Korean, Japanese and Chinese names
 * are a single token, and two of their characters at 32px is a smudge where one
 * is a name.
 */
function initialsOf(name: string): string {
  const words = name.normalize('NFC').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';

  return (first + last).toLocaleUpperCase();
}

/**
 * A picture of a person or a thing, at a known size, that is never an empty box.
 *
 * Three things can be drawn in it and exactly one of them is at a time: the
 * picture, if `src` is given and loads; otherwise whatever stands in for it —
 * `children`, or `initials`, or the initials derived from `name`; and failing
 * all of those, a silhouette. Which one is showing is Base UI's `Avatar` to
 * decide, because "has the image loaded" is a question with four answers and a
 * race in the middle of it.
 *
 * It carries no status dot of its own. An avatar with a green mark on it is an
 * `MPBadge` with an avatar in it, and inventing a second spelling for that would
 * give the library two of them.
 */
export const MPAvatar = React.forwardRef<HTMLSpanElement, MPAvatarProps>(function MPAvatar(
  {
    src,
    srcSet,
    alt,
    name,
    initials,
    shape = 'circle',
    variant = 'tonal',
    size = 'md',
    color = 'primary',
    delay,
    imageProps,
    onLoadingStatusChange,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const derived = name ? initialsOf(name) : '';
  const label = alt ?? name;

  // `children` beats the initials beats the silhouette. Only the last of the
  // three has nothing to say, which is what decides whether the fallback needs
  // the name spelled out beside it.
  const stand = hasContent(children) ? children : (initials ?? derived) || <PersonIcon />;
  const speaks = hasContent(children) || Boolean(initials ?? derived);

  const classNames = [
    'mp-avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden',
    'align-middle leading-none font-medium whitespace-nowrap select-none',
    CONTROL_SQUARE[size],
    INITIALS_TEXT[size],
    shape === 'circle' ? 'rounded-mp-full' : SQUARE_RADIUS[size],
    SURFACE[variant],
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseUIAvatar.Root
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      className={classNames}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {src ? (
        <BaseUIAvatar.Image
          src={src}
          srcSet={srcSet}
          // Empty rather than absent: an avatar beside the person's own name is
          // decoration, and `alt` left off is what makes a screen reader read
          // the file name out instead.
          alt={label ?? ''}
          className="size-full object-cover"
          onLoadingStatusChange={onLoadingStatusChange}
          {...imageProps}
        />
      ) : null}

      <BaseUIAvatar.Fallback
        delay={src ? delay : undefined}
        className="flex size-full items-center justify-center"
      >
        {/* `JD` read out loud is two letters, not a person. When there is a name
            it becomes the fallback's accessible name and the initials are left
            as the picture they are standing in for. */}
        {label && speaks ? <span className={VISUALLY_HIDDEN}>{label}</span> : null}
        <span aria-hidden={label && speaks ? true : undefined} className="contents">
          {stand}
        </span>
      </BaseUIAvatar.Fallback>
    </BaseUIAvatar.Root>
  );
});
