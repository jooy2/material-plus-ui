import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, ClockIcon, ErrorIcon, LinkIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { linkRel, safeHref } from '../../internal/link';
import { CHAT } from '../../internal/messages/chat';
import { hasContent, META_TEXT, PROSE_TEXT } from '../../internal/scale';
import { VISUALLY_HIDDEN } from '../../internal/visually-hidden';
import type { MPColor, MPSize, MPVariant } from '../../types';

/**
 * Whose message this is.
 *
 * `start` and `end` rather than `them`/`me` or `left`/`right`: a thread runs the
 * way the language does, and the same two words already mean this everywhere
 * else in the library. `start` is the default because a message from somebody
 * else is the one you have no other way of knowing about.
 */
export type MPChatBubbleSide = 'start' | 'end';

/**
 * How far a message has got.
 *
 * The first four are a ladder and the fifth is not on it: `failed` is the
 * message that did not go, which is why it is the only one drawn in another
 * colour family.
 */
export type MPChatBubbleStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * What a link inside a message unfurls to.
 *
 * This is the one shape in the library whose contents typically come from
 * **somebody else** — a preview is attached to a message another person sent —
 * so `url` is checked before it is rendered rather than trusted. See the note on
 * `LinkPreview` below.
 */
export interface MPChatBubblePreview {
  /**
   * Where the card goes.
   *
   * Only `http:`, `https:`, `mailto:`, `tel:` and relative URLs are rendered.
   * Anything else — `javascript:`, `data:` — draws the card without a link
   * rather than handing the reader a one-click script execution.
   */
  url: string;
  /** The page's title. */
  title?: React.ReactNode;
  /** Its summary, clamped to two lines. */
  description?: React.ReactNode;
  /** The share image, drawn across the top of the card. */
  image?: string;
  /** Who published it — a domain, a site name. */
  site?: React.ReactNode;
  /**
   * Opens the card in a new tab.
   * @default false
   */
  newTab?: boolean;
}

export interface MPChatBubbleProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'title'
> {
  /**
   * Whose message this is.
   * @default 'start'
   */
  side?: MPChatBubbleSide;
  /** Who sent it, above the bubble. */
  name?: React.ReactNode;
  /** When it was sent, beside the name. */
  time?: React.ReactNode;
  /**
   * The sender's picture — an [MPAvatar](../display/avatar), at the size the
   * thread uses. Left out, the bubble takes the whole row.
   */
  avatar?: React.ReactNode;
  /**
   * How far the message has got, drawn as a mark under the bubble. Left out,
   * nothing is drawn — a received message has no delivery state worth showing.
   */
  status?: MPChatBubbleStatus;
  /** Overrides the word the mark is read out as. */
  statusLabel?: string;
  /**
   * Draws the three dots instead of the message. Whatever is in `children` is
   * left alone, so the same bubble can go back to it when the message arrives.
   * @default false
   */
  typing?: boolean;
  /**
   * A picture, a video, a map — drawn edge to edge above the text, so the
   * bubble's own corners crop it.
   */
  media?: React.ReactNode;
  /** A link in the message, unfurled into a card under the text. */
  preview?: MPChatBubblePreview;
  /**
   * The message's own actions — an [MPMenu](../inputs/menu) trigger, most of the
   * time. Sits beside the bubble and stays out of the way until the row is
   * hovered or something in it takes focus.
   */
  actions?: React.ReactNode;
  /**
   * Which language the marks are read out in. Falls back to the nearest
   * `MPLocaleProvider`, then to English.
   */
  locale?: string;
  /**
   * How much surface the bubble paints.
   *
   * A bubble *is* the thing being coloured, unlike a card — so this is the
   * control ladder rather than the container one, and `filled` floods it with
   * the accent. That is what tells your own messages from everyone else's at a
   * glance rather than one line at a time.
   *
   * `side` deliberately does not decide it: which end of the thread is filled is
   * a decision about the product, not about the component, and a thread that
   * fills neither is a perfectly good thread.
   * @default 'tonal'
   */
  variant?: MPVariant;
  /**
   * The type scale of the message, and the room inside the bubble.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * @default 'primary'
   */
  color?: MPColor;
  /** The message. */
  children?: React.ReactNode;
}

/**
 * A bubble's own padding track, tighter than the sheet ladder.
 *
 * A sheet is a region of a page; a bubble is a sentence with a surface behind
 * it, and 16px of padding around eight words is a card rather than a message.
 * Both axes, because unlike a control a bubble has no fixed height to fight.
 */
const BUBBLE_PAD: Record<MPSize, string> = {
  xs: 'px-2 py-1',
  sm: 'px-2.5 py-1.5',
  md: 'px-3 py-2',
  lg: 'px-3.5 py-2.5',
  xl: 'px-4 py-3'
};

/**
 * The corner nearest the speaker, cut short.
 *
 * This is the library's one piece of chat vocabulary, and it does the job a
 * drawn tail does elsewhere: it says which end of the row the message came from,
 * without hanging a triangle off a surface that is supposed to have been cut
 * with a straight edge. Written as the *logical* corners rather than as
 * `rounded-tl`, so a thread in Arabic squares the other one without being told.
 *
 * The two lengths are both tokens — `corner-extra-small` against the bubble's
 * own `corner-extra-large` — which is what keeps the cut obvious at a glance in
 * a column of forty messages, and what keeps it following `data-mp-shape`.
 */
const TAIL: Record<MPChatBubbleSide, string> = {
  start: '[border-start-start-radius:var(--mp-sys-shape-corner-extra-small)]',
  end: '[border-start-end-radius:var(--mp-sys-shape-corner-extra-small)]'
};

/**
 * Filled, tinted, raised, hairlined, bare — said the way a **control** says
 * them, which is the opposite of what a card does.
 *
 * A bubble is the thing being coloured rather than a box holding somebody else's
 * content, so `filled` takes the accent under its own ink. `text` is the odd one
 * and is not "no surface": a bubble with no surface is not a bubble, so it takes
 * the quietest neutral container instead.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-mp-on-surface',
  outlined: 'border-mp-outline-variant border bg-transparent text-mp-on-surface',
  text: 'bg-mp-surface-container-low text-mp-on-surface'
};

/**
 * The double tick, drawn here rather than in `constants/icons.ts` because it is
 * the one glyph in the library only one component has any use for — and because
 * it is not a lucide drawing.
 *
 * Two ticks overlapping by about a third of their width, which is what says
 * "two" without doubling the width of the mark: a delivered message and a sent
 * one have to be told apart at 12px, side by side, in a column.
 */
function DoubleCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-full">
      <path
        d="m1.5 8.5 2.75 2.75L9.5 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.75 8.25 12l5.25-5.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One glyph per step. `read` shares its mark with `delivered` and takes the colour. */
const STATUS_ICON: Record<MPChatBubbleStatus, React.ReactNode> = {
  sending: <MPIcon icon={ClockIcon} size="1.15em" />,
  sent: <MPIcon icon={CheckIcon} size="1.15em" />,
  delivered: <span className="block size-[1.15em]">{<DoubleCheckIcon />}</span>,
  read: <span className="block size-[1.15em]">{<DoubleCheckIcon />}</span>,
  failed: <MPIcon icon={ErrorIcon} size="1.15em" />
};

/**
 * Only two of the five carry a colour: the one that arrived and the one that did
 * not. The three in between are the ordinary course of events, and a thread
 * where every message is marked in colour is a thread where the colour has
 * stopped meaning anything.
 */
const STATUS_TONE: Record<MPChatBubbleStatus, string> = {
  sending: 'text-mp-on-surface-variant',
  sent: 'text-mp-on-surface-variant',
  delivered: 'text-mp-on-surface-variant',
  read: 'text-(--_mp-accent)',
  failed: 'text-mp-error'
};

/**
 * The card a link unfurls into.
 *
 * Its surface is mixed out of `currentColor` rather than pointed at a role,
 * because it is the one part of a bubble that has to work on both an accent fill
 * and a neutral one: on `filled` the ink is `on-primary` and the card is a pale
 * wash of it, on `outlined` the ink is `on-surface` and the card is a grey one.
 * A fixed role would be invisible against one of the two.
 */
const PREVIEW = [
  'rounded-mp-sm block overflow-hidden border no-underline',
  '[border-color:color-mix(in_oklab,currentColor_18%,transparent)]',
  '[background-color:color-mix(in_oklab,currentColor_7%,transparent)]',
  'hover:[background-color:color-mix(in_oklab,currentColor_12%,transparent)]',
  'transition-[background-color] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
  'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-solid outline-none'
].join(' ');

/**
 * The handle stays out of the way of the message until the row is reached for.
 *
 * This is not a control changing what it is — it is a menu trigger that would
 * otherwise sit in the middle of a conversation somebody is reading. A pointer
 * that cannot hover has nothing to reveal it, so on touch it is simply always
 * there.
 */
const ACTIONS = [
  'shrink-0 opacity-0',
  'transition-opacity duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
  'group-hover/bubble:opacity-100 group-focus-within/bubble:opacity-100',
  '[@media(hover:none)]:opacity-100'
].join(' ');

/**
 * One message in a conversation.
 *
 * MD3 does not describe a chat bubble — this is the library's own shape, in the
 * sense [MPProgressBox](../feedback/progress-box) is — but every part of it is
 * drawn out of the specification's own roles, so a thread of these sits in a
 * Material page without announcing that it is extra.
 *
 * Everything around the bubble is optional and nothing about it is fixed by
 * `side`: the avatar, the sender's name, the time, the delivery mark, the media
 * above the text and the link card below it are each drawn only when they are
 * given something. What `side` decides is which way the row runs and which
 * corner of the bubble is cut short.
 *
 * ## Why `variant` is not tied to `side`
 *
 * Filling the reading-end column is a convention, not a law. It is also a
 * decision about the product — some threads fill neither end, and a support
 * inbox may want the *agent's* messages filled rather than the reader's. So
 * `side` decides the geometry and `variant` decides the emphasis, and a caller
 * who wants the usual arrangement writes it once.
 */
export const MPChatBubble = React.forwardRef<HTMLDivElement, MPChatBubbleProps>(
  function MPChatBubble(
    {
      side = 'start',
      name,
      time,
      avatar,
      status,
      statusLabel,
      typing = false,
      media,
      preview,
      actions,
      locale: localeProp,
      variant = 'tonal',
      size = 'md',
      color = 'primary',
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const locale = useMPLocale(localeProp);
    const messages = useMPMessages(CHAT, locale);
    const end = side === 'end';

    const hasHeader = hasContent(name) || hasContent(time);
    const hasBody = typing || hasContent(children) || Boolean(preview);

    return (
      <div
        ref={ref}
        data-mp-size={size}
        data-mp-variant={variant}
        data-mp-side={side}
        className={[
          'mp-chat-bubble group/bubble flex w-full items-start gap-2',
          end ? 'flex-row-reverse' : '',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ ...accentSlots(color), ...style }}
        {...props}
      >
        {hasContent(avatar) ? <div className="shrink-0">{avatar}</div> : null}

        <div
          className={[
            'flex min-w-0 max-w-[min(100%,32rem)] flex-col gap-1',
            end ? 'items-end' : 'items-start'
          ].join(' ')}
        >
          {hasHeader ? (
            <div className={`flex items-baseline gap-2 ${META_TEXT}`}>
              {hasContent(name) ? <span className="font-medium">{name}</span> : null}
              {hasContent(time) ? <span className="text-mp-on-surface-variant">{time}</span> : null}
            </div>
          ) : null}

          <div className={`flex min-w-0 items-center gap-1 ${end ? 'flex-row-reverse' : ''}`}>
            <div
              className={[
                'mp-chat-bubble__sheet rounded-mp-xl flex min-w-0 flex-col overflow-hidden',
                'box-border',
                TAIL[side],
                SURFACE[variant],
                PROSE_TEXT[size]
              ].join(' ')}
            >
              {/* Edge to edge: the bubble's own corners are what crop it, which
                  is why the padding lives on the section below rather than on
                  the sheet. */}
              {hasContent(media) ? (
                <div className="[&_img]:block [&_img]:w-full [&_video]:block [&_video]:w-full">
                  {media}
                </div>
              ) : null}

              {hasBody ? (
                <div className={`flex min-w-0 flex-col gap-2 ${BUBBLE_PAD[size]}`}>
                  {typing ? (
                    <TypingDots label={messages.typing} />
                  ) : hasContent(children) ? (
                    <div className="min-w-0 break-words whitespace-pre-line">{children}</div>
                  ) : null}

                  {preview ? <LinkPreview preview={preview} /> : null}
                </div>
              ) : null}
            </div>

            {hasContent(actions) ? <div className={ACTIONS}>{actions}</div> : null}
          </div>

          {status ? (
            <div className={`flex items-center gap-1 ${META_TEXT} ${STATUS_TONE[status]}`}>
              {STATUS_ICON[status]}
              {/* The mark is the whole of what is drawn; the word behind it is
                  for the readers the mark says nothing to. */}
              <span className={VISUALLY_HIDDEN}>{statusLabel ?? messages[status]}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

/**
 * Three dots that light in sequence.
 *
 * Colour only, like every other indeterminate indicator in the library — the
 * dots never move, so a bubble being typed into does not bounce in a thread
 * somebody is reading. The wave is `mp-wave`, the same keyframe
 * `MPProgressBox`'s segments run on, and the delay is carried per dot in
 * `--_mp-index`.
 */
function TypingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 py-[0.35em]" role="status">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className="mp-chat-typing size-[0.45em] rounded-full bg-current"
          style={{ '--_mp-index': index } as React.CSSProperties}
        />
      ))}
      <span className={VISUALLY_HIDDEN}>{label}</span>
    </div>
  );
}

/**
 * The unfurled link: a picture, who published it, a title and two lines of
 * summary.
 *
 * This is the one place in the library where the URL being rendered came from
 * **somebody else**. Every other `href` here is an address the application wrote
 * into its own navigation; a preview is attached to a message another person
 * sent, which makes `url` untrusted input in the ordinary sense. React renders a
 * `javascript:` href with a development warning and no more, so without
 * `safeHref` a hostile preview is a one-click script execution in a chat thread
 * — and `safeHref` is why the anchor may end up with no `href` at all.
 *
 * The picture is loaded lazily and with the referrer withheld, for the same
 * reason and a quieter one: a remote image in a thread is a request the sender
 * chose, and a bare `<img src>` hands them the address of the page and the
 * reader's IP the moment the message scrolls near. `width`/`height` are
 * declared so a thread does not reflow around each one as it arrives.
 */
function LinkPreview({ preview }: { preview: MPChatBubblePreview }) {
  const { url, title, description, image, site, newTab = false } = preview;
  const target = newTab ? '_blank' : undefined;

  return (
    <a href={safeHref(url)} target={target} rel={linkRel(target, undefined)} className={PREVIEW}>
      {image ? (
        // Decorative: everything the picture is saying is written underneath it.
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          width={640}
          height={112}
          className="block h-28 w-full object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-0.5 p-2">
        {hasContent(site) ? (
          <span className="flex items-center gap-1 text-[0.85em] opacity-70">
            <MPIcon icon={LinkIcon} size="1em" />
            <span className="truncate">{site}</span>
          </span>
        ) : null}
        {hasContent(title) ? <span className="font-medium">{title}</span> : null}
        {hasContent(description) ? (
          <span className="line-clamp-2 text-[0.9em] opacity-80">{description}</span>
        ) : null}
      </div>
    </a>
  );
}
