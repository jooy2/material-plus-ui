import * as React from 'react';
import { MPTreeItem, MPTreeView, type MPTreeViewValue } from '../tree-view/MPTreeView';
import { MPPickerShell, type MPPickerShellProps } from '../../internal/Picker';
import type { MPPickerLabels } from '../../internal/Calendar';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMBOBOX } from '../../internal/messages/combobox';
import { TRANSFER } from '../../internal/messages/transfer';
import { PICKER } from '../../internal/messages/picker';
import { META_TEXT } from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPSlots } from '../../types';

/** One node of the tree the reader is choosing from. */
export interface MPTreeSelectItem {
  /** What is stored when this node is chosen. Unique across the whole tree. */
  value: MPTreeViewValue;
  label: React.ReactNode;
  /** What a search matches against. Falls back to `label` when it is a string. */
  searchLabel?: string;
  startIcon?: React.ReactNode;
  disabled?: boolean;
  /**
   * Whether this node may itself be chosen.
   *
   * `false` makes it a heading with children under it — a "Europe" that groups
   * countries without being one. Defaults to `true` for a leaf and follows
   * `selectableBranches` for a node that has children.
   */
  selectable?: boolean;
  children?: MPTreeSelectItem[];
}

/** The parts an `MPTreeSelect` draws that a `className` cannot reach. */
export type MPTreeSelectSlot = 'popup' | 'tree' | 'item' | 'empty';

export interface MPTreeSelectProps extends MPPickerShellProps {
  /** The tree, as nested items. */
  items?: MPTreeSelectItem[];
  /** The chosen value, or values when `multiple`. */
  value?: MPTreeViewValue | MPTreeViewValue[] | null;
  defaultValue?: MPTreeViewValue | MPTreeViewValue[] | null;
  onValueChange?: (value: MPTreeViewValue[]) => void;
  /** Whether more than one node may be held. @default false */
  multiple?: boolean;
  /**
   * Whether a node that has children may itself be chosen.
   *
   * Off by default, which is the shape most of these trees have: the branches
   * are the taxonomy and the leaves are the answers, and a "Europe" that can be
   * chosen alongside "France" is usually a data model nobody meant. An item's
   * own `selectable` overrides it either way.
   * @default false
   */
  selectableBranches?: boolean;
  /** Which branches start open. */
  defaultExpanded?: MPTreeViewValue[];
  expanded?: MPTreeViewValue[];
  onExpandedChange?: (expanded: MPTreeViewValue[]) => void;
  /** Whether the popup is open. Use with `onOpenChange` to control it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Shown in the trigger while nothing is chosen. */
  placeholder?: React.ReactNode;
  /** Offers the × that empties the control. @default false */
  clearable?: boolean;
  /** Closes the popup as soon as a node is chosen. @default !multiple */
  closeOnSelect?: boolean;
  /**
   * Offers a field above the tree that filters it.
   *
   * A match keeps its ancestors, because a node with its parents cut away is a
   * node the reader cannot place — "Seoul" under nothing at all.
   * @default false
   */
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Which language this draws its own strings in — the search field's
   * placeholder, the line an empty tree shows, the × that empties the control.
   */
  locale?: string;
  /** How the trigger writes what is held. Defaults to the labels, comma-joined. */
  format?: (chosen: MPTreeSelectItem[]) => React.ReactNode;
  labels?: Partial<MPPickerLabels>;
  /** Identifies the field when a form is submitted. One input per value. */
  name?: string;
  classNames?: MPSlots<MPTreeSelectSlot>;
}

/** Every node, flattened, so a value can be looked up without walking twice. */
function flatten(
  items: MPTreeSelectItem[],
  into: Map<MPTreeViewValue, MPTreeSelectItem> = new Map()
): Map<MPTreeViewValue, MPTreeSelectItem> {
  for (const item of items) {
    into.set(item.value, item);

    if (item.children) {
      flatten(item.children, into);
    }
  }

  return into;
}

/**
 * What a needle and a node are both folded to before they are compared.
 *
 * `toLocaleLowerCase` and nothing else, which is the fold `MPCombobox` already
 * uses: a filter is a convenience, and a collator that knew about diacritics
 * would be a second answer to a question this library has already answered one
 * way.
 */
const fold = (text: string) => text.trim().toLocaleLowerCase();

/** What a node is matched against. */
function haystackOf(item: MPTreeSelectItem): string {
  return fold(
    item.searchLabel ?? (typeof item.label === 'string' ? item.label : String(item.value))
  );
}

/**
 * Keeps the nodes that match, and every ancestor of one.
 *
 * The ancestors are the point. A tree filtered to bare matches is a list, and a
 * list of leaves is exactly what a tree was chosen over — "Seoul" with nothing
 * above it does not say which Seoul, or which taxonomy it came from.
 *
 * A node that matches keeps **all** of its own children rather than the ones
 * that matched: having found the branch the reader was looking for, hiding what
 * is inside it is the opposite of helpful.
 */
function filterTree(items: MPTreeSelectItem[], needle: string): MPTreeSelectItem[] {
  if (needle === '') {
    return items;
  }

  const kept: MPTreeSelectItem[] = [];

  for (const item of items) {
    const children = item.children ? filterTree(item.children, needle) : undefined;
    const hit = haystackOf(item).includes(needle);

    if (hit || (children && children.length > 0)) {
      kept.push({ ...item, children: hit ? item.children : children });
    }
  }

  return kept;
}

/** Every branch value in a tree — what a search opens so its matches are visible. */
function branchValues(items: MPTreeSelectItem[], into: MPTreeViewValue[] = []): MPTreeViewValue[] {
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      into.push(item.value);
      branchValues(item.children, into);
    }
  }

  return into;
}

/**
 * A value chosen from a tree rather than from a list.
 *
 * ```tsx
 * <MPTreeSelect label="Category" items={categories} searchable />
 * ```
 *
 * The gap between `MPSelect` and `MPTreeView`: the first is a flat list behind
 * a field, the second is a hierarchy that shows what it holds but has no field.
 * A category, a folder, an org-chart node and a region are all chosen from a
 * shape a flat list flattens away.
 *
 * ## Branches are not answers by default
 *
 * `selectableBranches` is off, because that is the shape most of these trees
 * have: the branches are the taxonomy and the leaves are the answers, and a
 * "Europe" that can be chosen alongside "France" is usually a data model
 * nobody meant. An item's own `selectable` overrides it either way, which is how
 * a tree with one selectable branch says so.
 *
 * A branch that cannot be chosen still opens and shuts, and still looks like
 * every other row — it is not the answer, which is not the same as being
 * unavailable. Its press is answered here rather than by the tree, so that a
 * press on "Europe" leaves the "France" underneath it alone.
 *
 * ## A search keeps the ancestors
 *
 * Filtered to bare matches, a tree is a list — and a list of leaves is exactly
 * what a tree was chosen over. So a match brings its parents with it, and every
 * branch the filter kept is opened: a match folded inside a shut parent is a
 * match the reader was not shown.
 */
export const MPTreeSelect = React.forwardRef<HTMLButtonElement, MPTreeSelectProps>(
  function MPTreeSelect(
    {
      items = [],
      value: valueProp,
      defaultValue,
      onValueChange,
      multiple = false,
      selectableBranches = false,
      defaultExpanded,
      expanded: expandedProp,
      onExpandedChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      placeholder,
      clearable = false,
      closeOnSelect,
      searchable = false,
      searchPlaceholder,
      locale: localeProp,
      format,
      labels: labelOverrides,
      name,
      size: sizeProp,
      color: colorProp,
      readOnly = false,
      disabled = false,
      classNames,
      ...shell
    },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const color = useMPColor(colorProp);
    const locale = useMPLocale(localeProp);
    const messages = useMPMessages(COMBOBOX, locale);
    const labels = useMPMessages(PICKER, locale, labelOverrides);
    /*
     * The word on a field somebody types a filter into is already written down
     * once, for `MPTransfer`, which has the same field for the same job. One
     * more spelling of "Search" is one more thing to translate in eighteen
     * locales and one more chance for the two to disagree.
     *
     * Not `MPCommandPalette`'s, which reads "Type a command or search…" — that
     * sentence is about a palette, and a filter over a taxonomy is not one.
     */
    const searchMessages = useMPMessages(TRANSFER, locale);

    const asArray = (
      next: MPTreeViewValue | MPTreeViewValue[] | null | undefined
    ): MPTreeViewValue[] =>
      next === null || next === undefined ? [] : Array.isArray(next) ? next : [next];

    const [uncontrolledValue, setUncontrolledValue] = React.useState(() => asArray(defaultValue));
    const held = valueProp !== undefined ? asArray(valueProp) : uncontrolledValue;

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const open = openProp ?? uncontrolledOpen;

    const [query, setQuery] = React.useState('');

    const byValue = React.useMemo(() => flatten(items), [items]);
    const needle = fold(query);
    const shown = React.useMemo(() => filterTree(items, needle), [items, needle]);

    // A search opens every branch it kept: a match folded inside a shut parent
    // is a match the reader was not shown.
    const searchExpanded = React.useMemo(
      () => (needle === '' ? undefined : branchValues(shown)),
      [needle, shown]
    );

    const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(
      () => defaultExpanded ?? []
    );
    const expanded = searchExpanded ?? expandedProp ?? uncontrolledExpanded;

    const commitExpanded = (next: MPTreeViewValue[]) => {
      // While a search is on, what stands open is the search's answer rather
      // than the reader's, so there is nothing here to record.
      if (searchExpanded) {
        return;
      }

      if (expandedProp === undefined) {
        setUncontrolledExpanded(next);
      }

      onExpandedChange?.(next);
    };

    const setOpen = (next: boolean) => {
      // A read-only picker does not open. What it holds is something to read.
      if (next && (readOnly || disabled)) {
        return;
      }

      if (openProp === undefined) {
        setUncontrolledOpen(next);
      }

      if (!next) {
        setQuery('');
      }

      onOpenChange?.(next);
    };

    const commit = (next: MPTreeViewValue[]) => {
      if (valueProp === undefined) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
    };

    const isSelectable = (item: MPTreeSelectItem) =>
      item.selectable ?? (item.children && item.children.length > 0 ? selectableBranches : true);

    /**
     * A heading answers its own press: it opens, and nothing else.
     *
     * Taken off the tree here rather than filtered out of what the tree reports,
     * for two reasons. A row the tree was told is `disabled` does not open
     * either — and a taxonomy whose branches cannot be opened is a list with
     * extra steps, which is what a tree was chosen over. And the tree reports a
     * press in single-value mode as the whole new selection, so a filtered
     * `['europe']` arrives as an empty one: committing it would have a press on
     * "Europe" clear the "France" underneath it and shut the popup on the way.
     *
     * `MPTreeView` has already moved the focus and made the row the active one
     * by the time this runs, so a heading still behaves like a row in every
     * respect but the answer.
     */
    const pressHeading = (item: MPTreeSelectItem) => (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();

      if (item.children && item.children.length > 0) {
        commitExpanded(
          expanded.includes(item.value)
            ? expanded.filter((entry) => entry !== item.value)
            : [...expanded, item.value]
        );
      }
    };

    const onSelectedChange = (next: MPTreeViewValue[]) => {
      // Only choosable rows reach this — a heading is intercepted above — so
      // what is left to do is drop a value whose item is no longer in `items`.
      const allowed = next.filter((entry) => byValue.has(entry));

      commit(multiple ? allowed : allowed.slice(-1));

      if (closeOnSelect ?? !multiple) {
        setOpen(false);
      }
    };

    const chosen = held
      .map((entry) => byValue.get(entry))
      .filter((item): item is MPTreeSelectItem => item !== undefined);

    const display =
      chosen.length === 0
        ? (placeholder ?? '')
        : format
          ? format(chosen)
          : chosen
              .map((item) => item.label)
              .reduce<React.ReactNode[]>(
                (all, label, index) => (index === 0 ? [label] : [...all, ', ', label]),
                []
              );

    const renderItems = (list: MPTreeSelectItem[]): React.ReactNode =>
      list.map((item) => (
        <MPTreeItem
          key={item.value}
          value={item.value}
          label={item.label}
          startIcon={item.startIcon}
          // Only the caller's own `disabled` greys a row out. A heading is not
          // unavailable, it is simply not the answer.
          disabled={item.disabled}
          onClick={isSelectable(item) ? undefined : pressHeading(item)}
          className={classNames?.item}
        >
          {item.children ? renderItems(item.children) : null}
        </MPTreeItem>
      ));

    return (
      <MPPickerShell
        {...shell}
        slug="tree-select"
        size={size}
        color={color}
        readOnly={readOnly}
        disabled={disabled}
        triggerRef={ref}
        display={display}
        empty={chosen.length === 0}
        clearable={clearable}
        onClear={() => commit([])}
        open={open}
        onOpenChange={setOpen}
        labels={labels}
        hiddenValues={name ? held.map((entry) => ({ name, value: String(entry) })) : undefined}
      >
        <div
          className={[
            'mp-tree-select__popup flex max-h-80 w-64 flex-col gap-2',
            classNames?.popup ?? ''
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {searchable ? (
            <input
              type="text"
              value={query}
              placeholder={searchPlaceholder ?? searchMessages.search}
              aria-label={searchPlaceholder ?? searchMessages.search}
              onChange={(event) => setQuery(event.currentTarget.value)}
              className={[
                'mp-tree-select__search text-mp-on-surface w-full shrink-0 bg-transparent',
                'placeholder:text-mp-on-surface-variant px-1 py-1 [font:inherit] outline-none'
              ].join(' ')}
            />
          ) : null}

          <div className="min-h-0 flex-1 overflow-auto">
            {shown.length === 0 ? (
              <p
                className={[
                  'mp-tree-select__empty text-mp-on-surface-variant m-0 px-1 py-2',
                  META_TEXT,
                  classNames?.empty ?? ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {messages.empty}
              </p>
            ) : (
              <MPTreeView
                size={size}
                // The popup is already a sheet at elevation 2, so a second
                // bordered rectangle inside it is a second rectangle.
                variant="text"
                multiple={multiple}
                selected={held}
                onSelectedChange={onSelectedChange}
                expanded={expanded}
                onExpandedChange={commitExpanded}
                className={classNames?.tree}
              >
                {renderItems(shown)}
              </MPTreeView>
            )}
          </div>
        </div>
      </MPPickerShell>
    );
  }
);
