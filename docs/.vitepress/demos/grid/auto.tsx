import { useState } from 'react';
import {
  ICONS,
  MPBox,
  MPButton,
  MPGrid,
  MPGridItem,
  MPIcon,
  MPIconButton,
  MPTypography
} from 'material-plus-ui';

/**
 * A player's control bar, which is the layout `span="auto"` is for.
 *
 * How many buttons are on the right is a runtime question — a fullscreen button
 * only where fullscreen is possible, a debug button only for staff — so the
 * group cannot name a share of twelve columns. It names `auto` and is the width
 * of whatever it turned out to hold; the transport controls take the rest with
 * `grow`. Add and remove buttons below and neither side is ever wrong.
 */
const TOOLS = [
  { key: 'settings', icon: ICONS.more, label: 'Settings' },
  { key: 'fullscreen', icon: ICONS.add, label: 'Fullscreen' },
  { key: 'captions', icon: ICONS.code, label: 'Captions' },
  { key: 'debug', icon: ICONS.info, label: 'Debug' }
];

export default function GridAuto() {
  const [shown, setShown] = useState(2);

  return (
    <div style={{ width: '100%' }}>
      <MPBox variant="outlined" className="mb-4">
        <MPGrid spacing={2} alignItems="center">
          <MPGridItem span="grow">
            <MPTypography level="body">A Duck Has an Adventure</MPTypography>
            <MPTypography level="caption">0:42 / 3:15</MPTypography>
          </MPGridItem>

          <MPGridItem span="auto">
            <div className="flex items-center gap-1">
              {TOOLS.slice(0, shown).map((tool) => (
                <MPIconButton
                  key={tool.key}
                  icon={<MPIcon icon={tool.icon} />}
                  label={tool.label}
                  size="sm"
                />
              ))}
            </div>
          </MPGridItem>
        </MPGrid>
      </MPBox>

      <div className="flex gap-2">
        <MPButton
          variant="outlined"
          size="sm"
          disabled={shown === 1}
          onClick={() => setShown(shown - 1)}
        >
          One fewer
        </MPButton>
        <MPButton
          variant="outlined"
          size="sm"
          disabled={shown === TOOLS.length}
          onClick={() => setShown(shown + 1)}
        >
          One more
        </MPButton>
      </div>
    </div>
  );
}
