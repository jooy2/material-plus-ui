import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon, ErrorIcon } from '../../constants/icons';
import { accentSlots } from '../../internal/accent';
import { hasContent, META_TEXT, SHEET_TITLE } from '../../internal/scale';
import {
  BORDER_STYLE,
  BULLET,
  BULLET_GAP,
  BULLET_SIZE,
  CONNECTOR_COLOR,
  ITEM_GAP,
  ITEM_GAP_X,
  STEP_MOTION,
  TITLE_COLOR,
  type MPStepConnector,
  type MPStepStatus
} from '../../internal/step';
import { useMPColor, useMPSize } from '../../internal/config';
import type { MPColor, MPOrientation, MPSize } from '../../types';

/** How far a step has got. The same three `MPTimeline` draws. */
export type MPStepStatusValue = MPStepStatus;

interface StepperContextValue {
  size: MPSize;
  color: MPColor;
  orientation: MPOrientation;
  active: number;
  /** `null` on a stepper nobody is driving, which makes every step unpressable. */
  onSelect: ((index: number) => void) | null;
  linear: boolean;
  /** How many steps are on the page, so the last one knows not to draw a line. */
  count: number;
  /** Which steps a linear stepper is allowed to jump back to. */
  furthest: number;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);
const StepIndexContext = React.createContext(0);

export interface MPStepperProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'onChange'
> {
  /**
   * Which step is being worked on now, counting from zero. Everything before it
   * is complete and everything after it is still to come.
   *
   * An index rather than a value, for the reason `MPTimeline`'s is: a step that
   * had to be told where it was in the list would be a step every caller could
   * put in the wrong place.
   */
  active?: number;
  /** Where an uncontrolled stepper starts. @default 0 */
  defaultActive?: number;
  /**
   * Called with the step that was pressed.
   *
   * **Leaving it out is what makes the steps unpressable.** A stepper with no
   * handler is a progress indicator — it says where the reader is and offers no
   * way to move, which is the right shape for a sequence the application drives
   * with its own Next and Back buttons.
   */
  onActiveChange?: (active: number) => void;
  /**
   * Whether a step can only be reached once the ones before it are done.
   *
   * On by default, because that is what a sequence *is*: a checkout that let
   * somebody press Payment before Address would be offering a step it cannot
   * complete. Off, every step is reachable at any time — a settings wizard, a
   * form split into sections a reader can wander.
   *
   * A linear stepper still allows going **back**. What it refuses is jumping
   * forward past the step the reader has actually reached.
   * @default true
   */
  linear?: boolean;
  /**
   * Which way the sequence runs.
   *
   * `horizontal` is the default here and `vertical` is `MPTimeline`'s, and the
   * two defaults disagree on purpose: a stepper is a small number of short
   * labels across the top of a task, and a timeline is an arbitrary number of
   * entries with an arbitrary amount to say about each.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  size?: MPSize;
  color?: MPColor;
  /** `MPStep` elements. Anything else is rendered where it is put. */
  children?: React.ReactNode;
}

export interface MPStepProps extends Omit<React.ComponentPropsWithoutRef<'li'>, 'color'> {
  /** What the step is called. */
  label?: React.ReactNode;
  /** A second line under it — what the step is for, or what it is waiting on. */
  description?: React.ReactNode;
  /**
   * What goes inside the bullet.
   *
   * Left out, a complete step draws a tick, a failed one draws its error glyph
   * and every other one draws its number — which is what a stepper's bullet is
   * for, and why this is an override rather than the usual way in.
   */
  bullet?: React.ReactNode;
  /**
   * Marks the step as failed. It is drawn in `error` and keeps its place in the
   * sequence rather than being removed, because a sequence with a hole in it is
   * one the reader cannot count.
   */
  error?: boolean;
  /**
   * A note under the label — *Optional*, *Skipped*, *2 of 3 done*.
   *
   * A node rather than a boolean, and that is not a small difference: a boolean
   * would mean this library shipping the **word** *Optional*, which would then
   * need a translation in eighteen languages for a label only some applications
   * ever draw. The caller has the word already, in their own copy and their own
   * language.
   */
  optional?: React.ReactNode;
  /** Refuses the press whatever the reachability rule says. */
  disabled?: boolean;
  /**
   * How the line to the next step is drawn.
   * @default 'solid'
   */
  connector?: MPStepConnector;
  color?: MPColor;
  /**
   * The step's own panel, drawn **only while the step is active**.
   *
   * Which is the half a stepper has that a timeline does not: a wizard is a rail
   * and one panel, and keeping the other panels mounted would mean a form whose
   * hidden fields still submit.
   */
  children?: React.ReactNode;
}

/**
 * A sequence being worked through, with one panel at a time.
 *
 * ```tsx
 * const [step, setStep] = useState(0);
 *
 * <MPStepper active={step} onActiveChange={setStep}>
 *   <MPStep label="Account">…</MPStep>
 *   <MPStep label="Payment">…</MPStep>
 *   <MPStep label="Done">…</MPStep>
 * </MPStepper>;
 * ```
 *
 * ## How it differs from `MPTimeline`
 *
 * They draw the same picture from the same table — see `internal/step.ts` — and
 * they are two components because they are two jobs:
 *
 * | | `MPTimeline` | `MPStepper` |
 * | --- | --- | --- |
 * | The sequence | happened | is being worked through |
 * | The steps | are read | are pressed |
 * | The content | is all on screen | is one panel |
 * | Default orientation | `vertical` | `horizontal` |
 *
 * A stepper with no `onActiveChange` is the overlap: unpressable, one panel, and
 * a progress indicator for a sequence the application's own Next and Back
 * buttons drive.
 *
 * ## It ships no Next and Back
 *
 * On purpose. Those buttons belong to the form: what "next" means is whether the
 * current step validates, and a library that drew them would either have to
 * guess that or ask for a validator per step. `onActiveChange` and two
 * `MPButton`s is four lines, and they are four lines the caller can read.
 *
 * ## Reachability
 *
 * `linear` decides which steps a press is allowed to reach. Going **back** is
 * always allowed; what a linear stepper refuses is jumping forward past the step
 * the reader has actually got to. An unreachable step is `aria-disabled` rather
 * than removed from the tab order, so a reader arrowing along the rail is told
 * *why* it will not open instead of finding a gap.
 */
export const MPStepper = React.forwardRef<HTMLDivElement, MPStepperProps>(function MPStepper(
  {
    active: activeProp,
    defaultActive = 0,
    onActiveChange,
    linear = true,
    orientation = 'horizontal',
    size: sizeProp,
    color: colorProp,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const color = useMPColor(colorProp);

  const [uncontrolled, setUncontrolled] = React.useState(defaultActive);
  const active = activeProp ?? uncontrolled;

  /*
   * The furthest step reached, which is not the same as the current one: a
   * reader who has got to step three and gone back to step one can still return
   * to three, and a linear stepper that only knew `active` would have taken that
   * away from them the moment they looked back.
   */
  const [furthest, setFurthest] = React.useState(active);

  if (active > furthest) {
    // Derived during render rather than in an effect, so the rail is never drawn
    // one frame behind the step it is already showing.
    setFurthest(active);
  }

  const steps = React.Children.toArray(children).filter(React.isValidElement);
  const count = steps.length;

  const select = React.useCallback(
    (index: number) => {
      if (activeProp === undefined) {
        setUncontrolled(index);
      }

      onActiveChange?.(index);
    },
    [activeProp, onActiveChange]
  );

  const context = React.useMemo<StepperContextValue>(
    () => ({
      size,
      color,
      orientation,
      active,
      onSelect: onActiveChange || activeProp === undefined ? select : null,
      linear,
      count,
      furthest
    }),
    [size, color, orientation, active, onActiveChange, activeProp, select, linear, count, furthest]
  );

  const horizontal = orientation === 'horizontal';

  return (
    <StepperContext.Provider value={context}>
      <div
        {...props}
        ref={ref}
        data-mp-size={size}
        className={['mp-stepper flex flex-col', className ?? ''].filter(Boolean).join(' ')}
        style={{ ...accentSlots(color), ...style }}
      >
        {/*
         * The rail is a list, and it stays one whether or not the steps are
         * pressable — a sequence is an ordered set of things either way, and a
         * screen reader announcing "3 of 5" is the whole reason to say so.
         */}
        <ol
          className={[
            'mp-stepper__rail flex list-none p-0',
            horizontal ? 'flex-row items-start' : 'flex-col'
          ].join(' ')}
          style={{ '--_mp-bullet': BULLET_SIZE[size] } as React.CSSProperties}
        >
          {steps.map((step, index) => (
            <StepIndexContext.Provider key={index} value={index}>
              {step}
            </StepIndexContext.Provider>
          ))}
        </ol>

        {/*
         * One panel, drawn outside the list rather than inside the step it
         * belongs to. A `<li>` holding the whole of a form would make the rail
         * as tall as the panel, and a horizontal rail would then be a row of
         * columns rather than a row of steps.
         */}
        <StepPanel steps={steps} active={active} />
      </div>
    </StepperContext.Provider>
  );
});

/** The active step's `children`, and nothing else's. */
function StepPanel({ steps, active }: { steps: React.ReactElement[]; active: number }) {
  const current = steps[active] as React.ReactElement<MPStepProps> | undefined;
  const content = current?.props.children;

  if (!hasContent(content)) {
    return null;
  }

  return (
    <div className="mp-stepper__panel mt-4" role="group" aria-label={undefined}>
      {content}
    </div>
  );
}

/**
 * One step in a sequence.
 *
 * Its index is not a prop and cannot be, for the reason `MPTimelineItem`'s is
 * not: a step told where it was in the list is a step every caller could put in
 * the wrong place. The stepper numbers its children as it walks them.
 */
export const MPStep = React.forwardRef<HTMLLIElement, MPStepProps>(function MPStep(
  {
    label,
    description,
    bullet,
    error = false,
    optional,
    disabled = false,
    connector = 'solid',
    color,
    className,
    style,
    /*
     * Taken out of the spread and deliberately not read here.
     *
     * The panel belongs to the *stepper*, which draws the active step's
     * `children` outside the list — see `StepPanel`. Left in `props` it would be
     * spread onto this `<li>` as well, and a horizontal rail would grow as tall
     * as whichever form happened to be in the step.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    children,
    ...props
  },
  ref
) {
  const stepper = React.useContext(StepperContext);
  const index = React.useContext(StepIndexContext);

  // A bare step outside a stepper still renders — it is one step with nothing
  // before or after it. The defaults are the stepper's own.
  const size = stepper?.size ?? 'md';
  const orientation = stepper?.orientation ?? 'horizontal';
  const active = stepper?.active ?? 0;
  const count = stepper?.count ?? 1;
  const furthest = stepper?.furthest ?? 0;
  const linear = stepper?.linear ?? true;

  const status: MPStepStatus =
    index < active ? 'complete' : index === active ? 'current' : 'upcoming';
  // The failed step swaps the accent family rather than adding a fourth state:
  // where it is in the sequence and what happened to it are two questions.
  const family = color ?? (error ? 'error' : (stepper?.color ?? 'primary'));

  const horizontal = orientation === 'horizontal';
  const last = index === count - 1;
  const drawsConnector = connector !== 'none' && !last;

  // Back is always allowed; what `linear` refuses is jumping past the step the
  // reader has actually reached.
  const reachable = !disabled && (!linear || index <= furthest);
  const pressable = stepper?.onSelect !== null && stepper?.onSelect !== undefined && reachable;

  const inside =
    bullet ??
    (status === 'complete' && !error ? (
      <MPIcon icon={CheckIcon} />
    ) : error ? (
      <MPIcon icon={ErrorIcon} />
    ) : (
      index + 1
    ));

  const bulletBox = (
    <span
      aria-hidden="true"
      className={[
        'mp-stepper__bullet rounded-mp-full relative z-10 flex shrink-0',
        'items-center justify-center',
        'size-(--_mp-bullet) text-[calc(var(--_mp-bullet)*0.5)] leading-none font-medium',
        'tabular-nums [&>svg]:size-[0.6em]',
        BULLET[status],
        // Wider than `STEP_MOTION`, because a bullet has a fill and a halo where
        // the line and the title beside it have only an edge and an ink.
        'transition-[background-color,border-color,box-shadow,color]',
        'duration-(--mp-sys-motion-duration-short4) ease-mp-standard'
      ].join(' ')}
    >
      {inside}
    </span>
  );

  const connectorLine = drawsConnector ? (
    <span
      aria-hidden="true"
      className={[
        'mp-stepper__connector pointer-events-none absolute',
        horizontal
          ? 'start-(--_mp-bullet) top-[calc(var(--_mp-bullet)/2_-_1px)] end-0 border-t-2'
          : 'top-(--_mp-bullet) start-[calc(var(--_mp-bullet)/2_-_1px)] bottom-0 border-s-2',
        BORDER_STYLE[connector],
        CONNECTOR_COLOR[status],
        STEP_MOTION
      ]
        .filter(Boolean)
        .join(' ')}
    />
  ) : null;

  const body = (
    <span className={`flex min-w-0 flex-col gap-0.5 text-start ${horizontal ? 'mt-2' : ''}`}>
      {hasContent(label) ? (
        <span
          className={[
            'mp-stepper__label',
            SHEET_TITLE[size],
            error ? 'text-mp-error' : TITLE_COLOR[status],
            STEP_MOTION
          ].join(' ')}
        >
          {label}
        </span>
      ) : null}
      {hasContent(optional) ? (
        <span className={`text-mp-on-surface-variant ${META_TEXT}`}>{optional}</span>
      ) : null}
      {hasContent(description) ? (
        <span className={`text-mp-on-surface-variant ${META_TEXT}`}>{description}</span>
      ) : null}
    </span>
  );

  const contents = (
    <>
      {connectorLine}
      <span
        className={`flex min-w-0 ${horizontal ? 'flex-col items-start' : 'flex-row'} ${horizontal ? '' : BULLET_GAP[size]}`}
      >
        {bulletBox}
        {body}
      </span>
    </>
  );

  return (
    <li
      {...props}
      ref={ref}
      aria-current={status === 'current' ? 'step' : undefined}
      className={[
        'mp-stepper__step relative min-w-0',
        horizontal ? `flex-1 ${last ? '' : ITEM_GAP_X[size]}` : last ? '' : ITEM_GAP[size],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...(color || error ? accentSlots(family) : null), ...style }}
    >
      {pressable ? (
        <button
          type="button"
          // Not the `disabled` attribute on an unreachable step, for the reason
          // the calendar's cells give: a disabled button leaves the tab order,
          // and a reader walking the rail would find a hole where the step they
          // cannot open yet should have told them so.
          className={[
            'group relative flex w-full min-w-0 cursor-pointer appearance-none bg-transparent p-0 text-start',
            'outline-mp-secondary rounded-mp-xs focus-visible:outline-2 focus-visible:outline-offset-2',
            'outline-none'
          ].join(' ')}
          onClick={() => stepper?.onSelect?.(index)}
        >
          {contents}
        </button>
      ) : (
        <span
          className="relative flex w-full min-w-0"
          aria-disabled={stepper?.onSelect && !reachable ? true : undefined}
        >
          {contents}
        </span>
      )}
    </li>
  );
});
