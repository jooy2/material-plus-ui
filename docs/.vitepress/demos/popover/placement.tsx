import { MPButton, MPPopover } from 'material-plus-ui';
import type { MPSide } from 'material-plus-ui';

/**
 * `side` and `align`, and the one thing neither of them promises.
 *
 * Base UI flips the popup to the opposite edge when there is no room for it —
 * scroll the frame until one of these runs out of space and watch it move. That
 * is the right behaviour, and it is why `side` is a preference rather than an
 * instruction.
 */
const SIDES: MPSide[] = ['top', 'right', 'bottom', 'left'];

export default function PopoverPlacement() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {SIDES.map((side) => (
        <MPPopover
          key={side}
          side={side}
          arrow
          size="xs"
          trigger={<MPButton variant="outlined">{side}</MPButton>}
        >
          Anchored to the {side} edge.
        </MPPopover>
      ))}
    </div>
  );
}
