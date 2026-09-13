import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { MPIcon } from '../icon/MPIcon';
import { BrokenImageIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { FADE, PORTAL_LAYER, SCRIM } from '../../internal/surface';
import { useMPSize } from '../../internal/config';
import type { MPSize } from '../../types';

/** How the picture is fitted into the box it was given. CSS's own words. */
export type MPImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/** What the picture is doing right now. */
export type MPImageState = 'loading' | 'loaded' | 'error';

/** A picture that stands in while the real one arrives. */
export interface MPImagePlaceholder {
  /**
   * A URL, a data URI, or a `Blob` such as a file the reader has just picked.
   *
   * A `Blob` is drawn through an object URL made for it, so keep the same Blob
   * from one render to the next: a new one on every render makes a new URL on
   * every render, and each of those renders again.
   */
  src: string | Blob;
  /**
   * Blurs the stand-in. `true` is a 20px radius, and a number is a radius in
   * pixels.
   * @default false
   */
  blur?: boolean | number;
}

/** A turn in degrees, clockwise, a quarter at a time. */
export type MPImageRotate = 0 | 90 | 180 | 270;

/** Which way the picture is mirrored, along the axes it is shown on. */
export type MPImageFlip = 'none' | 'horizontal' | 'vertical' | 'both';

/**
 * The part of the picture a crop keeps, in `object-position`'s words: the
 * centre, a side, a corner, or two percentages across and down.
 */
export type MPImagePosition =
  | 'center'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'
  | `${number}% ${number}%`;

export interface MPImageProps extends Omit<React.ComponentPropsWithoutRef<'img'>, 'onError'> {
  /** Where the picture is. */
  src?: string;
  /**
   * What the picture says, for a reader who cannot see it.
   *
   * Required, and the one prop here that is — for the reason `MPIconButton`'s
   * `label` is required: a picture with no text alternative is the single most
   * common accessibility defect a component library can help with, and the help
   * is refusing to compile without one. Pass `alt=""` for a picture that is
   * decoration, which is a claim rather than an omission.
   */
  alt: string;
  /**
   * The proportion the box holds, written the way CSS writes it — a number
   * (`1.5`) or a ratio (`'16 / 9'`).
   *
   * Left out, the box is whatever the picture turns out to be, and the page
   * **reflows** when it arrives. Giving a ratio is what reserves the room.
   */
  ratio?: number | string;
  /**
   * How the picture is fitted into that box. `scale-down` is `contain` that
   * never enlarges a file smaller than the box.
   * @default 'cover'
   */
  fit?: MPImageFit;
  /**
   * The width of the file, or of the box when it is given without `height`.
   *
   * With `height` as well, the two are the file's size in pixels, as on an
   * `<img>`, and they reserve its proportion. Alone, it makes the box that wide,
   * no wider than its container, and as tall as the picture or `ratio` makes
   * it. A number or a string of digits is pixels, and any other string is a CSS
   * length.
   */
  width?: number | string;
  /**
   * The height of the file, or of the box when it is given without `width`.
   *
   * With `width` as well, the two are the file's size in pixels. Alone, it makes
   * the box that tall and as wide as its container, or as wide as `ratio` makes
   * it when there is one. A number or a string of digits is pixels, and any
   * other string is a CSS length.
   */
  height?: number | string;
  /**
   * Drawn while the picture is on its way.
   *
   * A shimmer by default, on the surface the box sits on. `false` draws nothing,
   * which is what a picture inside something that already has its own loading
   * treatment wants.
   *
   * `{ src, blur }` draws a picture instead: a small copy of the file, a data
   * URI or a `Blob`, fitted, placed, turned and mirrored like the picture, and
   * blurred if `blur` says so. It gives way once the picture has faded in over
   * it. Like the shimmer, it fills the box, so the box needs a reserved size: a
   * `ratio`, or both `width` and `height`.
   */
  placeholder?: React.ReactNode | false | MPImagePlaceholder;
  /**
   * Drawn instead of the picture when it does not arrive.
   *
   * A broken-picture glyph on a neutral surface by default. This is the prop
   * that makes the component worth having: a bare `<img>` whose `src` 404s draws
   * the browser's own broken-image mark, which is different in every browser and
   * belongs to none of them.
   */
  fallback?: React.ReactNode;
  /**
   * Opens the picture over a scrim when it is pressed.
   *
   * The box becomes a button, so it is reachable by keyboard and says what it
   * does. Off by default: most pictures on a page are not worth opening, and one
   * that silently became pressable would be a control nobody declared.
   * @default false
   */
  preview?: boolean;
  /**
   * What the preview loads, when that is not `src` — the full-resolution file
   * behind a thumbnail.
   * @default src
   */
  previewSrc?: string;
  /** The label on the button `preview` turns the box into. */
  previewLabel?: string;
  /**
   * Called when the state changes, for a caller that wants to know.
   *
   * **This is the signal to use, not `onLoad`.** `onLoad` is the `<img>`'s own
   * event and is passed straight through, so it does not fire for a picture the
   * browser already has: the load has been and gone before React attached
   * anything, which is the whole reason this component exists. `onStateChange`
   * is reported from the `complete` check as well as from the event, so it
   * arrives either way.
   */
  onStateChange?: (state: MPImageState) => void;
  /**
   * Turns the picture clockwise, in quarter turns.
   *
   * Only quarters, because a picture turned by any other angle stops covering
   * its box, and filling the corners would mean enlarging it by an amount the
   * caller would then want to tune. A quarter turn swaps the box's proportion:
   * `width` and `height`, when both are given, are read as the file's size and
   * reserve the turned shape, and without them the shape is read from the file
   * once it arrives. An explicit `ratio` is the layout's shape and is kept.
   *
   * Drawn with the `rotate` property rather than `transform`, so a `transform`
   * of your own, such as a hover zoom, still applies on top.
   * @default 0
   */
  rotate?: MPImageRotate;
  /**
   * Mirrors the picture along the axes it is shown on.
   *
   * `horizontal` swaps left and right on the screen whether or not the picture
   * is turned. Drawn with the `scale` property, so it leaves `transform` free as
   * `rotate` does, and `preview` opens the picture mirrored.
   * @default 'none'
   */
  flip?: MPImageFlip;
  /**
   * Which part of the picture a `cover` crop keeps, and where `contain`, `none`
   * and `scale-down` leave their empty space.
   *
   * Read on the picture as it is shown, so `top` keeps the top of a picture
   * that has been turned or mirrored. Physical rather than logical: the subject
   * of a photograph does not move to the other side on a right-to-left page. A
   * value in any other form reaches `object-position` as written.
   * @default 'center'
   */
  position?: MPImagePosition;
  /**
   * What fills the room `fit` leaves around the picture.
   *
   * `blur` draws the same picture behind itself, covering the box and blurred,
   * the way a video player fills the sides of a portrait clip. It reuses the
   * picture's request, and it is drawn only for a `fit` that can leave room:
   * `contain`, `none` and `scale-down`. Any other string is a CSS `background`
   * painted behind the picture: a colour, a custom property or a gradient.
   * @default 'none'
   */
  letterbox?: 'none' | 'blur' | (string & {});
  /**
   * Loads this picture first: the one a page is judged by, which is usually its
   * Largest Contentful Paint.
   *
   * Sets `loading="eager"` and a high fetch priority. A `loading` or
   * `fetchPriority` of your own still wins. Give it to one picture per page: a
   * high priority on every picture raises none of them above the others.
   * @default false
   */
  priority?: boolean;
  /** The corner and type scale of the placeholder and the fallback. @default 'md' */
  size?: MPSize;
}

/** The size of a file, in its own pixels. */
interface PictureSize {
  width: number;
  height: number;
}

/** The state, and the file's size once it has arrived, written in one update. */
interface Progress {
  state: MPImageState;
  natural?: PictureSize;
}

const FIT: Record<MPImageFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down'
};

/**
 * A picture on its side, laid out at the box's height by the box's width and
 * then turned into place.
 *
 * `object-fit` fits the element's own box, so the element has to have the
 * turned proportion before it is turned. The container units read the wrapper,
 * which is a size container only while this applies. `max-width: none` undoes
 * the `max-width: 100%` most resets put on an `<img>`: on a tall box that cap is
 * shorter than the length the turned picture needs.
 */
const SIDEWAYS: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100cqh',
  height: '100cqw',
  maxWidth: 'none',
  translate: '-50% -50%'
};

/**
 * The attribute name for an `<img>`'s fetch priority, spelled the way the running
 * React writes it.
 *
 * React 19 knows it as `fetchPriority` and warns about the lowercase form. React
 * 18 does not know it: it warns about the camel-case form, though it writes the
 * attribute either way, and passes the lowercase one through without a word.
 * The version is parsed the way `internal/inert.ts` parses it, so a canary whose
 * major does not read as a number takes the modern spelling.
 */
const reactMajor = Number.parseInt(React.version, 10);
const FETCH_PRIORITY =
  !Number.isFinite(reactMajor) || reactMajor === 0 || reactMajor >= 19
    ? 'fetchPriority'
    : 'fetchpriority';

/** What `priority` sets, before the caller's own attributes. */
const PRIORITY = {
  loading: 'eager',
  [FETCH_PRIORITY]: 'high'
} as React.ImgHTMLAttributes<HTMLImageElement>;

/** The blur radius of the `blur` letterbox, in pixels. */
const LETTERBOX_BLUR = 24;

/** The blur radius of a picture placeholder given `blur: true`, in pixels. */
const PLACEHOLDER_BLUR = 20;

/**
 * Whether `placeholder` is a picture rather than something to render: an object
 * that is not an element and has a `src`.
 */
function isPicturePlaceholder(value: unknown): value is MPImagePlaceholder {
  return (
    typeof value === 'object' && value !== null && !React.isValidElement(value) && 'src' in value
  );
}

/**
 * The URL a picture placeholder is drawn from.
 *
 * A string is used as it is. A `Blob` needs an object URL, which is created in
 * an effect and revoked in its cleanup: created during render, it would leak
 * whenever React threw that render away. The URL is kept together with the Blob
 * it was made for, and handed out only while that Blob is still the one given,
 * so a new Blob never draws the previous one's URL for a render.
 */
function usePlaceholderUrl(source: string | Blob | undefined): string | undefined {
  const [objectUrl, setObjectUrl] = React.useState<{ blob: Blob; url: string }>();

  React.useEffect(() => {
    if (source === undefined || typeof source === 'string') {
      return undefined;
    }

    const url = URL.createObjectURL(source);

    // State set from an effect on purpose: the object URL is the outside
    // resource this effect creates and releases, and rendering has to wait for
    // it.
    setObjectUrl({ blob: source, url });

    return () => URL.revokeObjectURL(url);
  }, [source]);

  if (source === undefined || typeof source === 'string') {
    return source;
  }

  return objectUrl?.blob === source ? objectUrl.url : undefined;
}

/**
 * A layer drawn under the picture, grown past the box by `margin` on every side.
 *
 * A blur fades to transparent over about two radii at the element's edge, so a
 * blurred layer the size of the box would let the page show through around its
 * rim. Grown by that much, the fade falls outside the box, and the box's
 * `overflow: hidden` clips it.
 */
function underlay(margin: number, sideways: boolean): React.CSSProperties {
  const grow = `${margin * 2}px`;

  return sideways
    ? { ...SIDEWAYS, width: `calc(100cqh + ${grow})`, height: `calc(100cqw + ${grow})` }
    : {
        position: 'absolute',
        top: -margin,
        left: -margin,
        width: `calc(100% + ${grow})`,
        height: `calc(100% + ${grow})`,
        maxWidth: 'none'
      };
}

/**
 * Any number, as the nearest quarter turn: `-90` is `270`, `450` is `90`, and a
 * value that is not a finite number is no turn at all.
 */
function quarterTurn(rotate: number | undefined): MPImageRotate {
  if (rotate === undefined || !Number.isFinite(rotate)) {
    return 0;
  }

  return ((((Math.round(rotate / 90) % 4) + 4) % 4) * 90) as MPImageRotate;
}

/**
 * The `rotate` and `scale` a picture is drawn with.
 *
 * The individual transform properties apply translate, then rotate, then scale,
 * so the scale acts on the element before it is turned. On a quarter turn the
 * element's axes are the screen's swapped, and so are the two scale factors: a
 * mirror lands on the screen axis the caller named.
 */
function orientation(turn: MPImageRotate, flip: MPImageFlip): React.CSSProperties {
  const across = flip === 'horizontal' || flip === 'both';
  const down = flip === 'vertical' || flip === 'both';
  const [x, y] = turn === 90 || turn === 270 ? [down, across] : [across, down];

  return {
    ...(turn ? { rotate: `${turn}deg` } : null),
    ...(x || y ? { scale: `${x ? -1 : 1} ${y ? -1 : 1}` } : null)
  };
}

/** Where each side keyword puts the point: which axis, and how far along it. */
const SIDES = new Map<string, readonly [axis: 0 | 1, at: number]>([
  ['left', [0, 0]],
  ['right', [0, 1]],
  ['top', [1, 0]],
  ['bottom', [1, 1]]
]);

/**
 * `position` on the picture as shown, rewritten for the element's own frame.
 *
 * `object-position` places the picture inside the element before the element is
 * turned or mirrored, so `top` on a picture turned upside down would keep what
 * ends up at the bottom. The point is read as fractions across and down, the
 * mirror is undone first because it applies on the screen's axes after the
 * turn, and then each clockwise quarter is undone in turn. The result is written
 * as percentages, which every engine serialises the same way.
 *
 * A value this cannot read, such as one with a length in it, is returned as
 * written for the browser to interpret.
 */
function objectPosition(position: string, turn: MPImageRotate, flip: MPImageFlip): string {
  const words = position.trim().split(/\s+/);
  const point = [0.5, 0.5];
  const named = [false, false];

  if (words.length > 2) {
    return position;
  }

  for (const [index, word] of words.entries()) {
    if (word === 'center') {
      continue;
    }

    // A side names its own axis; a percentage is across first and down second.
    const side = SIDES.get(word);
    const percentage = /^(-?\d*\.?\d+)%$/.exec(word);
    const axis = side ? side[0] : index;
    const at = side ? side[1] : percentage ? Number(percentage[1]) / 100 : undefined;

    if (at === undefined || named[axis]) {
      return position;
    }

    point[axis] = at;
    named[axis] = true;
  }

  let [across, down] = point;

  if (flip === 'horizontal' || flip === 'both') {
    across = 1 - across;
  }

  if (flip === 'vertical' || flip === 'both') {
    down = 1 - down;
  }

  for (let quarter = 0; quarter < turn / 90; quarter++) {
    [across, down] = [down, 1 - across];
  }

  const percent = (fraction: number) => `${Math.round(fraction * 10000) / 100}%`;

  return `${percent(across)} ${percent(down)}`;
}

/** A `width` or `height` in pixels: a number, or a string of digits. */
function pixels(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  return value !== undefined && /^\d+$/.test(value.trim()) ? Number(value) : undefined;
}

/** A lone `width` or `height` as the box's size: pixels, or the length as written. */
function boxLength(value: number | string): string {
  const px = pixels(value);

  return px === undefined ? String(value) : `${px}px`;
}

/**
 * The box a preview on its side is drawn in.
 *
 * A content-sized `<img>` cannot be turned in place, because its box keeps the
 * unturned shape. So the preview gets a box of the turned shape, as large as the
 * popup allows and no larger than the file, and the picture is laid out inside
 * it the way the thumbnail is. `shown` is the preview's own file once it has
 * loaded. Before that the proportion comes from the thumbnail, and so does the
 * pixel cap when the two are the same file. With nothing known the box is
 * square.
 */
function turnedPreviewBox(
  shown: PictureSize | undefined,
  thumbnail: PictureSize | undefined,
  sameFile: boolean
): React.CSSProperties {
  const shape = shown ?? thumbnail;
  const cap = shown ?? (sameFile ? thumbnail : undefined);

  if (!shape) {
    return { aspectRatio: '1', width: 'min(100%, 100cqh)', containerType: 'size' };
  }

  const across = shape.height;
  const down = shape.width;
  const limit = cap ? `${cap.height}px, ` : '';

  return {
    aspectRatio: `${across} / ${down}`,
    width: `min(100%, ${limit}calc(100cqh * ${across} / ${down}))`,
    containerType: 'size'
  };
}

/** The size of a loaded `<img>`, or nothing for a file that has none. */
function naturalSize(node: HTMLImageElement): PictureSize | undefined {
  return node.naturalWidth > 0 && node.naturalHeight > 0
    ? { width: node.naturalWidth, height: node.naturalHeight }
    : undefined;
}

/**
 * A picture that says what it is doing.
 *
 * ```tsx
 * <MPImage src={photo} alt="The east face at dawn" ratio="16 / 9" preview />
 * ```
 *
 * A bare `<img>` has three states and shows two of them badly. While it is on
 * its way there is a hole the size of nothing, and the page jumps when it lands;
 * when it fails there is the browser's own broken-image mark, which is different
 * in every browser and belongs to none of them. This draws a placeholder for the
 * first and a fallback for the second, and `ratio` reserves the room so that
 * neither one moves the page.
 *
 * ## The cached case is the one that breaks
 *
 * An image already in the cache fires `load` **before** React attaches the
 * handler, so a component that only listened would sit on its placeholder
 * forever — and the picture behind it would be fully drawn the whole time. The
 * `complete` flag is checked on mount for exactly that, which is why this is a
 * component rather than three lines of `useState` at a call site.
 *
 * ## `alt` is required
 *
 * For the reason `MPIconButton`'s `label` is: a picture with no text alternative
 * is the most common accessibility defect a library can actually help with, and
 * the help is refusing to compile. `alt=""` is the way to say *decoration*,
 * which is a claim somebody made rather than a prop somebody forgot.
 *
 * ## What it is not
 *
 * Not a gallery. `preview` opens **this** picture and nothing else — a lightbox
 * that walked between images would need to know which images, in what order, and
 * that is a component holding a collection rather than a picture.
 *
 * Not a `next/image`. There is no `srcset` generation, no loader and no format
 * negotiation: those belong to whatever is serving the file, and a library that
 * guessed at them would be guessing about somebody else's CDN. `srcSet` and
 * `sizes` pass straight through to the `<img>`.
 */
export const MPImage = React.forwardRef<HTMLImageElement, MPImageProps>(function MPImage(
  {
    src,
    alt,
    ratio,
    fit = 'cover',
    placeholder,
    fallback,
    preview = false,
    previewSrc,
    previewLabel,
    onStateChange,
    rotate,
    flip = 'none',
    position = 'center',
    letterbox = 'none',
    priority = false,
    size: sizeProp,
    className,
    style,
    width,
    height,
    onLoad,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale();
  const messages = useMPMessages(COMMON, locale);

  const standIn = isPicturePlaceholder(placeholder) ? placeholder : undefined;
  const standInUrl = usePlaceholderUrl(standIn?.src);

  const [progress, setProgress] = React.useState<Progress>({ state: src ? 'loading' : 'error' });
  const [previewNatural, setPreviewNatural] = React.useState<PictureSize & { src?: string }>();
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const { state, natural } = progress;

  const report = React.useCallback(
    (next: MPImageState, node?: HTMLImageElement) => {
      // Read here rather than in a second update, so a load costs one render.
      const measured = next === 'loaded' && node ? naturalSize(node) : undefined;

      setProgress((current) => {
        if (
          current.state === next &&
          current.natural?.width === measured?.width &&
          current.natural?.height === measured?.height
        ) {
          return current;
        }

        if (current.state !== next) {
          onStateChange?.(next);
        }

        return { state: next, natural: measured };
      });
    },
    [onStateChange]
  );

  // A new `src` starts again. Written as a render-time reset rather than an
  // effect so the old picture is never shown for a frame under the new source's
  // placeholder.
  const [lastSrc, setLastSrc] = React.useState(src);

  if (src !== lastSrc) {
    setLastSrc(src);
    setProgress({ state: src ? 'loading' : 'error' });
  }

  React.useEffect(() => {
    const node = imageRef.current;

    if (!node || !src) {
      return;
    }

    /*
     * The whole reason this is a component.
     *
     * An image already in the cache is `complete` before React has attached
     * anything, so its `load` event has been and gone. A component that only
     * listened would hold its placeholder over a picture that is already drawn,
     * and it would do it on every second page view — the one case nobody tests
     * because the first view works.
     *
     * `naturalWidth` is what tells the two kinds of `complete` apart: a finished
     * image has a width, and one that failed is also `complete` and has none.
     */
    if (node.complete) {
      report(node.naturalWidth > 0 ? 'loaded' : 'error', node);
    }
  }, [src, report]);

  const turn = quarterTurn(rotate);
  const sideways = turn === 90 || turn === 270;
  const oriented = orientation(turn, flip);
  const placed: React.CSSProperties =
    position === 'center' ? {} : { objectPosition: objectPosition(position, turn, flip) };

  /*
   * `width` and `height` together are the file's size, as they are on an
   * `<img>`. One of them alone is the size of the box on that axis.
   */
  const both = width !== undefined && height !== undefined;
  const loneWidth = width !== undefined && !both ? boxLength(width) : undefined;
  const loneHeight = height !== undefined && !both ? boxLength(height) : undefined;
  const declaredWidth = both ? pixels(width) : undefined;
  const declaredHeight = both ? pixels(height) : undefined;
  const declared =
    declaredWidth && declaredHeight ? { width: declaredWidth, height: declaredHeight } : undefined;
  // What the file is known to measure: what the caller said, or what arrived.
  const file = declared ?? natural;

  /*
   * The box a picture on its side needs.
   *
   * The picture is taken out of the flow, so nothing inside the box gives it a
   * height any more. An explicit `ratio` is the layout's shape and stays; failing
   * that, the file's own proportion is written turned, from the declared size
   * or, once it has loaded, from the file itself. A lone `height` has already
   * fixed the box, and a proportion as well would recompute its width.
   */
  const boxRatio =
    sideways && ratio === undefined && file && loneHeight === undefined
      ? `${file.height} / ${file.width}`
      : ratio;

  const showing = state === 'loaded';

  const defaultFallback = (
    <div
      className={[
        'bg-mp-surface-container text-mp-on-surface-variant',
        'flex size-full items-center justify-center'
      ].join(' ')}
    >
      <MPIcon icon={BrokenImageIcon} size={24} />
    </div>
  );

  const defaultPlaceholder = (
    <div
      className={[
        'bg-mp-surface-container-high size-full',
        'motion-safe:animate-pulse motion-reduce:animate-none'
      ].join(' ')}
    />
  );

  const fade = [
    // Held rather than hidden: the element has to stay in the layout for the
    // browser to fetch it, and `display: none` on an `<img>` is a fetch some
    // browsers will skip.
    showing ? 'opacity-100' : 'opacity-0',
    'transition-opacity duration-(--mp-sys-motion-duration-short4)'
  ].join(' ');

  // When the picture is fetched and how urgently, which the letterbox copy
  // shares so that it waits for, and hurries, the same request.
  const loading = props.loading ?? (priority ? 'eager' : undefined);
  const fetchPriority = props.fetchPriority ?? (priority ? 'high' : undefined);

  // Only a fit that can leave room around the picture has room to fill.
  const blurred =
    letterbox === 'blur' && (fit === 'contain' || fit === 'none' || fit === 'scale-down');
  const painted = letterbox !== 'none' && letterbox !== 'blur' ? letterbox : undefined;

  // A stand-in has nothing to stand in for once the file has failed.
  const standing = Boolean(standInUrl) && state !== 'error';
  const standInBlur =
    standIn?.blur === true
      ? PLACEHOLDER_BLUR
      : typeof standIn?.blur === 'number' && Number.isFinite(standIn.blur)
        ? Math.max(0, standIn.blur)
        : 0;

  const picture = (
    <>
      {blurred ? (
        /*
         * The same picture, covering the box behind itself.
         *
         * Given exactly what the picture loads from, so the browser reuses the
         * one request rather than fetching the file twice. Hidden from assistive
         * technology and from the pointer: a right-click on the empty area does
         * not offer to save a copy nobody can see is there.
         */
        <img
          {...(fetchPriority ? { [FETCH_PRIORITY]: fetchPriority } : null)}
          src={src}
          srcSet={props.srcSet}
          sizes={props.sizes}
          loading={loading}
          decoding={props.decoding}
          crossOrigin={props.crossOrigin}
          referrerPolicy={props.referrerPolicy}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`pointer-events-none select-none object-cover ${fade}`}
          style={{
            ...oriented,
            ...placed,
            filter: `blur(${LETTERBOX_BLUR}px)`,
            ...underlay(LETTERBOX_BLUR * 2, sideways)
          }}
        />
      ) : null}

      {standing ? (
        <img
          src={standInUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`pointer-events-none select-none ${FIT[fit]}`}
          style={{
            ...oriented,
            ...placed,
            ...(standInBlur ? { filter: `blur(${standInBlur}px)` } : null),
            ...underlay(standInBlur * 2, sideways),
            /*
             * Gone in one step once the picture has finished fading in over it.
             * Fading the two against each other would leave both half
             * transparent in the middle, and the page would show through.
             */
            ...(showing
              ? {
                  opacity: 0,
                  transition: 'opacity 0ms linear var(--mp-sys-motion-duration-short4)'
                }
              : null)
          }}
        />
      ) : null}

      <img
        {...(priority ? PRIORITY : null)}
        {...props}
        ref={(node) => {
          imageRef.current = node;

          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        src={src}
        alt={alt}
        width={both ? width : undefined}
        height={both ? height : undefined}
        // A block, because an inline `<img>` sits on a line box that keeps room
        // below it for descenders, and a box with no ratio would end that far
        // below the picture on a page without a reset.
        className={`block size-full ${FIT[fit]} ${fade}`}
        style={{
          ...oriented,
          ...placed,
          // An absolutely positioned layer before it would otherwise paint over
          // it, whatever the order in the document.
          ...(blurred || standing ? { position: 'relative' } : null),
          ...(sideways ? SIDEWAYS : null)
        }}
        onLoad={(event) => {
          report('loaded', event.currentTarget);
          onLoad?.(event);
        }}
        onError={() => report('error')}
      />

      {state === 'loading' && placeholder !== false && !standIn ? (
        <span aria-hidden="true" className="absolute inset-0">
          {(placeholder as React.ReactNode) ?? defaultPlaceholder}
        </span>
      ) : null}

      {state === 'error' ? (
        <span className="absolute inset-0">{fallback ?? defaultFallback}</span>
      ) : null}
    </>
  );

  const boxClass = ['mp-image relative block overflow-hidden', className ?? '']
    .filter(Boolean)
    .join(' ');
  const boxStyle = {
    aspectRatio: boxRatio,
    /*
     * A lone `width` narrows the box, and a lone `height` narrows it too when a
     * ratio turns that height into a width. Either way the box is no wider than
     * its container. The box is also the preview's button, so the focus ring
     * follows it.
     */
    ...(loneWidth !== undefined ? { width: loneWidth, maxWidth: '100%' } : null),
    ...(loneHeight !== undefined ? { height: loneHeight } : null),
    ...(loneHeight !== undefined && ratio !== undefined
      ? { width: 'auto', maxWidth: '100%' }
      : null),
    // Only while the picture is on its side: size containment changes how the
    // box is measured, and nothing else needs it.
    ...(sideways ? { containerType: 'size' } : null),
    ...(painted !== undefined ? { background: painted } : null),
    ...style
  } as React.CSSProperties;

  // The preview's own file, which is not the thumbnail's when `previewSrc` is set.
  const full = previewSrc ?? src;
  const previewKnown = previewNatural?.src === full ? previewNatural : undefined;

  const recordPreview = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const measured = naturalSize(event.currentTarget);

    if (
      measured &&
      (measured.width !== previewKnown?.width || measured.height !== previewKnown?.height)
    ) {
      setPreviewNatural({ ...measured, src: full });
    }
  };

  if (!preview) {
    return (
      <span data-mp-size={size} data-mp-state={state} className={boxClass} style={boxStyle}>
        {picture}
      </span>
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        data-mp-size={size}
        data-mp-state={state}
        // A failed picture is not worth opening, so the trigger refuses rather
        // than presenting a scrim over a broken-image glyph.
        disabled={state === 'error'}
        aria-label={(previewLabel ?? alt) || messages.open}
        className={[
          boxClass,
          // A button is as wide as its contents, where the box without `preview`
          // fills its container. Filled here too, the two are the same width,
          // and a picture on its side, which lends the button no width at all,
          // does not collapse it. A lone `width` still narrows it inline.
          'w-full',
          'outline-mp-secondary cursor-zoom-in appearance-none border-0 bg-transparent p-0',
          'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default',
          'outline-none'
        ]
          .filter(Boolean)
          .join(' ')}
        style={boxStyle}
      >
        {picture}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className={`${SCRIM} ${FADE} fixed inset-0 z-40`} />
        <Dialog.Popup
          className={[
            PORTAL_LAYER,
            FADE,
            'fixed inset-0 flex items-center justify-center p-6'
          ].join(' ')}
          // The turned preview's box is sized against the room this leaves.
          style={sideways ? { containerType: 'size' } : undefined}
        >
          {/*
           * The full picture is a second `<img>` rather than the same element
           * moved, because moving it would take it out of the page behind the
           * scrim and leave a hole to close back into. `previewSrc` is what
           * makes the thumbnail worth being a thumbnail.
           */}
          {sideways ? (
            <span
              className="relative block shrink-0"
              style={turnedPreviewBox(previewKnown, file, previewSrc === undefined)}
            >
              <img
                src={full}
                alt={alt}
                className="object-contain"
                style={{ ...oriented, ...SIDEWAYS }}
                onLoad={recordPreview}
              />
            </span>
          ) : (
            <img
              src={full}
              alt={alt}
              className="max-h-full max-w-full object-contain"
              style={oriented}
              onLoad={recordPreview}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
