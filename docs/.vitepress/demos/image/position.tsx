import { MPImage } from 'material-plus-ui';
import type { MPImagePosition } from 'material-plus-ui';

const POSITIONS: MPImagePosition[] = ['top', 'center', 'bottom'];

/**
 * A tall photograph in a short box, cropped three ways.
 *
 * `cover` fills the box and cuts off the rest, and `position` chooses what is
 * kept: the wet stones at the top, the umbrella in the middle, or its handle at
 * the bottom.
 */
export default function ImagePosition() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
      {POSITIONS.map((position) => (
        <div key={position} style={{ display: 'grid', gap: 8 }}>
          <MPImage
            src="/samples/photos/thumbs/red-umbrella-autumn-path.webp"
            alt="A red umbrella lying closed on a wet stone path among autumn leaves"
            height={140}
            position={position}
          />
          <small className="text-mp-on-surface-variant">
            <code>{position}</code>
          </small>
        </div>
      ))}
    </div>
  );
}
