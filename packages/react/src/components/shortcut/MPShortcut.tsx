import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import { tokenizeShortcut, useDetectedOS, type MPResolvedOS } from '../../internal/keys';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import { useMPSize } from '../../internal/config';
import type { MPColor, MPSize, MPVariant } from '../../types';

/**
 * Which keyboard the shortcut is being read on.
 *
 * `auto` asks the browser, which is right for a shortcut a reader is about to
 * press. The three explicit values are for documentation that has to name a
 * platform rather than the reader's own — a support page describing the Windows
 * build, a table comparing the two.
 */
export type MPShortcutOS = 'auto' | 'mac' | 'windows' | 'linux';

/** The three real platforms, once `auto` has been resolved. */
type ResolvedOS = MPResolvedOS;

export interface MPShortcutProps extends Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'color' | 'children'
> {
  /**
   * The keys, innermost punctuation and all.
   *
   * A string is split on `+` — `'Mod+Shift+P'` — which covers everything except
   * a shortcut whose key *is* a plus. For that one, pass the array form:
   * `keys={['Ctrl', '+']}`.
   */
  keys: string | string[];
  /**
   * Which keyboard to name the modifiers for.
   * @default 'auto'
   */
  os?: MPShortcutOS;
  /**
   * What goes between two keys. Omit it for the platform's own convention: a `+`
   * on Windows and Linux, and nothing at all on macOS, where a shortcut is
   * written as a run of symbols — `⇧⌘P`, never `⇧+⌘+P`.
   */
  separator?: React.ReactNode;
  /**
   * How much surface a key cap paints.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * @default 'md'
   */
  size?: MPSize;
  /**
   * @default 'secondary'
   */
  color?: MPColor;
}

/**
 * What a key is called, and what it is drawn as.
 *
 * `symbol` is what a sighted reader sees and `name` is what a screen reader
 * says. They differ on exactly the keys macOS draws as glyphs — `⌘` announced by
 * its Unicode name is "place of interest sign", which is not a key anybody has
 * on their keyboard.
 */
interface KeyLabel {
  symbol: string;
  name: string;
}

const word = (text: string): KeyLabel => ({ symbol: text, name: text });

/**
 * One entry per key that is spelled differently somewhere, keyed by the token
 * with its case and spaces taken off.
 *
 * The aliases are deliberate and not generosity: `Cmd`, `Command` and `Meta` are
 * three names one key already has, and a component that accepted only one of
 * them would be a component every caller has to look up.
 *
 * `Mod` is the entry the rest exist for. It is the only token whose *meaning*
 * changes with the platform rather than just its spelling — the modifier a
 * shortcut is actually built on, which is Command on a Mac and Control
 * everywhere else. Writing `Ctrl` and hoping is what makes a documentation page
 * wrong for half its readers.
 */
const KEY_LABELS: Record<string, Record<ResolvedOS, KeyLabel>> = {
  mod: {
    mac: { symbol: '⌘', name: 'Command' },
    windows: word('Ctrl'),
    linux: word('Ctrl')
  },
  meta: {
    mac: { symbol: '⌘', name: 'Command' },
    windows: word('Win'),
    linux: word('Super')
  },
  ctrl: {
    mac: { symbol: '⌃', name: 'Control' },
    windows: word('Ctrl'),
    linux: word('Ctrl')
  },
  alt: {
    mac: { symbol: '⌥', name: 'Option' },
    windows: word('Alt'),
    linux: word('Alt')
  },
  shift: {
    mac: { symbol: '⇧', name: 'Shift' },
    windows: word('Shift'),
    linux: word('Shift')
  },
  enter: {
    mac: { symbol: '↩', name: 'Enter' },
    windows: word('Enter'),
    linux: word('Enter')
  },
  tab: {
    mac: { symbol: '⇥', name: 'Tab' },
    windows: word('Tab'),
    linux: word('Tab')
  },
  escape: {
    mac: { symbol: '⎋', name: 'Escape' },
    windows: word('Esc'),
    linux: word('Esc')
  },
  backspace: {
    mac: { symbol: '⌫', name: 'Backspace' },
    windows: word('Backspace'),
    linux: word('Backspace')
  },
  delete: {
    mac: { symbol: '⌦', name: 'Delete' },
    windows: word('Del'),
    linux: word('Del')
  },
  capslock: {
    mac: { symbol: '⇪', name: 'Caps Lock' },
    windows: word('Caps Lock'),
    linux: word('Caps Lock')
  }
};

/** The tokens that name one key by more than one word. */
const KEY_ALIASES: Record<string, string> = {
  cmdorctrl: 'mod',
  commandorcontrol: 'mod',
  cmd: 'meta',
  command: 'meta',
  super: 'meta',
  win: 'meta',
  windows: 'meta',
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  esc: 'escape',
  del: 'delete',
  caps: 'capslock'
};

/**
 * The keys drawn as arrows on every platform, not just on a Mac. An arrow is not
 * a Mac convention — it is what is printed on the key.
 */
const ARROW_LABELS: Record<string, KeyLabel> = {
  up: { symbol: '↑', name: 'Arrow up' },
  down: { symbol: '↓', name: 'Arrow down' },
  left: { symbol: '←', name: 'Arrow left' },
  right: { symbol: '→', name: 'Arrow right' },
  arrowup: { symbol: '↑', name: 'Arrow up' },
  arrowdown: { symbol: '↓', name: 'Arrow down' },
  arrowleft: { symbol: '←', name: 'Arrow left' },
  arrowright: { symbol: '→', name: 'Arrow right' }
};

/** Resolves one token into what to draw and what to announce. */
function labelFor(token: string, os: ResolvedOS): KeyLabel {
  const normalized = token.toLowerCase().replace(/[\s_-]/g, '');
  const canonical = KEY_ALIASES[normalized] ?? normalized;

  const arrow = ARROW_LABELS[canonical];

  if (arrow) {
    return arrow;
  }

  const known = KEY_LABELS[canonical];

  if (known) {
    return known[os];
  }

  // Everything else is printed as it was written, with the one courtesy that a
  // single letter is capitalised: `keys="mod+k"` should draw a K, because that
  // is what is on the key.
  return word(token.length === 1 ? token.toUpperCase() : token);
}

/**
 * A key cap's height, and the same call `MPChip` makes: a token inside a line of
 * text is not a control the line lines up against. `md` is 32px, which is where
 * a two-character cap has a square of its own without becoming a button.
 */
const HEIGHT: Record<MPSize, string> = {
  xs: 'h-5',
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12'
};

/** The width a cap is held to, so `⌘` and `K` come out the same square. */
const MIN_WIDTH: Record<MPSize, string> = {
  xs: 'min-w-5',
  sm: 'min-w-6',
  md: 'min-w-8',
  lg: 'min-w-10',
  xl: 'min-w-12'
};

const TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-small',
  sm: 'text-mp-label-medium',
  md: 'text-mp-label-large',
  lg: 'text-mp-label-large',
  xl: 'text-mp-title-medium'
};

const PAD_X: Record<MPSize, string> = {
  xs: 'px-1',
  sm: 'px-1.5',
  md: 'px-2',
  lg: 'px-2.5',
  xl: 'px-3'
};

/**
 * A key cap is `corner-extra-small`, which is the shape MD3 gives a text field —
 * a shallow well rather than a pill. That is what a key cap has looked like in
 * every manual ever printed, and it is deliberately as far from `corner-full` as
 * the shape scale goes: nothing here is pressable.
 */
const RADIUS: Record<MPSize, string> = {
  xs: 'rounded-mp-xs',
  sm: 'rounded-mp-xs',
  md: 'rounded-mp-sm',
  lg: 'rounded-mp-sm',
  xl: 'rounded-mp-md'
};

/**
 * The five weights. `outlined` is the default: a key cap is a hairline box, and
 * it should be the quietest thing in a menu row it usually sits at the end of.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-mp-on-surface-variant',
  outlined: 'border-mp-outline-variant text-mp-on-surface-variant border bg-transparent',
  text: 'text-mp-on-surface-variant bg-mp-surface-container'
};

/**
 * A keyboard key, or a combination of them.
 *
 * Two things make this more than a styled `<kbd>`, and both are about the label
 * rather than the box around it.
 *
 * The first is `Mod`. A shortcut written as `Ctrl+K` is wrong for every Mac
 * reader and one written as `⌘K` is wrong for everybody else, so the token that
 * means "the modifier shortcuts are built on" resolves per platform — and `os`
 * is there for the pages that have to name a platform rather than the reader's.
 *
 * The second is that `⌘` is not a word. A screen reader reads it as "place of
 * interest sign", so every key drawn as a glyph carries its name beside it in a
 * clipped box. What is announced is "Command K", which is what the shortcut is
 * called.
 *
 * The keys are real `<kbd>` elements; the wrapper around them is a `<span>`.
 * Nesting `<kbd>` inside `<kbd>` is allowed and would also be defensible, but a
 * `kbd` wrapper is a second box for a host stylesheet to reach into for no gain
 * — the semantics are carried by the keys themselves either way.
 */
export const MPShortcut = React.forwardRef<HTMLSpanElement, MPShortcutProps>(function MPShortcut(
  {
    variant = 'outlined',
    size: sizeProp,
    color = 'secondary',
    keys,
    os = 'auto',
    separator,
    className,
    style,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const detected = useDetectedOS();
  const resolved: ResolvedOS = os === 'auto' ? detected : os;

  const tokens = tokenizeShortcut(keys);
  const labels = tokens.map((token) => labelFor(token, resolved));

  // macOS writes a shortcut as a run of symbols with nothing between them; the
  // other two join theirs with a `+`. A caller who passes one gets theirs.
  const joiner = separator === undefined ? (resolved === 'mac' ? null : '+') : separator;

  const keyClasses = [
    'inline-flex shrink-0 items-center justify-center',
    'font-mono leading-none whitespace-nowrap tabular-nums',
    HEIGHT[size],
    MIN_WIDTH[size],
    TEXT[size],
    PAD_X[size],
    RADIUS[size],
    SURFACE[variant]
  ].join(' ');

  return (
    <span
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      className={[
        'mp-shortcut inline-flex max-w-full items-center gap-1 align-middle',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {labels.map((label, index) => (
        // The index is a legitimate key here: the list is the `keys` prop, in
        // order, and two identical keys in one shortcut are the same key.
        <React.Fragment key={index}>
          {index > 0 && joiner !== null ? (
            <span aria-hidden="true" className="text-mp-on-surface-variant">
              {joiner}
            </span>
          ) : null}

          <kbd className={keyClasses}>
            {label.symbol === label.name ? (
              label.symbol
            ) : (
              <>
                <span aria-hidden="true">{label.symbol}</span>
                <span className={VISUALLY_HIDDEN}>{label.name}</span>
              </>
            )}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
});
