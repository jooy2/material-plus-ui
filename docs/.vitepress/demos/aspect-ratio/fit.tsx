import { MPAspectRatio } from 'material-plus-ui';
import type { MPAspectFit } from 'material-plus-ui';

/**
 * The same picture in the same box, fitted four ways.
 *
 * `fit` is the one convenience the component adds on top of the proportion: the
 * media is stretched to the box and *then* fitted, which is the pair of
 * declarations every use of this would otherwise start with.
 *
 * The values are `object-fit`'s own words rather than a nicer set, so there is
 * nothing to look up.
 */
const FITS: MPAspectFit[] = ['cover', 'contain', 'fill', 'none'];

/** A portrait photo in a landscape box, so the four are actually different. */
const PHOTO = '/samples/photos/thumbs/red-umbrella-autumn-path.webp';

export default function AspectRatioFit() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(4, 1fr)', width: '100%' }}>
      {FITS.map((fit) => (
        <div key={fit} style={{ display: 'grid', gap: 8 }}>
          <MPAspectRatio
            ratio="4 / 3"
            fit={fit}
            rounded
            className="bg-mp-surface-container-highest"
          >
            <img src={PHOTO} alt="" />
          </MPAspectRatio>
          <small className="text-mp-on-surface-variant">
            <code>{fit}</code>
          </small>
        </div>
      ))}
    </div>
  );
}
