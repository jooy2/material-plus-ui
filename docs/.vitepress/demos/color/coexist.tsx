import { MPTextField } from 'material-plus-ui';
import { DEFAULT_LOCALE, type Locale } from '../../data/i18n';

/**
 * What happens when the page already defines Material's own tokens.
 *
 * The right-hand panel sets `--md-sys-color-primary` and `--md-sys-color-outline`
 * the way a project running Material Web already would, and sets a source colour
 * as well. The two pinned roles are taken as given; everything else keeps
 * deriving. That mix is the normal case, not a special one.
 */
const CAPTIONS = {
  plain: { ko: '페이지에 MD3 토큰이 없음', en: 'No MD3 tokens on the page' },
  coexist: {
    ko: '--md-sys-color-primary·outline 이 이미 있음',
    en: '--md-sys-color-primary and outline already present'
  }
} as const;

function Panel({ caption, style }: { caption: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'grid', gap: 10, ...style }}>
      <small className="text-mp-on-surface-variant">
        <code>{caption}</code>
      </small>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['primary', 'outline', 'on-surface-variant', 'error'] as const).map((role) => (
          <span
            key={role}
            title={role}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 6,
              background: `var(--color-mp-${role})`,
              outline: '1px solid var(--vp-c-divider)',
              outlineOffset: -1
            }}
          />
        ))}
      </div>
      <MPTextField label="At rest" value="hello@example.com" fullWidth />
    </div>
  );
}

export default function ColorCoexist({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      <Panel
        caption={CAPTIONS.plain[locale]}
        style={{ '--mp-source-color': '#00696d' } as React.CSSProperties}
      />
      <Panel
        caption={CAPTIONS.coexist[locale]}
        style={
          {
            '--mp-source-color': '#00696d',
            '--md-sys-color-primary': '#b3261e',
            '--md-sys-color-outline': '#79747e'
          } as React.CSSProperties
        }
      />
    </div>
  );
}
