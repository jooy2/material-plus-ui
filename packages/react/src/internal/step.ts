/**
 * The bullet, the connector and the ladder they are drawn on — written once for
 * the two components that draw a numbered sequence.
 *
 * `MPTimeline` shows a sequence that **happened**; `MPStepper` drives one that
 * is being **worked through**. They are two components because those are two
 * jobs — one is read and the other is pressed — but they are the same picture,
 * and a picture kept by two tables is a picture that drifts the first time one
 * of them is edited alone. That is the argument `scale.ts` makes about the size
 * ladder, applied to a smaller thing.
 *
 * What is *not* here is anything either one decides on its own: the timeline's
 * `meta` line, the stepper's reachability. Those are not shared and putting them
 * here would make this a third component nobody renders.
 */
import type { MPSize } from '../types';

/**
 * How far a step has got.
 *
 * Three rather than more, and `error` is deliberately not among them —
 * `MPStepper` draws a failed step by swapping the accent family for `error`,
 * which is one axis rather than a fourth state every table below would have to
 * grow a row for. The three are about *position in the sequence*; the colour is
 * about what happened.
 */
export type MPStepStatus = 'complete' | 'current' | 'upcoming';

/** How the line between two steps is drawn. `none` leaves the gap open. */
export type MPStepConnector = 'solid' | 'dashed' | 'dotted' | 'none';

/**
 * The bullet.
 *
 * Its own ladder rather than a step off `CONTROL_HEIGHT`, for the reason a
 * checkbox's tick has one: a bullet is not a control you can put a label inside.
 * It is a mark beside one, sized against the title next to it.
 *
 * It is written as a custom property rather than as a class because the
 * connector has to know it: the line is centred on the bullet, and centring is
 * arithmetic on this number.
 */
export const BULLET_SIZE: Record<MPSize, string> = {
  xs: '0.875rem',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
  xl: '1.875rem'
};

/** Between the bullet column and the content beside it. */
export const BULLET_GAP: Record<MPSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2.5',
  md: 'gap-3',
  lg: 'gap-3.5',
  xl: 'gap-4'
};

/**
 * How far apart two steps sit.
 *
 * The floor is set by the step with nothing in it. A step that is only a title
 * and a time is one line tall, so the gap is the *whole* of what separates it
 * from the next one — where a step with a paragraph under it has the paragraph's
 * own leading working for it as well.
 */
export const ITEM_GAP: Record<MPSize, string> = {
  xs: 'pb-5',
  sm: 'pb-6',
  md: 'pb-7',
  lg: 'pb-8',
  xl: 'pb-10'
};

/** The same ladder across, for the horizontal form. */
export const ITEM_GAP_X: Record<MPSize, string> = {
  xs: 'pe-5',
  sm: 'pe-6',
  md: 'pe-7',
  lg: 'pe-8',
  xl: 'pe-10'
};

/**
 * What everything that changes with a step's status eases on.
 *
 * The bullet always had this. The line leaving it and the title beside it did
 * not, so advancing a stepper drew one event twice: a bullet filling with the
 * accent over 200ms, and a connector and a heading arriving at their new colours
 * in the frame the state changed. A sequence is read across, and the half of it
 * that snapped was the half that carries the eye to the next step.
 *
 * `border-color` and `color` rather than a blanket `transition-colors`, which
 * would also put the `background-color` and the `box-shadow` of the three-line
 * `BULLET` table on every connector — a line has neither, and a transition
 * listing a property nothing declares is a declaration the browser keeps.
 */
export const STEP_MOTION = [
  'transition-[border-color,color]',
  'duration-(--mp-sys-motion-duration-short4)',
  'ease-mp-standard'
].join(' ');

export const BORDER_STYLE: Record<MPStepConnector, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  none: ''
};

/**
 * The bullet at each of the three states.
 *
 * Every one of them is a different axis, never a different opacity: `complete`
 * is filled with the accent under its own ink, `current` is the same fill with a
 * halo of the container tone around it, and `upcoming` is a hairline ring on the
 * page's own surface. A reader who cannot tell the colours apart still has a
 * filled shape, a haloed shape and an empty one.
 */
export const BULLET: Record<MPStepStatus, string> = {
  complete: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  current:
    'bg-(--_mp-accent) text-(--_mp-on-accent) shadow-[0_0_0_0.25rem_var(--_mp-accent-container)]',
  upcoming: 'border-mp-outline text-mp-on-surface-variant border-2 bg-transparent'
};

/**
 * The line *after* a step, which is what makes it the step's own property: a
 * connector is coloured by whether the step it leaves has been reached, not by
 * where it arrives.
 */
export const CONNECTOR_COLOR: Record<MPStepStatus, string> = {
  complete: 'border-(--_mp-accent)',
  current: 'border-mp-outline-variant',
  upcoming: 'border-mp-outline-variant'
};

export const TITLE_COLOR: Record<MPStepStatus, string> = {
  complete: 'text-mp-on-surface',
  current: 'text-(--_mp-accent)',
  upcoming: 'text-mp-on-surface-variant'
};
