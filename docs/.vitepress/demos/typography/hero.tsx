import { MPTypography } from 'material-plus-ui';

export default function TypographyHero() {
  return (
    <div style={{ display: 'grid', gap: 8, width: '100%', maxWidth: 560 }}>
      <MPTypography level="overline">Release notes</MPTypography>
      <MPTypography level="h2">Material Plus 1.0</MPTypography>
      <MPTypography level="lead">
        The components other Material libraries do not ship, and wider versions of the ones they do.
      </MPTypography>
      <MPTypography>
        Every level below is one of MD3’s own type roles, at the specification’s size, leading,
        tracking and weight.
      </MPTypography>
      <MPTypography level="caption">Published 9 August 2026</MPTypography>
    </div>
  );
}
