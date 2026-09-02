import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classMap, responsiveSlots, withBaseline } from '../../internal/responsive';
import { WINDOW_CLASSES } from '../../internal/window-class';
import type { MPResponsive } from '../../types';

/**
 * How a row divides the space its items did not take.
 *
 * CSS's own words rather than a set of this library's, because this is CSS's own
 * question: a grid is the one component whose props are asking the layout engine
 * for something directly, and inventing a second spelling for `space-between`
 * would mean a caller has to translate what they already know.
 */
export type MPGridJustify =
  'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

/** How items sit against each other across a row. */
export type MPGridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/** The same, for one item overriding the row it is in. */
export type MPGridAlignSelf = MPGridAlign | 'auto';

/**
 * How wide one item is: a number of the grid's columns, or `'grow'`.
 *
 * `'grow'` is the one value that is not a measurement. It is "whatever the row
 * has left after everybody else has taken theirs", which is the width a
 * thumbnail's neighbour wants and the one thing a twelve-column arithmetic
 * cannot express — the remainder is only known once the other items in *that*
 * row have been laid out, and no `span` a caller writes down knows what else is
 * in the row.
 *
 * Two growing items in a row split the remainder equally rather than by their
 * contents, which is the useful half of what makes it predictable.
 */
export type MPGridSpan = number | 'grow';

/**
 * How many columns a row is divided into when nobody says.
 *
 * Twelve, which is what MD3's layout grid uses from the medium window up. A
 * compact window is four columns in the specification, and a layout that wants
 * to be exactly that says so — `columns={{ compact: 4, medium: 12 }}` — because
 * a *default* that changed the divisor at 600dp would silently change what
 * `span={6}` means on a phone.
 */
const DEFAULT_COLUMNS = 12;

/**
 * The gutter when nobody says, on Tailwind's spacing scale: `4` is `1rem`.
 *
 * 16dp is MD3's own compact gutter, and the specification widens it to 24dp from
 * the medium window up — `spacing={{ compact: 4, medium: 6 }}`, which is one
 * line and is in the docs. It is not the default for the same reason twelve
 * columns are: a gutter that moved on its own would move every item in the row
 * at a width the caller never wrote down.
 */
const DEFAULT_SPACING = 4;

/**
 * One step of `spacing`, in `rem`.
 *
 * Tailwind's spacing scale, not Material's 8dp one, and deliberately: `gap-4`
 * and `spacing={4}` have to be the same 16px or a grid would measure its gutters
 * differently from the box around it, and that is the one place a caller would
 * have to stop and convert.
 */
const SPACING_STEP = 0.25;

/**
 * A count of columns, as a plain number for `calc()` to divide by.
 *
 * Rounded, and floored at one, because the value ends up as a divisor: a grid of
 * 2.5 columns is not a thing anybody meant, and a grid of nought is a division
 * by zero that takes the whole width declaration down with it.
 */
function columnCount(value: number): string {
  return String(Math.max(1, Math.round(value)));
}

/** A span, which has to be at least one column to be a column at all. */
function spanValue(value: number): string {
  return String(Math.max(1, Math.round(value)));
}

/**
 * The two slot families a `span` writes, which is one family more than it looks.
 *
 * `'grow'` is not a column count, so it cannot be written as one: the width
 * declaration multiplies by `1 - grow`, and the grid item that is growing has to
 * hand the row a `0` there and a `flex-grow: 1` beside it. So a span that
 * mentions `'grow'` anywhere emits a `--_mp-grow-*` for **every** class it
 * names, including the numeric ones — a `0` at `expanded` is what stops the
 * `1` at `compact` cascading up into it, exactly as an explicit span stops a
 * narrower one.
 *
 * A span with no `'grow'` in it emits nothing extra, and that is the point: the
 * common case is a number and stays one property per class, which is the
 * arithmetic the whole file is written around.
 */
function spanSlots(value: MPResponsive<MPGridSpan> | undefined): React.CSSProperties {
  const map = classMap(value);
  const growing = Object.values(map).some((entry) => entry === 'grow');
  const slots: Record<string, string> = {};

  for (const windowClass of WINDOW_CLASSES) {
    const entry = map[windowClass];

    if (entry === undefined) {
      continue;
    }

    if (entry !== 'grow') {
      slots[`--_mp-span-${windowClass}`] = spanValue(entry);
    }

    if (growing) {
      slots[`--_mp-grow-${windowClass}`] = entry === 'grow' ? '1' : '0';
    }
  }

  return slots as React.CSSProperties;
}

/** An offset, where nought is meaningful and is the default. */
function offsetValue(value: number): string {
  return String(Math.max(0, Math.round(value)));
}

/**
 * A gutter, as a length.
 *
 * Fractions are the point — `spacing={1.5}` is `0.375rem`, exactly what `gap-1.5`
 * is — so the multiplication is rounded rather than left to print
 * `0.30000000000000004rem` into the DOM.
 */
function spacingValue(units: number): string {
  const rem = Math.max(0, units) * SPACING_STEP;

  return `${Number(rem.toFixed(5))}rem`;
}

/*
 * The alignment tables. These *are* literal class names, so unlike the widths
 * they stay in Tailwind — see the note on the component below for why the rest
 * of the arithmetic cannot.
 */

const JUSTIFY: Record<MPGridJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly'
};

const ALIGN_ITEMS: Record<MPGridAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline'
};

/**
 * Where the *rows* sit when the grid is shorter than the box holding it. Only
 * ever visible on a grid with a height of its own, which is why it takes the
 * full distribution vocabulary and `alignItems` does not.
 */
const ALIGN_CONTENT: Record<MPGridJustify | 'stretch', string> = {
  start: 'content-start',
  center: 'content-center',
  end: 'content-end',
  'space-between': 'content-between',
  'space-around': 'content-around',
  'space-evenly': 'content-evenly',
  stretch: 'content-stretch'
};

const ALIGN_SELF: Record<MPGridAlignSelf, string> = {
  auto: 'self-auto',
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
  stretch: 'self-stretch',
  baseline: 'self-baseline'
};

export interface MPGridProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * How many columns a row is divided into. Every `span` and every `offset`
   * inside is read against this number, so `columns={24}` makes `span={12}` a
   * half rather than a full width.
   *
   * MD3's own layout grid is `{ compact: 4, medium: 12 }`.
   * @default 12
   */
  columns?: MPResponsive<number>;
  /**
   * The gutter between items, on Tailwind's spacing scale — `spacing={4}` is
   * `1rem`, the same length `gap-4` is. Fractions are allowed, so `1.5` is
   * `0.375rem`.
   *
   * MD3's own gutter is `{ compact: 4, medium: 6 }` — 16dp on a phone, 24dp from
   * a medium window up.
   * @default 4
   */
  spacing?: MPResponsive<number>;
  /** The gutter between rows only. Falls back to `spacing`. */
  rowSpacing?: MPResponsive<number>;
  /** The gutter between columns only. Falls back to `spacing`. */
  columnSpacing?: MPResponsive<number>;
  /** How a row distributes the width its items did not use. */
  justifyContent?: MPGridJustify;
  /**
   * How items sit against each other across a row.
   * @default 'stretch'
   */
  alignItems?: MPGridAlign;
  /** Where the rows sit when the grid is shorter than the box holding it. */
  alignContent?: MPGridJustify | 'stretch';
  /**
   * Whether a row that runs out of columns continues on the next one. Turned
   * off, the grid is one row that overflows — which is what a horizontally
   * scrolling strip wants and nothing else does.
   * @default true
   */
  wrap?: boolean;
  /**
   * Renders something other than a `<div>`: `render={<section />}`,
   * `render={<ul />}`. Base UI's own escape hatch, so it behaves here exactly as
   * it does on every Base UI primitive.
   */
  render?: useRender.RenderProp;
  /** The `MPGridItem`s. */
  children?: React.ReactNode;
}

export interface MPGridItemProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * How many of the grid's columns the item takes. Read against the grid's
   * `columns`, so `span={6}` is half of the default twelve and a quarter of
   * `columns={24}`.
   *
   * Responsive: `span={{ compact: 12, medium: 6, expanded: 4 }}` is full width on
   * a phone, half from 600dp and a third from 840dp. Each entry applies from its
   * own window class up, so two of them usually describe a whole layout.
   *
   * A span wider than the row is clamped to the row rather than overflowing.
   *
   * `span="grow"` is the exception to all of the above: it takes the width the
   * row has left rather than a share of it, which is the layout a thumbnail
   * beside a body of text wants — `<MPGridItem span={3}>` for the picture and
   * `<MPGridItem span="grow">` for the words, with no arithmetic to keep in step
   * when the picture's column count changes. It is responsive like any other
   * value: `span={{ compact: 12, medium: 'grow' }}` stacks on a phone and fills
   * the rest of the row from 600dp.
   * @default the grid's full width
   */
  span?: MPResponsive<MPGridSpan>;
  /**
   * Columns left empty *before* the item — space pushed in ahead of it, not an
   * absolute position in the row. First in a twelve-column row, `offset={4}` with
   * `span={4}` is the middle third; after an item that already took four columns,
   * the same offset skips four more and lands on the last third.
   *
   * Responsive in the same way `span` is.
   * @default 0
   */
  offset?: MPResponsive<number>;
  /** Overrides the row's `alignItems` for this item alone. */
  alignSelf?: MPGridAlignSelf;
  /**
   * Renders something other than a `<div>`: `render={<li />}`,
   * `render={<article />}`. Base UI's own escape hatch.
   */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Material's layout grid: a row divided into columns, and items that take some
 * of them.
 *
 * MD3 describes a page as a number of columns with a gutter between them, and
 * describes how that number changes with the **window size class** rather than
 * with a pixel width — four columns in a compact window, twelve from medium up.
 * That is what this component is, and it is why `span` and `columns` take
 * `{ compact, medium, expanded, large, extra-large }` rather than a set of
 * breakpoints of the library's own invention. See `MPWindowClass` for why those
 * are not Tailwind's four.
 *
 * ## Why the widths are real CSS and not utilities
 *
 * They cannot be utilities. A column is
 * `(100% + gutter) * span / columns - gutter`, it has to be recomputed at four
 * widths, and it is the width of an element whose column count is declared on its
 * *parent* — none of which Tailwind can spell, because Tailwind finds classes by
 * scanning source text and `columns` is a number the caller picks at runtime.
 *
 * So the arithmetic is written once, in `src/styles.css`, and the per-instance
 * numbers arrive as inline `--_mp-*` slots — exactly how a `color` reaches a
 * background in this library. The count and the two gutters are declared on the
 * grid and *inherited* by the items rather than passed through a React context,
 * which is not a shortcut: a media query can change an inherited custom property
 * without React hearing about it, so the column count an item lays itself out
 * against is always the one that is actually on screen. A context would have to
 * re-render the subtree at every window class to say the same thing.
 *
 * ## Why a grid paints nothing
 *
 * No `variant`, no `color`, no padding. A grid is not a surface — it is the
 * arrangement of the surfaces inside it — and the moment it draws a sheet of its
 * own it stops being usable as the outermost thing on a page. Wrap it in an
 * [MPBox](./box) or an [MPCard](./card) when the sheet is wanted, and in an
 * [MPContainer](./container) when what is wanted is the page margin.
 *
 * Nesting is an `MPGrid` inside an `MPGridItem`, not a grid that is also an item:
 * the inner grid redeclares the column count for its own subtree while the item
 * around it keeps the width the outer grid gave it.
 */
export const MPGrid = React.forwardRef<HTMLDivElement, MPGridProps>(function MPGrid(
  {
    columns,
    spacing,
    rowSpacing,
    columnSpacing,
    justifyContent,
    alignItems,
    alignContent,
    wrap = true,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  return useRender({
    render,
    ref,
    props: {
      className: [
        'mp-grid flex',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        // Both gutters are read out of the slots below, which is what lets a
        // media query change them with no re-render.
        'gap-x-(--_mp-gap-x) gap-y-(--_mp-gap-y)',
        justifyContent ? JUSTIFY[justifyContent] : '',
        alignItems ? ALIGN_ITEMS[alignItems] : '',
        alignContent ? ALIGN_CONTENT[alignContent] : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      style: {
        ...responsiveSlots('cols', withBaseline(columns, DEFAULT_COLUMNS), columnCount),
        ...responsiveSlots(
          'gap-x',
          withBaseline(columnSpacing ?? spacing, DEFAULT_SPACING),
          spacingValue
        ),
        ...responsiveSlots(
          'gap-y',
          withBaseline(rowSpacing ?? spacing, DEFAULT_SPACING),
          spacingValue
        ),
        ...style
      },
      children,
      ...props
    }
  });
});

/**
 * One cell of an `MPGrid`.
 *
 * It is a width and nothing else — no surface, no padding, no typography. What
 * goes inside brings its own, which is the whole reason a cell and an
 * [MPBox](./box) are two components: wrapping something in a layout must not
 * change how it looks, and a cell that drew a sheet would make `span` a visual
 * decision.
 *
 * The column count it divides by is inherited from the grid as a custom
 * property, so an item with no `MPGrid` above it falls back to twelve rather than
 * breaking. It will still be a plain block in a plain parent, which is not a
 * layout — always wrap.
 */
export const MPGridItem = React.forwardRef<HTMLDivElement, MPGridItemProps>(function MPGridItem(
  { span, offset, alignSelf, render, className, style, children, ...props },
  ref
) {
  return useRender({
    render,
    ref,
    props: {
      className: ['mp-grid-item', alignSelf ? ALIGN_SELF[alignSelf] : '', className ?? '']
        .filter(Boolean)
        .join(' '),
      /*
       * What narrows the `margin-inline-start` rule to the items it is for.
       *
       * The offset is a margin, and the stylesheet's declaration is unlayered —
       * so on every item that had never asked for one it was still winning
       * against a caller's own `m-6`, silently, on the inline-start side alone.
       * That is a hard thing to see: three sides of the margin are there and the
       * fourth is not.
       *
       * The arithmetic is unchanged and so is the cascade for anything that did
       * ask. An explicit `offset={0}` still counts as asking — a caller writing
       * a zero is naming the property, and it has always been the value the
       * declaration resolved to anyway.
       */
      'data-mp-offset': offset === undefined || offset === null ? undefined : '',
      style: {
        ...spanSlots(span),
        ...responsiveSlots('offset', offset, offsetValue),
        ...style
      },
      children,
      ...props
    }
  });
});
