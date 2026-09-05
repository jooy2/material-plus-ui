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
 * over a scrim. What it opens is `previewSrc`, the full-size file; the page
 * itself only ever paid for the thumbnail in `src`.
 */
export default function ImageHero() {
  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <MPTypography level="overline">loaded — and previewable</MPTypography>
        <MPImage
          src="/samples/photos/thumbs/alpine-lake-dawn.webp"
          previewSrc="/samples/photos/alpine-lake-dawn.webp"
          alt="A still lake below a low sun, with snow on the peaks behind it"
          ratio="16 / 9"
          preview
        />
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
