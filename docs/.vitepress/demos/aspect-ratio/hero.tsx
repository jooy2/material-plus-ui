import { MPAspectRatio } from 'material-plus-ui';

/**
 * A row of thumbnails is a row of one shape, whatever the pictures in it are.
 *
 * The box reserves the space before the media has arrived, which is what stops a
 * card whose image loads late from reflowing the page around it.
 */
const RATIOS: { ratio: string; label: string }[] = [
  { ratio: '1 / 1', label: '1 / 1' },
  { ratio: '4 / 3', label: '4 / 3' },
  { ratio: '16 / 9', label: '16 / 9' }
];

export default function AspectRatioHero() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
      {RATIOS.map(({ ratio, label }) => (
        <div key={ratio} style={{ display: 'grid', gap: 8 }}>
          <MPAspectRatio ratio={ratio} rounded className="bg-mp-surface-container-highest">
            <div className="text-mp-on-surface-variant text-mp-label-large flex h-full w-full items-center justify-center">
              {label}
            </div>
          </MPAspectRatio>
        </div>
      ))}
    </div>
  );
}
