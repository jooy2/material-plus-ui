import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import { transitionProps } from '../../internal/transition';
import { hasContent, META_TEXT, SHEET_PAD } from '../../internal/scale';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPSize, MPTransition, MPVariant } from '../../types';

/**
 * The props are a `<figure>`'s rather than a `<blockquote>`'s, which is a
 * consequence of where the drawing happens: everything a caller passes lands on
 * the wrapper, and the wrapper is a figure or a div. Both are `HTMLElement`, so
 * an event handler written against one works on the other.
 */
export interface MPBlockquoteProps extends Omit<React.ComponentPropsWithoutRef<'figure'>, 'color'> {
  /**
   * How much surface the quote paints behind the words.
   * @default 'text'
   */
  variant?: MPVariant;
  /**
   * The type scale of the quote and the room around it.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Which accent family the rule down the leading edge is drawn in — and, on
   * `filled` and `tonal`, the surface behind the words.
   * @default 'primary'
   */
  color?: MPColor;
  /**
   * Who said it. Its presence is what turns the quote into a `<figure>` with a
   * `<figcaption>`, which is the markup the HTML specification asks for: an
   * attribution is *about* the quote and is not part of what was said.
   */
  author?: React.ReactNode;
  /**
   * Where it is from — a book, a talk, a page. Rendered inside a `<cite>`, which
   * is the element for the title of a work and, per the specification, never for
   * the name of a person. That is what `author` is.
   */
  source?: React.ReactNode;
  /**
   * URL of the document the quote was taken from. Lands on the `<blockquote>`'s
   * own `cite` attribute, which is machine-readable and shown to nobody — use
   * `source` for the part a reader should see.
   */
  cite?: string;
  /**
   * The mark drawn before the quote. Omit it for the house glyph, pass a node to
   * replace it, pass `false` to take it away.
   */
  icon?: React.ReactNode | false;
  /** What was said. */
  children?: React.ReactNode;
  /**
   * An entrance, run once as it mounts.
   *
   * `transition="fade"` is the whole of what most callers want; the object form
   * takes a duration, an edge to come from, or a scale to start at. Anything
   * that has to run again — on scroll, on hover, under your own control — is an
   * [MPAnimateFade](../motion/animate-fade) and its siblings.
   */
  transition?: MPTransition;
}

/**
 * The quote itself, one step above body copy with the leading opened up.
 *
 * `md` is `title-large` — 22px at weight 400, which is MD3's own largest role
 * that is not a heading, and exactly what a pull quote is. The leading is the
 * role's, so a quote that runs to four lines has the air a paragraph needs
 * rather than a title's tight 1.27.
 */
const QUOTE_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-body-medium',
  sm: 'text-mp-body-large',
  md: 'text-mp-title-large',
  lg: 'text-mp-headline-small',
  xl: 'text-mp-headline-medium'
};

/**
 * The rule down the leading edge, and the one thing every variant has.
 *
 * `border-s`, not `border-l`: the rule belongs on the side the text starts on,
 * which is the right edge under RTL. Its width is the one number here that does
 * not come off a ladder — a quote rule is 2px at every size, because it is a
 * mark in the margin rather than a part of the type.
 */
const RULE = 'border-s-2 [border-inline-start-color:var(--_mp-accent)]';

/**
 * The five weights, and the two in the middle are the interesting ones.
 *
 * `elevated` and `outlined` leave the sheet **neutral** — `surface-container-low`
 * and a hairline — because a quote holds somebody else's words and words on a
 * tinted panel are words on a background nobody chose them against. `filled` and
 * `tonal` dye it anyway, which is what a pull quote in a brand colour is, and
 * they are the two a caller has to ask for by name.
 *
 * `text` is the default and the one that belongs in running prose: a rule in the
 * margin and nothing else, which is what a quote has looked like since long
 * before there were surfaces to put one on.
 */
const SURFACE: Record<MPVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  elevated: 'shadow-mp-1 bg-mp-surface-container-low text-mp-on-surface',
  outlined: 'border-mp-outline-variant border border-s-2 bg-transparent text-mp-on-surface',
  text: 'bg-transparent text-mp-on-surface'
};

/**
 * The quotation mark: a pair of commas turned up, drawn rather than typed.
 *
 * A real `“` would be set in whatever face the page uses and would change shape,
 * weight and baseline with it — and at 2em it is the largest single glyph in the
 * component, so it changing is the most visible thing that could. This is one
 * drawing at one weight, and it lives here rather than in `constants/icons.ts`
 * because exactly one component draws it and it is not a lucide glyph.
 */
function QuoteMarkIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-full">
      <path
        d="M6.4 3.6c-2.3.9-3.7 2.8-3.7 5.1 0 2 1.2 3.3 2.8 3.3 1.4 0 2.5-1 2.5-2.4 0-1.3-.9-2.2-2.1-2.2-.2 0-.4 0-.6.1.3-1 1.1-1.8 2.2-2.3l-1.1-1.6ZM13.3 3.6c-2.3.9-3.7 2.8-3.7 5.1 0 2 1.2 3.3 2.8 3.3 1.4 0 2.5-1 2.5-2.4 0-1.3-.9-2.2-2.1-2.2-.2 0-.4 0-.6.1.3-1 1.1-1.8 2.2-2.3l-1.1-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Somebody else's words, set apart from your own.
 *
 * There is no Base UI primitive under this and there should not be: a quote has
 * no state, no keyboard contract and nothing to interact with. What it has is
 * markup that is easy to get wrong, and getting it right is most of the point.
 *
 * **Nothing is drawn on the `<blockquote>` itself.** The surface, the rule and
 * the padding all belong to the element around it, and that is not tidiness —
 * `blockquote` is one of the handful of tags a host stylesheet still styles by
 * name. VitePress's `.vp-doc blockquote` sets a grey `border-left`, a
 * `padding-left` and a `color`, all at a specificity a one-class utility cannot
 * outrank, so a rule drawn on the quote itself would silently come out grey and
 * a pixel too thin.
 *
 * The wrapper is a `<figure>` when there is an attribution and a `<div>` when
 * there is not, because the HTML specification is explicit that the attribution
 * goes *outside* the blockquote — a name inside it claims the speaker said their
 * own name — and a `<figure>` with no `<figcaption>` in it is a figure of
 * nothing.
 */
export const MPBlockquote = React.forwardRef<HTMLElement, MPBlockquoteProps>(function MPBlockquote(
  {
    variant = 'text',
    size: sizeProp,
    color: colorProp,
    author,
    source,
    cite,
    icon,
    transition,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);
  const attributed = hasContent(author) || hasContent(source);
  const glyph = icon === undefined ? <QuoteMarkIcon /> : icon;
  const painted = variant !== 'text';

  const entrance = transitionProps(transition);
  const shellClasses = [
    'mp-blockquote flex flex-col',
    // The type scale is on the shell rather than on the `<blockquote>`, and it
    // is on the shell for the reason everything else is: a host stylesheet
    // styles `blockquote` by name at a specificity a utility cannot outrank —
    // VitePress's `.vp-doc blockquote` resets the leading, `.prose blockquote`
    // sets its own size. The quote inherits from the wrapper, which nobody else
    // is reaching into.
    QUOTE_TEXT[size],
    RULE,
    // A quote is never a pill, and the corners on the ruled edge stay square: a
    // 2px rule that curves away from the text it marks is a bracket, not a
    // margin rule.
    painted ? 'rounded-mp-md rounded-s-none' : '',
    SURFACE[variant],
    painted ? SHEET_PAD[size] : 'ps-4',
    entrance.className,
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const quote = (
    <blockquote cite={cite}>
      {hasContent(glyph) ? (
        // The mark tracks the quote's own type scale at twice its size, so one
        // drawing is the right size at every step of the ladder. It sits at 38%
        // — the spec's own opacity for content that is present but not the
        // subject — rather than in a second colour that would need a token.
        <span aria-hidden="true" className="mb-1 block size-[2em] opacity-38">
          {glyph}
        </span>
      ) : null}
      {children}
    </blockquote>
  );

  const shellStyle = { ...accentSlots(color), ...entrance.style, ...style };

  if (!attributed) {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-mp-size={size}
        data-mp-variant={variant}
        className={shellClasses}
        style={shellStyle}
        {...props}
      >
        {quote}
      </div>
    );
  }

  return (
    <figure
      ref={ref}
      data-mp-size={size}
      data-mp-variant={variant}
      className={shellClasses}
      style={shellStyle}
      {...props}
    >
      {quote}

      <figcaption
        className={[
          'mt-2 flex flex-wrap items-baseline gap-x-1.5',
          // On a painted surface the caption inherits the ink the surface set;
          // on a bare one it takes the supporting role, which is what an
          // attribution is next to the words it attributes.
          painted ? 'opacity-80' : 'text-mp-on-surface-variant',
          META_TEXT
        ].join(' ')}
      >
        {hasContent(author) ? (
          <span className="font-medium">
            {/* An em dash, the way an attribution has been set since print, and
                `aria-hidden` because a screen reader announcing "em dash" before
                a name is reading the typography rather than the text. */}
            <span aria-hidden="true">— </span>
            {author}
          </span>
        ) : null}
        {/* `<cite>` arrives italic from the browser's own stylesheet. The
            Material type scale has no italic on it. */}
        {hasContent(source) ? <cite className="not-italic">{source}</cite> : null}
      </figcaption>
    </figure>
  );
});
