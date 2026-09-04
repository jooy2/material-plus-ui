import * as React from 'react';
import { cssLength } from '../../internal/length';
import { META_TEXT, PROSE_TEXT, hasContent } from '../../internal/scale';
import { useMPDensity, useMPSize } from '../../internal/config';
import type { MPDensity, MPOrientation, MPSize } from '../../types';

/**
 * What a pair inherits from the list around it.
 *
 * Local rather than in `internal/`, because a pair is meaningless outside its
 * list — unlike an `MPButton`, which is a component in its own right that an
 * `MPButtonGroup` happens to contain.
 */
interface MPDataListContextValue {
  size: MPSize;
  orientation: MPOrientation;
}

const MPDataListContext = React.createContext<MPDataListContextValue>({
  size: 'md',
  orientation: 'horizontal'
});

export interface MPDataListProps extends Omit<React.ComponentPropsWithoutRef<'dl'>, 'color'> {
  /**
   * Where the label sits.
   *
   * - `horizontal` — beside the value, in a column of its own. The default, and
   *   the shape a details panel takes.
   * - `vertical` — above it. For a narrow column, and for values long enough
   *   that a label beside them would leave most of the row empty.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * How wide the label column is when `horizontal`. A number is pixels, a
   * string is any CSS length.
   *
   * Left out it is as wide as the widest label, which is what keeps every value
   * in the list starting at the same place without anybody measuring anything.
   */
  labelWidth?: number | string;
  /** Draws a hairline between the rows. @default false */
  dividers?: boolean;
  /** @default 'md' */
  size?: MPSize;
  /**
   * Tightens the gaps between rows and columns, and nothing else. The type
   * scale does not move.
   * @default 0
   */
  density?: MPDensity;
  /** The pairs. */
  children?: React.ReactNode;
}

export interface MPDataListItemProps {
  /** What the value is called. */
  label: React.ReactNode;
  /** The value. A node, so a chip, a link or a piece of code all fit. */
  children?: React.ReactNode;
}

/**
 * The two gaps, in pixels, at each rung of the ladder.
 *
 * Numbers rather than the literal class tables the rest of the library keeps,
 * and this is the one component where that is the smaller answer rather than
 * the lazier one. Both gaps are read in four places — the column gap, the row
 * gap, the top margin a vertical pair takes, and the padding a divider needs to
 * sit in the middle of — across five rungs and four density steps. Written out
 * as classes that is sixty literal strings for two numbers, and the four places
 * would have to agree with each other by hand.
 *
 * As custom properties it is arithmetic, which is also what makes the density
 * step exact: MD3's own 4dp, taken off the gap rather than off a height,
 * because a row here has no height of its own — it is text, and the gap is the
 * whole of what there is to take.
 */
const COLUMN_GAP: Record<MPSize, number> = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 };
const ROW_GAP: Record<MPSize, number> = { xs: 8, sm: 10, md: 12, lg: 14, xl: 16 };

/**
 * A gap with the density steps taken out of it.
 *
 * The floors are what each gap stops meaning below: four pixels between rows is
 * the last width that still reads as a break rather than as a line wrap, and
 * eight between columns is the last that reads as two columns rather than as a
 * word space.
 */
function tighten(base: number, density: MPDensity, floor: number): number {
  return Math.max(floor, base + density * 4);
}

/**
 * One pair: what it is called, and what it is.
 *
 * A fragment rather than an element, so the `<dt>` and the `<dd>` land as direct
 * children of the `<dl>` and the grid can line every label up against every
 * other. It has no `size` or `density` of its own — those belong to the list,
 * because a details panel with one row set tighter than its neighbours is not a
 * thing anybody wants.
 */
export function MPDataListItem({ label, children }: MPDataListItemProps) {
  const { size, orientation } = React.useContext(MPDataListContext);
  const vertical = orientation === 'vertical';

  return (
    <React.Fragment>
      <dt
        className={[
          'mp-data-list__label text-mp-on-surface-variant min-w-0',
          META_TEXT,
          // The gap between one pair and the next, in the mode where a flex gap
          // cannot say it: a column of `<dt>`/`<dd>` children spaces the label
          // from its own value as readily as it spaces one pair from the next,
          // and a label floating halfway between two values belongs to neither.
          vertical ? 'mt-(--_mp-data-list-row) first:mt-0' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </dt>
      {/* `m-0`, because a browser gives every `<dd>` a 40px inline-start margin
          of its own — which in the grid would push every value off the column
          the labels were lined up against. */}
      <dd className={`mp-data-list__value text-mp-on-surface m-0 min-w-0 ${PROSE_TEXT[size]}`}>
        {hasContent(children) ? children : null}
      </dd>
    </React.Fragment>
  );
}

/**
 * A list of things and what they are called — a details panel, the summary of a
 * record, the metadata under a heading.
 *
 * ```tsx
 * <MPDataList>
 *   <MPDataListItem label="Status">Active</MPDataListItem>
 *   <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
 * </MPDataList>
 * ```
 *
 * ## Why not a two-column `MPTable`
 *
 * Because they are read differently, and the difference is the whole reason
 * this is a component. A table is a grid of **rows**, all of the same shape,
 * and a screen reader walks it as a grid — announcing column headers, offering
 * cell-by-cell navigation, counting rows. This is a set of **pairs**, and each
 * one is announced as "label, value", which is what a details panel actually
 * is.
 *
 * So it is a real `<dl>` of real `<dt>`/`<dd>` pairs, and `MPDataListItem`
 * renders a fragment rather than a wrapper: the two elements have to be direct
 * children of the `<dl>` for the grid to line every label up against every
 * other, and a `<div>` between them would take the grid with it.
 *
 * ## It draws no surface
 *
 * No sheet, no padding, no corner. Put it in an `MPCard` when one is wanted,
 * which is what makes the same list work inside a card, inside a popover, and
 * loose under a heading.
 */
export const MPDataList = React.forwardRef<HTMLDListElement, MPDataListProps>(function MPDataList(
  {
    orientation = 'horizontal',
    labelWidth,
    dividers = false,
    size: sizeProp,
    density: densityProp,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);
  const vertical = orientation === 'vertical';

  const context = React.useMemo(() => ({ size, orientation }), [size, orientation]);

  return (
    <MPDataListContext.Provider value={context}>
      <dl
        ref={ref}
        data-mp-size={size}
        className={[
          // `m-0`, because a `<dl>` arrives with the browser's own block margin.
          'mp-data-list m-0 min-w-0',
          vertical
            ? 'flex flex-col'
            : [
                'grid items-baseline',
                '[grid-template-columns:var(--_mp-data-list-label)_minmax(0,1fr)]',
                'gap-x-(--_mp-data-list-col) gap-y-(--_mp-data-list-row)'
              ].join(' '),
          /*
           * The hairline, and which elements carry it is not the same question
           * in the two modes.
           *
           * Laid out as a grid, a `<dt>` and its `<dd>` share one row, so both
           * of them need the border for the line to reach across. Stacked in a
           * column they are two rows, and a border on the `<dd>` would draw a
           * line between a label and its own value — which is the one place in
           * the list there is nothing to divide.
           *
           * Counted per element type rather than per child, because that is
           * what makes "every pair but the first" expressible without a wrapper
           * element the grid cannot afford.
           */
          dividers
            ? [
                'border-mp-outline-variant',
                '[&>dt:nth-of-type(n+2)]:border-t [&>dt:nth-of-type(n+2)]:pt-(--_mp-data-list-row)',
                vertical
                  ? ''
                  : '[&>dd:nth-of-type(n+2)]:border-t [&>dd:nth-of-type(n+2)]:pt-(--_mp-data-list-row)'
              ]
                .filter(Boolean)
                .join(' ')
            : '',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          {
            // `max-content` is what makes every value in the list start at the
            // same place without the caller having to measure the longest label.
            '--_mp-data-list-label': cssLength(labelWidth) ?? 'max-content',
            '--_mp-data-list-col': `${tighten(COLUMN_GAP[size], density, 8)}px`,
            '--_mp-data-list-row': `${tighten(ROW_GAP[size], density, 4)}px`,
            ...style
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </dl>
    </MPDataListContext.Provider>
  );
});
