import { useState } from 'react';
import { ICONS, MPIcon, MPIconButton, MPPill, MPProgressCircular } from 'material-plus-ui';

/**
 * A lozenge holding a small amount of live information — the state a page has
 * that is not about any one control.
 *
 * Press the middle to open its details. The pill grows downward into them rather
 * than swapping to another shape, and the corner morphs from `corner-full` to
 * `corner-extra-large` on the way: a stadium corner on a box six lines tall eats
 * the first two words of every line.
 */
export default function PillHero() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 }}>
      <MPPill
        title="On a call"
        description="04:12"
        startIcon={<MPIcon icon={ICONS.clock} />}
        endIcon={
          <MPIconButton
            size="xs"
            variant="text"
            icon={<MPIcon icon={ICONS.close} />}
            label="Hang up"
          />
        }
        expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        details="Ada, Grace and two others. Muted for the last minute."
      />

      <MPPill
        variant="tonal"
        color="primary"
        title="Uploading"
        description="3 of 8"
        startIcon={<MPProgressCircular size="xs" />}
      />
    </div>
  );
}
