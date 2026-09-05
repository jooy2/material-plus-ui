import * as React from 'react';
import { VISUALLY_HIDDEN } from './visually-hidden';
import { cssLength } from './length';
import { PLOT_HEIGHT, formatCategory, type ChartValue } from './chart';
import type {
  MPChartCategory,
  MPChartLegend,
  MPChartTooltip,
  MPChartTooltipItem,
  MPSide,
  MPSize
} from '../types';

/**
 * Everything a chart draws that is not the data.
 *
 * The legend, the hover panel, the spoken readout, the table behind the picture
 * and the arrangement that holds them — the parts a pie chart and a line chart
 * have in common, which is all of them except the plot.
 *
 * A file of its own for the reason `internal/density.ts` has one: the split
 * stylesheet is cut along the import graph a **file** at a time, so a pie chart
 * reaching into `ChartFrame.tsx` for a legend would carry the axes, the scales
 * and the column hit-testing it has no use for. It arrives here instead, and
 * the cartesian frame is one more consumer rather than the owner.
 */

/* ------------------------------------------------------------------- props */

/** What every framed chart takes, whatever it draws. */
export interface ChartBaseProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children' | 'title'
> {
  /**
   * How tall the drawing is. A number is pixels; a string is any CSS length.
   * Defaults to the `size` ladder.
   *
   * The axis labels are drawn **inside** this rather than under it, so a card
   * sized to the chart is a card the chart fits in.
   */
  height?: number | string;
  /**
   * How numbers are written everywhere they appear — the axis, the panel, the
   * table. `Intl.NumberFormat` options, the same prop `MPStatistic` takes.
   *
   * Without it a tick is compacted past ten thousand, because four labels of
   * seven digits is not an axis, it is a column of numbers beside a picture.
   */
  format?: Intl.NumberFormatOptions;
  /** Which language the chart's own words and dates are in. */
  locale?: string;
  /**
   * What the chart is a chart **of**. Read out in place of the drawing, and
   * used as the caption of the table behind it.
   */
  label?: string;
  /**
   * The legend. Drawn from two series up and left off below that, because a
   * legend with one swatch in it restates the title.
   */
  legend?: boolean | MPChartLegend;
  /**
   * What the pointer uncovers. On by default: a chart drawn in a browser is
   * interactive, and a reader who wants March's number should not have to
   * measure it against a gridline.
   */
  tooltip?: boolean | MPChartTooltip;
  /** What to draw when there is nothing to draw. */
  empty?: React.ReactNode;
  /** @default 'md' */
  size?: MPSize;
}

/* -------------------------------------------------------------- visibility */

export interface Visibility {
  visible: boolean[];
  hovered: number | null;
  toggle: (index: number) => void;
  setHovered: (index: number | null) => void;
}

/**
 * Which entries are drawn, and which one the legend is being pointed at.
 *
 * Keyed by an entry's place in the array as it was passed, which is what stops
 * a hidden one renumbering those after it. Colours come off that same index, so
 * hiding Europe leaves Asia exactly the colour it already was.
 *
 * It takes anything that can say whether it starts hidden rather than a series
 * specifically, because a pie's entries are its slices.
 */
export function useVisibility(series: readonly { hidden?: boolean }[]): Visibility {
  const [hidden, setHidden] = React.useState<ReadonlySet<number>>(() => {
    const initial = new Set<number>();

    series.forEach((one, index) => {
      if (one.hidden) {
        initial.add(index);
      }
    });

    return initial;
  });

  const [hovered, setHovered] = React.useState<number | null>(null);

  const toggle = React.useCallback((index: number) => {
    setHidden((now) => {
      const next = new Set(now);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }, []);

  return { visible: series.map((_, index) => !hidden.has(index)), hovered, toggle, setHovered };
}

/* ------------------------------------------------------------------ legend */

export const LEGEND_SIDE = {
  top: 'flex-col-reverse',
  bottom: 'flex-col',
  left: 'flex-row-reverse',
  right: 'flex-row'
} as const;

const LEGEND_ALIGN = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end'
} as const;

interface LegendProps {
  /**
   * What each entry is called. Names rather than series, because a pie's
   * entries are its slices — the entity a legend identifies is not always a
   * series, and a legend that insisted on one would be a legend a pie has to
   * fake a series array for.
   */
  names: readonly (string | undefined)[];
  colors: readonly string[];
  options: MPChartLegend;
  visibility: Visibility;
  size: MPSize;
  values?: readonly (string | undefined)[];
  swatch?: (index: number, color: string) => React.ReactNode;
}

/**
 * The identity channel that does not depend on being able to see a colour.
 *
 * A swatch and a word, and the swatch is the only thing on the row wearing the
 * series' colour — the name beside it stays in ordinary ink. That is the rule
 * for every piece of text in a chart: a label written in the mark's colour is a
 * label the reader has to decode before they can read it, and it fails outright
 * in forced colours.
 *
 * Interactive by default, and each entry is a real `<button>` with
 * `aria-pressed`. A legend that filters is a control, and a control that is a
 * `<div>` with an `onClick` is one a keyboard cannot reach.
 */
export function ChartLegend({
  names,
  colors,
  options,
  visibility,
  size,
  values,
  swatch
}: LegendProps) {
  const interactive = options.interactive !== false;
  const text = size === 'xs' || size === 'sm' ? 'text-mp-label-small' : 'text-mp-label-medium';

  return (
    <ul
      className={[
        'mp-chart__legend flex flex-wrap items-center gap-x-4 gap-y-1',
        LEGEND_ALIGN[options.align ?? 'center'],
        text
      ].join(' ')}
    >
      {names.map((given, index) => {
        const shown = visibility.visible[index];
        const dimmed = !shown || (visibility.hovered !== null && visibility.hovered !== index);
        const name = given ?? `${index + 1}`;

        const body = (
          <>
            <span className="shrink-0" aria-hidden="true">
              {swatch ? (
                swatch(index, colors[index])
              ) : (
                <span
                  className="block size-2.5 rounded-mp-full"
                  style={{ background: colors[index] }}
                />
              )}
            </span>
            <span className="text-mp-on-surface-variant truncate">{name}</span>
            {values?.[index] ? (
              <span className="text-mp-on-surface tabular-nums">{values[index]}</span>
            ) : null}
          </>
        );

        return (
          <li key={index} className="min-w-0">
            {interactive ? (
              <button
                type="button"
                aria-pressed={shown}
                onClick={() => visibility.toggle(index)}
                onPointerEnter={() => visibility.setHovered(index)}
                onPointerLeave={() => visibility.setHovered(null)}
                onFocus={() => visibility.setHovered(index)}
                onBlur={() => visibility.setHovered(null)}
                className={[
                  'flex min-w-0 cursor-pointer items-center gap-1.5 rounded-mp-xs',
                  'focus-visible:outline-mp-primary focus-visible:outline-2 focus-visible:outline-offset-2',
                  // Struck through as well as faded, because "off" has to survive
                  // being looked at in grayscale — and a row at 40% opacity is a
                  // row that reads as merely quiet.
                  dimmed ? 'opacity-40' : '',
                  shown ? '' : 'line-through'
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {body}
              </button>
            ) : (
              <span className={`flex min-w-0 items-center gap-1.5 ${dimmed ? 'opacity-40' : ''}`}>
                {body}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------------------------------------------- tooltip */

interface PanelProps {
  heading?: React.ReactNode;
  items: readonly MPChartTooltipItem[];
  x: number;
  y: number;
  flip: boolean;
  size: MPSize;
}

/**
 * What the pointer uncovers, as a panel.
 *
 * `pointer-events-none` is the load-bearing part: a panel that could be hovered
 * would sit under the pointer, take the hover from the plot, and close itself —
 * then reopen, then close, for as long as the reader held still.
 */
export function ChartTooltipPanel({ heading, items, x, y, flip, size }: PanelProps) {
  const text = size === 'xs' || size === 'sm' ? 'text-mp-label-small' : 'text-mp-label-medium';

  return (
    <div
      aria-hidden="true"
      className={[
        'mp-chart__tooltip pointer-events-none absolute z-10 min-w-24 max-w-64',
        'bg-mp-surface-container-high shadow-mp-2 rounded-mp-xs px-2.5 py-2',
        text
      ].join(' ')}
      style={{
        left: x,
        top: y,
        // Held clear of the mark and flipped near the right edge, so the panel
        // never leaves the plot it belongs to.
        transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, -50%)`
      }}
    >
      {heading === undefined || heading === null || heading === '' ? null : (
        <div className="text-mp-on-surface-variant mb-1 truncate">{heading}</div>
      )}
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.seriesIndex} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="block size-2 shrink-0 rounded-mp-full"
              style={{ background: item.color }}
            />
            {item.name ? (
              <span className="text-mp-on-surface-variant min-w-0 truncate">{item.name}</span>
            ) : null}
            <span className="text-mp-on-surface ms-auto ps-2 tabular-nums">
              {item.label ?? item.formatted}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The same reading, said out loud instead of drawn.
 *
 * It cannot be the panel above, and that is a constraint rather than a
 * preference: the panel is drawn inside the element carrying `role="img"`, and
 * `img` is a leaf role — everything under it is cut out of the accessibility
 * tree, so a live region in there announces to nobody. This is a **sibling** of
 * the picture, clipped rather than painted, and it is what makes the arrow keys
 * mean something to a reader who is not looking at the plot.
 *
 * Empty when nothing is active, so leaving the chart clears what was said
 * rather than leaving the last column standing in the region forever.
 */
export function ChartStatus({
  heading,
  items
}: {
  heading?: React.ReactNode;
  items: readonly MPChartTooltipItem[];
}) {
  return (
    <span role="status" aria-live="polite" className={VISUALLY_HIDDEN}>
      {items.length === 0 ? null : (
        <>
          {heading === undefined || heading === null || heading === '' ? null : <>{heading}, </>}
          {items.map((item, index) => (
            <React.Fragment key={item.seriesIndex}>
              {index > 0 ? ', ' : null}
              {item.name ? `${item.name}: ` : null}
              {item.label ?? item.formatted}
            </React.Fragment>
          ))}
        </>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------- table */

interface TableProps {
  id: string;
  caption: string;
  corner: React.ReactNode;
  categories: readonly MPChartCategory[];
  /** One per column, beside the category's own. */
  names: readonly (string | undefined)[];
  values: readonly (readonly ChartValue[])[];
  format: (value: number) => string;
  locale: string | undefined;
  empty: string;
}

/**
 * The numbers behind the picture, as a grid.
 *
 * Clipped rather than drawn. Every chart here ships one and it is what
 * `aria-describedby` points at, so a reader who cannot see the plot has the
 * data itself rather than a summary of it — and a reader who can see the plot
 * is not made to scroll past a table they did not ask for.
 *
 * Rendered rather than built on demand, because it is the description of a
 * focusable element: an `aria-describedby` pointing at an id that does not
 * exist yet is an `aria-describedby` pointing at nothing.
 */
export function ChartTable({
  id,
  caption,
  corner,
  categories,
  names,
  values,
  format,
  locale,
  empty
}: TableProps) {
  return (
    <div id={id} className={VISUALLY_HIDDEN}>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{corner}</th>
            {names.map((name, index) => (
              <th key={index} scope="col">
                {name ?? index + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={names.length + 1}>{empty}</td>
            </tr>
          ) : (
            categories.map((category, row) => (
              <tr key={row}>
                <th scope="row">{formatCategory(category, locale)}</th>
                {names.map((_, column) => {
                  const value = values[column]?.[row];

                  return (
                    <td key={column}>
                      {value?.label ??
                        (value?.value === null || value === undefined
                          ? empty
                          : format(value.value))}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------- shell */

export interface ChartShellProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children' | 'color' | 'title'
> {
  size: MPSize;
  /** The element the drawing is measured in and focused on. */
  plotRef: React.RefObject<HTMLDivElement | null>;
  /** Its accessible name, already resolved — never an optional prop passed straight through. */
  name: string;
  /** The id of the table describing it, or nothing when there is nothing to describe. */
  describedBy?: string;
  /** Whether there is anything here to walk. A chart with no data is not a tab stop. */
  interactive: boolean;
  height?: number | string;
  /** The pointer and keyboard handlers, which are the plot's own business. */
  plotProps?: React.HTMLAttributes<HTMLDivElement>;
  /** The drawing: an `<svg>`, or the empty state. */
  children: React.ReactNode;
  /** Floated over the drawing. */
  tooltip?: React.ReactNode;
  legend?: React.ReactNode;
  legendSide?: MPSide;
  status: { heading?: React.ReactNode; items: readonly MPChartTooltipItem[] };
  table?: React.ReactNode;
}

/**
 * The arrangement: a plot, a legend on one of its four sides, a readout beside
 * it and the table underneath.
 *
 * The readout is a **sibling** of the plot rather than a child, and that is a
 * constraint rather than a layout preference — see `ChartStatus`. Putting the
 * arrangement here is what keeps the two frames from disagreeing about it: the
 * one place this is easy to get wrong is the one place it must not be.
 */
export function ChartShell({
  size,
  plotRef,
  name,
  describedBy,
  interactive,
  height,
  plotProps,
  children,
  tooltip,
  legend,
  legendSide = 'bottom',
  status,
  table,
  className,
  ...rest
}: ChartShellProps) {
  return (
    <div
      data-mp-size={size}
      className={['mp-chart flex min-w-0 flex-col gap-3', className ?? '']
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <div className={`flex min-w-0 gap-3 ${LEGEND_SIDE[legendSide]}`}>
        <div
          ref={plotRef}
          role="img"
          tabIndex={interactive ? 0 : undefined}
          aria-label={name}
          aria-describedby={describedBy}
          {...plotProps}
          className={[
            'mp-chart__plot rounded-mp-xs relative min-w-0 flex-1',
            'focus-visible:outline-mp-primary focus-visible:outline-2 focus-visible:outline-offset-2'
          ].join(' ')}
          style={{ height: cssLength(height) ?? PLOT_HEIGHT[size] }}
        >
          {children}
          {tooltip}
        </div>

        {legend}
      </div>

      <ChartStatus heading={status.heading} items={status.items} />

      {table}
    </div>
  );
}
