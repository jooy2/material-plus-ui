import { MPFlex, MPMeter } from 'material-plus-ui';

/**
 * Three readings, each with bands in its own units — which is the thing to
 * notice: `from` is a value on the meter's own scale, not a percentage.
 */
export default function MeterHero() {
  return (
    <MPFlex direction="column" gap={20} style={{ width: '100%', maxWidth: 420 }}>
      <MPMeter
        value={2.1}
        max={5}
        label="Storage used"
        showValue
        format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
        thresholds={[
          { from: 3, color: 'tertiary' },
          { from: 4.5, color: 'error' }
        ]}
      />
      <MPMeter
        value={41}
        max={60}
        label="Seats taken"
        showValue
        format={{ maximumFractionDigits: 0 }}
        thresholds={[
          { from: 36, color: 'tertiary' },
          { from: 54, color: 'error' }
        ]}
      />
      <MPMeter
        value={94}
        label="Quota spent"
        showValue
        thresholds={[
          { from: 60, color: 'tertiary' },
          { from: 85, color: 'error' }
        ]}
      />
    </MPFlex>
  );
}
