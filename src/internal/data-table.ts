/**
 * The arithmetic an `MPDataTable` is made of.
 *
 * Here rather than in the component for the reason `internal/mockup.tsx` gives:
 * a component whose interesting fifty lines are buried in machinery is a
 * component nobody can read. Ranking two rows, cutting a page out of a list,
 * working out which rows a Shift-click covers and escaping a comma so a
 * spreadsheet does not shift a column are four questions with plain answers, and
 * a file that also has to draw a resize handle is not where they can be found.
 *
 * There is no React in this file and nothing in it knows what a column is.
 * Everything takes plain values and returns plain values, which is also what
 * makes it the half of the component that can be tested without a browser.
 */

/** Which way a column runs when it is sorted. */
export type MPSortDirection = 'asc' | 'desc';

/** One key of the sort, and its direction. A sort is a list of these. */
export interface MPDataTableSort {
  /** The column's `key`. */
  key: string;
  direction: MPSortDirection;
}

/* ------------------------------------------------------------------ sorting */

/**
 * The default comparison, for the columns that do not bring one.
 *
 * Empty sorts last in **both** directions, which is the one asymmetry here and
 * the one every spreadsheet has: a blank is not the smallest value, it is the
 * absence of one, and a descending sort whose first screen is forty blanks has
 * answered a question nobody asked.
 *
 * Numbers compare as numbers, dates as instants, booleans with `false` first,
 * and everything else through the collator — which is `numeric`, so `item2`
 * comes before `item10` rather than after it.
 */
export function compareValues(
  a: unknown,
  b: unknown,
  collator: Intl.Collator,
  descending = false
): number {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';

  /*
   * The reversal happens here rather than to the number this hands back, and
   * that is the whole reason this function knows which way the column runs: a
   * sort that flipped the result afterwards would flip the empties too, and
   * "last in both directions" would be "last in one".
   */
  if (aEmpty || bEmpty) {
    return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;
  }

  const sign = descending ? -1 : 1;

  if (typeof a === 'number' && typeof b === 'number') {
    // `NaN` is empty by another name: it compares false against everything, so
    // left to the subtraction below it would make the order depend on which
    // rows happened to be next to each other.
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return Number.isNaN(a) && Number.isNaN(b) ? 0 : Number.isNaN(a) ? 1 : -1;
    }

    return sign * (a - b);
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return sign * (Number(a) - Number(b));
  }

  if (a instanceof Date && b instanceof Date) {
    return sign * (a.getTime() - b.getTime());
  }

  return sign * collator.compare(String(a), String(b));
}

/**
 * Sorts by every key at once, the first key outermost.
 *
 * The sort is **stable** — `Array.prototype.sort` has been since ES2019 — which
 * is what makes a multi-key sort composable: sorting by name and then adding
 * date to the end of the list leaves rows with the same date in name order,
 * because that is the order they were already in.
 *
 * **The direction goes to `comparatorFor` rather than being applied to what it
 * hands back.** A machine that reversed the result would reverse everything in
 * it, and a comparison has parts that must not turn over — an empty cell sorts
 * last whichever way the column runs. Who reverses what is a policy, and this
 * function has none.
 *
 * `comparatorFor` answers `null` for a key no column claims, so a sort left over
 * from a column that has since gone is skipped rather than throwing.
 */
export function sortRows<T>(
  rows: readonly T[],
  sort: readonly MPDataTableSort[],
  comparatorFor: (key: string, direction: MPSortDirection) => ((a: T, b: T) => number) | null
): T[] {
  const steps: Array<(a: T, b: T) => number> = [];

  for (const entry of sort) {
    const compare = comparatorFor(entry.key, entry.direction);

    if (compare) {
      steps.push(compare);
    }
  }

  if (steps.length === 0) {
    return rows as T[];
  }

  return [...rows].sort((a, b) => {
    for (const step of steps) {
      const result = step(a, b);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  });
}

/**
 * What pressing a heading does, given what the sort already says.
 *
 * Three states rather than two — ascending, descending, unsorted — because the
 * order the rows arrived in is a state a reader cannot get back to by pressing
 * anything if the cycle only has two. That is the opposite of the choice
 * `MPTreeView`'s single select makes, and for the same reason read the other
 * way: there, "nothing chosen" is reachable by pressing something else; here it
 * is not.
 *
 * `additive` is what a Shift-press sets. It leaves the column where it already
 * is in the list rather than moving it to the end, so flipping the second key of
 * a two-key sort does not quietly make it the first.
 */
export function nextSort(
  current: readonly MPDataTableSort[],
  key: string,
  additive: boolean
): MPDataTableSort[] {
  const existing = current.find((entry) => entry.key === key);
  const direction: MPSortDirection | null =
    existing === undefined ? 'asc' : existing.direction === 'asc' ? 'desc' : null;

  if (!additive) {
    return direction === null ? [] : [{ key, direction }];
  }

  if (direction === null) {
    return current.filter((entry) => entry.key !== key);
  }

  if (existing === undefined) {
    return [...current, { key, direction }];
  }

  return current.map((entry) => (entry.key === key ? { key, direction } : entry));
}

/* ------------------------------------------------------------------- paging */

/** Where one page starts and stops, and how many there are. */
export interface MPPageBounds {
  /** How many pages the rows come to. Never below `1`. */
  pages: number;
  /** The page actually shown, clamped into range. */
  page: number;
  /** Index of the first row on it. */
  start: number;
  /** One past the last. */
  end: number;
}

/**
 * The page arithmetic, with the clamp in it.
 *
 * The clamp is the whole reason this is a function rather than two expressions
 * at the call site. A search that cuts a twenty-page table to three leaves the
 * caller's `page` at fourteen, and a table that answers with an empty screen has
 * told the reader their search found nothing. The page moves to the last one
 * that exists instead.
 */
export function pageBounds(total: number, page: number, pageSize: number): MPPageBounds {
  const size = Math.max(1, Math.floor(pageSize));
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(Math.floor(page), 1), pages);
  const start = (current - 1) * size;

  return { pages, page: current, start, end: Math.min(start + size, total) };
}

/* ---------------------------------------------------------------- selection */

/**
 * Every key between two, inclusive, in the order the rows are currently in.
 *
 * "Currently" is the point. A Shift-press chooses what the reader can see
 * between the two rows they pressed, so the range is taken from the sorted,
 * searched order rather than from the order `items` arrived in — otherwise
 * shift-pressing two adjacent rows of a sorted table would take in every row
 * that happens to lie between them in the original array.
 *
 * Which of the two keys is the anchor does not matter: dragging up covers the
 * same rows as dragging down. A key that is no longer in the list — a row the
 * current search hides — yields nothing rather than the range from one end that
 * an index of `-1` would quietly produce.
 */
export function keysBetween(order: readonly string[], from: string, to: string): string[] {
  const a = order.indexOf(from);
  const b = order.indexOf(to);

  if (a === -1 || b === -1) {
    return [];
  }

  return order.slice(Math.min(a, b), Math.max(a, b) + 1);
}

/* ------------------------------------------------------------------- search */

/**
 * A value as something a query can be matched against.
 *
 * `toLocaleLowerCase` and nothing else, which is the fold `MPCombobox`,
 * `MPCommandPalette` and `MPTreeSelect` already use. A collator that knew about
 * diacritics would be a second answer to a question this library has answered
 * one way — and a reader who has learned what the search box in one part of a
 * product does should not have learned the wrong thing about the rest of it.
 *
 * A `Date` is deliberately not formatted. What a reader sees in a cell came out
 * of the caller's own `render`, and guessing a format the search would agree
 * with is how a table ends up not finding a date that is on the screen. A column
 * whose dates should be searchable gives them a `value`.
 */
export function searchText(value: unknown): string {
  if (value === null || value === undefined || typeof value === 'object') {
    return '';
  }

  return String(value).toLocaleLowerCase();
}

/**
 * What a row's searchable values are joined on: a character no keyboard
 * produces, so a query cannot span the seam between two cells and find a row on
 * text that is not next to itself.
 *
 * Written as an escape rather than as the character — a literal NUL in a source
 * file is invisible to every reviewer, and turns the file into something `grep`
 * refuses to search.
 */
const SEAM = '\u0000';

/** Every string a row can be found by, folded once and joined into one haystack. */
export function searchHaystack(values: readonly unknown[]): string {
  return values.map(searchText).join(SEAM);
}

/* ---------------------------------------------------------------------- CSV */

/**
 * One field, quoted only when it has to be.
 *
 * The escaping is the whole job here and getting it wrong is silent: a comma
 * inside a cell shifts every column after it by one, and nobody notices until a
 * spreadsheet somewhere is off by a column. RFC 4180 is four rules and all four
 * are in these six lines — a field is quoted if it holds the separator, a quote
 * or a line break, and a quote inside a quoted field is written twice.
 *
 * `null` and `undefined` are empty rather than the words "null" and "undefined",
 * which is what `String()` would put in the cell.
 */
export function csvField(value: unknown, separator: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);

  return /["\r\n]/.test(text) || text.includes(separator)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

export interface MPCsvOptions {
  /** What goes between fields. `;` for the locales whose spreadsheets expect it. */
  separator?: string;
  /**
   * Writes a byte-order mark in front.
   *
   * On by default, and not as a nicety: Excel reads a UTF-8 CSV without one as
   * the local code page, so every non-ASCII name in the file arrives as
   * mojibake. Every other reader ignores the mark.
   */
  bom?: boolean;
}

/** Rows of already-stringable values, as one CSV document. */
export function toCsv(rows: readonly (readonly unknown[])[], options: MPCsvOptions = {}): string {
  const { separator = ',', bom = true } = options;

  // CRLF, which is what RFC 4180 says and what the spreadsheets that care about
  // the byte-order mark also expect.
  const body = rows
    .map((row) => row.map((field) => csvField(field, separator)).join(separator))
    .join('\r\n');

  // The mark as an escape rather than as the character, for the reason `SEAM`
  // above is: a lone zero-width no-break space is invisible in a diff.
  return bom ? `\uFEFF${body}` : body;
}

/**
 * Hands the file to the browser.
 *
 * A `blob:` URL and a synthesised press, which is the only way a page can
 * produce a file the reader keeps. The URL is released on the next frame rather
 * than straight away: some browsers have not finished reading it when the press
 * returns, and releasing it too early is a download that silently produces
 * nothing.
 */
export function downloadText(text: string, fileName: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  requestAnimationFrame(() => URL.revokeObjectURL(url));
}

/* ------------------------------------------------------------------ columns */

/** How wide a column is when neither the caller nor a drag has said. */
export const DEFAULT_COLUMN_WIDTH = 160;

/** How narrow a drag may make one. Below this the heading is a single letter. */
export const MIN_COLUMN_WIDTH = 48;
