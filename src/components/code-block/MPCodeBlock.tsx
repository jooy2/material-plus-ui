import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, CodeIcon, CopyIcon } from '../../constants/icons';
import { canonicalLanguage, highlightCode, plainLines } from '../../internal/highlight';
import type { MPCodeLine } from '../../internal/highlight';
import { cssLength } from '../../internal/length';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { CODE } from '../../internal/messages/code';
import { META_TEXT, hasContent } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import { useMPDensity, useMPSize } from '../../internal/config';
import type { MPDensity, MPSize } from '../../types';

export { registerMPLanguage } from '../../internal/highlight';

/**
 * Which palette the block wears.
 *
 * - `auto` — the page's own scheme, light on a light page and dark on a dark
 *   one. The default, because that is what every other surface in this library
 *   does and a reader who has chosen a scheme has chosen it for the whole page.
 * - `dark` and `light` — pinned, whatever the page is doing. `dark` is what a
 *   documentation site usually wants: code has been read on a dark ground since
 *   terminals, and the choice is one prop.
 * - `mono` — no hue at all. Structure carried by weight and by how far a run is
 *   muted, which is what a block printed on paper, or read by somebody who
 *   cannot separate the hues, is left with.
 *
 * The type is open on purpose. A theme is a set of `--mp-code-*` custom
 * properties under a `[data-mp-code-theme]` selector and nothing else, so a
 * consumer who writes one in their own stylesheet has a theme — with nothing to
 * register, nothing to import, and no cost to anybody who did not.
 *
 * No third-party palettes ship here. One Dark, Dracula and the rest are other
 * projects' published work under their own licences, and porting them into this
 * package would be shipping somebody else's design; the open string is how to
 * bring the one you read in all day.
 */
export type MPCodeBlockTheme = 'auto' | 'dark' | 'light' | 'mono' | (string & {});

export interface MPCodeBlockProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'title' | 'prefix' | 'children' | 'onCopy'
> {
  /**
   * The code.
   *
   * Trailing whitespace is trimmed off the end of the block: a template literal
   * is almost always written with a newline before its closing backtick, and
   * that newline is a blank line at the bottom of every block. Nothing is
   * trimmed off the front, because indentation is meaningful in half of the
   * languages here.
   */
  code: string;
  /**
   * What it is written in — `ts`, `bash`, `yml`, `dockerfile`. The common
   * spellings and file extensions are understood, so a value copied off a
   * fenced code block works as it stands.
   *
   * A language nothing here knows is drawn plain rather than refused. Teach it
   * one with `registerMPLanguage`.
   */
  language?: string;
  /**
   * The palette.
   * @default 'auto'
   */
  theme?: MPCodeBlockTheme;
  /** The type scale and the air around the code. @default 'md' */
  size?: MPSize;
  /** Tightens that air and nothing else. @default 0 */
  density?: MPDensity;
  /**
   * Colours the code.
   *
   * Off, nothing is fetched at all — the grammar engine is behind a dynamic
   * import, so a block that does not colour itself costs no more than the text
   * in it. On, the block draws plain on the first frame and colours itself when
   * the grammar lands: a few milliseconds, and never a blank space where the
   * code should be.
   * @default true
   */
  highlight?: boolean;
  /**
   * The bar over the code, and the master switch for it. With it off there is
   * no bar, and none of `showLanguage`, `copyable` or `rawToggle` draws
   * anything whatever they say.
   * @default true
   */
  toolbar?: boolean;
  /**
   * A name at the start of the bar, usually a file path. Takes the place the
   * language would otherwise have, and both can be shown at once.
   */
  title?: React.ReactNode;
  /** Names the language at the start of the bar. @default true */
  showLanguage?: boolean;
  /** The button that puts the code on the clipboard. @default true */
  copyable?: boolean;
  /**
   * The toggle that drops the colouring and shows the characters as they are.
   *
   * Off by default: it is a second control on a bar that usually wants one, and
   * it means nothing at all when `highlight` is off.
   * @default false
   */
  rawToggle?: boolean;
  /**
   * Lines to mark: a tinted row with a rule down its leading edge.
   *
   * A number is one line, a string is a list of lines and ranges — `'4'`,
   * `'4-9'`, `'1,4-9,12'` — and an array is any mix of the two. They are
   * counted the way the gutter counts, so with `startLine={286}` a
   * `markLines={288}` marks the line the gutter calls 288.
   */
  markLines?: number | string | Array<number | string>;
  /** Numbers down the side. @default false */
  lineNumbers?: boolean;
  /** What the first line is numbered. @default 1 */
  startLine?: number;
  /**
   * A shell prompt in front of every line that has something on it — `$`, `#`,
   * `>>>`.
   *
   * Drawn but never *present*: the symbol is generated content, so it cannot be
   * selected, cannot be found by find-in-page, and is not what the copy button
   * puts on the clipboard. A transcript stays a transcript and still pastes
   * into a shell.
   */
  prompt?: string;
  /** Wraps long lines instead of scrolling them sideways. @default false */
  wrap?: boolean;
  /**
   * How tall the block may get before the code scrolls inside it. A number is
   * pixels, a string is any CSS length. Left out, the block is as tall as the
   * code.
   */
  maxHeight?: number | string;
  /** The typeface. Defaults to the page's own monospace stack. */
  fontFamily?: string;
  /** Overrides the size the `size` ladder chose. A number is pixels. */
  fontSize?: number | string;
  /** Overrides the leading. A bare number is a ratio, as in CSS. */
  lineHeight?: number | string;
  /**
   * Which language the block's own words are in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /** The copy button's label. Defaults to the wording in `locale`. */
  copyLabel?: string;
  /** And what it says once the code is on the clipboard. */
  copiedLabel?: string;
  /** The raw toggle's label. */
  rawLabel?: string;
  /** Fires with the copied text once the clipboard has taken it. */
  onCopy?: (code: string) => void;
}

/**
 * The type scale, one step under the running text at every rung.
 *
 * Its own ladder rather than a step off the Material type scale, and for a
 * reason that is about the face rather than about the component: a monospace
 * font at the same nominal size as the prose around it reads a size larger,
 * because its x-height is taller and every glyph is as wide as an `m`.
 */
const CODE_TEXT: Record<MPSize, string> = {
  xs: 'text-[0.6875rem]/[1.55]',
  sm: 'text-[0.75rem]/[1.6]',
  md: 'text-[0.8125rem]/[1.65]',
  lg: 'text-[0.875rem]/[1.7]',
  xl: 'text-[1rem]/[1.7]'
};

/**
 * The air around the code, in pixels, split into the two axes because they go
 * on two different elements.
 *
 * The vertical padding belongs to the box that scrolls. The horizontal padding
 * belongs to each **line**, so a marked line's tint reaches both edges of the
 * block rather than stopping at a gutter — and because the lines sit in a
 * `w-max min-w-full` block, every one of them reaches the same edge whether the
 * code is narrower than the block or scrolled sideways inside it.
 *
 * Numbers and custom properties rather than the literal class tables the rest
 * of the library keeps, for `MPDataList`'s reason: three tracks across five
 * rungs and four density steps is sixty strings, and the bar's own padding has
 * to stay in step with the line's or the title starts two pixels off the code
 * under it. Here it is one addition.
 */
const BODY_PAD_Y: Record<MPSize, number> = { xs: 8, sm: 12, md: 14, lg: 16, xl: 20 };
const LINE_PAD_X: Record<MPSize, number> = { xs: 8, sm: 12, md: 14, lg: 16, xl: 20 };
const BAR_PAD_Y: Record<MPSize, number> = { xs: 4, sm: 4, md: 6, lg: 8, xl: 8 };

/** How long the copy button says it worked. */
const COPIED_FOR = 2000;

/**
 * A padding with the density steps taken out of it, floored where it stops
 * being air and starts being a mistake.
 */
function tighten(base: number, density: MPDensity, floor: number): number {
  return Math.max(floor, base + density * 2);
}

/**
 * `4`, `'4-9'`, `'1,4-9,12'` or any array of those, as the set of numbers they
 * name.
 *
 * A set rather than a sorted list of ranges, because the only question ever
 * asked of it is "is this line in it", once per line. Anything unparseable is
 * dropped rather than thrown: a marked line is an annotation, and a typo in one
 * should cost the annotation rather than the code.
 */
function markedLines(spec: number | string | Array<number | string> | undefined): Set<number> {
  const marked = new Set<number>();

  if (spec === undefined) {
    return marked;
  }

  for (const part of Array.isArray(spec) ? spec : [spec]) {
    if (typeof part === 'number') {
      if (Number.isFinite(part)) {
        marked.add(Math.trunc(part));
      }

      continue;
    }

    for (const token of part.split(',')) {
      const range = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(token);

      if (!range) {
        continue;
      }

      const from = Number(range[1]);
      const to = range[2] === undefined ? from : Number(range[2]);

      // Written the wrong way round is still a range, and the reader who typed
      // `9-4` meant the same six lines.
      for (let line = Math.min(from, to); line <= Math.max(from, to); line += 1) {
        marked.add(line);
      }
    }
  }

  return marked;
}

/**
 * Puts `text` on the clipboard, through whichever of the two ways the browser
 * allows.
 *
 * The async Clipboard API needs a secure context, and a component library is
 * used on `http://192.168.1.4:3000` more often than anyone admits. The fallback
 * is the old `execCommand` dance against an off-screen textarea, which works
 * everywhere and is deprecated everywhere.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);

      return true;
    }
  } catch {
    // Falls through: a rejection here is a permission or a context, and the
    // fallback below is subject to neither.
  }

  try {
    const carrier = document.createElement('textarea');

    carrier.value = text;
    carrier.setAttribute('readonly', '');
    carrier.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.append(carrier);
    carrier.select();

    const copied = document.execCommand('copy');

    carrier.remove();

    return copied;
  } catch {
    return false;
  }
}

/**
 * A viewer for one line of code or a thousand.
 *
 * ```tsx
 * <MPCodeBlock code={source} language="ts" title="src/index.ts" lineNumbers />
 * ```
 *
 * Everything above the code is optional and off one prop each, because the same
 * component has to be a snippet inside a sentence — no bar, no numbers, no
 * chrome — and the full transcript at the top of a README. Those are the same
 * block with different things turned on rather than two components.
 *
 * ## The colouring arrives separately
 *
 * highlight.js, reached through a dynamic import, which makes it the one thing
 * in this library that is loaded rather than imported. The grammars are forty
 * kilobytes and there are thirty-four of them, so they come as their own chunk,
 * one language at a time, and only for a block that asked to be coloured. The
 * block draws plain on the first frame and colours itself when the chunk lands;
 * there is never a blank space where the code should be.
 *
 * ## It is drawn as lines, always
 *
 * Even with no numbers and no prompt. A line is what carries a number, a prompt
 * and a place in the scroll, and a component that switched between two
 * renderings would have two sets of wrapping behaviour to keep in step.
 *
 * ## The block does not take the page's accent
 *
 * It has a palette of its own, because code is read against a ground chosen for
 * code and the twelve hues it needs are not the four MD3 has. `theme` picks
 * which set fills the slots, and `auto` — the default — is the one that follows
 * the page's light and dark the way every other surface here does.
 */
export const MPCodeBlock = React.forwardRef<HTMLDivElement, MPCodeBlockProps>(function MPCodeBlock(
  {
    code,
    language,
    theme = 'auto',
    size: sizeProp,
    density: densityProp,
    highlight = true,
    toolbar = true,
    title,
    showLanguage = true,
    copyable = true,
    rawToggle = false,
    markLines,
    lineNumbers = false,
    startLine = 1,
    prompt,
    wrap = false,
    maxHeight,
    fontFamily,
    fontSize,
    lineHeight,
    locale: localeProp,
    copyLabel,
    copiedLabel,
    rawLabel,
    onCopy,
    className,
    style,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);
  const messages = useMPMessages(CODE, useMPLocale(localeProp));

  /*
   * What the clipboard gets and what the highlighter is handed: line endings
   * normalised, trailing blank lines gone, and nothing else touched.
   *
   * The `\r` is not pedantry. A `code` prop very often arrives from a file,
   * and a file written on Windows ends every line with one — which lines are
   * split on `\n`, so each line keeps a carriage return the reader cannot
   * see, the highlighter treats as part of the last token, and the clipboard
   * hands straight to a shell.
   */
  const source = React.useMemo(() => code.replace(/\r\n?/g, '\n').replace(/\s+$/, ''), [code]);

  const name = canonicalLanguage(language);

  const [raw, setRaw] = React.useState(false);
  const [copied, setCopied] = React.useState<boolean | null>(null);
  const [coloured, setColoured] = React.useState<MPCodeLine[] | null>(null);

  const wanted = highlight && !raw && name !== null;

  /*
   * The colouring, once the grammar has arrived.
   *
   * `cancelled` rather than an `AbortController`, because there is nothing to
   * abort: the import is already in flight and shared with every other block
   * in the same language, and all this has to guarantee is that a block
   * unmounted or re-pointed mid-fetch does not set state afterwards.
   */
  React.useEffect(() => {
    if (!wanted || !name) {
      setColoured(null);

      return;
    }

    let cancelled = false;

    highlightCode(source, name).then(
      (lines) => {
        if (!cancelled) {
          setColoured(lines);
        }
      },
      () => {
        if (!cancelled) {
          setColoured(null);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [source, name, wanted]);

  const lines = React.useMemo(
    () => (wanted && coloured ? coloured : plainLines(source)),
    [wanted, coloured, source]
  );

  const marked = React.useMemo(() => markedLines(markLines), [markLines]);

  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const done = await writeToClipboard(source);

    clearTimeout(timer.current);
    setCopied(done);
    timer.current = setTimeout(() => setCopied(null), COPIED_FOR);

    if (done) {
      onCopy?.(source);
    }
  };

  /*
   * Select-all inside the block rather than select-all of the page.
   *
   * The code is a focusable region, so a reader who tabbed to it and pressed
   * the shortcut every editor has meant *this* code — and the browser's own
   * answer, selecting the article around it too, is never what they were
   * after. Unconditional rather than a prop, because the behaviour it would
   * turn back on is not a feature.
   *
   * The prompts and the line numbers are generated content, so they fall
   * outside the range for the same reason they fall outside the clipboard:
   * there is nothing there to select.
   */
  const codeRef = React.useRef<HTMLPreElement | null>(null);

  const selectEverything = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'a' && event.key !== 'A') {
      return;
    }

    if (!(event.metaKey || event.ctrlKey) || event.altKey) {
      return;
    }

    const node = codeRef.current;
    const selection = typeof window === 'undefined' ? null : window.getSelection();

    if (!node || !selection) {
      return;
    }

    event.preventDefault();

    const range = document.createRange();

    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copyName = copyLabel ?? messages.copy;
  const copiedName = copiedLabel ?? messages.copied;
  const rawName = rawLabel ?? messages.raw;

  /*
   * The bar's buttons are plain elements against the block's own slots rather
   * than `MPIconButton`s, and that is not a shortcut.
   *
   * A control in this library reads the page's colour roles. These sit on a
   * sheet that has deliberately refused them — a dark block on a light
   * article is the ordinary case — so an icon button here would be a light
   * control on a black bar. What they keep is the house treatment: the corner
   * ladder, the duration token, the focus ring.
   */
  const buttonClasses = [
    'mp-code__button inline-flex shrink-0 cursor-pointer items-center gap-1 border-0',
    'rounded-mp-xs bg-transparent px-1.5 py-1',
    'text-(--mp-code-dim) hover:text-(--mp-code-fg) hover:bg-(--mp-code-hover)',
    META_TEXT,
    'transition-[color,background-color] duration-(--mp-sys-motion-duration-short4)',
    'ease-mp-standard motion-reduce:transition-none',
    'outline-(--mp-code-fg) focus-visible:outline-2 focus-visible:outline-offset-1',
    'focus-visible:outline-solid outline-none'
  ].join(' ');

  const regionName = hasContent(title)
    ? typeof title === 'string'
      ? title
      : undefined
    : (name ?? messages.label);

  const barShown = toolbar && (showLanguage || copyable || rawToggle || hasContent(title));

  return (
    <div
      ref={ref}
      data-mp-size={size}
      data-mp-code-theme={theme}
      data-mp-code-wrap={wrap ? 'true' : undefined}
      className={[
        'mp-code rounded-mp-md flex min-w-0 flex-col overflow-hidden',
        'border-(--mp-code-rule) bg-(--mp-code-bg) text-(--mp-code-fg) border',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          // Wide enough for the last number, so the gutter does not step as
          // the block scrolls.
          '--mp-code-gutter': `${String(startLine + Math.max(lines.length - 1, 0)).length}ch`,
          '--mp-code-pad-x': `${tighten(LINE_PAD_X[size], density, 6)}px`,
          '--mp-code-pad-y': `${tighten(BODY_PAD_Y[size], density, 4)}px`,
          '--mp-code-bar-pad-y': `${tighten(BAR_PAD_Y[size], density, 2)}px`,
          ...(fontFamily ? { fontFamily } : null),
          ...(fontSize === undefined ? null : { fontSize: cssLength(fontSize) }),
          ...(lineHeight === undefined ? null : { lineHeight }),
          ...style
        } as React.CSSProperties
      }
      {...props}
    >
      {barShown ? (
        <div
          className={[
            'mp-code__bar border-(--mp-code-rule) flex min-w-0 items-center gap-1 border-b',
            // The bar's inline padding is the line's plus the two pixels a
            // line spends on the rule a marked one draws, so the title starts
            // exactly where the code under it does. Two ladders within four
            // pixels of each other read as one ladder somebody got wrong.
            'px-[calc(var(--mp-code-pad-x)+2px)] py-(--mp-code-bar-pad-y)'
          ].join(' ')}
        >
          {hasContent(title) ? (
            <span className={`mp-code__title min-w-0 truncate font-mono ${META_TEXT}`}>
              {title}
            </span>
          ) : null}

          {showLanguage && name ? (
            <span
              className={[
                'mp-code__language text-(--mp-code-dim) min-w-0 truncate font-mono',
                'tracking-wide uppercase select-none',
                META_TEXT
              ].join(' ')}
            >
              {name}
            </span>
          ) : null}

          <span className="flex-1" />

          {rawToggle && highlight ? (
            <button
              type="button"
              aria-pressed={raw}
              aria-label={rawName}
              title={rawName}
              onClick={() => setRaw((previous) => !previous)}
              className={[buttonClasses, raw ? 'bg-(--mp-code-hover) text-(--mp-code-fg)' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <MPIcon icon={CodeIcon} size="1.15em" />
            </button>
          ) : null}

          {copyable ? (
            <button type="button" onClick={copy} className={buttonClasses}>
              <MPIcon icon={copied ? CheckIcon : CopyIcon} size="1.15em" />
              <span>{copied === null ? copyName : copied ? copiedName : messages.copyFailed}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={`mp-code__body flex min-h-0 flex-col ${CODE_TEXT[size]}`}>
        <div
          // A scrollable region has to be reachable by a keyboard that has no
          // pointer to drag with, and a focusable region has to have a name.
          role="region"
          aria-label={regionName}
          tabIndex={0}
          onKeyDown={selectEverything}
          className={[
            // `box-border`, so `maxHeight` means the height of the box a reader
            // sees rather than the height of what is inside it. This library ships
            // no preflight, and a consumer whose own reset has not reached in here
            // would otherwise get 120 plus the padding.
            'mp-code__scroller box-border min-h-0 overflow-auto py-(--mp-code-pad-y)',
            'outline-(--mp-code-fg) focus-visible:outline-2 focus-visible:-outline-offset-2',
            'focus-visible:outline-solid outline-none'
          ].join(' ')}
          style={maxHeight === undefined ? undefined : { maxHeight: cssLength(maxHeight) }}
        >
          {/*
           * `w-max min-w-full` is what keeps the gutter and the prompts
           * aligned while the code is scrolled sideways: the rows are as wide
           * as the longest line rather than as wide as the window onto them,
           * so every line's number starts at the same place rather than at
           * the scroll's. It is also what lets a marked line's tint reach the
           * same right edge as every other one.
           */}
          <pre
            ref={codeRef}
            className={[
              'm-0 bg-transparent p-0 font-mono',
              wrap ? 'w-full' : 'w-max min-w-full'
            ].join(' ')}
          >
            {lines.map((tokens, index) => {
              const number = startLine + index;

              return (
                <div
                  key={index}
                  className="mp-code-line px-(--mp-code-pad-x)"
                  data-line={lineNumbers ? number : undefined}
                  data-mark={marked.has(number) ? '' : undefined}
                  data-prompt={prompt && tokens.length > 0 ? prompt : undefined}
                >
                  <code>
                    {tokens.map((run, position) =>
                      run.token ? (
                        <span key={position} className={run.token}>
                          {run.text}
                        </span>
                      ) : (
                        <React.Fragment key={position}>{run.text}</React.Fragment>
                      )
                    )}
                  </code>
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* The copy button changes its own label, which a screen reader reading
            the page rather than the button would never hear. This is the
            announcement, and it is only ever one word long. */}
      <span aria-live="polite" className={VISUALLY_HIDDEN}>
        {copied === null ? '' : copied ? copiedName : messages.copyFailed}
      </span>
    </div>
  );
});
