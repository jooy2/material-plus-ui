import { MPBox, MPTypography } from 'material-plus-ui';

/**
 * The plainest surface in the library: it groups things, and that is all.
 *
 * Everything structural — a heading, a footer, dividers, a picture across the
 * top — belongs to Card, which is this box with those sections laid out on it.
 */
export default function BoxHero() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 420 }}>
      <MPBox>
        <MPTypography level="body">
          A sheet with content on it. No heading, no footer, no rule about what goes inside.
        </MPTypography>
      </MPBox>

      <MPBox variant="elevated">
        <MPTypography level="body">
          The same box, separated from the page by a shadow instead of a hairline.
        </MPTypography>
      </MPBox>
    </div>
  );
}
