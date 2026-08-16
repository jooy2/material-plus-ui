import { MPAnimateBlink, MPBox, MPChip, MPTypography } from 'material-plus-ui';

/**
 * `min` is a **dimming**, never the only thing carrying the message.
 *
 * A reader with a reduced-motion preference sees none of this, so the words
 * have to stand on their own: "Recording" says what is happening whether or not
 * anything pulses beside it.
 */
export default function AnimateBlinkHero() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 380 }}>
      <MPBox size="sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MPAnimateBlink min={0.15} duration={1200}>
            <span
              style={{
                display: 'block',
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: 'var(--_mp-color-error)'
              }}
            />
          </MPAnimateBlink>
          <MPTypography level="body">Recording — 04:12</MPTypography>
        </div>
      </MPBox>

      <MPAnimateBlink min={0.55} duration={1600}>
        <MPChip variant="tonal" color="error">
          3 checks failing
        </MPChip>
      </MPAnimateBlink>
    </div>
  );
}
