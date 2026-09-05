import * as React from 'react';
import { Form } from '@base-ui/react/form';
import { useMPSize } from '../../internal/config';
import { SHEET_GAP } from '../../internal/scale';
import type { MPSize } from '../../types';

/**
 * When a field decides whether it is valid.
 *
 * Base UI's own three, under Base UI's own spelling. This is one of the few
 * places the library does *not* invent a word of its own: `validationMode` is
 * what a caller will read everywhere else, and a nicer synonym would only be a
 * word they had to translate back.
 */
export type MPFormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';

/** Errors that came from somewhere else, keyed by the field's `name`. */
export type MPFormErrors = Record<string, string | string[]>;

export interface MPFormProps extends Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit'> {
  /**
   * When a field validates.
   *
   * - `onSubmit` — on submit, and on every change afterwards. The default, and
   *   the only one that does not tell somebody their email address is wrong
   *   while they are still typing it.
   * - `onBlur` — when a field loses focus.
   * - `onChange` — on every keystroke.
   * @default 'onSubmit'
   */
  validationMode?: MPFormValidationMode;
  /**
   * Errors from outside the browser's own validation — a server, a form action,
   * a schema — keyed by the `name` of the field each belongs to.
   *
   * They are shown **on the field**, and cleared as soon as that field changes.
   */
  errors?: MPFormErrors;
  /**
   * Called on a valid submit, with the form's values. The native submit event is
   * prevented, so nothing navigates.
   */
  onSubmit?: (values: Record<string, unknown>) => void;
  /**
   * The gap between the form's children. A form is a stack, and this is which
   * rung of the [ladder](../../design/prop-conventions#size) it stacks on.
   * @default 'md'
   */
  size?: MPSize;
  children?: React.ReactNode;
}

/**
 * A `<form>` that knows which of its fields is wrong.
 *
 * On its own, a page of [MPTextField](./text-field)s validates one field at a
 * time, and a failed submit leaves the reader to go and find the red one. What
 * this adds is the part that has to be owned **above** the fields: a submit
 * collects every field's validity at once, focus lands on the first one that
 * failed, and `errors` puts a server's answer back on the field it belongs to
 * rather than in a banner at the top of the page.
 *
 * ## It is not a form library
 *
 * There is no schema here, no resolver and no field array. A project that wants
 * those keeps the one it already has and hands the result to `errors`, which is
 * the seam this is built around — and it is a seam rather than an integration
 * precisely because every one of those libraries can produce
 * `{ [name]: message }`.
 *
 * ## Why it lays its children out at all
 *
 * Because a form is a **stack**, and a stack with no gap is a stack of fields
 * touching. The gap is the only visual decision here: no surface, no padding, no
 * measure. Those belong to an [MPCard](../layout/card) or an
 * [MPContainer](../layout/container) around it, for the reason a container gives
 * — the thing that decides the shape of a page should not also be the thing that
 * submits it.
 */
export const MPForm = React.forwardRef<HTMLFormElement, MPFormProps>(function MPForm(
  { validationMode = 'onSubmit', errors, onSubmit, size: sizeProp, className, children, ...props },
  ref
) {
  const size = useMPSize(sizeProp);

  return (
    <Form
      ref={ref}
      validationMode={validationMode}
      errors={errors}
      onFormSubmit={(values) => onSubmit?.(values)}
      data-mp-size={size}
      className={['mp-form flex flex-col', SHEET_GAP[size], className ?? '']
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Form>
  );
});
