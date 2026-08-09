import { MPAvatar } from 'material-plus-ui';

export default function AvatarHero() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
      <MPAvatar name="Jane Doe" />
      <MPAvatar name="홍길동" color="tertiary" />
      <MPAvatar name="Ada Lovelace" variant="filled" color="secondary" />
      <MPAvatar shape="square" variant="outlined" initials="MP" />
      <MPAvatar />
    </div>
  );
}
