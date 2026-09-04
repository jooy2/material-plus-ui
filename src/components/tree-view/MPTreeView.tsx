import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { ChevronDownIcon } from '../../constants/icons';
import { containerSurface } from '../../internal/elevation';
import { MPStateLayer } from '../../internal/StateLayer';
import { CONTROL_GAP, CONTROL_ICON, PROSE_TEXT, hasContent } from '../../internal/scale';
import { useMPDensity, useMPSize } from '../../internal/config';
import type { MPDensity, MPElevation, MPSize, MPVariant } from '../../types';

/**
 * How the hierarchy is drawn between the rows.
 *
 * - `none` — indentation only. The quietest, and usually right for a navigation
 *   sidebar, where the tree is two levels deep and the labels say what the
 *   structure is.
 * - `simple` — one hairline rail per level, running the full height of the
 *   group. Enough to follow a column of rows back to the branch it belongs to.
 * - `folder` — the rail plus an elbow into every row, with the rail under a
 *   last child stopping at that row. The file-manager drawing, and the one to
 *   reach for when the tree is deep.
 */
export type MPTreeViewLines = 'none' | 'simple' | 'folder';

/** A row's identity, and what `expanded` and `selected` are lists of. */
export type MPTreeViewValue = string | number;

/**
 * What an `MPTreeItem` inherits from the tree around it.
 *
 * The same arrangement `MPList` and `MPAccordion` use, and for one more reason
 * than they have: a tree is one widget with one tab stop, so which branch is
 * open, which row is chosen and which row the tab key lands on are all
 * properties of the *tree* rather than of any row in it. A row that owned its
 * own open state could not be shut by pressing ArrowLeft on the row below it.
 */
interface MPTreeViewContextValue {
  size: MPSize;
  density: MPDensity;
  disabled: boolean;
  expandedKeys: ReadonlySet<string>;
  selectedKeys: ReadonlySet<string>;
  activeKey: string | null;
  toggle: (value: MPTreeViewValue) => void;
  select: (value: MPTreeViewValue) => void;
  activate: (key: string) => void;
  register: (key: string, api: MPTreeItemApi) => () => void;
}

/**
 * The one thing a row can do that the tree cannot reach through the DOM.
 *
 * ArrowRight opens a branch **without** choosing it — that is the difference
 * between walking a tree and picking things out of it — so the tree cannot get
 * there by pressing the row, which does both. All it has from a DOM node is the
 * key on it, and a key is not the `value` the caller passed: `2` and `'2'` are
 * the same string and two different values. So each row leaves its own opener
 * here, closed over the value it actually holds.
 */
interface MPTreeItemApi {
  toggle: () => void;
}

const MPTreeViewContext = React.createContext<MPTreeViewContextValue>({
  size: 'md',
  density: 0,
  disabled: false,
  expandedKeys: new Set(),
  selectedKeys: new Set(),
  activeKey: null,
  toggle: () => {},
  select: () => {},
  activate: () => {},
  register: () => () => {}
});

/**
 * Whether a row is inside a branch that is on its way shut.
 *
 * A branch has to stay in the document while it collapses or there is nothing
 * left to collapse, and for those couple of hundred milliseconds its rows are
 * visible but no longer *there*. This is how they know: a row that reads `true`
 * does not register itself with the tree, so the tree's answer to "is the row
 * holding the tab stop still on screen" turns over on the same render that shut
 * the branch rather than a fifth of a second later. The `data-closing`
 * attribute is the other half, keeping the same rows out of the order the arrow
 * keys walk.
 */
const MPTreeClosingContext = React.createContext(false);

export interface MPTreeViewProps extends Omit<
  React.ComponentPropsWithoutRef<'ul'>,
  'defaultValue' | 'onSelect'
> {
  /**
   * How much surface the sheet paints.
   *
   * A container's ladder, so the sheet is never dyed — a tree holds other
   * people's labels, and those arrive with colours of their own. `text` is the
   * one to reach for in a sidebar: the sidebar is already a surface, and a
   * second bordered rectangle inside it is a second rectangle.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /** How far off the page the sheet is lifted, on MD3's five levels. */
  elevation?: MPElevation;
  /** The row height and the type the labels are set in. @default 'md' */
  size?: MPSize;
  /** Takes room out of that row height, four pixels a step. @default 0 */
  density?: MPDensity;
  /**
   * How the hierarchy is drawn between the rows.
   * @default 'simple'
   */
  lines?: MPTreeViewLines;
  /** Which branches are open. Use with `onExpandedChange` for a controlled tree. */
  expanded?: MPTreeViewValue[];
  /** Which start open, for an uncontrolled one. */
  defaultExpanded?: MPTreeViewValue[];
  onExpandedChange?: (expanded: MPTreeViewValue[]) => void;
  /**
   * Which rows are chosen. An array even when only one row may be chosen at a
   * time — the same shape `MPAccordion`'s value takes, so turning `multiple` on
   * does not also change the type of the value.
   */
  selected?: MPTreeViewValue[];
  /** Which start chosen, for an uncontrolled one. */
  defaultSelected?: MPTreeViewValue[];
  onSelectedChange?: (selected: MPTreeViewValue[]) => void;
  /**
   * Whether more than one row may be chosen at a time.
   * @default false
   */
  multiple?: boolean;
  /** Every row stops answering. */
  disabled?: boolean;
  /** The name the tree is announced by. */
  label?: string;
  /** The top-level `MPTreeItem`s. */
  children?: React.ReactNode;
}

export interface MPTreeItemProps extends Omit<React.ComponentPropsWithoutRef<'li'>, 'onClick'> {
  /**
   * Identifies the row to `expanded` and `selected`. One is generated when it is
   * left out, which is fine for a tree nobody drives from code.
   */
  value?: MPTreeViewValue;
  /**
   * The row's text. Its own prop rather than `children`, because in a tree the
   * children are the rows underneath it.
   */
  label?: React.ReactNode;
  /** Content before the label — a folder glyph, a file type, a status dot. */
  startIcon?: React.ReactNode;
  /** Content after the label, inside the pressable area — a count, a badge. */
  endIcon?: React.ReactNode;
  /**
   * A control pinned to the end of the row, deliberately outside the pressable
   * area — the same shape `MPListItem` uses. A row that both opens and holds a
   * menu button has two things to press.
   */
  action?: React.ReactNode;
  /** Renders the row as a link, for a tree that is navigation. */
  href?: string;
  /** Fires when the row is pressed, before it opens or is chosen. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Forces the disclosure arrow onto a row with no children yet — the branch
   * that is fetched the first time it is opened.
   */
  expandable?: boolean;
  /** Unavailable. Its branch, if it is open, keeps working. */
  disabled?: boolean;
  /** The rows underneath this one. */
  children?: React.ReactNode;
}

/**
 * A tree row's height, in pixels.
 *
 * **Not the control ladder**, and this is the one place in the library where a
 * row deliberately leaves it. A control is 56dp at `md` because MD3 draws a
 * field at 56dp; a tree row is one line in a column of dozens, and six of them
 * at 56 is a sidebar that shows six things. These are the heights a file tree
 * is actually read at.
 *
 * The trade is a real one and worth stating: `md` at 40 is under the 48dp touch
 * target, so a tree meant to be used with a thumb wants `lg`. That is the same
 * judgement `MPDensity` makes when it lets a control down to 24.
 */
const ROW_HEIGHT: Record<MPSize, number> = { xs: 28, sm: 32, md: 40, lg: 48, xl: 56 };

/**
 * How far one level is set in from the one above it, in pixels.
 *
 * Its own ladder rather than a step off a padding track, because indentation is
 * not padding: it is the width of the column a guide line is drawn in, and it
 * has to stay wide enough for an elbow to be legible at `xs` and narrow enough
 * that six levels still fit in a sidebar at `xl`.
 */
const INDENT: Record<MPSize, number> = { xs: 14, sm: 16, md: 20, lg: 24, xl: 28 };

/**
 * A row's inline padding.
 *
 * Its own track for the reason `MPList` has its own vertical ones: a tree row is
 * one line among dozens, and the padding that gives a box air would push every
 * label a level further in than the indentation just placed it.
 */
const ROW_PAD_X: Record<MPSize, string> = {
  xs: 'px-1.5',
  sm: 'px-2',
  md: 'px-2.5',
  lg: 'px-3',
  xl: 'px-3.5'
};

/**
 * The corner of the tint under a hovered or chosen row.
 *
 * `corner-full`, and that is MD3's own: the specification draws a navigation
 * drawer's item as a full-height stadium, which is what a chosen row in a tree
 * is. A cut corner on a box that is one line tall is a lozenge somebody got
 * wrong rather than a decision.
 */
const ROW_SHAPE = 'rounded-mp-full';

/** The guide drawing, which is real CSS in `styles.css`. */
const LINES: Record<MPTreeViewLines, string> = {
  none: '',
  simple: 'mp-tree--simple',
  folder: 'mp-tree--folder'
};

/**
 * A row's height with the density steps taken out of it.
 *
 * Four pixels a step, which is MD3's own, down to the 24px floor `MPDensity`
 * describes — below that a row stops being a target and starts being a line of
 * text with a background.
 */
function rowHeight(size: MPSize, density: MPDensity): number {
  return Math.max(24, ROW_HEIGHT[size] + density * 4);
}

/**
 * Every row in the tree, in the order the eye reads them.
 *
 * A branch that is shutting is still in the document — it has to be, or there
 * would be nothing left to collapse — and its rows must not be part of that
 * order while it is. Arrow keys are the reason: without this, the row *below* a
 * branch that was just closed is whatever was inside it.
 */
function treeRows(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"]')).filter(
    (row) => row.closest('[data-mp-closing]') === null
  );
}

const keyOf = (value: MPTreeViewValue) => String(value);

/**
 * A tree of rows that open and shut.
 *
 * ```tsx
 * <MPTreeView label="Files" defaultExpanded={['src']}>
 *   <MPTreeItem value="src" label="src">
 *     <MPTreeItem value="index" label="index.ts" />
 *   </MPTreeItem>
 * </MPTreeView>
 * ```
 *
 * There is no Base UI primitive under this — the library has no tree — and the
 * three things a tree owes are most of the component: the
 * `tree`/`treeitem`/`group` roles, one tab stop for the whole widget, and the
 * arrow keys that walk it.
 *
 * ## The keyboard is handled once, at the top
 *
 * A tree's arrow keys are questions about the **tree** — what is the next
 * visible row, where is my parent — and the only element that can answer them
 * is the one holding all of them. The rows a query returns are in document
 * order, which is reading order, because a shut branch is unmounted rather than
 * hidden.
 *
 * | | |
 * | --- | --- |
 * | Up, Down | The previous and next visible row |
 * | Home, End | The first and last |
 * | Right | Opens a shut branch; steps into an open one |
 * | Left | Shuts an open branch; steps out of a leaf |
 * | Enter, Space | Presses the row, which chooses it and opens it |
 *
 * Right and Left swap under RTL, read off the element rather than off a prop: a
 * caller may have set `dir` three ancestors up, and ArrowRight has to mean
 * "further in" either way.
 *
 * ## Why the arrow is not a button
 *
 * The `<li>` is the `treeitem` and it is what takes focus, which is the ARIA
 * pattern. A button inside it would be a second tab stop in a widget that is
 * supposed to have exactly one — and the keyboard already opens a branch with
 * ArrowRight. So the disclosure arrow is a plain span with a click handler: a
 * pointer target, and nothing a keyboard has to walk past.
 */
export const MPTreeView = React.forwardRef<HTMLUListElement, MPTreeViewProps>(function MPTreeView(
  {
    variant = 'outlined',
    elevation,
    size: sizeProp,
    density: densityProp,
    lines = 'simple',
    expanded,
    defaultExpanded,
    onExpandedChange,
    selected,
    defaultSelected,
    onSelectedChange,
    multiple = false,
    disabled = false,
    label,
    className,
    style,
    children,
    onKeyDown,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);

  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<MPTreeViewValue[]>(
    defaultExpanded ?? []
  );
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<MPTreeViewValue[]>(
    defaultSelected ?? []
  );
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  const expandedValues = expanded ?? uncontrolledExpanded;
  const selectedValues = selected ?? uncontrolledSelected;

  const rootRef = React.useRef<HTMLUListElement | null>(null);

  const setRootRef = React.useCallback(
    (node: HTMLUListElement | null) => {
      rootRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const toggle = React.useCallback(
    (value: MPTreeViewValue) => {
      const key = keyOf(value);
      const current = expanded ?? uncontrolledExpanded;
      const next = current.some((entry) => keyOf(entry) === key)
        ? current.filter((entry) => keyOf(entry) !== key)
        : [...current, value];

      if (expanded === undefined) {
        setUncontrolledExpanded(next);
      }

      onExpandedChange?.(next);
    },
    [expanded, uncontrolledExpanded, onExpandedChange]
  );

  const select = React.useCallback(
    (value: MPTreeViewValue) => {
      const key = keyOf(value);
      const current = selected ?? uncontrolledSelected;
      const isSelected = current.some((entry) => keyOf(entry) === key);
      /*
       * Single select never empties: pressing the chosen row again keeps it,
       * because "nothing chosen" is a state a caller cannot get back to by
       * pointing at a row. Multi-select does toggle — that is what it is for.
       */
      const next = multiple
        ? isSelected
          ? current.filter((entry) => keyOf(entry) !== key)
          : [...current, value]
        : [value];

      if (selected === undefined) {
        setUncontrolledSelected(next);
      }

      onSelectedChange?.(next);
    },
    [multiple, selected, uncontrolledSelected, onSelectedChange]
  );

  const apisRef = React.useRef(new Map<string, MPTreeItemApi>());

  const register = React.useCallback((key: string, api: MPTreeItemApi) => {
    apisRef.current.set(key, api);

    return () => {
      apisRef.current.delete(key);
    };
  }, []);

  /*
   * The context is keyed on the *contents* of the two lists rather than on
   * their identity. `expanded={[...open]}` rebuilt on every render is the
   * ordinary way a controlled tree gets written, and keying on the array
   * itself would rebuild the context — and re-render every row under it —
   * each time.
   *
   * A join rather than `JSON.stringify`: the keys are already strings, so the
   * quoting and escaping is work spent producing a longer key that answers the
   * same question. The separator is a NUL, which no key produced by `String()`
   * of a `string | number` can contain, so two different lists cannot spell
   * one key.
   */
  const expandedKey = React.useMemo(() => expandedValues.map(keyOf).join(' '), [expandedValues]);
  const selectedKey = React.useMemo(() => selectedValues.map(keyOf).join(' '), [selectedValues]);

  const context = React.useMemo<MPTreeViewContextValue>(
    () => ({
      size,
      density,
      disabled,
      expandedKeys: new Set(expandedValues.map(keyOf)),
      selectedKeys: new Set(selectedValues.map(keyOf)),
      activeKey,
      toggle,
      select,
      activate: setActiveKey,
      register
    }),
    // The two lists are read inside and are deliberately not listed here: the
    // keys above change exactly when their contents do, which is the question.
    [size, density, disabled, expandedKey, selectedKey, activeKey, toggle, select, register]
  );

  /*
   * The tab stop has to be somewhere, and after a branch shuts it may be on a
   * row that no longer exists. Rather than tracking every mount and unmount,
   * the tree checks what is actually rendered and moves the stop to the first
   * row whenever the one it was on has gone. It runs after every render and
   * sets state only when it has to, so it settles in one extra pass.
   *
   * No dependency list, deliberately: a branch shutting unmounts rows without
   * changing anything this could be keyed on.
   *
   * The usual answer is the first line and costs nothing. Every rendered row
   * registers itself and unregisters on the way out, and a child's effect runs
   * before its parent's — so by the time this runs the map is exactly what is
   * on screen, and "is the tab stop still there" is a lookup rather than a
   * `querySelectorAll` over a tree that may hold thousands of rows.
   */
  React.useEffect(() => {
    if (activeKey !== null && apisRef.current.has(activeKey)) {
      return;
    }

    const root = rootRef.current;

    if (!root) {
      return;
    }

    // Only when the cheap answer said no. Which row is *first* is a question
    // about document order, and the DOM is the only thing that knows it — the
    // map is in registration order, which is mount order and not the same.
    const rows = treeRows(root);

    if (rows.length > 0) {
      setActiveKey(rows[0].dataset.mpValue ?? null);
    }
  });

  function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const root = rootRef.current;
    const target = (event.target as HTMLElement | null)?.closest?.(
      '[role="treeitem"]'
    ) as HTMLElement | null;

    if (!root || !target || !root.contains(target)) {
      return;
    }

    const rows = treeRows(root);
    const index = rows.indexOf(target);

    if (index === -1) {
      return;
    }

    const move = (row: HTMLElement | null | undefined) => {
      if (!row) {
        return;
      }

      event.preventDefault();
      setActiveKey(row.dataset.mpValue ?? null);
      row.focus();
    };

    // The arrows open and shut without choosing, so they go through the row's
    // own opener rather than through a click, which would do both.
    const openBranch = (row: HTMLElement) => {
      const rowKey = row.dataset.mpValue;

      if (rowKey) {
        apisRef.current.get(rowKey)?.toggle();
      }
    };

    // The direction is read off the element rather than off a prop: a caller
    // may have set `dir` three ancestors up, and ArrowRight has to mean
    // "further in" either way.
    const rtl = getComputedStyle(root).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const open = target.getAttribute('aria-expanded');

    switch (event.key) {
      case 'ArrowDown':
        move(rows[index + 1]);
        break;
      case 'ArrowUp':
        move(rows[index - 1]);
        break;
      case 'Home':
        move(rows[0]);
        break;
      case 'End':
        move(rows[rows.length - 1]);
        break;
      case forward:
        // Open a shut branch; on an open one, step into it. The first child is
        // the next row in the document, which is what makes that one line.
        if (open === 'false') {
          event.preventDefault();
          openBranch(target);
        } else if (open === 'true') {
          move(rows[index + 1]);
        }

        break;
      case back:
        if (open === 'true') {
          event.preventDefault();
          openBranch(target);
        } else {
          move(target.parentElement?.closest('[role="treeitem"]') as HTMLElement | null);
        }

        break;
      // Enter is the one key that *presses* the row — it chooses it and opens
      // it on the way, which is what pressing it with a pointer does.
      case 'Enter':
      case ' ':
        event.preventDefault();
        target.click();
        break;
      default:
        break;
    }
  }

  return (
    <MPTreeViewContext.Provider value={context}>
      <ul
        ref={setRootRef}
        role="tree"
        aria-label={label}
        aria-multiselectable={multiple || undefined}
        data-mp-size={size}
        data-mp-variant={variant}
        className={[
          'mp-tree rounded-mp-md m-0 box-border flex list-none flex-col p-1',
          containerSurface(variant, elevation),
          'text-mp-on-surface',
          LINES[lines],
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          {
            '--_mp-tree-indent': `${INDENT[size]}px`,
            '--_mp-tree-row': `${rowHeight(size, density)}px`,
            ...style
          } as React.CSSProperties
        }
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </ul>
    </MPTreeViewContext.Provider>
  );
});

/**
 * One row, and everything under it.
 *
 * The `<li>` is the `treeitem` and it is what takes focus, which is the ARIA
 * pattern — see the note on `MPTreeView` for why that makes the disclosure
 * arrow a span rather than a button.
 */
export const MPTreeItem = React.forwardRef<HTMLLIElement, MPTreeItemProps>(function MPTreeItem(
  {
    value,
    label,
    startIcon,
    endIcon,
    action,
    href,
    expandable,
    disabled: disabledProp = false,
    className,
    children,
    onClick,
    ...props
  },
  ref
) {
  const {
    size,
    disabled: treeDisabled,
    expandedKeys,
    selectedKeys,
    activeKey,
    toggle,
    select,
    activate,
    register
  } = React.useContext(MPTreeViewContext);

  const generatedId = React.useId();
  const identity = value ?? generatedId;
  const key = keyOf(identity);

  const itemRef = React.useRef<HTMLLIElement | null>(null);

  const setItemRef = React.useCallback(
    (node: HTMLLIElement | null) => {
      itemRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  // `toArray` rather than `count`: it drops the `null` a `{when && …}` leaves
  // behind, so a branch whose children all filtered out is a leaf.
  const branch = React.Children.toArray(children);
  const isParent = expandable ?? branch.length > 0;
  const isExpanded = isParent && expandedKeys.has(key);
  const isSelected = selectedKeys.has(key);
  const disabled = disabledProp || treeDisabled;

  /*
   * The opener the tree's arrow keys reach for. The object is stable and its one
   * method is rewritten on every render, so the map the tree holds never goes
   * stale and registering does not have to run again when the row's props move.
   */
  const apiRef = React.useRef<MPTreeItemApi>({ toggle: () => {} });

  apiRef.current.toggle = () => {
    if (!disabled && isParent) {
      toggle(identity);
    }
  };

  const closing = React.useContext(MPTreeClosingContext);

  React.useEffect(
    () => (closing ? undefined : register(key, apiRef.current)),
    [closing, key, register]
  );

  /*
   * A branch opens and shuts at a height, the way an accordion's panel does. It
   * used to be there on one frame and gone on the next, which on a tree deep
   * enough to need one is the whole page jumping.
   *
   * The height is a grid row going from `0fr` to `1fr` rather than a measured
   * pixel value: nothing has to be observed, a branch that gains a row while it
   * is open grows with it, and a nested branch opening inside this one is
   * carried by the same `1fr`.
   *
   * Two pieces of state rather than one, because they change at different
   * moments. `mounted` is whether the rows exist at all — it goes up with the
   * branch and comes down only once the collapse has finished, which is what
   * gives the transition something to run on. `open` is the row track, and it is
   * flipped a frame *after* the mount, because a transition needs a previous
   * value and an element that has never been laid out has none.
   */
  const [branchMounted, setBranchMounted] = React.useState(isExpanded);
  const [branchOpen, setBranchOpen] = React.useState(isExpanded);
  const branchRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (isExpanded) {
      setBranchMounted(true);

      const frame = requestAnimationFrame(() => setBranchOpen(true));

      return () => cancelAnimationFrame(frame);
    }

    setBranchOpen(false);

    /*
     * A duration of zero fires no `transitionend` at all, so the branch would
     * sit shut and mounted for good — and zero is exactly what a reduced-motion
     * preference sets the duration to, which is the reader least able to afford
     * a tree full of rows that are not there. Asked of the element rather than
     * assumed, since a consumer's own class can set it too.
     */
    const node = branchRef.current;
    const instant =
      node === null ||
      getComputedStyle(node)
        .transitionDuration.split(',')
        .every((one) => Number.parseFloat(one) === 0);

    if (instant) {
      setBranchMounted(false);
    }

    return undefined;
  }, [isExpanded]);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    // Every row is inside every row above it, so a click answered here must not
    // be answered again by each ancestor on the way out. This is also what the
    // arrow keys press — they call `.click()` on the `<li>`, which is why the
    // handler is here rather than on the row drawn inside it.
    event.stopPropagation();

    if (disabled) {
      event.preventDefault();

      return;
    }

    // The `<li>` is what holds the focus, and a click on something inside it
    // does not move focus there in every browser, so the row says so out loud.
    itemRef.current?.focus();
    activate(key);

    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (isParent) {
      toggle(identity);
    }

    select(identity);
  }

  const rowClassNames = [
    'mp-tree__row group relative flex min-w-0 flex-1 items-center overflow-hidden text-start',
    'h-(--_mp-tree-row) no-underline',
    ROW_PAD_X[size],
    ROW_SHAPE,
    CONTROL_GAP[size],
    PROSE_TEXT[size],
    'transition-[background-color,color] duration-(--mp-sys-motion-duration-short4)',
    'ease-mp-standard motion-reduce:transition-none',
    // The ring is drawn on the row rather than on the `<li>` that actually has
    // the focus: the `<li>` also contains the whole branch, so an outline on it
    // would trace a box around everything below the row as well.
    'group-focus-visible/tree-item:outline-mp-secondary',
    'group-focus-visible/tree-item:outline-2 group-focus-visible/tree-item:-outline-offset-2',
    'group-focus-visible/tree-item:outline-solid',
    // An if/else rather than stacked variants: two Tailwind classes of equal
    // specificity resolve by their order in the generated stylesheet.
    disabled
      ? 'text-mp-on-surface/38 cursor-default'
      : isSelected
        ? 'bg-mp-secondary-container text-mp-on-secondary-container cursor-pointer'
        : 'text-mp-on-surface cursor-pointer'
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <React.Fragment>
      {disabled ? null : <MPStateLayer />}

      {/*
        Turned, not moved: the arrow is a glyph, so rotating it is the one
        allowance the rule against transforming a surface makes. A leaf still
        draws the box, so every label in a branch starts on the same column.
      */}
      <span
        aria-hidden="true"
        onClick={(event) => {
          if (disabled || !isParent) {
            return;
          }

          // The arrow opens the branch and nothing else — it does not choose the
          // row. That is the difference between pointing at a folder and opening
          // one, and it is the only reason the arrow is a target of its own.
          event.stopPropagation();
          event.preventDefault();
          itemRef.current?.focus();
          activate(key);
          toggle(identity);
        }}
        className={[
          'mp-tree__arrow relative flex h-[1lh] w-[1.15em] shrink-0 items-center justify-center',
          'transition-[rotate] duration-(--mp-sys-motion-duration-short4)',
          'ease-mp-standard motion-reduce:transition-none',
          isParent ? 'text-mp-on-surface-variant' : '',
          isExpanded ? 'rotate-0' : '-rotate-90 rtl:rotate-90'
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isParent ? <MPIcon icon={ChevronDownIcon} size={CONTROL_ICON[size] - 6} /> : null}
      </span>

      {hasContent(startIcon) ? (
        <span className="text-mp-on-surface-variant relative flex h-[1lh] shrink-0 items-center">
          {startIcon}
        </span>
      ) : null}

      <span className="relative min-w-0 flex-1 truncate">{label}</span>

      {hasContent(endIcon) ? (
        <span className="text-mp-on-surface-variant relative flex h-[1lh] shrink-0 items-center">
          {endIcon}
        </span>
      ) : null}
    </React.Fragment>
  );

  return (
    <li
      ref={setItemRef}
      role="treeitem"
      aria-expanded={isParent ? isExpanded : undefined}
      aria-selected={isSelected ? true : undefined}
      aria-disabled={disabled || undefined}
      data-mp-value={key}
      tabIndex={activeKey === key ? 0 : -1}
      // Not `outline-none`: that utility zeroes the same variable the row's own
      // ring is drawn through.
      className={['mp-tree__item group/tree-item relative block', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ outline: 'none' }}
      onClick={handleClick}
      {...props}
    >
      <div className="flex w-full items-center">
        {href && !disabled ? (
          <a
            href={href}
            // Inside the tab stop, not another one: a tree is a single widget,
            // and the arrow keys are how the rows in it are reached.
            tabIndex={-1}
            className={rowClassNames}
            aria-current={isSelected ? 'page' : undefined}
          >
            {body}
          </a>
        ) : (
          <div className={rowClassNames}>{body}</div>
        )}

        {hasContent(action) ? (
          <span
            className={`mp-tree__action flex shrink-0 items-center ${ROW_PAD_X[size]}`}
            onClick={(event) => event.stopPropagation()}
          >
            {action}
          </span>
        ) : null}
      </div>

      {isParent && branchMounted && branch.length > 0 ? (
        <div
          ref={branchRef}
          // What `treeRows` reads to leave a shutting branch out of the order the
          // arrow keys walk. `pointer-events` goes with it: a row on its way out
          // must not answer the click that closed it.
          data-mp-closing={isExpanded ? undefined : ''}
          className={[
            'mp-tree__branch grid',
            'transition-[grid-template-rows] duration-(--mp-sys-motion-duration-short4)',
            'ease-mp-standard motion-reduce:transition-none',
            branchOpen ? 'grid-rows-[1fr]' : 'pointer-events-none grid-rows-[0fr]'
          ].join(' ')}
          onTransitionEnd={(event) => {
            // The row track and this element only — every row inside it is
            // transitioning a colour of its own on the way past.
            if (
              event.target === event.currentTarget &&
              event.propertyName === 'grid-template-rows' &&
              !isExpanded
            ) {
              setBranchMounted(false);
            }
          }}
        >
          <ul role="group" className="m-0 min-h-0 list-none overflow-hidden ps-(--_mp-tree-indent)">
            <MPTreeClosingContext.Provider value={closing || !isExpanded}>
              {children}
            </MPTreeClosingContext.Provider>
          </ul>
        </div>
      ) : null}
    </li>
  );
});
