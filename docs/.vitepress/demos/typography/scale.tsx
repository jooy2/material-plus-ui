import { MPTypography } from 'material-plus-ui';
import type { MPTypographyLevel } from 'material-plus-ui';

const ROLES: Array<[MPTypographyLevel, string]> = [
  ['h1', 'display-small'],
  ['h2', 'headline-large'],
  ['h3', 'headline-medium'],
  ['h4', 'headline-small'],
  ['h5', 'title-large'],
  ['h6', 'title-medium'],
  ['lead', 'title-large'],
  ['body', 'body-large'],
  ['caption', 'body-small'],
  ['overline', 'label-small']
];

export default function TypographyScale() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      {ROLES.map(([level, role]) => (
        <div key={level} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <code style={{ width: 72, flexShrink: 0, fontSize: 12, opacity: 0.7 }}>{level}</code>
          <MPTypography level={level} lines={1}>
            {role}
          </MPTypography>
        </div>
      ))}
    </div>
  );
}
