import { MPBlockquote } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/**
 * The quote's type scale, and every rung is one of MD3's own roles.
 *
 * `md` is `title-large` — 22px at weight 400, the specification's largest role
 * that is not a heading, and exactly what a pull quote is. The leading is the
 * role's, so a quote that runs to four lines gets the air a paragraph needs
 * rather than a title's tight 1.27.
 */
const SIZES: { size: MPSize; role: string }[] = [
  { size: 'xs', role: 'body-medium' },
  { size: 'sm', role: 'body-large' },
  { size: 'md', role: 'title-large — the default' },
  { size: 'lg', role: 'headline-small' },
  { size: 'xl', role: 'headline-medium' }
];

export default function BlockquoteSizes() {
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 560 }}>
      {SIZES.map(({ size, role }) => (
        <MPBlockquote key={size} size={size} icon={false} source={role}>
          Simplicity is about subtracting the obvious.
        </MPBlockquote>
      ))}
    </div>
  );
}
