import { useEffect, useRef, useState } from 'react';
import { DEFAULT_LOCALE, type Locale } from '../../data/i18n';

/**
 * Every colour role, with the value the browser actually resolved it to.
 *
 * Unlike the other demos this one is documentation rather than a code sample, so
 * it takes the locale `Demo.vue` passes in and localises its own copy.
 *
 * The values are read back from the DOM rather than written out here. Every role
 * is an `oklch(from …)` expression over a source colour, so the declared value
 * says nothing a reader can use — and a hardcoded table is a table that goes
 * stale the first time `src/styles.css` is touched. Reading the computed value
 * means this page cannot disagree with the stylesheet.
 *
 * Both schemes are measured at once, from two probe elements, so the table shows
 * light and dark side by side rather than only whichever one the page is in.
 */
const ROLES = [
  {
    key: 'primary',
    tone: { ko: 'primary 40 / 80', en: 'primary 40 / 80' },
    use: {
      ko: '포커스된 외곽선, 캐럿, 포커스된 라벨',
      en: 'A focused outline, the caret, a focused label'
    }
  },
  {
    key: 'on-surface',
    tone: { ko: 'neutral 10 / 90', en: 'neutral 10 / 90' },
    use: {
      ko: '입력 텍스트, hover 외곽선, disabled 기준색',
      en: 'Input text, a hovered outline, the disabled base'
    }
  },
  {
    key: 'on-surface-variant',
    tone: { ko: 'neutral-variant 30 / 80', en: 'neutral-variant 30 / 80' },
    use: {
      ko: '라벨, 보조 텍스트, 앞·뒤 아이콘',
      en: 'Labels, supporting text, leading and trailing icons'
    }
  },
  {
    key: 'outline',
    tone: { ko: 'neutral-variant 50 / 60', en: 'neutral-variant 50 / 60' },
    use: { ko: '평상시 외곽선', en: 'An outline at rest' }
  },
  {
    key: 'error',
    tone: { ko: 'error 40 / 80 (고정 hue)', en: 'error 40 / 80 (fixed hue)' },
    use: { ko: '오류 상태의 모든 것', en: 'Everything in the error state' }
  }
] as const;

const TEXT = {
  role: { ko: '롤', en: 'Role' },
  light: { ko: '라이트', en: 'Light' },
  dark: { ko: '다크', en: 'Dark' },
  tone: { ko: '톤', en: 'Tone' },
  use: { ko: '쓰이는 곳', en: 'Where it is used' },
  source: { ko: '소스 색상', en: 'Source colour' }
} as const;

/** A resolved colour, as the browser reports it and as sRGB hex. */
interface Resolved {
  raw: string;
  hex: string;
}

/**
 * `getComputedStyle` gives back the `oklch()` it was told, not an sRGB value, so
 * the hex is produced by letting the browser itself convert: paint the colour
 * onto a canvas and read the pixel. That keeps the conversion the browser's
 * rather than a second implementation of OKLab in this file.
 */
function toHex(raw: string, canvas: HTMLCanvasElement): string {
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    return '';
  }

  context.clearRect(0, 0, 1, 1);
  context.fillStyle = raw;
  context.fillRect(0, 0, 1, 1);

  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;

  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export default function ColorPalette({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const lightProbe = useRef<HTMLDivElement>(null);
  const darkProbe = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<{ light: Resolved; dark: Resolved }[]>([]);
  const [source, setSource] = useState('');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    function read(probe: HTMLElement, role: string): Resolved {
      const cell = probe.querySelector<HTMLElement>(`[data-role='${role}']`)!;
      const raw = getComputedStyle(cell).backgroundColor;

      return { raw, hex: toHex(raw, canvas) };
    }

    setSource(getComputedStyle(lightProbe.current!).getPropertyValue('--mp-source-color').trim());
    setRows(
      ROLES.map(({ key }) => ({
        light: read(lightProbe.current!, key),
        dark: read(darkProbe.current!, key)
      }))
    );
  }, []);

  /* Off-screen, and measured rather than shown. Both schemes have to exist in
     the document at the same time for the table to hold both columns. */
  const probe = (scheme: 'light' | 'dark', ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      data-mp-scheme={scheme}
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      {ROLES.map(({ key }) => (
        <div key={key} data-role={key} style={{ background: `var(--color-mp-${key})` }} />
      ))}
    </div>
  );

  const swatch = (value: Resolved, scheme: 'light' | 'dark') => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          flexShrink: 0,
          background: value.raw,
          outline: '1px solid var(--vp-c-divider)',
          outlineOffset: -1
        }}
      />
      <code style={{ fontSize: '0.75rem' }}>{value.hex}</code>
      <span className="mp-scheme-tag">{TEXT[scheme][locale]}</span>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {probe('light', lightProbe)}
      {probe('dark', darkProbe)}

      <p style={{ marginBottom: 12, fontSize: '0.8125rem', color: 'var(--vp-c-text-2)' }}>
        {TEXT.source[locale]}: <code>{source}</code>
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="mp-palette">
          <thead>
            <tr>
              <th>{TEXT.role[locale]}</th>
              <th>{TEXT.light[locale]}</th>
              <th>{TEXT.dark[locale]}</th>
              <th>{TEXT.tone[locale]}</th>
              <th>{TEXT.use[locale]}</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, i) => (
              <tr key={role.key}>
                <td>
                  <code>{role.key}</code>
                </td>
                <td>{rows[i] ? swatch(rows[i].light, 'light') : null}</td>
                <td>{rows[i] ? swatch(rows[i].dark, 'dark') : null}</td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{role.tone[locale]}</td>
                <td style={{ fontSize: '0.8125rem' }}>{role.use[locale]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
