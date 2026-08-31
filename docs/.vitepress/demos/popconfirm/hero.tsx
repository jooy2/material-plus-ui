import { useState } from 'react';
import { ICONS, MPIcon, MPIconButton, MPPopconfirm, MPTypography } from 'material-plus-ui';

/**
 * A row of delete buttons is the case this exists for.
 *
 * A modal would cover the table and take away the row the reader was pointing
 * at — and having to re-find it afterwards is how the wrong row gets deleted.
 * The question stays where the control is, and the page behind it stays put.
 *
 * Escape and a press outside both count as *no*.
 */
export default function PopconfirmHero() {
  const [rows, setRows] = useState(['Quarterly report', 'Design review', 'Onboarding notes']);

  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      {rows.length === 0 ? (
        <MPTypography level="caption">All gone.</MPTypography>
      ) : (
        rows.map((row) => (
          <div
            key={row}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <MPTypography level="body">{row}</MPTypography>
            <MPPopconfirm
              trigger={
                <MPIconButton
                  icon={<MPIcon icon={ICONS.close} />}
                  label={`Delete ${row}`}
                  color="error"
                />
              }
              title="Delete this row?"
              description="It cannot be undone."
              confirmLabel="Delete"
              color="error"
              onConfirm={() => setRows((all) => all.filter((r) => r !== row))}
            />
          </div>
        ))
      )}
    </div>
  );
}
