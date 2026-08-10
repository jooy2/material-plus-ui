import { MPOtpField } from 'material-plus-ui';

/**
 * `groupSize` splits the row with a separator, and `charset` decides what may
 * be typed at all — anything rejected is dropped rather than shown.
 */
export default function OtpFieldGrouping() {
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <MPOtpField label="Two blocks of three" length={6} groupSize={3} />
      <MPOtpField
        label="Licence key"
        length={8}
        groupSize={4}
        charset="alphanumeric"
        separator="—"
        size="sm"
      />
      <MPOtpField label="PIN" length={4} mask size="sm" />
    </div>
  );
}
