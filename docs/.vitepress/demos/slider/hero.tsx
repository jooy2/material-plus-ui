import { useState } from 'react';
import { MPSlider } from 'material-plus-ui';

export default function SliderHero() {
  const [volume, setVolume] = useState<number | number[]>(40);

  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <MPSlider label="Volume" showValue value={volume} onValueChange={setVolume} />
    </div>
  );
}
