import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import { inertProps } from '../../internal/inert';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_ICON,
  CONTROL_TEXT,
  hasContent,
  META_TEXT,
  PROSE_TEXT,
  SHEET_PAD_X
} from '../../internal/scale';
import type { MPColor, MPSize, MPVariant } from '../../types';

/**
 * How the lozenge sits in the page's scroll.
 *
 * Local to this component rather than in `src/types.ts`, which is the rule that
 * file states: an axis joins the shared vocabulary when a **second** component
 * needs it, not in anticipation of one. Nothing else in the library pins itself
 * to the viewport.
 */
export type MPPillPosition = 'static' | 'sticky' | 'fixed';

export interface MPPillProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  // `title` is the tooltip attribute on every element; here it is the pill's
  // headline, and a node rather than a string.
  'color' | 'onClick' | 'title'
> {
  /**
   * The leading slot — a glyph, an avatar, a status dot, a photograph.
   *
   * It is given a square box of its own and clipped to a circle, so an `<img>`
   * lands in it as readily as an icon does: the picture fills the box and is
   * cropped rather than letterboxed, which is what a 20px avatar wants.
   */
  startIcon?: React.ReactNode;
  /** The trailing slot. Outside the pressable area, so it can be a control. */
  endIcon?: React.ReactNode;
  /**
   * The headline in the middle — what the pill is currently about.
   *
   * A prop rather than something to compose, for the reason a card's title is
   * one: the arrangement is fixed. Almost every pill is a line of text with an
   * optional second line under it, and spelling that as children means every
   * caller inventing their own centring and type scale.
   */
  title?: React.ReactNode;
  /** The second line, under the title. One step down and quieter. */
  description?: React.ReactNode;
  /**
   * The second half, revealed when `expanded`.
   *
   * The pill grows downward into it rather than swapping to a different shape:
   * one object saying more, which is the whole idea behind this component.
   */
  details?: React.ReactNode;
  /**
   * Whether `details` is showing.
   * @default false
   */
  expanded?: boolean;
  /**
   * How it sits in the page's scroll. `fixed` pins it against the viewport and
   * centres it, which is the arrangement this shape exists for.
   * @default 'static'
   */
  position?: MPPillPosition;
  /**
   * Which edge it is held against when `position` is not `static`.
   * @default 'top'
   */
  side?: 'top' | 'bottom';
  /** Passing it makes the middle a real button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * How much surface the lozenge paints.
   *
   * The **control** ladder rather than the container one: a pill is the thing
   * being coloured, so `filled` takes the accent under its own ink.
   * @default 'filled'
   */
  variant?: MPVariant;
  /**
   * The row's minimum height and the type scale in it. The same numbers a button
   * is drawn at, so a collapsed pill lines up with one beside it.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * @default 'secondary'
   */
  color?: MPColor;
  /**
   * Anything the middle needs that `title` and `description` cannot say — a pair
   * of small readouts, a live counter, a progress indicator. Rendered under
   * them, in the same centred column.
   */
  children?: React.ReactNode;
}

/**
 * The row's floor, as a minimum rather than as a height.
 *
 * The numbers are `CONTROL_HEIGHT`'s — a collapsed pill lines up with a button
 * of the same `size` beside it — but a pill carrying a description is two lines
 * tall, and a fixed height would clip the second.
 */
const ROW_MIN: Record<MPSize, string> = {
  xs: 'min-h-8',
  sm: 'min-h-10',
  md: 'min-h-14',
  lg: 'min-h-16',
  xl: 'min-h-18'
};

/**
 * The air either side of the middle, and the thing that makes this read as a
 * lozenge rather than as a wide chip.
 *
 * Roughly double the sheet's inline track at every step. The leading glyph and
 * the trailing slot are the pill's furniture; what it is *about* is the column
 * between them, and giving that column noticeably more room than either
 * neighbour is what puts the eye there first.
 */
const CENTRE_PAD: Record<MPSize, string> = {
  xs: 'px-4',
  sm: 'px-5',
  md: 'px-6',
  lg: 'px-8',
  xl: 'px-10'
};

/**
 * The five weights, said the way a **control** says them.
 *
 * A pill is the thing being coloured rather than a box holding somebody else's
 * content, so `filled` takes the accent under its own ink. `elevated` is the one
 * that is nearly redundant here — every pill already carries a shadow, because a
 * lozenge floating flat on the content it is floating over reads as a mistake —
 * and what it adds is the neutral surface rather than the height.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'shadow-mp-2 bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'shadow-mp-2 bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-2 bg-mp-surface-container-low text-(--_mp-accent)',
  outlined: 'border-mp-outline shadow-mp-1 border bg-mp-surface-container text-mp-on-surface',
  text: 'shadow-mp-1 bg-mp-surface-container text-mp-on-surface'
};

/** Where a pinned pill hangs, and how far in from the edge. */
const POSITION: Record<MPPillPosition, Record<'top' | 'bottom', string>> = {
  static: { top: '', bottom: '' },
  sticky: { top: 'sticky top-3 z-20', bottom: 'sticky bottom-3 z-20' },
  fixed: {
    // Centred by stretching the box across the viewport and letting `mx-auto`
    // shrink it back, rather than by translating it half its own width. `auto`
    // margins are direction-agnostic, so the lozenge stays centred under RTL —
    // and nothing about the surface is transformed.
    top: 'fixed inset-x-0 top-3 z-30 mx-auto w-fit',
    bottom: 'fixed inset-x-0 bottom-3 z-30 mx-auto w-fit'
  }
};

/**
 * The leading box: a square the size of a standalone glyph, clipped round.
 *
 * `CONTROL_ICON` rather than a ladder of its own, because that table already
 * answers the same question — how big is a glyph riding beside a label — and the
 * leading slot of a pill is exactly that.
 */
const MEDIA =
  'flex shrink-0 items-center justify-center overflow-hidden rounded-mp-full [&_img]:size-full [&_img]:object-cover';

/**
 * The description under the title.
 *
 * Mixed toward transparent rather than pointed at `on-surface-variant`: the
 * middle of a pill sits on the accent's own fill as often as on a neutral
 * surface, and a fixed grey that reads as secondary on white reads as dirt on
 * `primary`. Taking the ink that is already there and letting some of the
 * surface through is the one form of "one step quieter" that holds on all five
 * variants.
 */
const DESCRIPTION = '[color:color-mix(in_oklab,currentColor_72%,transparent)]';

/**
 * A floating lozenge holding a small amount of live information.
 *
 * MD3 does not describe this shape, and the library ships it for the reason it
 * ships [MPProgressBox](../feedback/progress-box): there is a real thing here
 * that the specification's own parts can draw, and no component in the set draws
 * it. What it is *for* is the state a page has that is not about any one control
 * — a call in progress, an upload that is still going, a recording, a train two
 * minutes away.
 *
 * ## The shape, and the one house rule it bends
 *
 * A collapsed pill is a stadium: `corner-full`, which every other **sheet** in
 * this library is held back from. That is allowed here for the same reason the
 * rule exists — a radius says what kind of object something is, and this is not
 * a sheet lying on the page. It is an object hovering over it, and an object
 * hovering over the page should not look like it was cut from the same material.
 *
 * Opening `details` moves the corner to `corner-extra-large`, and the move is
 * transitioned. That is not decoration: `corner-full` on a box that has grown to
 * six lines is a corner a third of its height, which eats the first two words of
 * every line. The pill morphs from a lozenge into a rounded rectangle with the
 * loudest corner the sheet ladder has, which is the shape it should have been
 * all along at that size.
 *
 * ## What is measured, and why
 *
 * `details` is revealed by animating a **measured** height, exactly as an
 * accordion panel is — but the measurement is a `ResizeObserver` rather than
 * Base UI's one-shot one, because live information is the kind of content that
 * changes while it is on screen. A pill whose details grew after they opened
 * would otherwise be clipped at the height they had when they arrived.
 */
export const MPPill = React.forwardRef<HTMLDivElement, MPPillProps>(function MPPill(
  {
    startIcon,
    endIcon,
    title,
    description,
    details,
    expanded = false,
    position = 'static',
    side = 'top',
    onClick,
    variant = 'filled',
    size = 'md',
    color = 'secondary',
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const detailsRef = React.useRef<HTMLDivElement>(null);
  const detailsId = React.useId();
  const [detailsHeight, setDetailsHeight] = React.useState(0);

  React.useEffect(() => {
    const element = detailsRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => setDetailsHeight(element.scrollHeight));

    observer.observe(element);
    setDetailsHeight(element.scrollHeight);

    return () => observer.disconnect();
  }, [details]);

  const interactive = Boolean(onClick);
  const padX = SHEET_PAD_X[size];

  const middle = (
    <>
      {hasContent(startIcon) ? (
        <span className={MEDIA} style={{ width: CONTROL_ICON[size], height: CONTROL_ICON[size] }}>
          {startIcon}
        </span>
      ) : null}

      {/* The middle. Centred in a column of its own rather than run on from the
          glyph, and padded well clear of both neighbours — the pill is a frame,
          and this is what is in it. */}
      {hasContent(title) || hasContent(description) || hasContent(children) ? (
        <span
          className={[
            'flex min-w-0 flex-1 flex-col items-center justify-center text-center',
            CENTRE_PAD[size]
          ].join(' ')}
        >
          {hasContent(title) ? <span className="max-w-full truncate">{title}</span> : null}
          {hasContent(description) ? (
            <span className={`max-w-full truncate font-normal ${META_TEXT} ${DESCRIPTION}`}>
              {description}
            </span>
          ) : null}
          {children}
        </span>
      ) : null}
    </>
  );

  return (
    <div
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      data-mp-expanded={expanded || undefined}
      className={[
        'mp-pill inline-flex max-w-full flex-col overflow-hidden align-middle',
        'box-border whitespace-nowrap select-none',
        expanded ? 'rounded-mp-xl' : 'rounded-mp-full',
        'transition-[border-radius,background-color,box-shadow]',
        'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
        'motion-reduce:transition-none',
        CONTROL_TEXT[size],
        SURFACE[variant],
        POSITION[position][side],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      <div
        className={[
          // `min-h` rather than a fixed height: one line keeps the stadium the
          // radius is cut for, and a title with a description under it grows
          // into a rounded rectangle instead of being clipped. `py-1` costs
          // nothing in the one-line case — the minimum is taller than the line
          // plus the padding — and is what keeps two lines off the edges.
          'flex shrink-0 items-center py-1',
          ROW_MIN[size],
          CONTROL_GAP[size],
          // With a pressable middle the padding belongs to the button, so its hit
          // area covers the whole row rather than only the words.
          interactive ? 'ps-0' : padX,
          hasContent(endIcon) ? 'pe-1' : interactive ? 'pe-0' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {interactive ? (
          // A real `<button>` inside the shell rather than a handler on the shell
          // itself, and `endIcon` deliberately outside it — the same shape
          // `MPChip` uses, and for the same two reasons: a `<div>` carrying a
          // click handler is invisible to a keyboard, and a `<button>` holding
          // whatever control somebody put in `endIcon` is markup the browser
          // rewrites on parse.
          <button
            type="button"
            className={[
              'group relative flex min-w-0 flex-1 cursor-pointer items-center justify-center',
              'self-stretch appearance-none border-0 bg-transparent font-[inherit] text-inherit',
              // `inherit`, so the state layer and the focus ring trace the
              // lozenge's own corners rather than drawing a squarer rectangle
              // inside them.
              'rounded-[inherit]',
              CONTROL_GAP[size],
              padX,
              'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
              'focus-visible:outline-solid outline-none'
            ].join(' ')}
            /*
             * Only where there is something to expand. A pill's `details` is
             * driven by the caller rather than by this button, so the two are
             * not necessarily the same gesture — but where a pill has details
             * at all, the press that reveals them is the press this button
             * takes, and a control that changes what is on screen without
             * saying so leaves a screen reader to find out by accident.
             */
            aria-expanded={hasContent(details) ? expanded : undefined}
            aria-controls={hasContent(details) ? detailsId : undefined}
            onClick={onClick}
          >
            <MPStateLayer />
            {middle}
          </button>
        ) : (
          middle
        )}

        {hasContent(endIcon) ? (
          <span className="flex h-[1lh] shrink-0 items-center">{endIcon}</span>
        ) : null}
      </div>

      {hasContent(details) ? (
        <div
          id={detailsId}
          className={[
            'overflow-hidden',
            'transition-[height] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
            'motion-reduce:transition-none'
          ].join(' ')}
          style={{ height: expanded ? detailsHeight : 0 }}
          // `inert` rather than `aria-hidden`: a collapsed panel is a zero-height
          // box whose content is still perfectly focusable, and `aria-hidden`
          // alone would leave a keyboard reader tabbing into something their
          // screen reader has been told does not exist.
          //
          // Spread rather than written out: React 18 and React 19 want opposite
          // values for this attribute — see `internal/inert.ts`.
          {...inertProps(!expanded)}
        >
          <div ref={detailsRef} className={`${padX} pb-2 whitespace-normal ${PROSE_TEXT[size]}`}>
            {details}
          </div>
        </div>
      ) : null}
    </div>
  );
});
