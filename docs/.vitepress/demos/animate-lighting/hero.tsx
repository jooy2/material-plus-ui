import { MPAnimateLighting, MPCard, MPTypography } from 'material-plus-ui';

/**
 * The light is **behind** the content rather than on it, so what a reader sees
 * is a glow escaping from under the edges. Nothing inside is altered, nothing
 * is overlaid, and the card stays exactly as legible as it was.
 *
 * Two things it needs from the content: a `size` that agrees with its radius,
 * since the glow follows the wrapper's own corners — and a surface of its own.
 * "Behind" only reads as behind if there is something opaque in front of it, so
 * this card is `elevated` rather than the default `outlined`, which paints no
 * background at all.
 */
export default function AnimateLightingHero() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 380 }}>
      <MPAnimateLighting size="md">
        <MPCard variant="elevated" title="Recommended" subtitle="Team · ₩29,000 / month">
          <MPTypography level="body">
            Marking the one thing on a screen that is currently live, with light rather than by
            moving anything.
          </MPTypography>
        </MPCard>
      </MPAnimateLighting>
    </div>
  );
}
