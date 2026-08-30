import * as React from 'react';
import { Autocomplete } from '@base-ui/react/autocomplete';
import { Dialog } from '@base-ui/react/dialog';
import { MPShortcut } from '../shortcut/MPShortcut';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { COMMAND } from '../../internal/messages/command';
import { MPStateLayer } from '../../internal/StateLayer';
import { hasContent, META_TEXT, PROSE_TEXT } from '../../internal/scale';
import { FADE, PORTAL_LAYER, SCRIM, SHEET_MOTION } from '../../internal/surface';
import type { MPColor, MPSize } from '../../types';

/** One thing the palette can do. */
export interface MPCommand {
  /** What identifies the command. */
  value: string;
  /** What the row says, and what the query is matched against. */
  label: string;
  /** A second line under it — where the command goes, or what it changes. */
  description?: React.ReactNode;
  /** A glyph before the label. */
  icon?: React.ReactNode;
  /**
   * The keystroke that does the same thing, set at the end of the row.
   *
   * Written the way [MPShortcut](../display/shortcut) writes them, so `Mod`
   * resolves per platform. The palette **does not bind it** — the application
   * does, and this is the label for the binding it already has.
   */
  shortcut?: string;
  /**
   * The heading this command sits under.
   *
   * Commands are drawn in the order they are given and a heading appears each
   * time the group changes, so a group's commands have to be listed together.
   */
  group?: string;
  /**
   * Extra words the query is matched against but that are never drawn — the name
   * somebody else's product gives the same command, an abbreviation, the word
   * the reader would have searched for.
   */
  keywords?: readonly string[];
  /** In the list but not runnable. */
  disabled?: boolean;
  /** What running it does. */
  onSelect?: () => void;
}

export interface MPCommandPaletteProps {
  /** Everything the palette can do. */
  items: readonly MPCommand[];
  /** Whether the palette is open. Use with `onOpenChange` for a controlled one. */
  open?: boolean;
  /**
   * Whether it starts open, for an uncontrolled one.
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Called when a command is run, after its own `onSelect`. The palette closes
   * either way.
   */
  onSelect?: (item: MPCommand) => void;
  /**
   * The keystroke that opens the palette, bound on the window.
   *
   * Written the way [MPShortcut](../display/shortcut) writes them, so `Mod` is
   * Command on a Mac and Control everywhere else — the same vocabulary the rows
   * *draw*, because a shortcut a component displays and one it binds have to be
   * spelled the same way or the label is a claim nobody checked. `false` binds
   * nothing.
   * @default 'Mod+K'
   */
  shortcut?: string | false;
  /** How wide the sheet may get. A number in pixels, or any CSS length. */
  width?: number | string;
  /**
   * How tall the list may get before it scrolls.
   * @default 320
   */
  maxHeight?: number | string;
  /**
   * The row height and type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the highlighted row and the caret read.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Which language the placeholder, the empty line and the dialog's own name are
   * written in. Falls back to the nearest `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** The placeholder in the field. Defaults to the wording in `locale`. */
  placeholder?: string;
  /** The line where the rows would be, when nothing matched. */
  emptyMessage?: React.ReactNode;
  /** The accessible name of the dialog, which has no visible title. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** How wide the sheet gets when nothing says. */
const MAX_WIDTH: Record<MPSize, string> = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl'
};

/** The field, which is taller than a row because it is the thing being typed in. */
const INPUT_HEIGHT: Record<MPSize, string> = {
  xs: 'h-10',
  sm: 'h-12',
  md: 'h-14',
  lg: 'h-16',
  xl: 'h-18'
};

/** MD3's own menu-row inset, which is what a row of commands is. */
const INSET_X: Record<MPSize, string> = {
  xs: 'px-2',
  sm: 'px-2.5',
  md: 'px-3',
  lg: 'px-4',
  xl: 'px-5'
};

const ROW_PAD_Y: Record<MPSize, string> = {
  xs: 'py-1',
  sm: 'py-1.5',
  md: 'py-2',
  lg: 'py-2.5',
  xl: 'py-3'
};

/**
 * Everything one command answers to, folded once, as a single string.
 *
 * The filter used to lower-case the label, the group and every keyword on every
 * item on every keystroke — five hundred commands with five keywords each is
 * three thousand throwaway strings per character typed, in the handler of the
 * one control whose entire job is to keep up with typing.
 *
 * None of that depends on the query, so it is done once per `items` and the
 * keystroke is left with an `includes`.
 *
 * The parts are joined with a newline rather than a space, so a query cannot
 * match across the seam between a label and a keyword — `"copy link"` should not
 * find a command called *Copy* that happens to be tagged *link*.
 */
function haystack(item: MPCommand): string {
  return [item.label, item.group ?? '', ...(item.keywords ?? [])].join('\n').toLowerCase();
}

/**
 * `Mod+K` and its friends, as a predicate over a real keyboard event.
 *
 * The same vocabulary [MPShortcut](../display/shortcut) draws, read rather than
 * written. A shortcut a component displays and a shortcut it binds have to be
 * spelled the same way, or the label on the screen is a claim nobody checked.
 */
function pressed(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const wanted = new Set(parts.slice(0, -1));
  const mac = /mac|iphone|ipad/i.test(typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const mod = mac ? event.metaKey : event.ctrlKey;

  if (wanted.has('mod') !== mod) {
    return false;
  }

  if (wanted.has('shift') !== event.shiftKey) {
    return false;
  }

  if (wanted.has('alt') !== event.altKey) {
    return false;
  }

  if (!wanted.has('mod') && wanted.has('ctrl') !== event.ctrlKey) {
    return false;
  }

  if (!wanted.has('mod') && wanted.has('meta') !== event.metaKey) {
    return false;
  }

  return event.key.toLowerCase() === key;
}

/**
 * Everything an application can do, behind one field.
 *
 * The shape a keyboard-first product takes once it has more actions than a menu
 * bar can hold: the reader types what they want instead of remembering where it
 * was put.
 *
 * ## What it is not
 *
 * Not an [MPMenu](./menu). A menu is a short list in one place, and every row is
 * visible before you go looking for it — that is the whole of what a menu is
 * good at, and it is why a menu of sixty rows is not a menu.
 *
 * Not an [MPCombobox](./combobox) either, and this one is worth being precise
 * about: what comes back from a combobox is a **value**, which the caller then
 * does something with. What comes back from here is *something happening*. The
 * row is the action, `onSelect` runs it, and the sheet closes because there is
 * nothing left to decide.
 *
 * ## The surface is MD3's search view
 *
 * `surface-container-high` at `corner-extra-large` under elevation 3 — which is
 * MD3's own docked search view, and happens to be the same three decisions
 * [MPDialog](../feedback/dialog) makes. That is not a coincidence worth hiding:
 * a sheet that has taken the page over a scrim is one object in this system,
 * whether it is asking a question or taking a search.
 *
 * ## Where the behaviour comes from
 *
 * Base UI's `Autocomplete` owns the list — the highlight the pointer and the
 * arrow keys **share**, `aria-activedescendant`, Enter running the highlighted
 * row — and its `Dialog` owns the sheet, the scrim, the focus trap and putting
 * the focus back wherever the reader was. What is left here is the surface, the
 * matching, and the key that opens it.
 */
export function MPCommandPalette({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  shortcut = 'Mod+K',
  width,
  maxHeight = 320,
  size = 'md',
  color = 'primary',
  locale: localeProp,
  placeholder,
  emptyMessage,
  label,
  className,
  style
}: MPCommandPaletteProps) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(COMMAND, locale);

  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState('');

  const showing = open ?? uncontrolled;

  /**
   * Every way out goes through here, which is the point: a command that ran, an
   * Escape, a click on the scrim and a `false` from the caller all have to leave
   * the palette in the same state.
   *
   * The query is dropped on the way **out** rather than on the way in, so the
   * sheet never flashes the last search as it fades away.
   */
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery('');
      }

      if (open === undefined) {
        setUncontrolled(next);
      }

      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );

  React.useEffect(() => {
    if (shortcut === false) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!pressed(event, shortcut)) {
        return;
      }

      // Some browsers put their own search bar on Mod+K, and the page asked for
      // this key.
      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcut, setOpen]);

  const folded = React.useMemo(() => items.map(haystack), [items]);

  const filtered = React.useMemo(() => {
    if (query === '') {
      return items;
    }

    const needle = query.toLowerCase();

    return items.filter((_, index) => folded[index].includes(needle));
  }, [items, folded, query]);

  const run = (item: MPCommand) => {
    if (item.disabled) {
      return;
    }

    item.onSelect?.();
    onSelect?.(item);
    setOpen(false);
  };

  const sheetWidth = typeof width === 'number' ? `${width}px` : width;
  const listHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

  return (
    <Dialog.Root open={showing} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className={`${PORTAL_LAYER} fixed inset-0 ${FADE} ${SCRIM}`} />

        {/*
         * Pinned near the top rather than centred. A palette is opened by
         * somebody who is about to type, and a field that arrives under the
         * reader's hands is a field they do not have to look for — the same
         * reason every editor's palette in the last decade sits at a twelfth of
         * the way down.
         */}
        <Dialog.Viewport
          className={`${PORTAL_LAYER} fixed inset-0 flex justify-center p-4 pt-[12vh]`}
        >
          <Dialog.Popup
            aria-label={label ?? messages.label}
            data-mp-size={size}
            className={[
              'mp-command-palette relative flex w-full flex-col self-start overflow-hidden',
              'bg-mp-surface-container-high text-mp-on-surface shadow-mp-3 rounded-mp-xl',
              'outline-none',
              PROSE_TEXT[size],
              sheetWidth === undefined ? MAX_WIDTH[size] : '',
              // The dialog's own arrival, unchanged: a sheet that has taken the
              // page grows as it fades, and this is one.
              `transition-[opacity,scale] ${SHEET_MOTION}`,
              'motion-safe:data-starting-style:scale-95 motion-safe:data-ending-style:scale-95',
              className ?? ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              ...accentSlots(color),
              ...(sheetWidth === undefined ? null : { maxWidth: sheetWidth }),
              ...style
            }}
          >
            <Autocomplete.Root
              open
              mode="list"
              // Filtered here rather than by Base UI, so that a group heading can
              // be drawn from the same array the rows come out of — a heading
              // has to know whether the row above it survived the query.
              items={filtered}
              filter={null}
              value={query}
              onValueChange={(next) => setQuery(next)}
              itemToStringValue={(item: MPCommand) => item.label}
            >
              <div
                className={`border-mp-outline-variant flex shrink-0 items-center border-b ${INSET_X[size]}`}
              >
                <Autocomplete.Input
                  autoFocus
                  placeholder={placeholder ?? messages.search}
                  className={[
                    'mp-command-palette__input min-w-0 flex-1 bg-transparent font-[inherit]',
                    'text-inherit outline-none',
                    'placeholder:text-mp-on-surface-variant caret-(--_mp-accent)',
                    INPUT_HEIGHT[size]
                  ].join(' ')}
                />
              </div>

              <Autocomplete.List
                className="mp-command-palette__list min-h-0 flex-1 overflow-y-auto overscroll-contain p-1"
                style={{ maxHeight: listHeight }}
              >
                {(item: MPCommand, index: number) => (
                  <React.Fragment key={`${index}:${item.value}`}>
                    {item.group && item.group !== filtered[index - 1]?.group ? (
                      <div
                        role="presentation"
                        className={`text-mp-on-surface-variant pt-2 pb-1 font-medium ${INSET_X[size]} ${META_TEXT}`}
                      >
                        {item.group}
                      </div>
                    ) : null}

                    <Autocomplete.Item
                      index={index}
                      value={item}
                      disabled={item.disabled}
                      onClick={() => run(item)}
                      className={[
                        'mp-command-palette__row group rounded-mp-xs relative flex cursor-pointer',
                        'items-center gap-3 select-none outline-none',
                        'data-disabled:text-mp-on-surface/38 data-disabled:cursor-default',
                        INSET_X[size],
                        ROW_PAD_Y[size]
                      ].join(' ')}
                    >
                      {/*
                       * `data-highlighted` rather than `:hover`, exactly as on a
                       * menu row: it is also what the arrow keys move, so the
                       * pointer and the keyboard light the same row and a reader
                       * never has to work out which of two marks Enter would run.
                       */}
                      <MPStateLayer
                        layer="inset-0 rounded-[inherit] bg-current"
                        className="group-data-highlighted:opacity-8 group-data-disabled:opacity-0"
                      />

                      {hasContent(item.icon) ? (
                        <span className="relative flex h-[1lh] shrink-0 items-center">
                          {item.icon}
                        </span>
                      ) : null}

                      <span className="relative flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{item.label}</span>
                        {hasContent(item.description) ? (
                          <span className={`text-mp-on-surface-variant truncate ${META_TEXT}`}>
                            {item.description}
                          </span>
                        ) : null}
                      </span>

                      {item.shortcut ? (
                        <MPShortcut size="xs" keys={item.shortcut} className="relative shrink-0" />
                      ) : null}
                    </Autocomplete.Item>
                  </React.Fragment>
                )}
              </Autocomplete.List>

              <Autocomplete.Empty
                className={`text-mp-on-surface-variant py-6 text-center ${INSET_X[size]} ${META_TEXT}`}
              >
                {emptyMessage ?? messages.empty}
              </Autocomplete.Empty>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
