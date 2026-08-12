import { useState } from 'react';
import { MPCarousel, MPChip, MPTypography } from 'material-plus-ui';

/**
 * Driven from outside, and read back from outside.
 *
 * `onValueChange` fires for every way the index can move — an arrow, a mark, a
 * drag that settled on a new snap point — so a caption beside the frame stays in
 * step with a gesture nobody wrote a handler for.
 */
const CITIES = ['Seoul', 'Busan', 'Jeju'];

export default function CarouselControlled() {
  const [index, setIndex] = useState(0);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CITIES.map((city, cityIndex) => (
          <MPChip key={city} selected={cityIndex === index} onClick={() => setIndex(cityIndex)}>
            {city}
          </MPChip>
        ))}
      </div>

      <MPCarousel
        value={index}
        onValueChange={setIndex}
        loop={false}
        variant="filled"
        label="Cities"
      >
        {CITIES.map((city) => (
          <div
            key={city}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 140
            }}
          >
            <MPTypography level="h4">{city}</MPTypography>
          </div>
        ))}
      </MPCarousel>
    </div>
  );
}
