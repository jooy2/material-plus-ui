import { MPProgressBox } from 'material-plus-ui';

/**
 * `count` is the number of steps the thing being waited on actually has. The
 * leading segment fills partially, so four segments are not limited to 0, 25,
 * 50, 75 and 100.
 */
export default function ProgressBoxCount() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <MPProgressBox count={3} value={30} label="Three steps" showValue />
      <MPProgressBox count={4} value={30} label="Four steps" showValue />
      <MPProgressBox count={8} value={30} label="Eight steps" showValue color="tertiary" />
    </div>
  );
}
