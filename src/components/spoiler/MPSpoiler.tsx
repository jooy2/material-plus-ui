import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { inertProps } from '../../internal/inert';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { hasContent, META_TEXT, SHEET_PAD, SHEET_PAD_X, SHEET_PAD_Y } from '../../internal/scale';
import { CONTAINER_SURFACE } from '../../internal/surface';
import type { MPColor, MPSize, MPVariant } from '../../types';

export interface MPSpoilerProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'onChange'
> {
  /** Whether the content is uncovered. Use with `onRevealedChange` to control it. */
  revealed?: boolean;
  /**
   * Where an uncontrolled spoiler starts.
   * @default false
   */
  defaultRevealed?: boolean;
  /** Called when the reveal or hide button is pressed. */
  onRevealedChange?: (revealed: boolean) => void;
  /**
   * Which language the cover is written in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   *
   * Both strings can be written out instead, in `label` and `description`; this
   * is for the far more common case where the page already knows its language
   * and nobody should have to translate a button that says "Reveal".
   */
  locale?: string;
  /** The reveal button's label. Defaults to the `locale`'s word for it. */
  label?: React.ReactNode;
  /** The hide button's label, when `reversible` is on. */
  hideLabel?: React.ReactNode;
  /**
   * The line above the button, saying why the content is covered. Defaults to
   * the `locale`'s wording; pass `false` for a cover with nothing written on it.
   */
  description?: React.ReactNode | false;
  /**
   * Replaces the default reveal button entirely.
   *
   * The replacement is yours to wire up: pass `revealed` and `onRevealedChange`
   * and drive it from your own control. `label` is the prop for the far commoner
   * case of wanting different words on the button that is already there.
   */
  action?: React.ReactNode;
  /**
   * Keeps the content coverable: once revealed, a hide button appears under it.
   * @default false
   */
  reversible?: boolean;
  /**
   * Clamps the covered box to this height — a CSS length, or a number in pixels.
   * Revealing releases it and the content takes whatever height it needs.
   *
   * Left out, the box is exactly as tall as what it holds, which is right for a
   * paragraph or a picture. Set it for something long enough that a page of
   * blurred content would be a page of nothing.
   */
  maxHeight?: number | string;
  /**
   * How hard the content is blurred, in pixels.
   * @default 10
   */
  blur?: number;
  /**
   * Inner padding around the content. Turn it off for something that should
   * reach the edges — a picture, a video.
   * @default true
   */
  padded?: boolean;
  /**
   * How much surface the sheet paints. `text` draws no box at all, which is what
   * a spoiler sitting inside running prose usually wants.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The room inside, and the size of the button on the cover.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the reveal button reads. The sheet stays neutral, as
   * every container in this library does.
   * @default 'primary'
   */
  color?: MPColor;
  /** What is being covered. */
  children?: React.ReactNode;
}

/**
 * The wash between the blurred content and the words on top of it.
 *
 * Blur alone is not cover. It takes a paragraph apart but leaves its colour and
 * its rhythm — a photograph blurred at 10px is still recognisably a photograph
 * of a face — and it leaves the button standing on whatever happened to be
 * underneath it. Mixing the page's own `surface` role over the top settles both:
 * the content goes to a wash of its own colours, and the button gets something
 * to stand on.
 *
 * `surface` rather than one of the containers, because this is standing in for
 * the page rather than for a sheet on it — the same role `MPOverlay`'s `solid`
 * tone reads, and for the same reason.
 */
const SCRIM = '[background-color:color-mix(in_oklab,var(--_mp-color-surface)_55%,transparent)]';

/**
 * Content that is covered until somebody asks for it.
 *
 * MD3 does not describe this, and it is the library's own for the reason
 * [MPProgressBox](../feedback/progress-box) is: a real thing, drawn out of the
 * specification's own parts. There is no primitive under it either, and there
 * should not be — a spoiler has no keyboard contract of its own beyond the
 * button on its cover, which is a real [MPButton](../inputs/button).
 *
 * The cover is a **blur** rather than a `display: none`, which is the whole
 * point: a reader can see that there is something there, roughly how much of it
 * there is, and — with `maxHeight` — that it has been clamped. What they cannot
 * do is read it by accident, which is the one thing a spoiler is for.
 *
 * ## What `inert` buys, and why `aria-hidden` would not
 *
 * While it is covered the content is `inert`, so it is not tabbable, not
 * readable by a screen reader, and not selectable by a drag across the page. All
 * three matter: a spoiler that can be defeated by Ctrl-A is not a spoiler, and
 * `aria-hidden` alone would leave a keyboard reader tabbing into a link their
 * screen reader has been told is not there.
 */
export const MPSpoiler = React.forwardRef<HTMLDivElement, MPSpoilerProps>(function MPSpoiler(
  {
    revealed,
    defaultRevealed = false,
    onRevealedChange,
    locale: localeProp,
    label,
    hideLabel,
    description,
    action,
    reversible = false,
    maxHeight,
    blur = 10,
    padded = true,
    variant = 'outlined',
    size = 'md',
    color = 'primary',
    className,
    children,
    ...props
  },
  ref
) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages('spoiler', locale);
  const contentId = React.useId();

  const [uncontrolled, setUncontrolled] = React.useState(defaultRevealed);
  const open = revealed ?? uncontrolled;

  const change = (next: boolean) => {
    if (revealed === undefined) {
      setUncontrolled(next);
    }

    onRevealedChange?.(next);
  };

  const notice = description === false ? null : (description ?? messages.notice);

  return (
    <div
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      data-mp-revealed={open || undefined}
      className={[
        // `isolate` so the cover's stacking context is this sheet rather than
        // whatever the page happens to have above it.
        'mp-spoiler rounded-mp-md relative isolate overflow-hidden',
        'box-border',
        CONTAINER_SURFACE[variant],
        'text-mp-on-surface',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div
        id={contentId}
        className={[
          'min-w-0',
          padded ? SHEET_PAD[size] : '',
          'transition-[filter] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
          'motion-reduce:transition-none',
          open ? '' : 'select-none'
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          filter: open ? undefined : `blur(${blur}px)`,
          // The clamp is only ever on the covered state: revealing something and
          // leaving it in a box with a scrollbar is answering the wrong question.
          maxHeight: open ? undefined : maxHeight,
          overflow: open ? undefined : 'hidden'
        }}
        // Spread rather than written out: React 18 and React 19 want opposite
        // values for this attribute — see `internal/inert.ts`.
        {...inertProps(!open)}
      >
        {children}
      </div>

      {open ? null : (
        <div
          className={[
            'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-center',
            SHEET_PAD[size],
            SCRIM
          ].join(' ')}
        >
          {hasContent(notice) ? (
            <p className={`text-mp-on-surface-variant m-0 ${META_TEXT}`}>{notice}</p>
          ) : null}

          {action ?? (
            <MPButton
              variant="tonal"
              size={size}
              color={color}
              onClick={() => change(true)}
              aria-expanded={false}
              aria-controls={contentId}
            >
              {label ?? messages.reveal}
            </MPButton>
          )}
        </div>
      )}

      {open && reversible ? (
        <div
          className={[
            'flex justify-end',
            SHEET_PAD_X[size],
            // The row takes the sheet's padding on both axes and then gives the
            // top back: padded content already ends with a full track, and two
            // of them stacked is a hole between the text and the way back out.
            // `pt-0` beating `py-*` is Tailwind's own longhand-after-shorthand
            // ordering rather than an accident of how these are concatenated.
            SHEET_PAD_Y[size],
            'pt-0'
          ].join(' ')}
        >
          <MPButton
            variant="text"
            size={size}
            color={color}
            onClick={() => change(false)}
            aria-expanded
            aria-controls={contentId}
          >
            {hideLabel ?? messages.hide}
          </MPButton>
        </div>
      ) : null}
    </div>
  );
});
