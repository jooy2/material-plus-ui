/**
 * The three things the protocol asks of every component here, and the
 * conversions that follow from them.
 *
 * A2UI's props are not React props. They arrive from an agent as JSON, the
 * renderer's binder resolves them — a data binding becomes the value it points
 * at, an action becomes a closure — and what reaches a component is that
 * resolved object. Two of its entries are on *every* component in the basic
 * catalog and correspond to nothing a Material Plus component takes:
 *
 * - `weight` is a flex share, meaningful only inside a Row or a Column. It is a
 *   number in the payload and a `style` here, because no component in this
 *   library has a prop for how much of a parent's main axis it should claim —
 *   `MPFlex` distributes, and the claim belongs to the child.
 * - `accessibility` carries a label and a description for assistive technology,
 *   and from v1.0 whether its updates are announced and whether it is hidden
 *   from assistive technology altogether.
 *
 * The rest of this file is the vocabulary gap. A2UI writes `spaceBetween` where
 * `MPFlex` writes `space-between`, and its date and time values are ISO 8601
 * strings where every picker in this library works in `Date`.
 */
import type * as React from 'react';
import { sanitizeMediaUrl } from '@a2ui/web_core/v1_0';
import type { MPGridAlign, MPGridJustify } from '../../components/grid/MPGrid';

/**
 * What an agent can say about a component to a screen reader.
 *
 * `unknown` rather than `string`. The SDK's binder resolves a data binding
 * wherever one appears, however deeply, and its types say the result is a
 * string — but a binding resolves to whatever the data model holds at that
 * path, and nothing checks that against the schema. So a label bound to a path
 * can arrive as a number, an object or nothing at all.
 *
 * `asText` and the checks in `accessibilityAttributes` are where that is
 * handled.
 */
export interface MPA2uiAccessibility {
  /** The accessible name. */
  label?: unknown;
  /** The longer form, for what the name cannot carry. */
  description?: unknown;
  /** Whether a change to the element is announced, and how urgently. */
  live?: unknown;
  /** Whether the element and everything in it is hidden from assistive technology. */
  hidden?: unknown;
}

/**
 * A resolved dynamic value, as the string it is.
 *
 * For the nested props described above: a `title`, an option's `label`, the two
 * `accessibility` strings. Anything that is not a string is dropped rather than
 * coerced, because the alternative is `String({ name: 'Ada' })` — the words
 * `[object Object]` drawn in an interface, which is worse than the missing label
 * it would be standing in for.
 */
export const asText = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

/**
 * A URL an agent named for a picture, a video or a sound, or `undefined` for one
 * the page should not load.
 *
 * The SDK's own rule, the one its reference renderer applies to the same three
 * components: an `http:` or `https:` address, a path relative to the page, or a
 * `data:` URL. Anything else, such as `javascript:`, `blob:` or `file:`, is
 * dropped, and so is an address that starts `//`. The element is then drawn
 * with no source. A Content Security Policy still decides which hosts media may
 * come from; this decides which kinds of address get as far as asking.
 */
export const mediaUrl = (value: unknown): string | undefined => sanitizeMediaUrl(value);

/**
 * `weight` as the declaration a flex child needs.
 *
 * `minWidth` and `minHeight` go with it. A flex item's automatic minimum size is
 * its content, so a weighted child holding a long word or a wide image refuses
 * to shrink below it and the row overflows instead of dividing as asked.
 */
export const weightStyle = (weight?: number): React.CSSProperties | undefined => {
  if (typeof weight !== 'number') {
    return undefined;
  }

  return { flex: String(weight), minWidth: 0, minHeight: 0 };
};

/**
 * `accessibility` as attributes an element takes.
 *
 * The description becomes `title` rather than `aria-description`, which is still
 * a draft attribute no browser maps to anything. `title` is announced by every
 * screen reader in use and shows as a tooltip besides, which is the closer
 * reading of what an agent means by a description.
 *
 * `live` is `aria-live`, left off for `off`, which is what an element without it
 * already does, and `hidden` is `aria-hidden` only when it is `true`.
 *
 * Spread onto the element a component owns. It is *not* spread onto a labelled
 * control — a text field, a checkbox, a slider — because those carry a `label`
 * of their own from the payload, and an `aria-label` beside it replaces the
 * label the reader can see with one they cannot.
 */
export const accessibilityAttributes = (
  accessibility?: MPA2uiAccessibility
): Pick<
  React.HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-live' | 'aria-hidden' | 'title'
> => {
  const live = accessibility?.live;

  return {
    'aria-label': asText(accessibility?.label),
    'aria-live': live === 'polite' || live === 'assertive' ? live : undefined,
    'aria-hidden': accessibility?.hidden === true ? true : undefined,
    title: asText(accessibility?.description)
  };
};

/**
 * A2UI's main-axis words, in `MPFlex`'s spelling.
 *
 * `stretch` has no main-axis meaning in flexbox and is dropped to `start`, the
 * same reading a browser gives `justify-content: stretch` on a flex container.
 * The cross axis is where stretching happens, and that is `align` below.
 */
export const FLEX_JUSTIFY: Record<string, MPGridJustify> = {
  start: 'start',
  center: 'center',
  end: 'end',
  spaceBetween: 'space-between',
  spaceAround: 'space-around',
  spaceEvenly: 'space-evenly',
  stretch: 'start'
};

/** A2UI's cross-axis words, which are `MPFlex`'s own. */
export const FLEX_ALIGN: Record<string, MPGridAlign> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch'
};

/** `YYYY-MM-DD`, and the same followed by a time. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;
/**
 * `HH:MM`, optionally with seconds — a time on its own carries no date.
 *
 * The fraction is allowed because a value formatted out of a full timestamp
 * carries one, and a time is the one shape with nothing after it to ignore: the
 * date pattern above is unanchored, so a fraction at the end of a date and time
 * falls off on its own.
 */
const ISO_TIME = /^(\d{2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/;

/**
 * An ISO 8601 date, time, or date and time, as a local `Date`.
 *
 * Parsed by hand rather than handed to `new Date(value)`, because the two
 * shapes an agent sends most are the two the constructor reads as UTC:
 * `2026-03-01` is midnight in Greenwich, which is the 28th of February
 * anywhere west of it, and a calendar that opens on the wrong day is the bug
 * this avoids. A local `Date` is what the pickers here work in, so the value is
 * read as the wall clock it plainly is.
 *
 * A value carrying its own offset — `...Z`, `...+09:00` — is unambiguous and
 * goes to the constructor, which converts it to this machine's clock.
 */
export const parseIsoValue = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const time = ISO_TIME.exec(value);

  if (time) {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      Number(time[1]),
      Number(time[2]),
      Number(time[3] ?? 0)
    );
  }

  if (/[Z+]|\d-\d{2}:\d{2}$/.test(value.slice(10))) {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parts = ISO_DATE.exec(value);

  if (!parts) {
    return null;
  }

  return new Date(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    Number(parts[4] ?? 0),
    Number(parts[5] ?? 0),
    Number(parts[6] ?? 0)
  );
};

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * A `Date` as the ISO 8601 string the payload holds, in the precision that was
 * asked for.
 *
 * Local parts, never `toISOString()`: that prints UTC, and a Seoul afternoon
 * written back as the previous day's UTC evening would move the value every
 * time the agent read it back. The shapes are the ones an HTML date, time and
 * `datetime-local` input produce, which is what the protocol's own renderer
 * writes and therefore what an agent is most likely to parse.
 */
export const formatIsoValue = (
  date: Date | null,
  { withDate, withTime }: { withDate: boolean; withTime: boolean }
): string => {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (withDate && withTime) {
    return `${day}T${clock}`;
  }

  return withTime ? clock : day;
};
