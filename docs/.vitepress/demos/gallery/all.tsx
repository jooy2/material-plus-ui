import { useState, type ReactNode } from 'react';
import { MPIcon, MPTextField, ICONS } from 'material-plus-ui';
import { DEFAULT_LOCALE, type Locale } from '../../data/i18n';

/**
 * Every component, with a working one inside each card.
 *
 * The preview is not a picture. It is the component, rendered from `src/`, in
 * whichever scheme the frame's switch is set to — which is the whole reason this
 * page is a demo rather than a table of links.
 *
 * Adding a component means adding an entry here. It is step 10 of the checklist
 * in `docs/{locale}/design/prop-conventions.md`, and the reason it is on the
 * checklist at all is that a component missing from this page is invisible: the
 * index would still list it, but nobody would see what it looks like without
 * clicking through.
 *
 * A preview that needs state needs a component of its own, because a hook cannot
 * live in the array.
 */
type Text = Record<Locale, string>;

interface Entry {
  name: string;
  summary: Text;
  /** Appended to the locale's base path. */
  path: string;
  preview: ReactNode;
}

interface Group {
  title: Text;
  note: Text;
  entries: Entry[];
}

/** The field is controlled, so its card is a component rather than an element. */
function TextFieldPreview() {
  const [value, setValue] = useState('');

  return (
    <MPTextField
      label="Email"
      type="email"
      placeholder="you@example.com"
      value={value}
      onChange={setValue}
      startIcon={<MPIcon icon={ICONS.search} size={18} />}
      fullWidth
    />
  );
}

const GROUPS: Group[] = [
  {
    title: { ko: '입력', en: 'Inputs' },
    note: {
      ko: '값을 받는 컨트롤. 라벨과 유효성 배선이 이미 조립되어 있습니다.',
      en: 'Controls that collect a value, with the labelling and validity already assembled.'
    },
    entries: [
      {
        name: 'MPTextField',
        summary: {
          ko: 'IME를 견디는 outlined 텍스트 필드',
          en: 'An outlined text field that survives an IME'
        },
        path: '/components/inputs/text-field',
        preview: (
          <div style={{ width: '100%', maxWidth: 260 }}>
            <TextFieldPreview />
          </div>
        )
      }
    ]
  },
  {
    title: { ko: '표시', en: 'Display' },
    note: {
      ko: '내용을 보여주는 컴포넌트.',
      en: 'Components that show something rather than collect it.'
    },
    entries: [
      {
        name: 'MPIcon',
        summary: {
          ko: '아는 크기와 아는 색의 글리프',
          en: 'A glyph at a known size, in a known colour'
        },
        path: '/components/display/icon',
        preview: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <MPIcon icon={ICONS.search} size={22} color="var(--color-mp-primary)" label="Search" />
            <MPIcon icon={ICONS.info} size={26} color="var(--color-mp-on-surface)" label="Info" />
            <MPIcon icon={ICONS.error} size={30} color="var(--color-mp-error)" label="Failed" />
          </div>
        )
      }
    ]
  }
];

function EntryCard({ entry, locale, base }: { entry: Entry; locale: Locale; base: string }) {
  return (
    <a href={`${base}${entry.path}`} className="mp-gallery-card">
      <div className="mp-gallery-preview">{entry.preview}</div>
      <div className="mp-gallery-meta">
        <span className="mp-gallery-name">{entry.name}</span>
        <span className="mp-gallery-summary">{entry.summary[locale]}</span>
      </div>
    </a>
  );
}

export default function AllComponents({
  locale = DEFAULT_LOCALE,
  base = ''
}: {
  locale?: Locale;
  /** URL prefix of the locale this page is in — `''` at the root, `/ko` otherwise. */
  base?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {GROUPS.map((group) => (
        <section key={group.title.en} className="mp-gallery-group">
          <div className="mp-gallery-heading">
            <span className="mp-gallery-title">{group.title[locale]}</span>
            <span className="mp-gallery-note">{group.note[locale]}</span>
          </div>
          <div className="mp-gallery-grid">
            {group.entries.map((entry) => (
              <EntryCard key={entry.name} entry={entry} locale={locale} base={base} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
