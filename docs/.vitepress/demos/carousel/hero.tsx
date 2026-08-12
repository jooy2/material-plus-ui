import { MPCarousel } from 'material-plus-ui';

/**
 * A strip of slides, one of which is in view.
 *
 * Try dragging it. Swiping on a phone and two-finger dragging on a trackpad both
 * work, because the mechanism is the browser's own scrolling with CSS snap
 * points rather than a gesture handler pretending to be it.
 */
const SLIDES = [
  { title: 'Namsan', tone: 'var(--_mp-color-primary-container)' },
  { title: 'Bukhansan', tone: 'var(--_mp-color-secondary-container)' },
  { title: 'Gwanaksan', tone: 'var(--_mp-color-tertiary-container)' }
];

export default function CarouselHero() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <MPCarousel label="Mountains">
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 180,
              background: slide.tone,
              color: 'var(--_mp-color-on-surface)'
            }}
          >
            {slide.title}
          </div>
        ))}
      </MPCarousel>
    </div>
  );
}
