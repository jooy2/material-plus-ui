import { MPButton, MPButtonGroup } from 'material-plus-ui';

/**
 * The half of a group that is not visual.
 *
 * `variant`, `size`, `color` and `disabled` are set once for the set. A button's
 * own prop still wins, because a row of secondary actions with one destructive
 * button in it is a real thing — and that is exactly what the third button here
 * is.
 */
export default function ButtonGroupInheritance() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <MPButtonGroup variant="outlined" size="sm">
        <MPButton>Approve</MPButton>
        <MPButton>Defer</MPButton>
        <MPButton color="error">Reject</MPButton>
      </MPButtonGroup>

      <MPButtonGroup orientation="vertical" variant="tonal" size="sm">
        <MPButton>Top</MPButton>
        <MPButton>Middle</MPButton>
        <MPButton>Bottom</MPButton>
      </MPButtonGroup>
    </div>
  );
}
