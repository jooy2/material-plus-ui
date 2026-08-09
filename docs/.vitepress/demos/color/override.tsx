import { MPTextField } from 'material-plus-ui';
import { DEFAULT_LOCALE, type Locale } from '../../data/i18n';

/**
 * The three levels of control, side by side and all resolved live.
 *
 * Each panel is the same markup with one attribute's worth of difference, which
 * is the point: none of them is a provider, a theme object or a re-render.
 */
const CAPTIONS = {
  derived: {
    ko: '아무것도 지정하지 않음 — 기본 소스 색상에서 파생',
    en: 'Nothing set — derived from the default source colour'
  },
  source: {
    ko: '--mp-source-color 만 지정 — 모든 롤이 따라옴',
    en: 'Only --mp-source-color — every role follows'
  },
  role: {
    ko: '--mp-sys-color-primary 만 지정 — 그 롤만 바뀜',
    en: 'Only --mp-sys-color-primary — that one role changes'
  }
} as const;

function Panel({ caption, style }: { caption: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'grid', gap: 8, ...style }}>
      <small className="text-mp-on-surface-variant">
        <code>{caption}</code>
      </small>
      {/* Focused-looking without needing focus: the ring and label take
          `primary`, which is the role all three panels differ in. */}
      <div
        style={{
          border: '2px solid var(--color-mp-primary)',
          borderRadius: 'var(--mp-sys-shape-corner-extra-small)',
          padding: '14px 16px',
          color: 'var(--color-mp-primary)',
          fontSize: 14
        }}
      >
        primary
      </div>
      <MPTextField label="At rest" value="hello@example.com" fullWidth />
    </div>
  );
}

export default function ColorOverride({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
      <Panel caption={CAPTIONS.derived[locale]} />
      <Panel
        caption={CAPTIONS.source[locale]}
        style={{ '--mp-source-color': '#8f4c38' } as React.CSSProperties}
      />
      <Panel
        caption={CAPTIONS.role[locale]}
        style={{ '--mp-sys-color-primary': '#00696d' } as React.CSSProperties}
      />
    </div>
  );
}
