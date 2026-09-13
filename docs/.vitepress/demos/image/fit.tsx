import { useState } from 'react';
import { MPImage, MPSegmentedButton } from 'material-plus-ui';
import type { MPImageFit } from 'material-plus-ui';

const FITS: MPImageFit[] = ['cover', 'contain', 'fill', 'none', 'scale-down'];

/**
 * A box with a fixed height, and the five things the picture can do in it.
 *
 * `height` alone sizes the box, which is as wide as the demo. The file is
 * 480 × 320 and the box is 360 pixels tall, so `contain` enlarges the picture to
 * fill the height and `scale-down` leaves it at its own size. The surface behind
 * it shows the room each fit leaves.
 */
export default function ImageFit() {
  const [choice, setChoice] = useState<string[]>(['contain']);
  const fit = (choice[0] ?? 'cover') as MPImageFit;

  return (
    <div style={{ display: 'grid', gap: 16, width: '100%' }}>
      <MPSegmentedButton
        aria-label="Fit"
        size="sm"
        value={choice}
        onValueChange={setChoice}
        items={FITS.map((name) => ({ value: name, label: name }))}
      />
      <MPImage
        src="/samples/photos/thumbs/lakeside-observatory-blue-hour.webp"
        alt="A small lit observatory on the shore of a mountain lake at dusk"
        height={360}
        fit={fit}
        className="bg-mp-surface-container-highest"
      />
    </div>
  );
}
