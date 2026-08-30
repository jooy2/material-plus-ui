import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { META_TEXT, hasContent } from './scale';

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
  const classNames = [
    'mp-supporting-text block',
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
      <Field.Error match={true} className={`${classNames} text-mp-error`}>
        {errorMessage}
      </Field.Error>
    );
  }

  if (hasContent(description)) {
    return (
      <Field.Description className={`${classNames} text-mp-on-surface-variant`}>
        {description}
      </Field.Description>
    );
  }

  /*
   * The same slot with no `match` and nothing in it, which is what lets an error
   * the field was handed from *outside* reach it: Base UI renders this only when
   * the field is genuinely invalid, so a control with nothing to say draws
   * nothing at all — and one an `MPForm`'s `errors` has an answer for says it,
   * rather than turning red in silence.
   */
  return <Field.Error className={`${classNames} text-mp-error`} />;
}
