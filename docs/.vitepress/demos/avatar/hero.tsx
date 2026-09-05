import { MPAvatar } from 'material-plus-ui';

/**
 * A picture where there is one, and whatever stands in for it where there is
 * not. The fourth points at a file that is not there — the case a bare `<img>`
 * draws a broken mark for — and the last four never had a `src` to lose.
 */
export default function AvatarHero() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
      <MPAvatar src="/samples/people/anya-sol.webp" name="Anya Sol" />
      <MPAvatar src="/samples/people/lucas-adebayo.webp" name="Lucas Adebayo" />
      <MPAvatar src="/samples/people/noa-marin.webp" name="Noa Marin" shape="square" />
      <MPAvatar src="/this-file-does-not-exist.png" name="Farah Wells" color="tertiary" />
      <MPAvatar name="홍길동" color="tertiary" />
      <MPAvatar name="Ada Lovelace" variant="filled" color="secondary" />
      <MPAvatar shape="square" variant="outlined" initials="MP" />
      <MPAvatar />
    </div>
  );
}
