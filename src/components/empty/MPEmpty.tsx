import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { EMPTY } from '../../internal/messages/empty';
import { hasContent, PROSE_TEXT, SHEET_GAP, SHEET_PAD_X, SHEET_TITLE } from '../../internal/scale';
import { CONTAINER_SURFACE } from '../../internal/surface';
import type { MPSize, MPVariant } from '../../types';

export interface MPEmptyProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'title'
> {
  /**
   * The headline. Defaults to the words for "nothing here" in `locale`; pass
   * `false` for a state that is a glyph and a sentence with no heading over
   * them.
   */
  title?: React.ReactNode | false;
  /**
   * Which language that default headline is written in. Falls back to the
   * nearest `MPLocaleProvider`, then to English.
   *
   * It matters more here than anywhere else in the library: this is the one
   * invented string that is **drawn** rather than only read out, so a page in
   * Korean with an empty list used to say "Nothing here" in the middle of it.
   */
  locale?: string;
  /**
   * The glyph above the headline. Defaults to the empty tray; pass `false` to
   * drop it, or a node — an illustration, a brand mark, an icon from any set —
   * to replace it.
   */
  icon?: React.ReactNode | false;
  /**
   * What to do about it, under the text: a "Create the first one" button, a
   * "Clear filters" link. Several of them sit in a row and wrap together.
   */
  action?: React.ReactNode;
  /**
   * How much surface the state paints.
   *
   * `text` is the default here and on nothing else in the library. An empty
   * state is nearly always already inside something — a card's body, a table
   * below its header, a panel — and a second rectangle drawn inside the first is
   * one rectangle too many. The other four are for the case where it is not.
   * @default 'text'
   */
  variant?: MPVariant;
  /**
   * @default 'md'
   */
  size?: MPSize;
  /** Renders something other than a `<div>`: `render={<td colSpan={5} />}`. */
  render?: useRender.RenderProp;
  /** The sentence under the headline: why it is empty, or what to do next. */
  children?: React.ReactNode;
}

/**
 * The room the state takes, and its own ladder rather than `SHEET_PAD`'s.
 *
 * A sheet is padded so its content does not touch the edge; an empty state is
 * padded so the emptiness reads as *deliberate*. Given a sheet's 16px a `md` one
 * comes out the height of three lines of text, which looks like a paragraph that
 * failed to load rather than an answer to a question.
 *
 * The horizontal track is the shared one, unchanged: sideways there is nothing
 * to say, and a state set into a card should have the card's own gutters.
 */
const PAD_Y: Record<MPSize, string> = {
  xs: 'py-5',
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-10',
  xl: 'py-12'
};

/**
 * The glyph's scale, as a font size the `size-[1em]` below then reads.
 *
 * An `em` rather than a box, so whatever the caller hands over is measured
 * against the type around it and an icon from another set lands at the same
 * weight as ours. It is a long way above the size an icon rides a label at,
 * because this one is not riding anything — it is the first thing in an
 * otherwise empty rectangle.
 */
const GLYPH: Record<MPSize, string> = {
  xs: 'text-[1.5rem]',
  sm: 'text-[1.75rem]',
  md: 'text-[2.25rem]',
  lg: 'text-[2.75rem]',
  xl: 'text-[3.25rem]'
};

/**
 * The tray with nothing in it.
 *
 * Drawn here rather than taken from the icon set because it is the one glyph in
 * the library that has to sit over every *reason* a thing is empty. A folder, a
 * magnifying glass and a document each name one — nothing filed, nothing found,
 * nothing written — and this component is used for all three.
 *
 * The lip is a separate stroke, so what the drawing shows is a container with an
 * opening and no contents rather than a solid block.
 */
function TrayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-[1em]">
      <path
        d="M1.75 9.75h3l.9 1.6h4.7l.9-1.6h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m1.75 9.75 2.1-6a1.5 1.5 0 0 1 1.42-1h5.46a1.5 1.5 0 0 1 1.42 1l2.1 6v2a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * What stands where content would have been: a glyph, a headline, a sentence and
 * a way out.
 *
 * It is the other half of `MPSkeleton`. A skeleton is the shape of something on
 * its way; this is the shape of something that is not coming — a search with no
 * matches, an inbox nobody has written to, a folder before the first file. The
 * two are never both right at once, and a list that shows neither has a blank
 * rectangle where its answer should be.
 *
 * The headline is the only text in the library a component invents at full size,
 * and it is defaulted rather than required for one reason: the version that says
 * nothing useful is the version that gets shipped. `Nothing here` is a floor, and
 * every slot above it — the glyph, the sentence, the action — is there to be
 * filled with what is actually missing.
 *
 * ## No `color`
 *
 * Deliberately absent, where nearly every other component here has one. An empty
 * state in the accent colour is making a claim about content that does not
 * exist; the surface roles it reads are the neutral ones, and the way to say
 * "this is a problem" is a `color="error"` button in `action` — which is the
 * thing that can actually be pressed about it.
 */
export const MPEmpty = React.forwardRef<HTMLDivElement, MPEmptyProps>(function MPEmpty(
  {
    variant = 'text',
    size = 'md',
    title,
    icon,
    action,
    locale: localeProp,
    render,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(EMPTY, locale);
  const heading = title === undefined ? messages.title : title;
  const glyph = icon === undefined ? <TrayIcon /> : icon;
  const titled = hasContent(heading);

  const classNames = [
    'mp-empty flex w-full flex-col items-center justify-center text-center',
    SHEET_PAD_X[size],
    PAD_Y[size],
    variant === 'text' ? '' : 'rounded-mp-md',
    SHEET_GAP[size],
    // The sheet stays neutral even on `filled`, because `action` is somebody
    // else's button and it arrived with its own colours.
    CONTAINER_SURFACE[variant],
    'text-mp-on-surface',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return useRender({
    render,
    ref,
    props: {
      // A list that empties under the reader has to say so, and it has no other
      // way to: nothing was removed from the page, something was added to it.
      // Announced rather than interrupting, because "no results" is the answer
      // to a question that was just asked. `role={undefined}` turns it off for a
      // state that is simply part of the page on arrival.
      role: 'status',
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: classNames,
      style,
      children: (
        <>
          {hasContent(glyph) ? (
            <span
              className={`text-mp-on-surface-variant flex items-center ${GLYPH[size]} [&>svg]:size-[1em]`}
            >
              {glyph}
            </span>
          ) : null}

          {titled || hasContent(children) ? (
            // `max-w-prose` and nothing narrower: an empty state is centred, and
            // a centred sentence running the full width of a page is a sentence
            // whose second line starts somewhere the eye has to hunt for.
            <div className={`flex max-w-prose flex-col items-center ${SHEET_GAP[size]}`}>
              {titled ? <div className={SHEET_TITLE[size]}>{heading}</div> : null}
              {hasContent(children) ? (
                // The detail is supporting text under a headline, so it takes
                // `on-surface-variant` — the same role a field's description
                // takes. Without a headline it *is* the state, and stays reading
                // text.
                <div
                  className={`${PROSE_TEXT[size]} ${titled ? 'text-mp-on-surface-variant' : ''}`}
                >
                  {children}
                </div>
              ) : null}
            </div>
          ) : null}

          {hasContent(action) ? (
            <div className="flex flex-wrap items-center justify-center gap-2">{action}</div>
          ) : null}
        </>
      ),
      ...props
    }
  });
});
