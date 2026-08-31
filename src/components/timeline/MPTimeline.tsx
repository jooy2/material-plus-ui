import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { accentSlots } from '../../internal/accent';
import { hasContent, META_TEXT, PROSE_TEXT, SHEET_TITLE } from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPOrientation, MPSize } from '../../types';

/**
 * How far along one item is.
 *
 * Three states rather than two, because "the one you are on" is not the same
 * claim as "done", and a sequence that cannot say which step is current is a
 * list. Each gets its own axis — a filled bullet, a filled bullet with a halo
 * around it, an empty one — rather than three shades of the same thing.
 */
export type MPTimelineStatus = 'complete' | 'current' | 'upcoming';

/** How the line between two items is drawn. `none` leaves the gap open. */
export type MPTimelineConnector = 'solid' | 'dashed' | 'dotted' | 'none';

interface MPTimelineContextValue {
  size: MPSize;
  orientation: MPOrientation;
  color: MPColor;
  active: number | null;
}

interface MPTimelineItemContextValue {
  index: number;
  last: boolean;
}

const MPTimelineContext = React.createContext<MPTimelineContextValue | null>(null);
const MPTimelineItemContext = React.createContext<MPTimelineItemContextValue>({
  index: 0,
  last: false
});

export interface MPTimelineProps extends Omit<React.ComponentPropsWithoutRef<'ol'>, 'color'> {
  /**
   * How far the sequence has got: the index of the item being worked on now.
   * Everything before it is complete, everything after it is still to come.
   *
   * An index rather than a value, because a timeline has no selection — nothing
   * here is chosen, and the only question is how far down the list reality has
   * reached. Omit it and every item is `upcoming` unless it says otherwise; pass
   * the item count to mark the whole sequence done.
   */
  active?: number;
  /** @default 'md' */
  size?: MPSize;
  /** @default 'primary' */
  color?: MPColor;
  /**
   * Which way the sequence runs. `vertical` is the default and the one that
   * takes an arbitrary number of steps with an arbitrary amount to say about
   * each; `horizontal` is the stepper across the top of a checkout, and it is
   * only honest while every label is short.
   * @default 'vertical'
   */
  orientation?: MPOrientation;
  /** Renders something other than an `<ol>` — Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

export interface MPTimelineItemProps extends Omit<
  React.ComponentPropsWithoutRef<'li'>,
  'color' | 'title'
> {
  /** The heading of this step. */
  title?: React.ReactNode;
  /**
   * When it happened — a date, a duration, a name. Set beside the title on a
   * wide item and under it on a narrow one.
   */
  meta?: React.ReactNode;
  /**
   * What goes inside the bullet: a number, an icon, an avatar. Omit it and the
   * bullet is a plain disc, which is what a step with nothing to say about
   * itself should be.
   */
  bullet?: React.ReactNode;
  /**
   * Overrides what the timeline's `active` would have computed for this item — a
   * step that failed and stopped the sequence, a step that was skipped.
   */
  status?: MPTimelineStatus;
  /** Overrides the timeline's accent family for this item alone. */
  color?: MPColor;
  /**
   * How the line to the next item is drawn.
   * @default 'solid'
   */
  connector?: MPTimelineConnector;
  /** The body of the step. */
  children?: React.ReactNode;
}

/**
 * The bullet.
 *
 * Its own ladder rather than a step off `CONTROL_HEIGHT`, for the reason a
 * checkbox's tick has one: a bullet is not a control you can put a label inside.
 * It is a mark beside one, sized against the title next to it.
 *
 * It is written as a custom property rather than as a class because the
 * connector has to know it: the line is centred on the bullet, and centring is
 * arithmetic on this number.
 */
const BULLET_SIZE: Record<MPSize, string> = {
  xs: '0.875rem',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
  xl: '1.875rem'
};

/** Between the bullet column and the content beside it. */
const BULLET_GAP: Record<MPSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2.5',
  md: 'gap-3',
  lg: 'gap-3.5',
  xl: 'gap-4'
};

/**
 * How far apart two items sit.
 *
 * The floor is set by the item with nothing in it. A step that is only a title
 * and a time is one line tall, so the gap is the *whole* of what separates it
 * from the next one — where a step with a paragraph under it has the paragraph's
 * own leading working for it as well.
 */
const ITEM_GAP: Record<MPSize, string> = {
  xs: 'pb-5',
  sm: 'pb-6',
  md: 'pb-7',
  lg: 'pb-8',
  xl: 'pb-10'
};

/** The same ladder across, for the horizontal form. */
const ITEM_GAP_X: Record<MPSize, string> = {
  xs: 'pe-5',
  sm: 'pe-6',
  md: 'pe-7',
  lg: 'pe-8',
  xl: 'pe-10'
};

const BORDER_STYLE: Record<MPTimelineConnector, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  none: ''
};

/**
 * The bullet at each of the three states.
 *
 * Every one of them is a different axis, never a different opacity: `complete`
 * is filled with the accent under its own ink, `current` is the same fill with a
 * halo of the container tone around it, and `upcoming` is a hairline ring on the
 * page's own surface. A reader who cannot tell the colours apart still has a
 * filled shape, a haloed shape and an empty one.
 */
const BULLET: Record<MPTimelineStatus, string> = {
  complete: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  current:
    'bg-(--_mp-accent) text-(--_mp-on-accent) shadow-[0_0_0_0.25rem_var(--_mp-accent-container)]',
  upcoming: 'border-mp-outline text-mp-on-surface-variant border-2 bg-transparent'
};

/**
 * The line *after* an item, which is what makes it the item's own property: a
 * connector is coloured by whether the step it leaves has been reached, not by
 * where it arrives.
 */
const CONNECTOR_COLOR: Record<MPTimelineStatus, string> = {
  complete: 'border-(--_mp-accent)',
  current: 'border-mp-outline-variant',
  upcoming: 'border-mp-outline-variant'
};

const TITLE_COLOR: Record<MPTimelineStatus, string> = {
  complete: 'text-mp-on-surface',
  current: 'text-(--_mp-accent)',
  upcoming: 'text-mp-on-surface-variant'
};

/**
 * One step.
 *
 * Its index is not a prop and cannot be: an item that had to be told where it
 * was in the list would be an item every caller could put in the wrong place,
 * and `active={2}` would stop meaning anything. The timeline numbers its
 * children as it walks them and hands each one its index through a context.
 */
export const MPTimelineItem = React.forwardRef<HTMLLIElement, MPTimelineItemProps>(
  function MPTimelineItem(
    {
      title,
      meta,
      bullet,
      status,
      color,
      connector = 'solid',
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const timeline = React.useContext(MPTimelineContext);
    const { index, last } = React.useContext(MPTimelineItemContext);

    // A bare item outside a timeline still renders — it is just one step with
    // nothing before or after it. The defaults are the timeline's own.
    const size = timeline?.size ?? 'md';
    const orientation = timeline?.orientation ?? 'vertical';
    const family = color ?? timeline?.color ?? 'primary';
    const active = timeline?.active ?? null;

    const resolved: MPTimelineStatus =
      status ??
      (active === null
        ? 'upcoming'
        : index < active
          ? 'complete'
          : index === active
            ? 'current'
            : 'upcoming');

    const horizontal = orientation === 'horizontal';
    // The last item's line would run off the end of the sequence into nothing.
    const drawsConnector = connector !== 'none' && !last;

    const bulletBox = (
      <span
        aria-hidden="true"
        className={[
          'rounded-mp-full relative z-10 flex shrink-0 items-center justify-center',
          // The label inside the bullet is sized off the bullet rather than off
          // the page's own text, so a number in an `xs` bullet is not the same
          // 8px it would be in an `xl` one.
          'size-(--_mp-bullet) text-[calc(var(--_mp-bullet)*0.5)] leading-none font-medium',
          'tabular-nums [&>svg]:size-[0.6em]',
          BULLET[resolved],
          'transition-[background-color,border-color,box-shadow,color]',
          'duration-(--mp-sys-motion-duration-short4)'
        ].join(' ')}
      >
        {bullet}
      </span>
    );

    /*
     * The line, drawn as one border edge on an absolutely positioned box rather
     * than as a filled `<div>`, so `dashed` and `dotted` are the browser's own
     * dashes and land on the device pixel grid the way every other edge in the
     * library does.
     *
     * It starts at the far edge of the bullet and runs to the edge of the item,
     * which is where the next bullet begins — so the arithmetic is the bullet
     * size, and that is the whole reason it is a custom property.
     */
    const connectorLine = drawsConnector ? (
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute',
          // Half the bullet, less half the line, so the 2px rule is centred on
          // the bullet rather than starting at its centre.
          horizontal
            ? 'start-(--_mp-bullet) top-[calc(var(--_mp-bullet)/2_-_1px)] end-0 border-t-2'
            : 'top-(--_mp-bullet) start-[calc(var(--_mp-bullet)/2_-_1px)] bottom-0 border-s-2',
          BORDER_STYLE[connector],
          CONNECTOR_COLOR[resolved]
        ]
          .filter(Boolean)
          .join(' ')}
      />
    ) : null;

    const body = (
      <div className={`flex min-w-0 flex-col gap-0.5 ${horizontal ? 'mt-2' : ''}`}>
        {hasContent(title) || hasContent(meta) ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            {hasContent(title) ? (
              <span className={`${SHEET_TITLE[size]} ${TITLE_COLOR[resolved]}`}>{title}</span>
            ) : null}
            {hasContent(meta) ? (
              <span className={`text-mp-on-surface-variant ${META_TEXT}`}>{meta}</span>
            ) : null}
          </div>
        ) : null}

        {hasContent(children) ? (
          <div className={`text-mp-on-surface-variant ${PROSE_TEXT[size]}`}>{children}</div>
        ) : null}
      </div>
    );

    return (
      <li
        ref={ref}
        aria-current={resolved === 'current' ? 'step' : undefined}
        data-status={resolved}
        className={[
          'relative',
          horizontal
            ? `flex min-w-0 flex-1 flex-col ${last ? '' : ITEM_GAP_X[size]}`
            : `flex ${BULLET_GAP[size]} ${last ? '' : ITEM_GAP[size]}`,
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          {
            '--_mp-bullet': BULLET_SIZE[size],
            ...accentSlots(family),
            ...style
          } as React.CSSProperties
        }
        {...props}
      >
        {connectorLine}
        {bulletBox}
        {body}
      </li>
    );
  }
);

/**
 * A sequence of steps, in the order they happen in.
 *
 * There is no Base UI primitive under this and there should not be: a timeline
 * has no selection, no roving focus and no keyboard contract — it is a list, and
 * reaching for a composite primitive to draw one would hand every consumer's
 * record of events the semantics of a widget.
 *
 * It is an `<ol>` for the reason it exists at all: the order *is* the content. A
 * screen reader announcing "list of 5 items" over an unordered list would be
 * describing something else.
 *
 * The children are numbered here rather than by a prop on each item, so `active`
 * has something to count against and inserting a step in the middle does not
 * mean renumbering the ones after it.
 */
export const MPTimeline = React.forwardRef<HTMLOListElement, MPTimelineProps>(function MPTimeline(
  {
    active,
    size: sizeProp,
    color: colorProp,
    orientation = 'vertical',
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
  // `toArray` is what drops the `null`s and `false`s a conditional step leaves
  // behind, so `active={2}` counts the steps that are actually on the page.
  const items = React.Children.toArray(children);
  const count = items.length;

  const context = React.useMemo<MPTimelineContextValue>(
    () => ({ size, orientation, color, active: active ?? null }),
    [size, orientation, color, active]
  );

  const positions = React.useMemo<MPTimelineItemContextValue[]>(
    () => Array.from({ length: count }, (_, index) => ({ index, last: index === count - 1 })),
    [count]
  );

  const element = useRender({
    render: render ?? <ol />,
    ref,
    props: {
      // A host page's reset may take the markers off every `<ol>`, and Safari
      // takes the list semantics off with them. Saying `role="list"` out loud is
      // the one-line fix, and it costs nothing when there is no reset.
      role: 'list',
      'data-mp-size': size,
      className: [
        'mp-timeline flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      style,
      // One value per position, built with the list rather than inline: a fresh
      // object per item per render is a fresh context value per item per render,
      // which re-renders every step of a sequence that did not change.
      children: items.map((item, index) => (
        <MPTimelineItemContext.Provider key={index} value={positions[index]}>
          {item}
        </MPTimelineItemContext.Provider>
      )),
      ...props
    }
  });

  return <MPTimelineContext.Provider value={context}>{element}</MPTimelineContext.Provider>;
});
