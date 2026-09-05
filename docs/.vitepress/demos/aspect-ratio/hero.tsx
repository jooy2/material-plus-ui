import { MPAspectRatio } from 'material-plus-ui';

/**
 * A row of thumbnails is a row of one shape, whatever the pictures in it are.
 *
 * The box reserves the space before the media has arrived, which is what stops a
 * card whose image loads late from reflowing the page around it. All three
 * pictures below are different proportions; the boxes are not.
 */
const THUMBNAILS: { ratio: string; label: string; src: string; alt: string }[] = [
  {
    ratio: '1 / 1',
    label: '1 / 1',
    src: '/samples/photos/thumbs/misty-tea-terraces-sunrise.webp',
    alt: 'Tea terraces under a low sun'
  },
  {
    ratio: '4 / 3',
    label: '4 / 3',
    src: '/samples/photos/thumbs/red-umbrella-autumn-path.webp',
    alt: 'A red umbrella left open on a wet path of autumn leaves'
  },
  {
    ratio: '16 / 9',
    label: '16 / 9',
    src: '/samples/photos/thumbs/snowy-cabin-frozen-stream.webp',
    alt: 'A cabin in snow beside a frozen stream'
  }
];

export default function AspectRatioHero() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
      {THUMBNAILS.map(({ ratio, label, src, alt }) => (
        <div key={ratio} style={{ display: 'grid', gap: 8 }}>
          <MPAspectRatio
            ratio={ratio}
            fit="cover"
            rounded
            className="bg-mp-surface-container-highest"
          >
            <img src={src} alt={alt} />
          </MPAspectRatio>
          <small className="text-mp-on-surface-variant">
            <code>{label}</code>
          </small>
        </div>
      ))}
    </div>
  );
}
