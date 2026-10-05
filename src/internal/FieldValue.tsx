/**
 * The value of a field whose control is a button.
 *
 * A picker opens from a popover trigger, and a trigger is a `<button>`: it has
 * no value, takes no `required`, and registers nothing with the `Field` around
 * it. So `required` decided nothing, and `MPForm` neither checked the picker on
 * submit nor saw its value. This is the input that stands in for it.
 *
 * It is Base UI's own `Field.Control`, which is what makes the field count:
 * `MPForm` checks it with every other field, puts its value under the field's
 * name, shows the browser's message in the line under the field, and moves focus
 * to it when it is the first field that failed. Outside an `MPForm` it is a
 * required `<input>` in an ordinary form, which the browser checks before it
 * submits.
 *
 * It has no `name` of its own. The picker's hidden rows are what a form submits,
 * as they always were, and a name here would send the value twice. The name
 * `MPForm` files the value under is the `Field.Root`'s.
 *
 * Its own file rather than a part of `Picker.tsx`, because `MPColorPicker`
 * draws one too, and the split stylesheet is cut a file at a time along the
 * import graph: importing the shell for this would hand the colour picker every
 * class the shell spells out.
 */
import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { VISUALLY_HIDDEN } from './visually-hidden';

export interface MPFieldValueProps {
  /** The value as one string, and `''` while nothing is chosen. */
  value: string;
  required: boolean;
  /** A read-only field is not checked, as a read-only `<input>` is not. */
  readOnly: boolean;
  /** The id of the trigger, which is where focus belongs. */
  targetId: string;
}

export function MPFieldValue({ value, required, readOnly, targetId }: MPFieldValueProps) {
  return (
    <Field.Control
      value={value}
      required={required}
      readOnly={readOnly}
      // Out of the tab order and out of the accessibility tree: the trigger is
      // the control a reader reaches, and the one a screen reader names.
      tabIndex={-1}
      aria-hidden
      // When focus is sent here — by `MPForm` after a failed submit, or by the
      // browser over a native one — it goes on to the trigger, so the reader
      // lands on something they can press.
      onFocus={(event) => {
        event.currentTarget.ownerDocument.getElementById(targetId)?.focus();
      }}
      // Pinned to the field's bottom edge, so the browser's own message points
      // at the field rather than at the top of the page. The border and the
      // padding are the browser's, and would leave the clipped box wider than
      // the one pixel it is meant to be.
      className={`${VISUALLY_HIDDEN} start-0 bottom-0 m-0 border-0 p-0`}
      render={(props) => <input {...props} name={undefined} />}
    />
  );
}
