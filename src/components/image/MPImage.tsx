import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { MPIcon } from '../icon/MPIcon';
import { BrokenImageIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMON } from '../../internal/messages/common';
import { FADE, PORTAL_LAYER, SCRIM } from '../../internal/surface';
import { useMPSize } from '../../internal/config';
import type { MPSize } from '../../types';

/** How the picture is fitted into the box it was given. CSS's own four. */
export type MPImageFit = 'cover' | 'contain' | 'fill' | 'none';

/** What the picture is doing right now. */
export type MPImageState = 'loading' | 'loaded' | 'error';

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
   * How the picture is fitted into that box.
   * @default 'cover'
   */
  fit?: MPImageFit;
  /**
   * Drawn while the picture is on its way.
   *
   * A shimmer by default, on the surface the box sits on. `false` draws nothing,
   * which is what a picture inside something that already has its own loading
   * treatment wants.
   */
  placeholder?: React.ReactNode | false;
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
  /** The corner and type scale of the placeholder and the fallback. @default 'md' */
  size?: MPSize;
}

const FIT: Record<MPImageFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none'
};

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
    size: sizeProp,
    className,
    style,
    onLoad,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const locale = useMPLocale();
  const messages = useMPMessages(COMMON, locale);

  const [state, setState] = React.useState<MPImageState>(src ? 'loading' : 'error');
  const imageRef = React.useRef<HTMLImageElement | null>(null);

  const report = React.useCallback(
    (next: MPImageState) => {
      setState((current) => {
        if (current !== next) {
          onStateChange?.(next);
        }

        return next;
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
    setState(src ? 'loading' : 'error');
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
      report(node.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src, report]);

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

  const picture = (
    <>
      <img
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
        className={[
          'size-full',
          FIT[fit],
          // Held rather than hidden: the element has to stay in the layout for
          // the browser to fetch it, and `display: none` on an `<img>` is a
          // fetch some browsers will skip.
          showing ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-(--mp-sys-motion-duration-short4)'
        ].join(' ')}
        onLoad={(event) => {
          report('loaded');
          onLoad?.(event);
        }}
        onError={() => report('error')}
      />

      {state === 'loading' && placeholder !== false ? (
        <span aria-hidden="true" className="absolute inset-0">
          {placeholder ?? defaultPlaceholder}
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
  const boxStyle = { aspectRatio: ratio, ...style } as React.CSSProperties;

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
          'outline-mp-secondary cursor-zoom-in appearance-none border-0 bg-transparent p-0',
          'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default',
          'outline-none'
        ].join(' ')}
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
        >
          {/*
           * The full picture is a second `<img>` rather than the same element
           * moved, because moving it would take it out of the page behind the
           * scrim and leave a hole to close back into. `previewSrc` is what
           * makes the thumbnail worth being a thumbnail.
           */}
          <img src={previewSrc ?? src} alt={alt} className="max-h-full max-w-full object-contain" />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
