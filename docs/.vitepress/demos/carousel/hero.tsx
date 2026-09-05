import { MPCarousel } from 'material-plus-ui';

/**
 * A strip of slides, one of which is in view.
 *
 * Try dragging it. Swiping on a phone and two-finger dragging on a trackpad both
 * work, because the mechanism is the browser's own scrolling with CSS snap
 * points rather than a gesture handler pretending to be it.
 */
const SLIDES = [
  {
    src: '/samples/photos/thumbs/forest-trail-sunbeams.webp',
    alt: 'A path through tall trees with sunbeams coming down between them'
  },
  {
    src: '/samples/photos/thumbs/lakeside-observatory-blue-hour.webp',
    alt: 'A small observatory beside a lake at dusk'
  },
  {
    src: '/samples/photos/thumbs/snowy-cabin-frozen-stream.webp',
    alt: 'A cabin in snow beside a frozen stream'
  }
];

export default function CarouselHero() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <MPCarousel label="Trails">
        {SLIDES.map((slide) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }}
          />
        ))}
      </MPCarousel>
    </div>
  );
}
