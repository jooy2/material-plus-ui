import { MPAlert, MPButton } from 'material-plus-ui';

/**
 * The three shapes people mean by "an alert", which are one component with
 * different slots filled: a bare line, a line with a glyph, and a glyph with a
 * headline and the detail under it.
 */
export default function AlertHero() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <MPAlert>Your changes have been saved.</MPAlert>
      <MPAlert
        color="error"
        title="We could not charge your card"
        action={<MPButton variant="text">Retry</MPButton>}
        onClose={() => {}}
      >
        The bank declined the payment. Nothing has been billed.
      </MPAlert>
    </div>
  );
}
