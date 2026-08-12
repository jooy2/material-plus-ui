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

/** A tall gradient, so the difference between the four is actually visible. */
const PHOTO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231976d2'/><stop offset='1' stop-color='%239c27b0'/></linearGradient></defs><rect width='80' height='200' fill='url(%23g)'/></svg>";

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
