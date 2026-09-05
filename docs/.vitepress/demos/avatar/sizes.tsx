import { MPAvatar } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

const SIZES: MPSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export default function AvatarSizes() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        {SIZES.map((size) => (
          <MPAvatar
            key={size}
            size={size}
            src="/samples/people/helen-voss.webp"
            name="Helen Voss"
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        {SIZES.map((size) => (
          <MPAvatar key={size} size={size} name="Jane Doe" />
        ))}
      </div>
    </div>
  );
}
