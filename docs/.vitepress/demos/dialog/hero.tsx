import { MPButton, MPDialog, MPDialogClose } from 'material-plus-ui';

/**
 * The sections are props rather than compound sub-components: the arrangement
 * of a dialog is fixed, and what a caller wants to decide is what goes in each
 * slot.
 *
 * `MPDialogClose` is what lets an *uncontrolled* dialog have a Cancel button —
 * there is no `setOpen` for it to call.
 */
export default function DialogHero() {
  return (
    <MPDialog
      trigger={<MPButton variant="tonal">Delete project</MPButton>}
      title="Delete “Aurora”?"
      description="Everything in it goes too — issues, branches and the deploy history."
      actions={
        <>
          <MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />
          <MPDialogClose render={<MPButton color="error">Delete</MPButton>} />
        </>
      }
    />
  );
}
