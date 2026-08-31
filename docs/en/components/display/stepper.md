---
title: MPStepper
order: 22
---

# MPStepper

<p class="mp-lede">A sequence being worked through, with one panel at a time.</p>

<Demo src="stepper/hero" :minHeight="300">

<<< @/.vitepress/demos/stepper/hero.tsx

</Demo>

```tsx
import { MPStep, MPStepper } from 'material-plus-ui';

const [step, setStep] = useState(0);

<MPStepper active={step} onActiveChange={setStep}>
  <MPStep label="Account">…</MPStep>
  <MPStep label="Payment">…</MPStep>
  <MPStep label="Done">…</MPStep>
</MPStepper>;
```

## Props

<PropsTable name="MPStepper" />

### MPStep

<PropsTable name="MPStep" />

## How it differs from `MPTimeline`

They draw the same picture from the same table — the bullet, the connector and the ladder they sit on are one file, [`internal/step.ts`](https://github.com/jooy2/material-plus/blob/main/src/internal/step.ts), because a picture kept by two tables is a picture that drifts the first time one of them is edited alone.

They are two components because they are two jobs:

|                     | [`MPTimeline`](./timeline.md) | `MPStepper`             |
| ------------------- | ----------------------------- | ----------------------- |
| The sequence        | happened                      | is being worked through |
| The steps           | are read                      | are pressed             |
| The content         | is all on screen              | is one panel            |
| Default orientation | `vertical`                    | `horizontal`            |

A stepper with **no** `onActiveChange` is the overlap: unpressable, still one panel, and a progress indicator for a sequence the application's own buttons drive.

## It ships no Next and Back

On purpose, and it is the one thing readers of other libraries expect to find here.

What _next_ means is whether the current step validates — and a library that drew those buttons would either have to guess that or ask for a validator per step, which is a second way of writing the form you already wrote. `onActiveChange` plus two `MPButton`s is four lines, and they are four lines the caller can read:

```tsx
<MPButton variant="text" disabled={step === 0} onClick={() => setStep(step - 1)}>
  Back
</MPButton>
<MPButton disabled={!isValid} onClick={() => setStep(step + 1)}>
  Next
</MPButton>
```

## Reachability

`linear` decides which steps a press is allowed to reach, and it is on by default because that is what a sequence _is_: a checkout that let somebody press Payment before Address would be offering a step it cannot complete.

**Going back is always allowed.** What a linear stepper refuses is jumping forward past the step the reader has actually got to — and "actually got to" is the _furthest_ step, not the current one. A reader who reached step three and went back to step one can still return to three; a stepper that only knew `active` would have taken that away from them the moment they looked back.

`linear={false}` reaches anything at any time — a settings wizard, a long form split into sections a reader can wander.

An unreachable step is marked `aria-disabled` rather than removed. A reader walking the rail is told _why_ it will not open, instead of finding a gap.

## States

<Demo src="stepper/states" :minHeight="420">

<<< @/.vitepress/demos/stepper/states.tsx

</Demo>

A completed step draws a **tick** instead of its number, a failed one draws its error glyph, and everything else draws the number it was walked to. `bullet` overrides all three.

`error` swaps the accent family and **keeps the step in the sequence**. Where a step is in the run and what happened to it are two different questions, so failure is a colour rather than a fourth state — and a sequence with a hole in it is one the reader cannot count.

`optional` is a node rather than a boolean, which is not a small difference: a boolean would mean this library shipping the word _Optional_, and then a translation of it in eighteen languages for a label only some applications ever draw. You have the word already, in your own copy.

## The panel

The active step's `children`, and nothing else's — drawn **outside** the list rather than inside the step it belongs to. A `<li>` holding a whole form would make the rail as tall as the panel, and a horizontal rail would then be a row of columns rather than a row of steps.

Only one panel is mounted at a time. That is the half a stepper has that a timeline does not, and it is the half that matters for a form: keeping the other panels mounted would mean hidden fields that still submit.

## Sharp edges

- **A step's index is not a prop and cannot be.** The stepper numbers its children as it walks them, for the reason [`MPTimelineItem`](./timeline.md) gives: a step told where it was in the list is a step every caller could put in the wrong place.
- **`horizontal` is only honest while the labels are short.** The rail divides the width evenly, so a five-word label in one step sets the height of the row. `vertical` is the form that takes a description per step.
- **One panel means one panel.** State inside a step that is not active is unmounted along with it. Lift anything that has to survive the walk.

## Next

- [MPTimeline](./timeline.md) — the same picture, for a sequence that has already happened.
- [MPTabs](../layout/tabs.md) — one panel at a time when the order does not matter.
