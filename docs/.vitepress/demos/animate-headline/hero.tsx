import { MPAnimateHeadline, MPTypography } from 'material-plus-ui';

/**
 * Every line sits in the same grid cell, so the box is as tall as the longest
 * of them from the first frame and never resizes as the reel turns.
 *
 * `interval` is counted from the moment a line arrives rather than from the
 * start of the cycle, so it is reading time — raising `duration` does not
 * quietly eat it.
 */
export default function AnimateHeadlineHero() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
      <MPTypography level="h4" gutter={false}>
        Material Plus is
      </MPTypography>

      <MPAnimateHeadline interval={2200}>
        <MPTypography level="h4" color="primary" gutter={false}>
          a component library
        </MPTypography>
        <MPTypography level="h4" color="secondary" gutter={false}>
          Material Design 3
        </MPTypography>
        <MPTypography level="h4" color="tertiary" gutter={false}>
          built on Base UI
        </MPTypography>
      </MPAnimateHeadline>
    </div>
  );
}
