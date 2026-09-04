import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { TABLE } from '../../internal/messages/table';
import { cssLength } from '../../internal/length';
import { META_TEXT } from '../../internal/scale';
import { containerSurface } from '../../internal/elevation';
import { useMPColor, useMPDensity, useMPSize } from '../../internal/config';
import type { MPAlign, MPColor, MPDensity, MPSize, MPElevation, MPVariant } from '../../types';

/** Which edge the text in a column lines up against. */
export type MPTableAlign = MPAlign;

/**
 * A column: its heading, its default width, and how to get a cell out of a row.
 *
 * This is the whole reason the component takes data rather than markup. A `<td>`
 * written out per row can silently disagree with the `<th>` above it about how
 * many there are or what order they come in; a column list cannot.
 */
export interface MPTableColumn<Row> {
  /**
   * Identifies the column, and — unless `render` says otherwise — names the
   * property to read off each row.
   */
  key: string;
  /** The heading. Defaults to the `key`, which is usually not what you want. */
  label?: React.ReactNode;
  /**
   * The column's default width. A number is pixels; a string is any CSS length.
   *
   * "Default" is meant: the table still balances the columns to fill its width,
   * so this is a starting proportion rather than a guarantee.
   */
  width?: number | string;
  /**
   * Text alignment. Numbers usually want `end` so their digits line up in a
   * column; everything else wants `start`.
   * @default 'start'
   */
  align?: MPTableAlign;
  /**
   * Renders the cell. Without it the cell is `row[key]` rendered as-is, which
   * covers strings, numbers and elements.
   *
   * Anything else — a `Date`, a nested object, an array — draws an empty cell
   * rather than being handed to React, which would throw. Reach for this the
   * moment a column holds something that is not already text.
   */
  render?: (row: Row, index: number) => React.ReactNode;
}

export interface MPTableProps<Row> extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children'
> {
  /** The columns, in the order they appear. */
  headers: readonly MPTableColumn<Row>[];
  /**
   * The rows.   *
   * ## How long a list this holds
   *
   * Every row is rendered, and there is no windowing. That is the right default
   * — windowing costs a measured container, a scroll listener and a row height
   * the component would have to decide for the caller — and it has a ceiling: a
   * few hundred rows is nothing, a few thousand is a visible pause when the list
   * opens, and past that the answer is a narrower list rather than a faster one.
   *
   * A list somebody has to scroll ten thousand rows of is a list that wanted a
   * filter. Where it genuinely is that long, window it yourself and pass the
   * slice.
   */
  items: readonly Row[];
  /**
   * A stable key per row. Defaults to the row's index, which is fine for a
   * static table and wrong for one that sorts or filters.
   */
  getRowKey?: (row: Row, index: number) => React.Key;
  /** Shown above the table, and read out as its accessible name. */
  caption?: React.ReactNode;
  /**
   * What to show instead of rows when `items` is empty. Defaults to the wording
   * in `locale`.
   */
  empty?: React.ReactNode;
  /**
   * Which language that line is written in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * Tints every other row. Useful for a wide table where the eye has to track
   * across; noise on a narrow one.
   * @default false
   */
  striped?: boolean;
  /**
   * Lights the row under the pointer.
   * @default false
   */
  hoverable?: boolean;
  /**
   * Pins the header while the body scrolls. Only does anything if something
   * around the table actually constrains its height.
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * Makes rows activatable. Also turns on the hover treatment.
   *
   * A row that answers a press has to answer a keyboard too, so each one joins
   * the tab order and takes Enter and Space. That is the honest minimum for a
   * `<tr>` — a row cannot be wrapped in a `<button>` the way an
   * [MPListItem](../layout/list) is, because a `<button>` is not something a
   * `<tbody>` may contain.
   *
   * It is also worth knowing what it costs: a table of two hundred rows becomes
   * two hundred tab stops. When the row's job is to *navigate*, put a link in
   * the first cell instead — one tab stop per row that is already announced as
   * a link and can be opened in a new tab.
   */
  onRowClick?: (row: Row, index: number) => void;
  /**
   * How much surface the sheet around the table paints.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * How far off the page the sheet is lifted, on MD3's own scale.
   *
   * It moves the **tone** as well as the shadow, because Material pairs the two:
   * a level-2 surface is `surface-container` under a level-2 shadow, and a prop
   * that only cast a shadow would raise this into a surface the specification
   * has no name for. Given a level, `variant` is left holding only its hairline.
   *
   * Left unset, `variant` decides — and `variant="elevated"` is this at `1`.
   */
  elevation?: MPElevation;
  /**
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family a hovered or pressed row reads. The cells themselves
   * stay neutral.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Takes room out of every cell without changing what it is set in.
   *
   * The axis a table is most often asked for: the reason to make one denser is
   * to see more rows at once, and shrinking the type to get there makes the
   * figures harder to read at exactly the moment there are more of them. Each
   * step is MD3's four pixels off the row — `md` goes 52, 48, 44, 40 — and the
   * text stays where it was.
   * @default 0
   */
  density?: MPDensity;
}

/**
 * The cell padding, as raw lengths rather than classes — and this is the one
 * component in the library that has to do that.
 *
 * A button owns its `<button>`; nobody else styles it. A `<td>` is different:
 * VitePress's `.vp-doc td`, Tailwind Typography's `.prose td` and every CSS
 * framework in existence style table cells by tag name, at two-class specificity
 * that a one-class Tailwind utility cannot outrank. Padding, alignment and
 * borders all silently lost to the host before this was inline.
 *
 * The numbers are `SHEET_PAD_X`'s, in CSS pixels — the Tailwind spacing scale is
 * 0.25rem a step, so `px-4` and 16 are the same measurement written twice. Keep
 * them in step.
 *
 * Pixels rather than the rem strings this used to hold, because these are the
 * one padding track in the library that is arithmetic rather than a lookup: an
 * inline length can be *computed*, so the density steps below are a subtraction
 * instead of the three-column table every class-based track needs.
 */
const CELL_PAD_X: Record<MPSize, number> = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24
};

/**
 * Row height, as vertical padding.
 *
 * MD3's data table row is 52dp: `body-medium` is a 20px line box, and 20 plus
 * `1rem` either side is 52 exactly. The rungs above and below walk out from
 * there.
 */
const CELL_PAD_Y: Record<MPSize, number> = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24
};

/** A pixel count as the unit the cells are written in. */
function rem(px: number): string {
  return `${px / 16}rem`;
}

/**
 * The cell padding at a density step: two pixels off each face, which is MD3's
 * four off the row.
 *
 * The two axes bottom out in different places because they are answering
 * different questions. Sideways it is the room between one column and the next,
 * and 6px is where two numbers start touching. Vertically it is the row height,
 * and 4px is what keeps the shortest row — `body-small`'s 16px line box at `xs`
 * — on the 24px floor `MPDensity` names.
 */
function cellPadX(size: MPSize, density: MPDensity): string {
  return rem(Math.max(6, CELL_PAD_X[size] + density * 2));
}

function cellPadY(size: MPSize, density: MPDensity): string {
  return rem(Math.max(4, CELL_PAD_Y[size] + density * 2));
}

/**
 * What a cell is set in. MD3's data table puts its cells in `body-medium` and
 * its column headings in `title-small` — 14px at weight 500, which is the same
 * size one weight up, so a heading reads as a heading without changing the
 * column's measure.
 */
const CELL_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-small',
  sm: 'text-mp-body-small',
  md: 'text-mp-body-medium',
  lg: 'text-mp-body-medium',
  xl: 'text-mp-body-large'
};

const HEAD_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-medium',
  sm: 'text-mp-label-medium',
  md: 'text-mp-title-small',
  lg: 'text-mp-title-small',
  xl: 'text-mp-title-medium'
};

/**
 * A row's own background, read from a slot rather than written inline.
 *
 * Everything else about a cell is inline because a host stylesheet outranks a
 * utility — but a row has a *hover* state, and an inline style has no `:hover`.
 * A custom property is the way out: the host cannot see it, so a one-class
 * variant sets it without a fight, and the inline `background-color` on the row
 * just reads whatever it currently holds.
 */
const ROW = [
  '[--_mp-row:transparent]',
  'transition-[background-color] duration-(--mp-sys-motion-duration-short4)'
].join(' ');

/**
 * A cell's raw value, if React can draw it, and nothing if it cannot.
 *
 * Without `render`, a cell is `row[column.key]` — and `Row` is the caller's own
 * type, so that value is genuinely anything. A `Date`, a nested object, a `Map`:
 * handed to React each of them throws *Objects are not valid as a React child*,
 * from inside a `.map()` in a `<tbody>`, which takes down the table and every
 * boundary above it. One unexpected column in an API response was a blank page.
 *
 * A blank cell is the honest answer to "this is not text". The column already
 * has `render` for the case where it is something else, and the prop docs
 * already say so — what was missing is that failing to reach for it cost the
 * whole page rather than one cell.
 *
 * The list is what React itself will draw: strings, numbers, bigints, and the
 * three nothings. `null`, `undefined` and `boolean` are already nothing to
 * React, and are passed through rather than filtered so that the `false` a
 * `condition && value` leaves behind stays as harmless here as it is anywhere
 * else in this library.
 */
function drawableCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return null;
  }

  const kind = typeof value;

  if (kind === 'string' || kind === 'number' || kind === 'bigint' || kind === 'boolean') {
    return value as React.ReactNode;
  }

  return React.isValidElement(value) ? value : null;
}

/**
 * A grid of data.
 *
 * The sheet takes the same `variant`, `size` and `color` as everything it might
 * sit next to. What the table adds is the part that is genuinely tabular: the
 * columns, the rows, and the fact that the two cannot drift apart.
 *
 * ## Why it is not `React.forwardRef`
 *
 * It is generic in `Row`, and a `forwardRef` component's type erases that: the
 * wrapper is typed as one component rather than as a function with a type
 * parameter, so `headers` and `items` would stop checking against each other and
 * `column.render` would hand back `unknown`. Losing that check would cost more
 * than a ref on the scroll container is worth — and a caller who needs one can
 * put it on a `<div>` of their own around this.
 */
export function MPTable<Row>({
  headers,
  items,
  getRowKey,
  caption,
  empty,
  locale: localeProp,
  striped = false,
  hoverable = false,
  stickyHeader = false,
  onRowClick,
  variant = 'outlined',
  elevation,
  size: sizeProp,
  color: colorProp,
  density: densityProp,
  className,
  style,
  ...props
}: MPTableProps<Row>) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const density = useMPDensity(densityProp);
  const messages = useMPMessages(TABLE, useMPLocale(localeProp));
  const padX = cellPadX(size, density);
  const padY = cellPadY(size, density);
  const clickable = Boolean(onRowClick);
  const lit = hoverable || clickable;

  const cellStyle: React.CSSProperties = { padding: `${padY} ${padX}` };

  const headCellStyle: React.CSSProperties = {
    ...cellStyle,
    // The header takes a neutral surface rather than a tint, for the reason the
    // variant table gives: a coloured band behind a row of column names is the
    // fastest way to make data look like chrome.
    backgroundColor: 'var(--_mp-color-surface-container)'
  };

  const ruleStyle: React.CSSProperties = {
    borderTop: '1px solid var(--_mp-color-outline-variant)',
    backgroundColor: 'var(--_mp-row)'
  };

  return (
    <div
      data-mp-size={size}
      data-mp-variant={variant}
      // The sheet stays neutral. A table is the one component whose content is
      // entirely somebody else's, and a tinted panel behind a column of numbers
      // is a claim about them.
      className={[
        'mp-table rounded-mp-md overflow-x-auto',
        containerSurface(variant, elevation),
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      <table
        className={`text-mp-on-surface w-full text-start ${CELL_TEXT[size]}`}
        style={{ borderCollapse: 'collapse' }}
      >
        {caption ? (
          <caption
            className={`text-mp-on-surface-variant ${META_TEXT}`}
            style={{ ...cellStyle, textAlign: 'start' }}
          >
            {caption}
          </caption>
        ) : null}

        {/* Widths belong on a `<col>`, not on the first row's cells: a width set
            on a `<th>` is a width the browser is free to renegotiate against
            every other row, and only the column element states it once. */}
        <colgroup>
          {headers.map((column) => (
            <col
              key={column.key}
              style={column.width === undefined ? undefined : { width: cssLength(column.width) }}
            />
          ))}
        </colgroup>

        <thead>
          <tr>
            {headers.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[
                  'text-mp-on-surface-variant whitespace-nowrap',
                  HEAD_TEXT[size],
                  stickyHeader ? 'sticky top-0 z-10' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ ...headCellStyle, textAlign: column.align ?? 'start' }}
              >
                {column.label ?? column.key}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr className={ROW} style={ruleStyle}>
              <td
                colSpan={headers.length}
                className="text-mp-on-surface-variant"
                style={{ padding: `2rem ${padX}`, textAlign: 'center' }}
              >
                {empty ?? messages.empty}
              </td>
            </tr>
          ) : (
            items.map((row, index) => (
              <tr
                key={getRowKey ? getRowKey(row, index) : index}
                className={[
                  ROW,
                  // The stripe and the hover are the same neutral surface one
                  // step apart, rather than a tint: a table that alternates
                  // between white and pale blue has coloured half its data.
                  striped && index % 2 === 1
                    ? '[--_mp-row:var(--_mp-color-surface-container-low)]'
                    : '',
                  lit ? 'hover:[--_mp-row:var(--_mp-color-surface-container)]' : '',
                  clickable
                    ? [
                        'cursor-pointer',
                        // Inset rather than offset, for the reason a tab's ring
                        // is: the sheet scrolls sideways and clips at its
                        // padding box, so a ring drawn outside the row would be
                        // shaved off at both ends of the table.
                        'outline-mp-secondary focus-visible:outline-2',
                        'focus-visible:-outline-offset-2 focus-visible:outline-solid outline-none'
                      ].join(' ')
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={ruleStyle}
                /*
                 * The row keeps `role="row"` rather than claiming
                 * `role="button"`: a row that said it was a button would lose
                 * the position-in-the-table a screen reader reads out, which is
                 * the one thing a table cell has that a button does not.
                 *
                 * What it gains is the tab order and the two keys. `tabIndex` is
                 * only set while there is something to activate, so a plain
                 * table is not a wall of tab stops.
                 */
                tabIndex={clickable ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') {
                          return;
                        }

                        // Only the row itself. A press inside a cell belongs to
                        // whatever is in that cell — a Space typed into a
                        // field in a table must not activate the row around it.
                        if (event.target !== event.currentTarget) {
                          return;
                        }

                        // Space scrolls the page by default, and a row that
                        // fired *and* scrolled would answer twice.
                        event.preventDefault();
                        onRowClick(row, index);
                      }
                    : undefined
                }
              >
                {headers.map((column) => (
                  <td key={column.key} style={{ ...cellStyle, textAlign: column.align ?? 'start' }}>
                    {column.render
                      ? column.render(row, index)
                      : drawableCell((row as Record<string, unknown>)[column.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
