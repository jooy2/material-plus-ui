import * as React from 'react';
import { MPBox, type MPBoxProps } from '../box/MPBox';
import {
  hasContent,
  META_TEXT,
  PROSE_TEXT,
  SHEET_GAP,
  SHEET_PAD_X,
  SHEET_PAD_Y,
  SHEET_TITLE
} from '../../internal/scale';
import { useMPSize } from '../../internal/config';

export interface MPCardProps extends Omit<MPBoxProps, 'title' | 'padded'> {
  /**
   * The card's heading.
   *
   * A plain string is set in the card's own title role. Pass a real heading
   * element — `title={<h3>Totals</h3>}` — when the card should appear in the
   * document outline: it inherits the typography rather than the browser's, so
   * nothing about it looks different.
   */
  title?: React.ReactNode;
  /** A second line under it, one step down the type scale and muted. */
  subtitle?: React.ReactNode;
  /**
   * Content pinned to the end of the header row — a menu button, a status chip.
   * It stays on the title's line while the title wraps beside it.
   */
  headerAction?: React.ReactNode;
  /**
   * A picture, a chart, a map: drawn **edge to edge** across the top, so the
   * card's own corners crop it.
   *
   * MD3's own card anatomy puts the media above the headline, and it is a slot
   * of its own rather than part of `children` because it is the one part of a
   * card that must not be padded.
   */
  media?: React.ReactNode;
  /**
   * The bottom area. Laid out as a wrapping row, so a pair of buttons needs no
   * wrapper of its own; anything else brings its own layout.
   */
  footer?: React.ReactNode;
  /**
   * Draws a hairline between the sections instead of separating them with space.
   *
   * The rules run the full width of the sheet, so the padding moves off the card
   * and onto each section.
   * @default false
   */
  dividers?: boolean;
  /** The card's body. */
  children?: React.ReactNode;
}

/**
 * The internal hairline is the same `outline-variant` as the card's own edge, so
 * it reads as the sheet being scored rather than as a second, unrelated rule.
 */
const RULE = 'border-mp-outline-variant border-t';

/**
 * An [MPBox](./box) with the parts a card is made of laid out on it: a picture,
 * a heading, a subheading, a body and a footer.
 *
 * The sections are props rather than compound sub-components — no `<MPCard.Header>`
 * — for the reason [MPDialog](../feedback/dialog) gives: the arrangement of a
 * card is fixed, and what a caller wants to decide is what goes in each slot,
 * not what order the slots come in. Every `MPBox` prop passes straight through,
 * so a card is styled on exactly the same axes as the box it is.
 *
 * ## The surface is MD3's card, and so is the anatomy
 *
 * `corner-medium`, and three of the five variants are the specification's own
 * card variants to the letter: `filled` is `surface-container-highest`,
 * `elevated` is `surface-container-low` under a level-1 shadow, `outlined` is a
 * hairline in `outline-variant`. None of them is dyed, and there is no `color`
 * — see `MPBox` for the argument, which is the same one.
 *
 * ## What a card deliberately is not
 *
 * It is not pressable. MD3 does describe a card as a container that *may* be
 * interactive, and a `href` or an `onClick` here would be the wrong shape for
 * it: a card with a heading, a body and two buttons in its footer that is also
 * one big link is a link containing links, which the HTML parser will take
 * apart. Make the **heading** the link, or give the footer a button. What a
 * whole-card target is for is a grid of tiles, and a tile is an
 * [MPBox](./box) with an `<a>` in it.
 */
export const MPCard = React.forwardRef<HTMLDivElement, MPCardProps>(function MPCard(
  {
    size: sizeProp,
    title,
    subtitle,
    headerAction,
    media,
    footer,
    dividers = false,
    className,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const padX = SHEET_PAD_X[size];
  const padY = SHEET_PAD_Y[size];
  // With dividers the lines have to reach both edges, so the sheet gives up its
  // padding and every section takes it on instead. Without them the sheet keeps
  // the vertical track and the sections are told apart by a gap — the same trade
  // `MPDialog` makes.
  const section = dividers ? `${padX} ${padY}` : padX;

  const hasHeader = hasContent(title) || hasContent(subtitle) || hasContent(headerAction);
  const hasMedia = hasContent(media);

  const sections = [
    hasHeader
      ? {
          key: 'header',
          className: 'mp-card__header flex items-start gap-3',
          content: (
            <>
              {hasContent(title) || hasContent(subtitle) ? (
                <div className="flex min-w-0 flex-1 flex-col">
                  {hasContent(title) ? (
                    <div className={`mp-card__title ${SHEET_TITLE[size]}`}>{title}</div>
                  ) : null}
                  {hasContent(subtitle) ? (
                    <div className={`text-mp-on-surface-variant ${META_TEXT}`}>{subtitle}</div>
                  ) : null}
                </div>
              ) : null}
              {hasContent(headerAction) ? (
                <div className="ms-auto shrink-0">{headerAction}</div>
              ) : null}
            </>
          )
        }
      : null,
    hasContent(children)
      ? {
          key: 'content',
          className: `mp-card__body min-w-0 ${PROSE_TEXT[size]}`,
          content: children
        }
      : null,
    hasContent(footer)
      ? {
          key: 'footer',
          className: 'mp-card__footer flex flex-wrap items-center gap-2',
          content: footer
        }
      : null
  ].filter((entry) => entry !== null);

  return (
    <MPBox
      ref={ref}
      size={size}
      padded={false}
      className={[
        'mp-card flex flex-col',
        // Only when there is media. A card clips so its corners can crop the
        // picture — and `overflow: hidden` would otherwise shave the focus ring
        // off a control sitting against the sheet's edge, for no gain on a card
        // that has nothing to crop.
        hasMedia ? 'overflow-hidden' : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {hasMedia ? (
        // Edge to edge: the sheet's own corners are what crop it, which is why
        // the padding lives on the sections rather than on the card.
        <div className="mp-card__media [&_img]:block [&_img]:w-full [&_video]:block [&_video]:w-full">
          {media}
        </div>
      ) : null}

      {sections.length > 0 ? (
        // The sections are wrapped rather than laid out directly on the sheet, so
        // that the vertical track this div carries starts *below* the media. A
        // card whose picture had the sheet's padding above it would be a picture
        // in a frame, which is what full bleed means not to be.
        <div
          className={['flex min-w-0 flex-col', dividers ? '' : `${padY} ${SHEET_GAP[size]}`]
            .filter(Boolean)
            .join(' ')}
        >
          {sections.map((entry, index) => (
            <div
              key={entry.key}
              className={[
                section,
                entry.className,
                // No rule under the media: the picture is already the break.
                dividers && index > 0 ? RULE : ''
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {entry.content}
            </div>
          ))}
        </div>
      ) : null}
    </MPBox>
  );
});
