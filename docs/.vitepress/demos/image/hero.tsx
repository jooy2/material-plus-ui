import { MPImage, MPTypography } from 'material-plus-ui';

/**
 * The three states an `<img>` has, and the two it shows badly on its own.
 *
 * The first is a real picture. The second points at a file that is not there —
 * a bare `<img>` would draw the browser's own broken-image mark here, which is
 * different in every browser and belongs to none of them.
 *
 * `ratio` is what reserves the room: both boxes are 16 / 9 before anything has
 * arrived, so nothing on the page moves when it does.
 *
 * Press the first one — `preview` makes the box a button and opens the picture
 * over a scrim.
 */
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#00639b"/><stop offset="1" stop-color="#7fc4e8"/>
       </linearGradient></defs>
       <rect width="320" height="180" fill="url(#g)"/>
       <circle cx="250" cy="48" r="22" fill="#fff" opacity="0.85"/>
       <path d="M0 150 L90 96 L160 132 L240 84 L320 128 L320 180 L0 180 Z" fill="#0b3d5c" opacity="0.75"/>
     </svg>`
  );

export default function ImageHero() {
  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <MPTypography level="overline">loaded — and previewable</MPTypography>
        <MPImage src={PHOTO} alt="A lake below a low sun" ratio="16 / 9" preview />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <MPTypography level="overline">failed</MPTypography>
        <MPImage
          src="/this-file-does-not-exist.png"
          alt="A photo that never arrived"
          ratio="16 / 9"
        />
      </div>
    </div>
  );
}
