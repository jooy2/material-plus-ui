import { MPAvatar, MPAvatarGroup, MPTypography } from 'material-plus-ui';

const TEAM = [
  'Ada Lovelace',
  'Alan Turing',
  'Grace Hopper',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Radia Perlman'
];

/**
 * A stack of avatars, with the ones that did not fit as a count.
 *
 * The ring is not decoration: two circles of similar tone laid over each other
 * have no edge between them at all, and the stack reads as one smeared shape. It
 * is drawn in the page's own `surface`, so what separates the faces is the
 * background showing through rather than a white line on top of them.
 */
export default function AvatarGroupHero() {
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'center' }}>
      <MPAvatarGroup max={4} total={TEAM.length}>
        {TEAM.slice(0, 4).map((name) => (
          <MPAvatar key={name} name={name} />
        ))}
      </MPAvatarGroup>

      <MPTypography level="caption">
        Four drawn, {TEAM.length} altogether — `total` is what makes the count right when the group
        was handed only the first few.
      </MPTypography>
    </div>
  );
}
