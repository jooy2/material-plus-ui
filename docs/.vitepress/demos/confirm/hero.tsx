import { useState } from 'react';
import {
  ICONS,
  MPButton,
  MPConfirmProvider,
  MPIcon,
  MPTypography,
  useMPConfirm
} from 'material-plus-ui';

/**
 * A click handler, a question, and a boolean.
 *
 * What a caller has at the moment a confirmation is warranted is a handler, not
 * a place in the tree — so the dialog lives in the provider and the call site
 * gets a promise. Everything that is not the confirm button resolves `false`:
 * cancel, Escape, a press outside.
 */
function Row() {
  const { confirm, alert } = useMPConfirm();
  const [log, setLog] = useState<string[]>([]);

  const say = (line: string) => setLog((all) => [line, ...all].slice(0, 4));

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <MPButton
          color="error"
          startIcon={<MPIcon icon={ICONS.close} />}
          onClick={async () => {
            const sure = await confirm({
              title: 'Delete this project?',
              description: 'Everything in it goes too, and it cannot be undone.',
              confirmLabel: 'Delete',
              color: 'error'
            });

            say(sure ? 'Deleted.' : 'Kept.');
          }}
        >
          Delete project
        </MPButton>

        <MPButton
          variant="outlined"
          onClick={async () => {
            await alert({
              title: 'Saved',
              description: 'Your changes are on the server.'
            });

            say('Acknowledged.');
          }}
        >
          Save
        </MPButton>
      </div>

      <MPTypography level="caption">
        {log.length === 0 ? 'Nothing yet.' : log.join(' · ')}
      </MPTypography>
    </div>
  );
}

export default function ConfirmHero() {
  return (
    <MPConfirmProvider>
      <Row />
    </MPConfirmProvider>
  );
}
