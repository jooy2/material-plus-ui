import { useState } from 'react';
import { MPButton, MPImage } from 'material-plus-ui';

const PHOTO = '/samples/photos/forest-trail-sunbeams.webp';

/**
 * A 24px copy of the photograph stands in, blurred, while the full file loads.
 *
 * The copy is 220 bytes. Press the button to load the photograph again under a
 * new URL, so the browser has to fetch it and the stand-in stays on screen until
 * it arrives. On a fast connection that is a moment; throttling the network in
 * the browser's developer tools makes it longer.
 */
export default function ImagePlaceholder() {
  const [load, setLoad] = useState(0);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start', width: '100%' }}>
      <MPButton size="sm" variant="tonal" onClick={() => setLoad((count) => count + 1)}>
        Load again
      </MPButton>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <MPImage
          src={`${PHOTO}?load=${load}`}
          alt="A dirt trail through a forest of tall trees, with sunlight between the trunks"
          ratio="3 / 2"
          placeholder={{ src: '/samples/photos/tiny/forest-trail-sunbeams.webp', blur: true }}
        />
      </div>
    </div>
  );
}
