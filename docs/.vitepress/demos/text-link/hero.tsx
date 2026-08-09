import { MPTextLink } from 'material-plus-ui';

export default function TextLinkHero() {
  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 520, lineHeight: 1.7 }}>
      <p style={{ margin: 0 }}>
        The colour roles are derived from a single source colour — see{' '}
        <MPTextLink href="#">the colour page</MPTextLink> for the whole table.
      </p>
      <p style={{ margin: 0 }}>
        The specification itself is at{' '}
        <MPTextLink href="https://m3.material.io" newTab>
          m3.material.io
        </MPTextLink>
        .
      </p>
      <p style={{ margin: 0 }}>
        <MPTextLink href="#" color="primary" underline="hover" size="sm">
          A link that stands on its own
        </MPTextLink>
      </p>
    </div>
  );
}
