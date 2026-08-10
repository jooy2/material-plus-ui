import { MPButton, MPDialog, MPDialogClose, MPTypography } from 'material-plus-ui';

const CLAUSES = Array.from({ length: 12 }, (_, index) => index + 1);

/**
 * Only the body scrolls; the header and the actions stay put. `dividers` is
 * what says so — the moment a body scrolls, space alone stops explaining why
 * the heading did not move with it.
 */
export default function DialogScrolling() {
  return (
    <MPDialog
      trigger={<MPButton variant="outlined">Read the terms</MPButton>}
      title="Terms of service"
      description="Last updated 10 August 2026."
      dividers
      showClose
      actions={
        <>
          <MPDialogClose render={<MPButton variant="text">Decline</MPButton>} />
          <MPDialogClose render={<MPButton>Accept</MPButton>} />
        </>
      }
    >
      <div style={{ display: 'grid', gap: 16 }}>
        {CLAUSES.map((clause) => (
          <section key={clause}>
            <MPTypography level="h6">Clause {clause}</MPTypography>
            <MPTypography level="body">
              Nothing in this clause limits any right you already had, and nothing in it grants one
              you did not.
            </MPTypography>
          </section>
        ))}
      </div>
    </MPDialog>
  );
}
