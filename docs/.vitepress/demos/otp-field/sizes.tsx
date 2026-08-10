import { MPOtpField } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * Every rung is the control height of the same name, so a code sits at the same
 * height as the fields above and below it in a form.
 *
 * The **width** is not: a slot holds one character, so it is drawn narrower than
 * it is tall — which is what makes a row of them read as places for one
 * character each rather than as a row of tiny fields. The type scale goes above
 * the control ladder for the same reason a code is read out loud off a phone.
 */
const SIZES: { size: MPSize; note: string }[] = [
  { size: 'xs', note: '32 tall, 28 wide' },
  { size: 'sm', note: '40 tall, 36 wide' },
  { size: 'md', note: '56 tall, 48 wide — the default' },
  { size: 'lg', note: '64 tall, 56 wide' },
  { size: 'xl', note: '72 tall, 64 wide' }
];

export default function OtpFieldSizes() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      {SIZES.map(({ size, note }) => (
        <MPOtpField
          key={size}
          size={size}
          length={4}
          defaultValue="4821"
          label={`size="${size}" — ${note}`}
        />
      ))}
    </div>
  );
}
