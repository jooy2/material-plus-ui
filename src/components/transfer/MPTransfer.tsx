import * as React from 'react';
import { MPBox } from '../box/MPBox';
import { MPCheckbox } from '../checkbox/MPCheckbox';
import { MPIcon } from '../icon/MPIcon';
import { MPIconButton } from '../icon-button/MPIconButton';
import { MPTextField } from '../text-field/MPTextField';
import { ArrowRightIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { TRANSFER } from '../../internal/messages/transfer';
import type { MPMessages } from '../../internal/i18n';
import { hasContent, META_TEXT, SHEET_PAD_X } from '../../internal/scale';
import type { MPColor, MPSize, MPVariant } from '../../types';

/** One thing that can be on either side. */
export interface MPTransferItem {
  /** What identifies it, and what `value` is a list of. */
  value: string;
  /** What the row says. */
  label: React.ReactNode;
  /** In the list, but not movable. */
  disabled?: boolean;
}

export interface MPTransferProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /** Everything that can be on either side, in the order both lists show it. */
  items: readonly MPTransferItem[];
  /** What is on the trailing side. Use with `onValueChange` for a controlled pair. */
  value?: readonly string[];
  /** What starts there, for an uncontrolled one. */
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  /** The heading over the leading list. Defaults to the word in `locale`. */
  sourceLabel?: React.ReactNode;
  /** And over the trailing one. */
  targetLabel?: React.ReactNode;
  /**
   * Puts a filter above each list.
   * @default false
   */
  searchable?: boolean;
  /**
   * How tall each list is — a number in pixels, or any CSS length.
   * @default 220
   */
  height?: number | string;
  /** Nothing can be ticked or moved. */
  disabled?: boolean;
  /**
   * How much surface each panel paints, on the **container** ladder — the panels
   * hold rows of somebody else's labels, so they are never dyed.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The scale of the whole control: the rows, the headings, the filter and the
   * two arrows.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the ticks and the arrows read.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Which language the headings, the arrows and the filter are written in. Falls
   * back to the nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** Overrides for the words themselves. They win over the translation. */
  labels?: Partial<MPMessages['transfer']>;
}

/** The vertical room in a panel's heading strip and around its rows. */
const STRIP_PAD_Y: Record<MPSize, string> = {
  xs: 'py-1',
  sm: 'py-1.5',
  md: 'py-2',
  lg: 'py-2.5',
  xl: 'py-3'
};

/** And between two rows, which is tighter than between two sections. */
const ROW_PAD_Y: Record<MPSize, string> = {
  xs: 'py-0.5',
  sm: 'py-1',
  md: 'py-1',
  lg: 'py-1.5',
  xl: 'py-2'
};

/** What one side is handed, so the two panels are literally one function. */
interface PanelProps {
  title: React.ReactNode;
  rows: readonly MPTransferItem[];
  total: number;
  ticked: ReadonlySet<string>;
  onTick: (value: string, ticked: boolean) => void;
  onTickAll: (ticked: boolean) => void;
  search: string;
  onSearch: (search: string) => void;
  searchable: boolean;
  disabled: boolean;
  height: string;
  messages: MPMessages['transfer'];
  variant: MPVariant;
  size: MPSize;
  color: MPColor;
}

function Panel({
  title,
  rows,
  total,
  ticked,
  onTick,
  onTickAll,
  search,
  onSearch,
  searchable,
  disabled,
  height,
  messages,
  variant,
  size,
  color
}: PanelProps) {
  const movable = rows.filter((row) => !row.disabled);
  const tickedHere = movable.filter((row) => ticked.has(row.value));
  const all = movable.length > 0 && tickedHere.length === movable.length;
  const some = tickedHere.length > 0 && !all;
  const insetX = SHEET_PAD_X[size];

  return (
    <MPBox
      variant={variant}
      size={size}
      padded={false}
      className="mp-transfer__panel flex min-w-0 flex-col overflow-hidden"
    >
      <div
        className={[
          'mp-transfer__heading border-mp-outline-variant flex items-center gap-2 border-b',
          insetX,
          STRIP_PAD_Y[size]
        ].join(' ')}
      >
        {/*
         * The list's own heading *is* the select-all's label, rather than a
         * second string beside it. A tick in a column header with no name is a
         * control a screen reader announces as "checkbox" and nothing else, and
         * "Select all" drawn next to "Available" is the same word twice.
         */}
        <div className="min-w-0 flex-1">
          <MPCheckbox
            size={size}
            color={color}
            checked={all}
            indeterminate={some}
            disabled={disabled || movable.length === 0}
            label={<span className="block truncate font-medium">{title}</span>}
            onCheckedChange={(next) => onTickAll(next)}
          />
        </div>
        {/*
         * `tabular-nums` so the count does not jog sideways as it climbs past a
         * digit that happens to be narrower — it changes on every tick, which is
         * exactly when a reader is looking at it.
         */}
        <span className={`text-mp-on-surface-variant shrink-0 tabular-nums ${META_TEXT}`}>
          {tickedHere.length}/{total}
        </span>
      </div>

      {searchable ? (
        <div className={`${insetX} ${STRIP_PAD_Y[size]}`}>
          <MPTextField
            size={size}
            fullWidth
            disabled={disabled}
            placeholder={messages.search}
            aria-label={messages.search}
            value={search}
            onChange={onSearch}
          />
        </div>
      ) : null}

      <div
        className={`mp-transfer__list flex flex-col overflow-y-auto overscroll-contain ${insetX} ${STRIP_PAD_Y[size]}`}
        style={{ height }}
      >
        {rows.length === 0 ? (
          <span className={`text-mp-on-surface-variant ${META_TEXT} ${ROW_PAD_Y[size]}`}>
            {messages.empty}
          </span>
        ) : (
          rows.map((row, index) => (
            <div key={`${index}:${row.value}`} className={ROW_PAD_Y[size]}>
              <MPCheckbox
                size={size}
                color={color}
                label={row.label}
                checked={ticked.has(row.value)}
                disabled={disabled || row.disabled}
                onCheckedChange={(next) => onTick(row.value, next)}
              />
            </div>
          ))
        )}
      </div>
    </MPBox>
  );
}

/** Case-insensitive, and only against a label that is a string to match. */
function matches(item: MPTransferItem, query: string): boolean {
  if (query === '') {
    return true;
  }

  if (typeof item.label !== 'string') {
    return true;
  }

  return item.label.toLowerCase().includes(query.toLowerCase());
}

/**
 * Two lists and the arrows between them: everything that could be chosen on one
 * side, everything that has been on the other.
 *
 * This is the shape for a choice that is **long** — the columns in a report, the
 * permissions on a role, the people on a channel — where an
 * [MPCombobox](./combobox) with forty chips in its field stops being readable
 * and a column of forty checkboxes gives no answer at all to "what did I
 * actually pick". Below about a dozen options, one of those two is the smaller
 * component and the better one.
 *
 * ## Ticking is not choosing
 *
 * The two are deliberately separate, and it is the whole of the interaction.
 * `value` is **which side a row is on**; a tick is a mark on a row saying it
 * should move next time an arrow is pressed. So `onValueChange` fires on the
 * arrow and never on a tick, and a caller storing `value` is storing the answer
 * rather than the working.
 *
 * Moving drops the ticks on what moved and keeps the rest: a row that has
 * arrived on the other side is not still waiting to be sent there, and a row the
 * filter was hiding was never part of that press.
 *
 * ## The order never changes
 *
 * Both lists draw in the order of `items`, so a row sent across and back lands
 * where it started. A component that appended to the far list instead would
 * reorder the reader's own list every time they changed their mind.
 *
 * ## Why it is not one component with a `mode`
 *
 * Because the panels are one function called twice, which is what makes the two
 * sides provably identical: the same heading strip, the same select-all, the
 * same filter, the same empty line. The only thing that differs between them is
 * which way its arrow points.
 */
export const MPTransfer = React.forwardRef<HTMLDivElement, MPTransferProps>(function MPTransfer(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    sourceLabel,
    targetLabel,
    searchable = false,
    height = 220,
    disabled = false,
    variant = 'outlined',
    size = 'md',
    color = 'primary',
    locale: localeProp,
    labels,
    className,
    ...props
  },
  ref
) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(TRANSFER, locale, labels);

  const [uncontrolled, setUncontrolled] = React.useState<readonly string[]>(defaultValue ?? []);
  const selected = value ?? uncontrolled;

  const [ticked, setTicked] = React.useState<ReadonlySet<string>>(() => new Set());
  const [sourceSearch, setSourceSearch] = React.useState('');
  const [targetSearch, setTargetSearch] = React.useState('');

  const chosen = React.useMemo(() => new Set(selected), [selected]);
  const source = items.filter((item) => !chosen.has(item.value));
  const target = items.filter((item) => chosen.has(item.value));

  const commit = (next: string[]) => {
    if (value === undefined) {
      setUncontrolled(next);
    }

    onValueChange?.(next);
  };

  const tick = (item: string, on: boolean) => {
    setTicked((current) => {
      const next = new Set(current);

      if (on) {
        next.add(item);
      } else {
        next.delete(item);
      }

      return next;
    });
  };

  const tickAll = (rows: readonly MPTransferItem[], on: boolean) => {
    setTicked((current) => {
      const next = new Set(current);

      for (const row of rows) {
        if (row.disabled) {
          continue;
        }

        if (on) {
          next.add(row.value);
        } else {
          next.delete(row.value);
        }
      }

      return next;
    });
  };

  const move = (moving: readonly MPTransferItem[], toTarget: boolean) => {
    const moved = moving.filter((item) => !item.disabled && ticked.has(item.value));

    if (moved.length === 0) {
      return;
    }

    const ids = new Set(moved.map((item) => item.value));
    // Rebuilt from `items` rather than appended to, so the trailing list stays in
    // the order the caller wrote and a row sent across and back lands where it
    // started.
    const next = toTarget
      ? items
          .filter((item) => chosen.has(item.value) || ids.has(item.value))
          .map((item) => item.value)
      : selected.filter((item) => !ids.has(item));

    setTicked((current) => new Set([...current].filter((item) => !ids.has(item))));
    commit(next);
  };

  const sourceRows = source.filter((item) => matches(item, sourceSearch));
  const targetRows = target.filter((item) => matches(item, targetSearch));
  const canSend = sourceRows.some((item) => !item.disabled && ticked.has(item.value));
  const canReturn = targetRows.some((item) => !item.disabled && ticked.has(item.value));
  const listHeight = typeof height === 'number' ? `${height}px` : height;

  const panel = {
    ticked,
    disabled,
    height: listHeight,
    messages,
    variant,
    size,
    color,
    searchable
  };

  return (
    <div
      ref={ref}
      data-mp-size={size}
      className={[
        'mp-transfer grid w-full items-center gap-3',
        '[grid-template-columns:minmax(0,1fr)_auto_minmax(0,1fr)]',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Panel
        {...panel}
        title={hasContent(sourceLabel) ? sourceLabel : messages.source}
        rows={sourceRows}
        total={source.length}
        onTick={tick}
        onTickAll={(on) => tickAll(sourceRows, on)}
        search={sourceSearch}
        onSearch={setSourceSearch}
      />

      <div className="flex flex-col gap-2">
        <MPIconButton
          size={size}
          color={color}
          variant={variant === 'text' ? 'text' : 'outlined'}
          label={messages.toTarget}
          disabled={disabled || !canSend}
          onClick={() => move(sourceRows, true)}
          icon={<MPIcon icon={ArrowRightIcon} />}
        />
        <MPIconButton
          size={size}
          color={color}
          variant={variant === 'text' ? 'text' : 'outlined'}
          label={messages.toSource}
          disabled={disabled || !canReturn}
          onClick={() => move(targetRows, false)}
          // The same glyph turned, rather than a second one. `rotate-180` is
          // symmetrical about both axes, so it is also correct under RTL — where
          // the lists have already swapped sides and the arrows swap with them.
          icon={<MPIcon icon={ArrowRightIcon} className="rotate-180" />}
        />
      </div>

      <Panel
        {...panel}
        title={hasContent(targetLabel) ? targetLabel : messages.target}
        rows={targetRows}
        total={target.length}
        onTick={tick}
        onTickAll={(on) => tickAll(targetRows, on)}
        search={targetSearch}
        onSearch={setTargetSearch}
      />
    </div>
  );
});
