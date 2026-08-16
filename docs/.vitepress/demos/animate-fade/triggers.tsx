import { MPAnimateFade, MPBox, MPTypography } from 'material-plus-ui';

/**
 * The four triggers, and the one that matters most on a real page.
 *
 * `visible` waits for the element to be scrolled into view, which is the only
 * one that needs nothing from the caller and still runs at the moment a reader
 * arrives. `hover` starts again on every entry — and on focus too, or the
 * effect would be unreachable without a mouse.
 *
 * `repeat="infinite"` with `alternate` is what turns a one-way entrance into a
 * breath: every other pass runs backwards, so it returns instead of jumping.
 */
export default function AnimateFadeTriggers() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 420 }}>
      <MPAnimateFade trigger="visible" once={false} threshold={0.6}>
        <MPBox>
          <MPTypography level="body">Fades in whenever it is scrolled back into view.</MPTypography>
        </MPBox>
      </MPAnimateFade>

      <MPAnimateFade trigger="hover" from={0.35} duration={600} tabIndex={0}>
        <MPBox>
          <MPTypography level="body">Point at this one, or tab to it.</MPTypography>
        </MPBox>
      </MPAnimateFade>

      <MPAnimateFade from={0.4} repeat="infinite" alternate duration={1400}>
        <MPBox>
          <MPTypography level="body">A breath, rather than an arrival.</MPTypography>
        </MPBox>
      </MPAnimateFade>
    </div>
  );
}
