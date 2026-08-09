import * as React from 'react';
import { Field } from '@base-ui/react/field';
import type { MPSize } from '../types';

/**
 * The notched outline, and the label that sits in the notch.
 *
 * Three controls in this library wear the same shell — `MPTextField`,
 * `MPSelect` and `MPNumberField` — and that is not a coincidence to be
 * factored out later. Material's outlined text field *is* the shape a form
 * control takes; a form where the quantity box and the dropdown are a different
 * height, radius or outline weight from the fields around them is a form that
 * looks assembled rather than designed. So the shell is one component, and the
 * three controls differ only in what they put inside it.
 *
 * Both halves are exported separately because they are not siblings in the
 * layout. The outline is absolutely positioned behind the control's row; the
 * label sits on the outline's top edge, outside that row. Rendering them as one
 * element is what forces either the label into the `pointer-events-none` box
 * where it stops being clickable, or the outline out of the box it has to fill.
 */

/**
 * The label's text, in the one form both copies of it have to agree on.
 *
 * The asterisk is `aria-hidden` because `required` is already on the control,
 * and a screen reader that reads both says "required star".
 */
function labelContent(label: React.ReactNode, required: boolean) {
  return (
    <>
      {label}
      {required ? <span aria-hidden="true"> *</span> : null}
    </>
  );
}

export interface MPFieldOutlineProps {
  /** The label, which is what cuts the notch. Without one the outline is closed. */
  label?: React.ReactNode;
  required?: boolean;
}

/**
 * The outline itself.
 *
 * A `<legend>` inside a `<fieldset>` natively interrupts the top border, which
 * is exactly the notch an outlined text field has — sized to the text, with no
 * measuring in JavaScript. The legend is hidden with `invisible` rather than
 * removed, because a legend with no content reserves no gap.
 *
 * Decorative, and hidden from the accessibility tree: the accessible name comes
 * from the real `<label>`, and announcing a `<fieldset>` as a group around a
 * single control is noise a screen reader does not need.
 */
export function MPFieldOutline({ label, required = false }: MPFieldOutlineProps) {
  return (
    <fieldset
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 -top-[5px] m-0 min-w-0 px-2 pt-0',
        'rounded-mp-xs border border-mp-outline',
        /*
         * The colour eases; the width does not, and must not.
         *
         * `border-width` was in this list once, and it made focus feel broken. A
         * 1px-to-2px interpolation is rounded to whole device pixels at paint, so
         * the outline renders as 1px for almost the entire duration and then
         * jumps — measured at 197ms of nothing followed by a single step. The
         * ring appeared to arrive a fifth of a second after the click, even
         * though the focus state itself landed in 4ms. Anything sub-pixel in
         * extent should snap.
         */
        'transition-[border-color] duration-(--mp-sys-motion-duration-short4)',
        // MD3 raises the outline to `on-surface` on hover, and to `primary` at
        // two pixels on focus. Focus wins, so it is written second.
        'group-hover:border-mp-on-surface',
        /*
         * Two spellings of focus, and both are load-bearing. `data-focused` is
         * what Base UI's Field publishes for the control it owns. `focus-within`
         * covers everything else inside the shell — a number field's steppers, a
         * password toggle — which are part of the field as far as a reader moving
         * through it with the keyboard is concerned.
         */
        'group-focus-within:border-2 group-focus-within:border-mp-primary',
        'group-data-focused:border-2 group-data-focused:border-mp-primary',
        'group-data-invalid:border-mp-error',
        // The spec's disabled outline: `on-surface` at 12%.
        'group-data-disabled:border-mp-on-surface/12'
      ].join(' ')}
    >
      {label ? (
        <legend className="text-mp-body-small invisible float-none block h-[11px] w-auto p-0 px-1 leading-none">
          {labelContent(label, required)}
        </legend>
      ) : null}
    </fieldset>
  );
}

export interface MPFieldLabelProps extends MPFieldOutlineProps {
  /**
   * Which rung the control is drawn at. Only the inline offset reads it: the
   * label has to land over the gap the container's own padding put the notch in.
   */
  size: MPSize;
  /** The control the label names. */
  htmlFor?: string;
}

/**
 * The label a reader actually gets.
 *
 * A real `<label>`, associated with the control by Base UI, sitting on the
 * border line where the legend cut it away. It cannot *be* the legend: the
 * outline is `pointer-events-none` so that clicks land on the control
 * underneath, and a label inside it would stop being clickable.
 */
export function MPFieldLabel({ size, label, required = false, htmlFor }: MPFieldLabelProps) {
  return (
    <Field.Label
      htmlFor={htmlFor}
      className={[
        'text-mp-body-small text-mp-on-surface-variant',
        // Eased on the same curve and duration as the outline it sits in, so the
        // label and the ring arrive together rather than one snapping ahead.
        'transition-[color] duration-(--mp-sys-motion-duration-short4)',
        'pointer-events-auto absolute top-0 -translate-y-1/2 px-1 leading-none',
        // Tracks the container's inline padding, one step less so the label's own
        // `px-1` lands the text over where the border was cut.
        size === 'xs' ? 'left-1' : size === 'sm' ? 'left-2' : size === 'xl' ? 'left-4' : 'left-3',
        'group-focus-within:text-mp-primary',
        'group-data-focused:text-mp-primary',
        'group-data-invalid:text-mp-error',
        'group-data-disabled:text-mp-on-surface/38'
      ].join(' ')}
    >
      {labelContent(label, required)}
    </Field.Label>
  );
}
