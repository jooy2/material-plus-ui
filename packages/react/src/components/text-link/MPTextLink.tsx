import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { MPIcon } from '../icon/MPIcon';
import { ExternalLinkIcon, LinkIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { linkRel } from '../../internal/link';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { TEXT_LINK } from '../../internal/messages/text-link';
import { PROSE_TEXT } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPColor, MPSize } from '../../types';

/**
 * When the line under a link is drawn.
 *
 * `always` is the default, and the reason is `color`: an `MPTextLink` takes no
 * accent family unless one is asked for, so with the line off there would be
 * nothing at all distinguishing a link from the sentence it sits in. That is
 * also why this is not a boolean — "no underline" is a real choice for a link in
 * a nav bar or a footer, where position already says what it is, and it should
 * have to be spelled out rather than fallen into.
 */
export type MPTextLinkUnderline = 'always' | 'hover' | 'none';

export interface MPTextLinkProps extends Omit<React.ComponentPropsWithoutRef<'a'>, 'color'> {
  /** Where the link goes. */
  href: string;
  /**
   * When the underline is drawn.
   * @default 'always'
   */
  underline?: MPTextLinkUnderline;
  /**
   * Which accent family the link reads. Like `MPTypography` and unlike every
   * control in the library this has **no default** — a link in a paragraph is
   * usually the paragraph's own colour with a line under it, and a component
   * that arrived pre-dyed is one a page has to undo.
   */
  color?: MPColor;
  /**
   * The type scale. Also no default: a link inside a sentence is the size of the
   * sentence. Set it for a link that stands on its own.
   */
  size?: MPSize;
  /**
   * Opens the link in a new tab, with the `rel` that keeps the new page from
   * reaching back into this one.
   *
   * A window changing under the reader is the one thing about a link that cannot
   * be seen before it happens, so this also turns `icon` on by default and adds
   * a line for a screen reader — see `newTabLabel`.
   * @default false
   */
  newTab?: boolean;
  /**
   * The mark after the label. `true` draws the arrow leaving its box when
   * `newTab` is on and the chain otherwise, `false` draws nothing, and a node of
   * your own replaces the glyph.
   *
   * Left out, it follows `newTab`.
   */
  icon?: React.ReactNode | boolean;
  /**
   * What a screen reader hears after the label when `newTab` is on. A link
   * without it says nothing of its own, so this changes nothing there.
   *
   * Defaults to the wording in `locale`.
   */
  newTabLabel?: string;
  /**
   * Which language that wording is in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * Renders something other than an `<a>` — the `Link` a router brings, most of
   * the time. `href` still goes through, so `render={<NextLink href="…" />}`
   * needs it written once, on the `MPTextLink`.
   */
  render?: useRender.RenderProp;
  /** The label. */
  children?: React.ReactNode;
}

/**
 * Whether the line is drawn, and — with the colour below — the only two things
 * about a link that a prop changes.
 *
 * Every utility here is written through `[&.mp-link]`, which doubles the
 * component's own class into the selector and takes its specificity to two
 * classes. That is not decoration: `<a>` is, with `<td>`, one of the two tags a
 * host stylesheet still styles by name — `.prose a`, `.vp-doc a`, every CSS
 * framework ever — and all of those are a class plus a type, which outranks a
 * plain utility. A link that lost its colour and its line inside a `.prose`
 * block would have lost the only two things it is.
 *
 * Hover deliberately leaves the *text* colour alone and moves the line instead.
 * A link inside running prose that changes colour under the pointer drags the
 * reader's eye off the line they were reading.
 */
const UNDERLINE: Record<MPTextLinkUnderline, string> = {
  always: '[&.mp-link]:underline',
  hover: '[&.mp-link]:no-underline [&.mp-link]:hover:underline',
  // Nothing to hover, on purpose. A link with no line and no colour is a link
  // whose surroundings are saying what it is.
  none: '[&.mp-link]:no-underline'
};

/**
 * The line itself: how thick, how far below the baseline, and in what.
 *
 * It rests at 45% of whatever the text is and goes to the full colour under the
 * pointer, so one rule works on an inherited colour and on an accent one. The
 * thickness and offset are in `em` so they track the type rather than staying
 * a fixed hairline at 36px.
 *
 * Doubled through `[&.mp-link]` for the same reason the two above are: a host
 * `.prose a` sets `text-decoration` too.
 */
const LINE = [
  '[&.mp-link]:[text-underline-offset:0.2em]',
  '[&.mp-link]:[text-decoration-thickness:0.08em]',
  '[&.mp-link]:[text-decoration-color:color-mix(in_oklab,currentColor_45%,transparent)]',
  '[&.mp-link]:hover:[text-decoration-color:currentColor]'
].join(' ');

/**
 * A link, in a sentence or on its own.
 *
 * Everything about it is deliberately smaller than a button. It has no surface,
 * no height of its own and no colour unless asked — what it has is a line under
 * it, which is the one mark a reader already knows means "this goes somewhere".
 *
 * The three things it does that a bare `<a>` does not: it draws that line on a
 * schedule (`always`, or only under the pointer), it marks a link that opens a
 * new tab both visibly and for a screen reader, and it takes `render`, so the
 * `Link` a router brings can wear all of it.
 *
 * ## Why this is not a button with an `href`
 *
 * `MPButton` deliberately has no `href`, and this is the other half of that
 * decision. A link is announced as a link, opens in a new tab on the middle
 * mouse button, and shows its destination in the status bar; a button does none
 * of those and should not pretend to. Two components, because they are two
 * things.
 */
export const MPTextLink = React.forwardRef<HTMLAnchorElement, MPTextLinkProps>(function MPTextLink(
  {
    href,
    underline = 'always',
    color,
    size,
    newTab = false,
    icon,
    newTabLabel,
    locale: localeProp,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  /*
   * Whether this link takes over the window, however it was asked to.
   *
   * `newTab` is the documented spelling, but `target` also arrives through the
   * rest props — a caller writing `target="_blank"` directly, or a router's
   * `Link` carrying one — and everything that follows from opening a new tab
   * has to follow the *attribute* rather than the prop that usually sets it.
   * That is the `rel` below, and it is the mark and the spoken warning too: a
   * window changing under the reader is the one thing about a link that cannot
   * be seen before it happens, whichever prop arranged it.
   */
  const messages = useMPMessages(TEXT_LINK, useMPLocale(localeProp));
  const target = newTab ? '_blank' : (props.target as string | undefined);
  const opensNewTab = target === '_blank';

  // `icon` left out follows `newTab`, which is the whole reason it is not a
  // plain boolean with a `false` default: a link that takes over the window
  // should say so, and a caller should have to ask for the silent version.
  const mark = icon ?? opensNewTab;
  const glyph =
    mark === true ? (
      // `1em` rather than a pixel size: the glyph rides on the label at just
      // under its cap height, and an icon as tall as the line box would space
      // the words around it apart.
      <MPIcon icon={opensNewTab ? ExternalLinkIcon : LinkIcon} size="0.95em" />
    ) : (
      mark
    );

  const classNames = [
    // Both a style hook and the specificity — see `UNDERLINE`.
    'mp-link cursor-pointer',
    'transition-[color,text-decoration-color]',
    'duration-(--mp-sys-motion-duration-short4)',
    'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-solid focus-visible:rounded-mp-xs outline-none',
    size ? PROSE_TEXT[size] : '',
    UNDERLINE[underline],
    LINE,
    color ? '[&.mp-link]:text-(--_mp-accent)' : '[&.mp-link]:text-inherit',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return useRender({
    render: render ?? <a />,
    ref,
    props: {
      href,
      target,
      rel: linkRel(target, props.rel as string | undefined),
      className: classNames,
      style: color ? { ...accentSlots(color), ...style } : style,
      children: (
        <>
          {children}
          {glyph ? <span className="ms-[0.25em] inline-flex align-baseline">{glyph}</span> : null}
          {/* Drawn for nobody and read to everybody: the arrow says "new tab"
              only to a reader who can see it. The space is a real text node, so
              the accessible name comes out as two words rather than as the
              label with a bracket stuck to the end of it. */}
          {opensNewTab ? (
            <>
              {' '}
              <span className={VISUALLY_HIDDEN}>{newTabLabel ?? messages.newTab}</span>
            </>
          ) : null}
        </>
      ),
      ...props
    }
  });
});
