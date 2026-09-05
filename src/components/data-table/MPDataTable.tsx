import * as React from 'react';
import { MPButton } from '../button/MPButton';
import { MPCheckbox } from '../checkbox/MPCheckbox';
import { MPIcon } from '../icon/MPIcon';
import { MPPagination } from '../pagination/MPPagination';
import { MPSelect } from '../select/MPSelect';
import { MPTextField } from '../text-field/MPTextField';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { containerSurface } from '../../internal/elevation';
import { useMPColor, useMPDensity, useMPSize } from '../../internal/config';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { fillMessage } from '../../internal/i18n';
import { DATA_TABLE } from '../../internal/messages/data-table';
import { TABLE } from '../../internal/messages/table';
import { TRANSFER } from '../../internal/messages/transfer';
import { CONTROL_ICON, META_TEXT } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import { CELL_TEXT, HEAD_TEXT, ROW, cellPadX, cellPadY, drawableCell } from '../../internal/table';
import {
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  compareValues,
  downloadText,
  keysBetween,
  nextSort,
  pageBounds,
  searchHaystack,
  searchText,
  sortRows,
  toCsv,
  type MPDataTableSort
} from '../../internal/data-table';
import type {
  MPAlign,
  MPColor,
  MPDensity,
  MPElevation,
  MPSize,
  MPSlots,
  MPVariant
} from '../../types';

export type { MPDataTableSort, MPSortDirection } from '../../internal/data-table';

/** How many rows may be chosen at once. */
export type MPDataTableSelectionMode = 'none' | 'single' | 'multiple';

/** The parts an `MPDataTable` draws that a `className` cannot reach. */
export type MPDataTableSlot = 'toolbar' | 'table' | 'head' | 'row' | 'cell' | 'footer';

/**
 * A column: its heading, how wide it is, how to get a value out of a row and how
 * to draw one.
 *
 * The split between `value` and `render` is the whole shape of this type. A
 * `render` decides what a reader sees; a `value` decides what the sort and the
 * search see. Most columns need neither — the cell is `row[key]`, and that is
 * what is compared and matched. A column that draws an `MPChip` needs `render`,
 * and it needs `value` as well the moment it is sortable, because a React
 * element has no order.
 */
export interface MPDataTableColumn<Row> {
  /**
   * Identifies the column — to `sort`, to `columnWidths`, and unless `value` or
   * `render` says otherwise, it names the property to read off each row.
   */
  key: string;
  /** The heading. Defaults to the `key`, which is usually not what you want. */
  label?: React.ReactNode;
  /**
   * How wide, in pixels.
   *
   * Pixels rather than any CSS length, because a resize drag does arithmetic on
   * this number. Columns that do not say are `160`, and see `resizable` for what
   * turning it on does to the layout.
   */
  width?: number;
  /** How narrow a drag may make it. @default 48 */
  minWidth?: number;
  /**
   * Which edge the cells line up against. Numbers usually want `end` so their
   * digits line up in a column.
   * @default 'start'
   */
  align?: MPAlign;
  /** Whether this column can be sorted. Defaults to the table's `sortable`. */
  sortable?: boolean;
  /** Whether this column can be dragged wider. Defaults to the table's `resizable`. */
  resizable?: boolean;
  /** Whether the search looks in this column. @default true */
  searchable?: boolean;
  /**
   * The value behind the cell: what is sorted, and what the search is matched
   * against. Defaults to `row[key]`.
   */
  value?: (row: Row) => unknown;
  /**
   * Orders two rows by this column, for a value the default comparison cannot
   * rank — a status that goes `draft`, `review`, `live` rather than
   * alphabetically. Always written ascending; the table reverses it.
   */
  compare?: (a: Row, b: Row) => number;
  /**
   * Draws the cell. `index` is the row's place in the sorted, searched order and
   * is counted across every page, so `(row, index) => index + 1` is a running
   * row number.
   */
  render?: (row: Row, index: number) => React.ReactNode;
  /**
   * What a download writes for this cell.
   *
   * Defaults to `value`, and then to `row[key]`. It is separate from `render` on
   * purpose: a cell that draws a chip, an avatar or a progress bar has no text
   * to put in a file, and `render`'s return is a React element rather than
   * something a spreadsheet can hold.
   */
  exportValue?: (row: Row) => unknown;
  /** Leaves this column out of a download. @default true */
  exportable?: boolean;
}

export interface MPDataTableProps<Row> extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children' | 'onSelect'
> {
  /** The columns, in the order they appear. */
  headers: readonly MPDataTableColumn<Row>[];
  /** The rows. */
  items: readonly Row[];
  /**
   * A stable identity per row, and the value `selected` is a list of.
   *
   * Defaults to the row's index in `items`, which is enough for a table that
   * only ever displays. The moment rows can be chosen, sorted or searched it is
   * required in practice: an index identifies a position, and every one of those
   * three changes which row is in it.
   */
  getRowKey?: (row: Row, index: number) => React.Key;
  /** Shown above the table, and read out as its accessible name. */
  caption?: React.ReactNode;
  /** What to show instead of rows when nothing is left. */
  empty?: React.ReactNode;
  /**
   * Which language the table's own words are in — the ticks' names, the count
   * under the rows, the download button.
   *
   * It is also what the default sort compares strings with. Pass it whenever the
   * markup is rendered on a server: without it the comparison follows the
   * runtime's own locale, and a server that disagrees with the browser about
   * that produces two different row orders for the same table.
   */
  locale?: string;

  /**
   * Makes every column sortable. A column overrides it either way with its own
   * `sortable`.
   * @default false
   */
  sortable?: boolean;
  /**
   * Whether more than one column can be sorted at a time. With `multiple`, a
   * Shift-press adds a column to the sort instead of replacing it, and each
   * sorted heading carries its place in the order.
   * @default 'single'
   */
  sortMode?: 'single' | 'multiple';
  /** The sort. Use with `onSortChange` for a controlled one. */
  sort?: readonly MPDataTableSort[];
  /** What it starts as, for an uncontrolled table. */
  defaultSort?: readonly MPDataTableSort[];
  onSortChange?: (sort: MPDataTableSort[]) => void;

  /** Draws a field above the table that filters the rows. @default false */
  searchable?: boolean;
  /** The query. Use with `onSearchChange` for a controlled field. */
  search?: string;
  /** What it starts as, for an uncontrolled one. */
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  /**
   * Overrides the word on the field, which is also its accessible name.
   *
   * It is a label rather than a placeholder because a placeholder is not a name:
   * a field whose only word disappears the moment somebody types in it is a
   * field a screen reader announces as nothing.
   */
  searchLabel?: string;
  /**
   * A filter of your own, applied after the search. Return `false` to drop a
   * row. `index` is the row's place in `items`.
   */
  filter?: (row: Row, index: number) => boolean;
  /** Content at the end of the bar the search field sits in. */
  toolbar?: React.ReactNode;

  /**
   * Hands the rows out a page at a time, and puts the pages in the footer.
   *
   * Every row is rendered otherwise, and there is no windowing — the same
   * ceiling `MPTable` states, and this is the answer to it. A few hundred rows
   * is nothing, a few thousand is a visible pause, and past that a table wants
   * either this or a narrower list.
   * @default false
   */
  paged?: boolean;
  /** The current page, 1-based. Use with `onPageChange`. */
  page?: number;
  /** @default 1 */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** How many rows a page holds. Use with `onPageSizeChange`. */
  pageSize?: number;
  /** @default 25 */
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * What the footer's page-size control offers. An empty list drops the control.
   * @default [10, 25, 50, 100]
   */
  pageSizeOptions?: readonly number[];

  /**
   * Lets a heading be dragged wider or narrower, and gives the handle between
   * two columns to the keyboard as well.
   *
   * **It also changes how the columns are laid out, and it has to.** Without it
   * the browser balances the columns against their contents, which is what makes
   * a plain table read well; but a balanced column springs back from a drag,
   * because a width in that layout is a hint rather than a measurement. Turning
   * this on fixes the layout, so `width` becomes exact and a column that has not
   * said how wide it is takes 160.
   * @default false
   */
  resizable?: boolean;
  /** The widths, keyed by column. Use with `onColumnWidthsChange`. */
  columnWidths?: Readonly<Record<string, number>>;
  /** What they start as, for an uncontrolled table. */
  defaultColumnWidths?: Readonly<Record<string, number>>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;

  /**
   * How many rows may be chosen.
   * @default 'none'
   */
  selectionMode?: MPDataTableSelectionMode;
  /** The chosen rows, as their keys. Use with `onSelectedChange`. */
  selected?: readonly React.Key[];
  /** Which start chosen, for an uncontrolled table. */
  defaultSelected?: readonly React.Key[];
  /**
   * The keys, and the rows behind them — including rows the search has hidden
   * and rows on other pages, which are still chosen and still have to be handed
   * back.
   */
  onSelectedChange?: (selected: React.Key[], rows: Row[]) => void;
  /**
   * Adds a column of ticks, and one in the heading that takes the whole page at
   * once.
   *
   * It also decides which of the row and the tick is the keyboard's route into
   * the row — see the note on the component.
   * @default false
   */
  checkboxes?: boolean;
  /** Fires on every press of a row, before the selection changes. */
  onRowClick?: (row: Row, index: number) => void;

  /**
   * Adds a button that writes the rows out as a CSV file.
   *
   * **Every row the reader is currently looking at, not the page they are on.**
   * The search and the sort are applied and the paging is not, because a file of
   * page three is not a file anybody asked for.
   * @default false
   */
  exportable?: boolean;
  /** What the downloaded file is called. @default 'table.csv' */
  exportFileName?: string;
  /**
   * Takes the CSV instead of downloading it — to post it somewhere, to open it
   * in a viewer of your own, or to put a sheet around it.
   */
  onExport?: (csv: string) => void;

  /** Tints every other row. @default false */
  striped?: boolean;
  /** Lights the row under the pointer. @default false */
  hoverable?: boolean;
  /**
   * Pins the heading while the body scrolls. Only does anything if something
   * around the table actually constrains its height.
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * How much surface the sheet around the table paints.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /** How far off the page the sheet is lifted, on MD3's own scale. */
  elevation?: MPElevation;
  /** @default 'md' */
  size?: MPSize;
  /**
   * Which accent family the sort arrow, the ticks and a chosen row read. The
   * cells themselves stay neutral.
   * @default 'primary'
   */
  color?: MPColor;
  /** Takes room out of every cell without changing what it is set in. @default 0 */
  density?: MPDensity;
  classNames?: MPSlots<MPDataTableSlot>;
}

/**
 * What the sort and the search see, which is not always what the cell draws.
 *
 * Out here rather than inside the component because every memo below depends on
 * it, and a function rebuilt on every render is a dependency none of them can
 * hold.
 */
function valueOf<Row>(column: MPDataTableColumn<Row>, row: Row): unknown {
  return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
}

/** One row of `items`, with everything the table needs to talk about it. */
interface RowEntry<Row> {
  row: Row;
  /** The caller's key, handed back verbatim by `onSelectedChange`. */
  identity: React.Key;
  /** The same key as a string, which is what the sets and the ranges speak in. */
  key: string;
  /** Where it sat in `items`, which is what `getRowKey` and `filter` were told. */
  origin: number;
}

/** The tick column's width, wide enough that the box's focus ring is not clipped. */
const TICK_WIDTH: Record<MPSize, number> = {
  xs: 36,
  sm: 40,
  md: 48,
  lg: 52,
  xl: 60
};

/**
 * The heading, as a control.
 *
 * A real `<button>`, so it is reachable by Tab and announced as pressable. The
 * `<th>` around it carries `aria-sort`, which is what says *how* the column is
 * sorted; the button only says that pressing changes it.
 */
const SORT_BUTTON = [
  'group/sort -m-1 flex w-full cursor-pointer items-center gap-1 rounded-mp-xs p-1',
  'appearance-none border-0 bg-transparent font-[inherit] text-inherit text-start',
  'transition-[color] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
  'hover:text-mp-on-surface',
  'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
  'focus-visible:outline-solid outline-none'
].join(' ');

/**
 * The grab area, wider than the line it draws.
 *
 * Eight pixels of target for a one-pixel affordance: a resize handle you have to
 * hit exactly is the reason people give up on resizing columns. It straddles the
 * boundary the way the cursor says it does, which is why it is translated half
 * its own width past the end of its cell.
 *
 * `data-dragging` as well as `:hover`, because pointer capture means the pointer
 * may be well away from the handle while the drag runs, and a rule that went out
 * from under the hand would read as the drag having been let go.
 */
const RESIZE_HANDLE = [
  'mp-data-table__resize absolute inset-y-0 end-0 z-10 w-2 translate-x-1/2 rtl:-translate-x-1/2',
  'cursor-col-resize touch-none select-none appearance-none border-0 bg-transparent p-0',
  'after:absolute after:inset-y-1 after:start-1/2 after:w-px after:bg-transparent',
  'after:transition-[background-color] after:duration-(--mp-sys-motion-duration-short4)',
  'hover:after:bg-mp-primary data-dragging:after:bg-mp-primary',
  'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-solid outline-none'
].join(' ');

/**
 * A grid of data with the four things a reader does to one: put it in order,
 * cut it down, step through it and take some of it away.
 *
 * ```tsx
 * <MPDataTable headers={columns} items={rows} sortable searchable paged />
 * ```
 *
 * It is a separate component from [MPTable](table) rather than a mode of it.
 * `MPTable` is the presentational half: it
 * draws what it is given, in the order it is given, and a page that only shows a
 * grid should not carry a comparator, a CSV writer and a page clamp to do it.
 * What the two do share is the geometry — `internal/table.ts` holds the cells'
 * room and the type they are set in — so a data table never sits a pixel off the
 * plain table beside it.
 *
 * ## What it does to the rows, and in what order
 *
 * Search, then `filter`, then sort, then the page. The order is the only one
 * that makes each step mean what it says: sorting before searching would order
 * rows nobody is going to see, and paging before either would cut a page out of
 * a list the reader has not asked for yet. `render`'s `index` counts along the
 * sorted, searched order across every page, so it is a running row number rather
 * than a position on the screen.
 *
 * ## Who holds the keyboard
 *
 * A row that answers a press has to answer a keyboard, and a table of two
 * hundred rows that each did would be two hundred tab stops. So there is exactly
 * one route into a row and `checkboxes` is what picks it: with ticks, the tick
 * is the control and the row is not in the tab order; without them, the row is.
 * `onRowClick` on its own always puts the row in the tab order, because then
 * there is nothing else to press.
 */
export function MPDataTable<Row>({
  headers,
  items,
  getRowKey,
  caption,
  empty,
  locale: localeProp,
  sortable = false,
  sortMode = 'single',
  sort: sortProp,
  defaultSort,
  onSortChange,
  searchable = false,
  search: searchProp,
  defaultSearch,
  onSearchChange,
  searchLabel,
  filter,
  toolbar,
  paged = false,
  page: pageProp,
  defaultPage,
  onPageChange,
  pageSize: pageSizeProp,
  defaultPageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  resizable = false,
  columnWidths: columnWidthsProp,
  defaultColumnWidths,
  onColumnWidthsChange,
  selectionMode = 'none',
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  checkboxes = false,
  onRowClick,
  exportable = false,
  exportFileName = 'table.csv',
  onExport,
  striped = false,
  hoverable = false,
  stickyHeader = false,
  variant = 'outlined',
  elevation,
  size: sizeProp,
  color: colorProp,
  density: densityProp,
  className,
  style,
  classNames,
  ...props
}: MPDataTableProps<Row>) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const density = useMPDensity(densityProp);
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(DATA_TABLE, locale);
  const tableMessages = useMPMessages(TABLE, locale);
  // The word on a field somebody types a filter into is `MPTransfer`'s, which is
  // the same field doing the same job. See `MPTreeSelect`, which reuses it too.
  const searchMessages = useMPMessages(TRANSFER, locale);

  const padX = cellPadX(size, density);
  const padY = cellPadY(size, density);

  const [uncontrolledSort, setUncontrolledSort] = React.useState<MPDataTableSort[]>(() => [
    ...(defaultSort ?? [])
  ]);
  const sort = sortProp ?? uncontrolledSort;

  const [uncontrolledSearch, setUncontrolledSearch] = React.useState(defaultSearch ?? '');
  const search = searchProp ?? uncontrolledSearch;

  const [uncontrolledPage, setUncontrolledPage] = React.useState(defaultPage ?? 1);
  const page = pageProp ?? uncontrolledPage;

  const [uncontrolledPageSize, setUncontrolledPageSize] = React.useState(defaultPageSize ?? 25);
  const pageSize = pageSizeProp ?? uncontrolledPageSize;

  const [uncontrolledWidths, setUncontrolledWidths] = React.useState<Record<string, number>>(
    () => ({ ...defaultColumnWidths })
  );
  const widths = columnWidthsProp ?? uncontrolledWidths;

  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<React.Key[]>(() => [
    ...(defaultSelected ?? [])
  ]);
  const selected = selectedProp ?? uncontrolledSelected;
  const selectedKeys = React.useMemo(
    () => new Set(selected.map((entry) => String(entry))),
    [selected]
  );

  /*
   * The anchor a Shift-press measures from, and the one piece of selection state
   * that is genuinely the table's rather than the caller's: it is where the last
   * plain press landed, which is not something `selected` can say.
   */
  const anchor = React.useRef<string | null>(null);

  const entries = React.useMemo<RowEntry<Row>[]>(
    () =>
      items.map((row, index) => {
        const identity = getRowKey ? getRowKey(row, index) : index;

        return { row, identity, key: String(identity), origin: index };
      }),
    [items, getRowKey]
  );

  /*
   * One haystack per row, folded once. The alternative — folding on every
   * comparison — puts a `toLocaleLowerCase` on every cell of every row on every
   * keystroke, which is the shape of API a `matches(row, query)` signature
   * quietly asks for.
   */
  const haystacks = React.useMemo(() => {
    const columns = headers.filter((column) => column.searchable !== false);

    return entries.map((entry) => searchHaystack(columns.map((c) => valueOf(c, entry.row))));
  }, [entries, headers]);

  const needle = searchText(search.trim());

  const found = React.useMemo(() => {
    const matched =
      needle === '' ? entries : entries.filter((_, index) => haystacks[index].includes(needle));

    return filter ? matched.filter((entry) => filter(entry.row, entry.origin)) : matched;
  }, [entries, haystacks, needle, filter]);

  const collator = React.useMemo(
    () => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }),
    [locale]
  );

  const ordered = React.useMemo(
    () =>
      sortRows(found, sort, (key, direction) => {
        const column = headers.find((entry) => entry.key === key);

        if (!column) {
          return null;
        }

        const descending = direction === 'desc';
        const compare = column.compare;

        // A column's own comparison is always written ascending — that is what
        // its documentation promises — so reversing it is the table's job.
        if (compare) {
          return (a: RowEntry<Row>, b: RowEntry<Row>) =>
            descending ? -compare(a.row, b.row) : compare(a.row, b.row);
        }

        return (a: RowEntry<Row>, b: RowEntry<Row>) =>
          compareValues(valueOf(column, a.row), valueOf(column, b.row), collator, descending);
      }),
    [found, sort, headers, collator]
  );

  const bounds = pageBounds(ordered.length, page, pageSize);
  const shown = paged ? ordered.slice(bounds.start, bounds.end) : ordered;

  /* ------------------------------------------------------------- committing */

  const commitSort = (key: string, additive: boolean) => {
    const next = nextSort(sort, key, additive && sortMode === 'multiple');

    if (sortProp === undefined) {
      setUncontrolledSort(next);
    }

    onSortChange?.(next);
  };

  const commitPage = (next: number) => {
    if (pageProp === undefined) {
      setUncontrolledPage(next);
    }

    onPageChange?.(next);
  };

  const commitSearch = (next: string) => {
    if (searchProp === undefined) {
      setUncontrolledSearch(next);
    }

    // A search that cut the list shorter than the page the reader is on would
    // otherwise leave them looking at an empty screen and reading it as "no
    // matches". `pageBounds` clamps what is *drawn*; this is what stops the
    // number itself drifting somewhere it can never come back from.
    commitPage(1);
    onSearchChange?.(next);
  };

  const commitPageSize = (next: number) => {
    if (pageSizeProp === undefined) {
      setUncontrolledPageSize(next);
    }

    // The first row of the page the reader was on is not the first row of any
    // page under a new size, so there is no honest way to stay put. The top is
    // the one place that is the same answer whatever the size.
    commitPage(1);
    onPageSizeChange?.(next);
  };

  const commitWidths = (next: Record<string, number>) => {
    if (columnWidthsProp === undefined) {
      setUncontrolledWidths(next);
    }

    onColumnWidthsChange?.(next);
  };

  /**
   * What is now held, in the order `items` is in.
   *
   * Not the order the presses happened in, which is what a set of keys carries
   * and is not information anybody asked for: a reader who ticks the last row
   * and then the first has chosen two rows, not an order. Walking `items`
   * instead also drops a key whose row has since gone.
   */
  const commitSelection = (keys: string[]) => {
    const wanted = new Set(keys);
    const rows: Row[] = [];
    const identities: React.Key[] = [];

    for (const entry of entries) {
      if (wanted.has(entry.key)) {
        identities.push(entry.identity);
        rows.push(entry.row);
      }
    }

    if (selectedProp === undefined) {
      setUncontrolledSelected(identities);
    }

    onSelectedChange?.(identities, rows);
  };

  /* -------------------------------------------------------------- selection */

  const selectable = selectionMode !== 'none';
  const multiple = selectionMode === 'multiple';
  const showTicks = checkboxes && selectable;

  const pressRow = (entry: RowEntry<Row>, index: number, additive: boolean) => {
    onRowClick?.(entry.row, bounds.start + index);

    if (!selectable) {
      return;
    }

    if (!multiple) {
      // Single select toggles, unlike `MPTreeView`'s: a table row that could be
      // chosen but never let go would leave a reader with no way back to "no
      // rows chosen", which is the state every action bar above it keys off.
      commitSelection(selectedKeys.has(entry.key) ? [] : [entry.key]);
      anchor.current = entry.key;

      return;
    }

    if (additive && anchor.current !== null) {
      const range = keysBetween(
        shown.map((row) => row.key),
        anchor.current,
        entry.key
      );

      // Added to what is held rather than replacing it: a Shift-press extends a
      // selection, and a reader who has ticked three rows across two pages has
      // not asked for the other two to go.
      commitSelection([...new Set([...selectedKeys, ...range])]);

      return;
    }

    anchor.current = entry.key;
    commitSelection(
      selectedKeys.has(entry.key)
        ? [...selectedKeys].filter((key) => key !== entry.key)
        : [...selectedKeys, entry.key]
    );
  };

  const pageKeys = shown.map((entry) => entry.key);
  const chosenHere = pageKeys.filter((key) => selectedKeys.has(key)).length;
  const allHere = pageKeys.length > 0 && chosenHere === pageKeys.length;

  const toggleAll = () => {
    // The page rather than the whole set, because the tick sits in the header of
    // what is on screen and a control that quietly took four hundred rows the
    // reader cannot see is a control that did something else.
    commitSelection(
      allHere
        ? [...selectedKeys].filter((key) => !pageKeys.includes(key))
        : [...new Set([...selectedKeys, ...pageKeys])]
    );
  };

  /* ---------------------------------------------------------------- resizing */

  const widthOf = (column: MPDataTableColumn<Row>): number =>
    widths[column.key] ?? column.width ?? DEFAULT_COLUMN_WIDTH;

  const heldSelection = React.useRef<string | null>(null);

  React.useEffect(
    () => () => {
      // A table unmounted mid-drag never reaches `end`, and would leave the whole
      // page unselectable with nothing left on screen to explain why.
      if (heldSelection.current !== null) {
        document.body.style.userSelect = heldSelection.current;
        heldSelection.current = null;
      }
    },
    []
  );

  const beginResize = (
    column: MPDataTableColumn<Row>,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    const handle = event.currentTarget;

    /*
     * Capture is what keeps the drag alive once the pointer leaves the handle.
     * It is still allowed to fail — `setPointerCapture` throws for a pointer
     * that is no longer active, which a flicked tap can reach — and an exception
     * here would abandon the rest of this function, leaving the page's selection
     * taken away with nothing left to hand it back. `MPPanes` says the same.
     */
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Nothing to do about it, and nothing that follows depends on it.
    }

    handle.dataset.dragging = 'true';

    const held = document.body.style.userSelect;

    heldSelection.current = held;
    document.body.style.userSelect = 'none';

    const origin = event.clientX;
    const start = widthOf(column);
    // Positive is always "wider", so a drag under RTL widens the column the way
    // the pointer went rather than the way the axis is numbered.
    const sign = getComputedStyle(handle).direction === 'rtl' ? -1 : 1;
    const floor = Math.max(MIN_COLUMN_WIDTH, column.minWidth ?? MIN_COLUMN_WIDTH);

    const move = (moveEvent: PointerEvent) => {
      commitWidths({
        ...widths,
        [column.key]: Math.max(floor, Math.round(start + (moveEvent.clientX - origin) * sign))
      });
    };

    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      delete handle.dataset.dragging;

      if (heldSelection.current !== null) {
        document.body.style.userSelect = heldSelection.current;
        heldSelection.current = null;
      }
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };

  const nudge = (column: MPDataTableColumn<Row>, by: number) => {
    const floor = Math.max(MIN_COLUMN_WIDTH, column.minWidth ?? MIN_COLUMN_WIDTH);

    commitWidths({ ...widths, [column.key]: Math.max(floor, widthOf(column) + by) });
  };

  const resetWidth = (column: MPDataTableColumn<Row>) => {
    const next = { ...widths };

    delete next[column.key];
    commitWidths(next);
  };

  /* ----------------------------------------------------------------- export */

  const download = () => {
    const columns = headers.filter((column) => column.exportable !== false);
    const head = columns.map((column) =>
      typeof column.label === 'string' ? column.label : column.key
    );
    const body = ordered.map((entry) =>
      columns.map((column) =>
        column.exportValue ? column.exportValue(entry.row) : valueOf(column, entry.row)
      )
    );
    const csv = toCsv([head, ...body]);

    if (onExport) {
      onExport(csv);

      return;
    }

    downloadText(csv, exportFileName, 'text/csv;charset=utf-8');
  };

  /* ---------------------------------------------------------------- drawing */

  const cellStyle: React.CSSProperties = { padding: `${padY} ${padX}` };
  const headCellStyle: React.CSSProperties = {
    ...cellStyle,
    // The header takes a neutral surface rather than a tint, for the reason
    // `MPTable`'s does: a coloured band behind a row of column names is the
    // fastest way to make data look like chrome.
    backgroundColor: 'var(--_mp-color-surface-container)'
  };
  const ruleStyle: React.CSSProperties = {
    borderTop: '1px solid var(--_mp-color-outline-variant)',
    backgroundColor: 'var(--_mp-row)'
  };

  const sortIndex = (key: string) => sort.findIndex((entry) => entry.key === key);
  const columnCount = headers.length + (showTicks ? 1 : 0);
  const rowsAreTabStops = Boolean(onRowClick) || (selectable && !showTicks);
  const lit = hoverable || selectable || Boolean(onRowClick);
  const hasToolbar = searchable || exportable || toolbar !== undefined;
  const hasFooter = paged || selectable;

  const join = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ');

  return (
    <div
      data-mp-size={size}
      data-mp-variant={variant}
      className={join(
        'mp-data-table rounded-mp-md flex flex-col',
        containerSurface(variant, elevation),
        className
      )}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {hasToolbar ? (
        <div
          className={join(
            'mp-data-table__toolbar flex flex-wrap items-center gap-2',
            classNames?.toolbar
          )}
          style={{ padding: `${padY} ${padX}` }}
        >
          {searchable ? (
            <MPTextField
              size={size}
              value={search}
              onChange={commitSearch}
              label={searchLabel ?? searchMessages.search}
              startIcon={<MPIcon icon={SearchIcon} size={CONTROL_ICON[size]} />}
              className="mp-data-table__search min-w-0 flex-1"
            />
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          {toolbar}

          {exportable ? (
            <MPButton
              size={size}
              variant="text"
              color={color}
              onClick={download}
              startIcon={<MPIcon icon={ArrowDownIcon} size={CONTROL_ICON[size]} />}
            >
              {messages.download}
            </MPButton>
          ) : null}
        </div>
      ) : null}

      <div className="mp-data-table__scroll min-h-0 flex-1 overflow-auto">
        <table
          className={join(
            'text-mp-on-surface w-full text-start',
            CELL_TEXT[size],
            classNames?.table
          )}
          style={{
            borderCollapse: 'collapse',
            // Fixed only when a drag has to stick. See `resizable`: a width in
            // the balanced layout is a hint, and a hint springs back.
            ...(resizable
              ? {
                  tableLayout: 'fixed',
                  minWidth: headers.reduce(
                    (total, column) => total + widthOf(column),
                    showTicks ? TICK_WIDTH[size] : 0
                  )
                }
              : undefined)
          }}
        >
          {caption ? (
            <caption
              className={`text-mp-on-surface-variant ${META_TEXT}`}
              style={{ ...cellStyle, textAlign: 'start' }}
            >
              {caption}
            </caption>
          ) : null}

          {/* Widths belong on a `<col>`, not on the first row's cells: a width
              set on a `<th>` is one the browser renegotiates against every other
              row, and only the column element states it once. */}
          <colgroup>
            {showTicks ? <col style={{ width: TICK_WIDTH[size] }} /> : null}
            {headers.map((column) => (
              <col
                key={column.key}
                style={
                  resizable || widths[column.key] !== undefined || column.width !== undefined
                    ? { width: widthOf(column) }
                    : undefined
                }
              />
            ))}
          </colgroup>

          <thead className={classNames?.head}>
            <tr>
              {showTicks ? (
                <th
                  scope="col"
                  className={join('whitespace-nowrap', stickyHeader && 'sticky top-0 z-20')}
                  style={headCellStyle}
                >
                  <MPCheckbox
                    size={size}
                    color={color}
                    checked={allHere}
                    indeterminate={chosenHere > 0 && !allHere}
                    onCheckedChange={toggleAll}
                    label={<span className={VISUALLY_HIDDEN}>{messages.selectAll}</span>}
                    disabled={!multiple || pageKeys.length === 0}
                  />
                </th>
              ) : null}

              {headers.map((column) => {
                const canSort = column.sortable ?? sortable;
                const place = sortIndex(column.key);
                const entry = place === -1 ? undefined : sort[place];
                const canResize = column.resizable ?? resizable;
                const align = column.align ?? 'start';

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      canSort
                        ? entry === undefined
                          ? 'none'
                          : entry.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                        : undefined
                    }
                    className={join(
                      'text-mp-on-surface-variant relative whitespace-nowrap',
                      HEAD_TEXT[size],
                      stickyHeader && 'sticky top-0 z-10'
                    )}
                    style={{ ...headCellStyle, textAlign: align }}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className={join(
                          SORT_BUTTON,
                          align === 'end' && 'justify-end',
                          align === 'center' && 'justify-center'
                        )}
                        onClick={(event) => commitSort(column.key, event.shiftKey)}
                      >
                        <span className="min-w-0 truncate">{column.label ?? column.key}</span>

                        {/*
                          Turned, not swapped: one glyph rotated is one glyph in
                          the bundle, and the turn is what a reader watching the
                          column flip actually sees happen.
                        */}
                        <MPIcon
                          icon={ArrowUpIcon}
                          size={CONTROL_ICON[size] - 6}
                          className={join(
                            'shrink-0 transition-[rotate,opacity]',
                            'duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
                            entry === undefined
                              ? 'opacity-0 group-hover/sort:opacity-38'
                              : 'text-mp-primary opacity-100',
                            entry?.direction === 'desc' && 'rotate-180'
                          )}
                        />

                        {/* Which key of the sort this is. Only worth saying when
                            there is more than one. */}
                        {sort.length > 1 && place !== -1 ? (
                          <span className="text-mp-primary shrink-0 tabular-nums">{place + 1}</span>
                        ) : null}
                      </button>
                    ) : (
                      (column.label ?? column.key)
                    )}

                    {canResize ? (
                      <button
                        type="button"
                        aria-label={messages.resize}
                        className={RESIZE_HANDLE}
                        onPointerDown={(event) => beginResize(column, event)}
                        onDoubleClick={() => resetWidth(column)}
                        onKeyDown={(event) => {
                          const step = event.shiftKey ? 32 : 8;

                          if (event.key === 'ArrowRight') {
                            event.preventDefault();
                            nudge(column, step);
                          } else if (event.key === 'ArrowLeft') {
                            event.preventDefault();
                            nudge(column, -step);
                          } else if (event.key === 'Home') {
                            event.preventDefault();
                            resetWidth(column);
                          }
                        }}
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {shown.length === 0 ? (
              <tr className={ROW} style={ruleStyle}>
                <td
                  colSpan={columnCount}
                  className="text-mp-on-surface-variant"
                  style={{ padding: `2rem ${padX}`, textAlign: 'center' }}
                >
                  {empty ?? tableMessages.empty}
                </td>
              </tr>
            ) : (
              shown.map((entry, index) => {
                const chosen = selectedKeys.has(entry.key);

                return (
                  <tr
                    key={entry.key}
                    aria-selected={selectable ? chosen : undefined}
                    className={join(
                      ROW,
                      classNames?.row,
                      // The stripe and the hover are the same neutral surface one
                      // step apart rather than a tint: a table that alternates
                      // between white and pale blue has coloured half its data.
                      striped && (bounds.start + index) % 2 === 1
                        ? '[--_mp-row:var(--_mp-color-surface-container-low)]'
                        : '',
                      // A chosen row is the one place the accent reaches the
                      // body, and it is the lowest container tint the accent
                      // has: a filled row would take the cells' own contrast
                      // with it.
                      chosen ? '[--_mp-row:var(--_mp-color-secondary-container)]' : '',
                      lit && !chosen ? 'hover:[--_mp-row:var(--_mp-color-surface-container)]' : '',
                      (selectable || onRowClick) && 'cursor-pointer',
                      rowsAreTabStops &&
                        [
                          // Inset rather than offset, for the reason a tab's ring
                          // is: the sheet scrolls sideways and clips at its
                          // padding box, so a ring drawn outside the row would be
                          // shaved off at both ends of the table.
                          'outline-mp-secondary focus-visible:outline-2',
                          'focus-visible:-outline-offset-2 focus-visible:outline-solid outline-none'
                        ].join(' ')
                    )}
                    style={ruleStyle}
                    tabIndex={rowsAreTabStops ? 0 : undefined}
                    onClick={(event) => pressRow(entry, index, event.shiftKey)}
                    onKeyDown={
                      rowsAreTabStops
                        ? (event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') {
                              return;
                            }

                            // Only the row itself. A press inside a cell belongs
                            // to whatever is in that cell — a Space typed into a
                            // field in a table must not choose the row around it.
                            if (event.target !== event.currentTarget) {
                              return;
                            }

                            // Space scrolls the page by default, and a row that
                            // answered *and* scrolled would answer twice.
                            event.preventDefault();
                            pressRow(entry, index, event.shiftKey);
                          }
                        : undefined
                    }
                  >
                    {showTicks ? (
                      <td style={cellStyle}>
                        <MPCheckbox
                          size={size}
                          color={color}
                          checked={chosen}
                          onCheckedChange={() => pressRow(entry, index, false)}
                          label={<span className={VISUALLY_HIDDEN}>{messages.selectRow}</span>}
                        />
                      </td>
                    ) : null}

                    {headers.map((column) => (
                      <td
                        key={column.key}
                        className={classNames?.cell}
                        style={{ ...cellStyle, textAlign: column.align ?? 'start' }}
                      >
                        {column.render
                          ? column.render(entry.row, bounds.start + index)
                          : drawableCell(valueOf(column, entry.row))}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {hasFooter ? (
        <div
          className={join(
            'mp-data-table__footer border-mp-outline-variant flex flex-wrap items-center gap-3',
            'text-mp-on-surface-variant border-t',
            META_TEXT,
            classNames?.footer
          )}
          style={{ padding: `${padY} ${padX}` }}
        >
          <span className="mp-data-table__count">
            {fillMessage(messages.total, { total: String(ordered.length) })}
          </span>

          {selectedKeys.size > 0 ? (
            <span className="mp-data-table__selected text-mp-primary">
              {fillMessage(messages.selected, { count: String(selectedKeys.size) })}
            </span>
          ) : null}

          <span className="flex-1" />

          {paged && pageSizeOptions.length > 0 ? (
            <MPSelect
              size="xs"
              label={messages.perPage}
              floatingLabel={false}
              value={pageSize}
              onValueChange={(next) => commitPageSize(Number(next))}
              items={pageSizeOptions.map((option) => ({ value: option }))}
              className="mp-data-table__page-size"
              /*
               * Room for its own name. The words are the control's label and a
               * label sits in the notch, so a select only as wide as the two
               * digits in it has a name three lines tall lying across it. This
               * is the width of a small field, which is what it is.
               */
              style={{ minWidth: '9.5rem' }}
            />
          ) : null}

          {paged ? (
            <MPPagination
              size="xs"
              color={color}
              count={bounds.pages}
              page={bounds.page}
              onPageChange={commitPage}
              locale={locale}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
