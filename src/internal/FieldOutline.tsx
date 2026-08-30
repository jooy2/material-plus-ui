import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { PROSE_TEXT } from './scale';
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
 *
 * ## The two places the label can be
 *
 * Up in the notch — *shrunk* — or resting on the control's own line, at the
 * control's own type scale, where it reads as the placeholder. Material's
 * outlined field starts in the second and travels to the first the moment there
 * is something to make room for, which is the state change `useFloatingLabel`
 * below answers and the only thing either half here transitions between.
 */

/**
 * Where the label's text starts, by rung.
 *
 * The container's own inline padding less the label's `px-1`, so the text lands
 * over the gap the notch cut. It is the same in both states on purpose: the
 * label rises, it does not also slide, and a label that changed column as it
 * went would read as two labels rather than one.
 *
 * `start-*` rather than `left-*`, which it was. Everything else about this shell
 * is already logical — the `<legend>` that cuts the notch is laid out by the
 * writing direction, the control's padding is `ps`/`pe`, the adornments sit at
 * the `end` — so under RTL the notch opened on the right and the label stayed
 * pinned to the left, sitting on an unbroken stretch of the outline with a gap
 * beside it. It affected every control drawn on this shell: the text field, the
 * select, the number field, the combobox, the colour picker and all four
 * pickers.
 */
const LABEL_INSET: Record<MPSize, string> = {
  xs: 'start-1',
  sm: 'start-2',
  md: 'start-3',
  lg: 'start-3',
  xl: 'start-4'
};

/**
 * Where a resting label sits when the control is a `<textarea>`.
 *
 * Everywhere else the resting label is centred in the row, which is what
 * `top-1/2` says and what a fixed-height control makes true. A textarea has no
 * fixed height — that is the whole reason `MPTextField` puts its padding on the
 * control rather than on the row — so centring would drop the label into the
 * middle of a six-row box while the caret sat on the first line. These are the
 * first line's own centre: the row's 8px of block padding plus half a line.
 */
const MULTILINE_REST: Record<MPSize, string> = {
  xs: 'top-[18px]',
  sm: 'top-[18px]',
  md: 'top-5',
  lg: 'top-5',
  xl: 'top-5'
};

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
  /**
   * Whether the notch is cut. `false` closes it, for the moment the label is
   * resting on the control's line and there is nothing on the border to make
   * room for.
   * @default true
   */
  notched?: boolean;
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
export function MPFieldOutline({ label, required = false, notched = true }: MPFieldOutlineProps) {
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
        /*
         * `max-width` rather than `width`, and `0` rather than removing the
         * legend: a legend with no box reserves no gap, so the notch would snap
         * shut instead of closing. Zero-width with the height still declared
         * keeps the element — and the interpolation — while letting the top
         * border run unbroken behind it. The padding goes with it, or the notch
         * would stay 8px open with nothing in it.
         */
        <legend
          className={[
            'text-mp-body-small invisible float-none block h-[11px] w-auto overflow-hidden p-0',
            'leading-none',
            'ease-mp-standard transition-[max-width,padding]',
            'duration-(--mp-sys-motion-duration-short4)',
            notched ? 'max-w-full px-1' : 'max-w-0 px-0'
          ].join(' ')}
        >
          {labelContent(label, required)}
        </legend>
      ) : null}
    </fieldset>
  );
}

export interface MPFieldLabelProps extends MPFieldOutlineProps {
  /**
   * Which rung the control is drawn at. Read twice: for the inline offset, so
   * the label lands over the gap the container's padding put the notch in, and
   * for the type scale it rests at.
   */
  size: MPSize;
  /** The control the label names. */
  htmlFor?: string;
  /**
   * Whether the label is up in the notch. `false` rests it on the control's own
   * line, at the control's own type scale, where it reads as the placeholder.
   * @default true
   */
  shrunk?: boolean;
  /**
   * Whether the control is a `<textarea>`, which is the one case a resting
   * label cannot simply be centred in. See `MULTILINE_REST`.
   * @default false
   */
  multiline?: boolean;
}

/**
 * The label a reader actually gets.
 *
 * A real `<label>`, associated with the control by Base UI, sitting on the
 * border line where the legend cut it away. It cannot *be* the legend: the
 * outline is `pointer-events-none` so that clicks land on the control
 * underneath, and a label inside it would stop being clickable.
 *
 * Resting, it is `pointer-events-none` instead — it is lying over the text the
 * caret goes into, and a click on it has to reach the control so the caret
 * lands where the pointer did. A `<label for>` would only have focused the
 * control, which puts the caret at the end of the text rather than under the
 * pointer.
 */
export function MPFieldLabel({
  size,
  label,
  required = false,
  htmlFor,
  shrunk = true,
  multiline = false
}: MPFieldLabelProps) {
  return (
    <Field.Label
      htmlFor={htmlFor}
      data-mp-shrunk={shrunk ? '' : undefined}
      className={[
        'text-mp-on-surface-variant',
        // Eased on the same curve and duration as the outline it sits in, so the
        // label and the ring arrive together rather than one snapping ahead.
        'ease-mp-standard transition-[color,top,font-size,max-width]',
        'duration-(--mp-sys-motion-duration-short4)',
        'absolute -translate-y-1/2 px-1 leading-none',
        LABEL_INSET[size],
        shrunk
          ? 'text-mp-body-small pointer-events-auto top-0 max-w-none'
          : [
              PROSE_TEXT[size],
              // Kept clear of the trailing adornment a resting label would
              // otherwise run under — a password toggle, a chevron, a stepper.
              'pointer-events-none max-w-[calc(100%-2rem)] truncate',
              multiline ? MULTILINE_REST[size] : 'top-1/2'
            ].join(' '),
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

export interface MPFloatingLabel {
  /** Whether the label is up in the notch right now. */
  shrunk: boolean;
  /**
   * Spread on the element the control sits inside — the `Field.Root`, or the
   * shell `<div>` under it. Anything focusable within it counts as the field
   * being focused, which is what a reader tabbing onto a password toggle or a
   * stepper means by it.
   */
  focusProps: {
    onFocusCapture: React.FocusEventHandler<HTMLElement>;
    onBlurCapture: React.FocusEventHandler<HTMLElement>;
  };
}

export interface MPFloatingLabelOptions {
  /**
   * Whether the label floats at all. `false` pins it in the notch — which is
   * also what a control with no label wants, since there is nothing to rest.
   */
  floating: boolean;
  /** Whether the control holds anything. A filled control keeps its label up. */
  filled: boolean;
  /**
   * Anything else that holds the label up: a start adornment already occupying
   * the resting label's place, or a popup the focus has moved into.
   * @default false
   */
  pinned?: boolean;
}

/**
 * Which of its two places the label is in, and how the field learns it moved.
 *
 * Focus is tracked here rather than read from Base UI's `data-focused` because
 * the two do not agree on what a field is. `data-focused` follows the one
 * control the `Field` owns, and half the shells here have a button beside it —
 * a reveal toggle, a stepper, a clear × — that a reader on the keyboard is
 * plainly still *in* the field for. `focus-within` on the shell is the honest
 * boundary, and a capture-phase pair is how React spells it without a
 * `:focus-within` selector, which cannot be read back as a value.
 *
 * The `relatedTarget` test is what keeps the label still while focus moves
 * between two things inside the same shell. Without it, tabbing from the input
 * to the toggle drops the label and lifts it again in the same frame.
 */
export function useFloatingLabel({
  floating,
  filled,
  pinned = false
}: MPFloatingLabelOptions): MPFloatingLabel {
  const [focused, setFocused] = React.useState(false);

  return {
    shrunk: !floating || filled || focused || pinned,
    focusProps: {
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }
    }
  };
}
