import { MPAvatar, MPAvatarGroup } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

const SIZES: MPSize[] = ['xs', 'sm', 'md', 'lg'];
const TEAM = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];

/**
 * `size`, `shape`, `variant` and `color` are set once on the group rather than
 * on every avatar — a stack whose fourth face is a rung out is not a stack.
 *
 * An avatar's own prop still wins, which is what lets one of them be marked out
 * from the rest.
 */
export default function AvatarGroupSizes() {
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      {SIZES.map((size) => (
        <MPAvatarGroup key={size} size={size} max={3} total={8}>
          {TEAM.map((name) => (
            <MPAvatar key={name} name={name} />
          ))}
        </MPAvatarGroup>
      ))}

      <MPAvatarGroup color="tertiary" shape="square">
        <MPAvatar name="Ada Lovelace" />
        <MPAvatar name="Alan Turing" />
        {/* One face marked out from the rest. */}
        <MPAvatar name="Grace Hopper" variant="filled" color="error" />
      </MPAvatarGroup>
    </div>
  );
}
