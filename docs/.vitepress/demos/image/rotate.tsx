import { useState } from 'react';
import { MPImage, MPSegmentedButton } from 'material-plus-ui';
import type { MPImageFlip, MPImageRotate } from 'material-plus-ui';

const TURNS: MPImageRotate[] = [0, 90, 180, 270];
const FLIPS: MPImageFlip[] = ['none', 'horizontal', 'vertical', 'both'];

/**
 * A landscape photograph turned a quarter at a time, and mirrored.
 *
 * `width` and `height` are the thumbnail's own size, so the box already has the
 * turned shape before the file arrives: 480 × 320 on its side is 2 wide by 3
 * tall. The mirror follows the screen, so `horizontal` moves the boat to the
 * other side whichever way the picture is turned. Press the picture to open the
 * full-size file, turned and mirrored the same way.
 */
export default function ImageRotate() {
  const [turn, setTurn] = useState<string[]>(['90']);
  const [mirror, setMirror] = useState<string[]>(['none']);
  const rotate = Number(turn[0] ?? 0) as MPImageRotate;
  const flip = (mirror[0] ?? 'none') as MPImageFlip;

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <MPSegmentedButton
        aria-label="Rotate"
        size="sm"
        value={turn}
        onValueChange={setTurn}
        items={TURNS.map((degrees) => ({ value: String(degrees), label: `${degrees}°` }))}
      />
      <MPSegmentedButton
        aria-label="Flip"
        size="sm"
        value={mirror}
        onValueChange={setMirror}
        items={FLIPS.map((name) => ({ value: name, label: name }))}
      />
      <div style={{ width: 240 }}>
        <MPImage
          src="/samples/photos/thumbs/rowboat-misty-pond-sunrise.webp"
          previewSrc="/samples/photos/rowboat-misty-pond-sunrise.webp"
          alt="A rowboat on a still pond in morning mist"
          width={480}
          height={320}
          rotate={rotate}
          flip={flip}
          preview
        />
      </div>
    </div>
  );
}
