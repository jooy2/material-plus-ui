import { MPImage } from 'material-plus-ui';

const LETTERBOXES = ['none', 'var(--color-mp-surface-container-highest)', 'blur'];

/**
 * A portrait photograph in a landscape box, with `fit="contain"` leaving room
 * on both sides, and three ways of filling that room.
 *
 * `none` leaves whatever is behind the box. A colour, a custom property or a
 * gradient is painted behind the picture. `blur` draws the picture again behind
 * itself, covering the box and blurred, from the same request as the picture.
 */
export default function ImageLetterbox() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
      {LETTERBOXES.map((letterbox) => (
        <div key={letterbox} style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
          <MPImage
            src="/samples/photos/thumbs/red-umbrella-autumn-path.webp"
            alt="A red umbrella lying closed on a wet stone path among autumn leaves"
            ratio="4 / 3"
            fit="contain"
            letterbox={letterbox}
          />
          <small className="text-mp-on-surface-variant" style={{ overflowWrap: 'anywhere' }}>
            <code>{letterbox}</code>
          </small>
        </div>
      ))}
    </div>
  );
}
