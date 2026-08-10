import { MPButton, MPSnackbarProvider, useMPSnackbar } from 'material-plus-ui';

/**
 * The call site stays the one thing it should be: what happened. Everything
 * about how the message *looks* — where the stack sits, how wide it is, how
 * long it lasts — was decided once on the provider.
 */
function Actions() {
  const snackbar = useMPSnackbar();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <MPButton size="sm" onClick={() => snackbar.add({ message: 'Draft saved' })}>
        Save
      </MPButton>
      <MPButton
        size="sm"
        variant="outlined"
        onClick={() =>
          snackbar.add({
            message: 'Message archived',
            actionLabel: 'Undo',
            onAction: () => snackbar.add({ message: 'Message restored' })
          })
        }
      >
        Archive
      </MPButton>
    </div>
  );
}

export default function SnackbarHero() {
  return (
    <MPSnackbarProvider>
      <Actions />
    </MPSnackbarProvider>
  );
}
