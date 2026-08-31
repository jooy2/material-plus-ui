import { MPStep, MPStepper, MPTypography } from 'material-plus-ui';

/**
 * A failed step keeps its place.
 *
 * `error` swaps the accent family rather than adding a fourth state: where a
 * step is in the sequence and what happened to it are two different questions,
 * and a sequence with a hole in it is one the reader cannot count.
 *
 * The vertical form is the one that takes a description per step without the
 * rail becoming a row of columns.
 */
export default function StepperStates() {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <MPTypography level="overline">horizontal — the default</MPTypography>
        <MPStepper active={2}>
          <MPStep label="Uploaded" />
          <MPStep label="Scanned" error description="Two files failed" />
          <MPStep label="Published" optional="Optional" />
        </MPStepper>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <MPTypography level="overline">vertical</MPTypography>
        <MPStepper active={1} orientation="vertical" size="sm">
          <MPStep label="Order placed" description="14 March, 09:12" />
          <MPStep label="In transit" description="Left the depot this morning" />
          <MPStep label="Delivered" />
        </MPStepper>
      </div>
    </div>
  );
}
