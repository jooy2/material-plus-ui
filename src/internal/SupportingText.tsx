import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { META_TEXT, hasContent } from './scale';

/** Which of the two the line is currently saying, or neither. */
type Slot = 'error' | 'description' | 'none';

/**
 * The line under a control.
 *
 * Material calls it supporting text and gives it one slot, not two — which is
 * why this renders *either* the description or the error rather than stacking
 * them. An error is not additional information about a field, it is the field's
 * current problem, and pushing the description down a line to make room leaves
 * the reader reading a sentence that has just stopped applying.
 *
 * Both parts come from Base UI's `Field`, so whichever one is showing is wired
 * to the control by `aria-describedby` without anybody generating an id.
 * `Field.Error` needs `match` because it normally waits for the browser's own
 * validity state; here the message's presence *is* the state, which is the same
 * bargain `MPTextField.errorMessage` makes — there is no way to render a control
 * that is visibly wrong with no explanation of why.
 *
 * ## The line arrives rather than appearing
 *
 * A field that turned invalid grew by a line of text between one frame and the
 * next, and everything under it on the page moved down by that much. On a form
 * validated on blur that is the whole page stepping as the reader tabs through
 * it.
 *
 * So the space opens. `mp-supporting-text__reveal` in `styles.css` has the
 * argument for the row it opens as and for why swapping a description for an
 * error is a different animation from having something to say at all.
 *
 * What is worth knowing on this side is that the animation is **switched on by
 * an attribute this component sets**, rather than by a class that is simply
 * always there. A page load is not a change: a server-rendered form would
 * otherwise grow six description lines out of nothing the moment it hydrated,
 * which is a page assembling itself in front of a reader who asked for a form.
 * The effect below only ever runs when it has watched the message change.
 *
 * The wrapper is drawn only when there is a message, and that is not a detail
 * to lose either: every control that shows one puts it in a flex column with a
 * `gap`, so an element that was always there would be a gap that was always
 * there — two pixels under every checkbox in the library that has nothing to
 * say.
 */
export function MPSupportingText({
  description,
  errorMessage,
  className
}: {
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  /** Whatever inset lines the text up with the control it belongs to. */
  className?: string;
}) {
  const slot: Slot = hasContent(errorMessage)
    ? 'error'
    : hasContent(description)
      ? 'description'
      : 'none';

  const reveal = React.useRef<HTMLDivElement | null>(null);
  const previous = React.useRef(slot);

  /*
   * Which animation to run, and when to run one at all.
   *
   * Seeded with the slot the component was first rendered with, so the first
   * pass compares equal and nothing animates — that is the whole of how a page
   * load is kept from being treated as a change.
   *
   * Restarted by clearing `animation-name` and putting it back, exactly as
   * `internal/Calendar.tsx` does for the page turn and for the same reason:
   * there is no way to rewind a CSS animation from React, and re-rendering with
   * the same attribute changes nothing. A `key` would restart it by unmounting
   * the message, which takes the `aria-describedby` wiring with it — a screen
   * reader would be told the field's description had gone away and come back.
   *
   * A layout effect rather than an effect, so the attribute is on before the
   * browser paints. Set afterwards, the first painted frame is the finished
   * line and the animation starts from a state the reader has already seen.
   */
  React.useLayoutEffect(() => {
    const element = reveal.current;
    const before = previous.current;

    previous.current = slot;

    // `none` is the message leaving, and it takes its wrapper with it. There is
    // nothing to animate and nothing left to animate it on: softening that
    // would mean holding the last message the field had, and a field still
    // showing an error it no longer has — to a screen reader as much as to the
    // eye — is worse than a line that closes quickly.
    if (!element || slot === before || slot === 'none') {
      return;
    }

    // From nothing the space has to open; between two messages it is already
    // open, and opening it again would collapse the line and re-open it.
    element.dataset.mpReveal = before === 'none' ? 'open' : 'swap';
    element.style.animationName = 'none';
    void element.offsetWidth;
    element.style.animationName = '';
  }, [slot]);

  const classNames = [
    // `min-h-0` is what lets the row travel to nothing: the text is the grid
    // item, and a grid item's automatic minimum size is its content's, which
    // would hold the row open at the height of the message being revealed.
    'mp-supporting-text block min-h-0',
    META_TEXT,
    // Both go grey when the control is disabled — including the error, which is
    // still true but is no longer something the reader can act on. Read off the
    // part's own attribute rather than a `group-` on some ancestor: Base UI
    // publishes `data-disabled` on every Field part, so this holds wherever the
    // component chose to put its group.
    'data-disabled:text-mp-on-surface/38',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  if (hasContent(errorMessage)) {
    return (
      <div ref={reveal} className="mp-supporting-text__reveal">
        <Field.Error match={true} className={`${classNames} text-mp-error`}>
          {errorMessage}
        </Field.Error>
      </div>
    );
  }

  if (hasContent(description)) {
    return (
      <div ref={reveal} className="mp-supporting-text__reveal">
        <Field.Description className={`${classNames} text-mp-on-surface-variant`}>
          {description}
        </Field.Description>
      </div>
    );
  }

  /*
   * The same slot with no `match` and nothing in it, which is what lets an error
   * the field was handed from *outside* reach it: Base UI renders this only when
   * the field is genuinely invalid, so a control with nothing to say draws
   * nothing at all — and one an `MPForm`'s `errors` has an answer for says it,
   * rather than turning red in silence.
   *
   * No wrapper around this one, and that is the whole reason it is written out
   * a third time rather than folded into the two above. The wrapper is a real
   * element: put unconditionally around a slot that usually renders nothing, it
   * would be a flex item in every field's column and a gap under every control
   * in the library that has nothing to say.
   */
  return <Field.Error className={`${classNames} text-mp-error`} />;
}
