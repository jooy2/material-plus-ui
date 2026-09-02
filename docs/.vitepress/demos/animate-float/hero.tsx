import { MPAnimateFloat, MPBox, MPTypography } from 'material-plus-ui';

/**
 * Three shapes on one stagger rather than three separate floats, which is the
 * one arrangement where more than one of these is right: they read as a set
 * drifting together instead of as three things each doing their own thing.
 */
export default function AnimateFloatHero() {
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center', width: '100%' }}>
      <MPAnimateFloat
        stagger={900}
        tilt={2}
        style={{ display: 'flex', gap: 16, alignItems: 'center' }}
      >
        <MPBox size="sm">
          <MPTypography level="body">Above</MPTypography>
        </MPBox>
        <MPBox size="sm">
          <MPTypography level="body">the</MPTypography>
        </MPBox>
        <MPBox size="sm">
          <MPTypography level="body">sheet</MPTypography>
        </MPBox>
      </MPAnimateFloat>

      <MPTypography level="caption">
        Half a centimetre of unhurried travel, and nothing here can be pressed.
      </MPTypography>
    </div>
  );
}
