import { MPButton, MPCard } from 'material-plus-ui';

/**
 * Space or rules, which is one prop and two different trades.
 *
 * Without `dividers` the *sheet* carries the vertical padding and the sections
 * are told apart by a gap. With them each section carries both axes, so a
 * hairline can reach the sheet's own edges — the same trade `MPDialog` makes,
 * and the reason to turn it on is the same: the lines are what say the parts are
 * parts.
 */
export default function CardDividers() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 420 }}>
      <MPCard title="Separated by space" footer={<MPButton variant="text">Act</MPButton>}>
        The default.
      </MPCard>

      <MPCard dividers title="Separated by rules" footer={<MPButton variant="text">Act</MPButton>}>
        The rules reach both edges, because the padding moved off the sheet and onto each section.
      </MPCard>
    </div>
  );
}
