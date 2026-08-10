import { MPButton, MPDialog, MPDialogClose, MPIcon, ICONS } from 'material-plus-ui';

/**
 * A hero icon centres the header, which is MD3's own rule — and it is a real
 * distinction rather than a decoration: a dialog with an icon is *announcing*
 * something, and a dialog without one is *asking* something.
 */
export default function DialogIcon() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <MPDialog
        trigger={<MPButton variant="outlined">Announcing</MPButton>}
        icon={<MPIcon icon={ICONS.success} size={24} />}
        title="Your export is ready"
        description="We have emailed a link to the address on your account. It expires in seven days."
        actions={<MPDialogClose render={<MPButton variant="text">Got it</MPButton>} />}
        size="sm"
      />
      <MPDialog
        trigger={<MPButton variant="outlined">Asking</MPButton>}
        title="Leave without saving?"
        description="Your last three changes have not been written yet."
        actions={
          <>
            <MPDialogClose render={<MPButton variant="text">Stay</MPButton>} />
            <MPDialogClose render={<MPButton color="error">Leave</MPButton>} />
          </>
        }
        size="sm"
      />
    </div>
  );
}
