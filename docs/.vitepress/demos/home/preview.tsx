import { useState, type ReactNode } from 'react';
import {
  ICONS,
  MPAlert,
  MPButton,
  MPDataTable,
  MPDatePicker,
  MPIcon,
  MPLineChart,
  MPTextField
} from 'material-plus-ui';
import { DEFAULT_LOCALE, type Locale } from '../../data/i18n';

/**
 * Six components on the front page, running rather than pictured.
 *
 * The all-components grid is the inventory; this is the sample, so it is chosen
 * for spread rather than for importance — a field, a button, a picker, a chart,
 * a message and a table. Four of the six are things a Material library is not
 * expected to ship, which is the argument the page is making just above it.
 *
 * The cards borrow the gallery's classes on purpose. A reader who follows one
 * of these links lands on a page of the same cards, and two card designs for
 * one kind of thing is a difference that means nothing.
 */
interface Entry {
  name: string;
  /** Appended to the locale's base path. */
  path: string;
  preview: ReactNode;
}

/** Holds a preview at the width its card gives it. */
function Fit({ children, width = 260 }: { children: ReactNode; width?: number }) {
  return <div style={{ width: '100%', maxWidth: width }}>{children}</div>;
}

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

function DatePickerPreview() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <MPDatePicker label="Due date" size="sm" value={value} onValueChange={setValue} fullWidth />
  );
}

const ENTRIES: Entry[] = [
  {
    name: 'MPTextField',
    path: '/components/inputs/text-field',
    preview: (
      <Fit>
        <TextFieldPreview />
      </Fit>
    )
  },
  {
    name: 'MPButton',
    path: '/components/inputs/button',
    preview: (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        <MPButton size="sm">Save</MPButton>
        <MPButton size="sm" variant="tonal">
          Preview
        </MPButton>
        <MPButton size="sm" variant="outlined">
          Cancel
        </MPButton>
      </div>
    )
  },
  {
    name: 'MPDatePicker',
    path: '/components/inputs/date-picker',
    preview: (
      <Fit>
        <DatePickerPreview />
      </Fit>
    )
  },
  {
    name: 'MPLineChart',
    path: '/components/display/line-chart',
    preview: (
      <Fit width={300}>
        <MPLineChart
          size="xs"
          label="Sessions by source"
          categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
          series={[
            { name: 'Organic', data: [42, 46, 44, 51, 56, 54] },
            { name: 'Referral', data: [31, 34, 40, 43, 41, 49] }
          ]}
          curve="smooth"
          locale="en-US"
        />
      </Fit>
    )
  },
  {
    name: 'MPDataTable',
    path: '/components/display/data-table',
    preview: (
      <Fit width={300}>
        <MPDataTable
          size="xs"
          sortable
          striped
          defaultSort={[{ key: 'score', direction: 'desc' }]}
          getRowKey={(row: { id: string; name: string; score: number }) => row.id}
          headers={[
            { key: 'name', label: 'Name' },
            { key: 'score', label: 'Score', align: 'end' }
          ]}
          items={[
            { id: 'a', name: 'Ada', score: 30 },
            { id: 'b', name: 'Bo', score: 10 },
            { id: 'c', name: 'Cai', score: 20 }
          ]}
        />
      </Fit>
    )
  },
  {
    name: 'MPAlert',
    path: '/components/feedback/alert',
    preview: (
      <Fit>
        <MPAlert size="sm" color="error" title="Payment failed" onClose={() => {}}>
          The bank declined the card.
        </MPAlert>
      </Fit>
    )
  }
];

export default function HomePreview({
  locale = DEFAULT_LOCALE,
  base = ''
}: {
  locale?: Locale;
  /** URL prefix of the locale this page is in — `''` at the root, `/ko` otherwise. */
  base?: string;
}) {
  const label = locale === 'ko' ? '컴포넌트 문서 열기' : 'Open the component page';

  return (
    <div className="mp-gallery-grid mp-home-preview">
      {ENTRIES.map((entry) => (
        <a
          key={entry.name}
          href={`${base}${entry.path}`}
          className="mp-gallery-card"
          aria-label={`${entry.name} — ${label}`}
        >
          <div className="mp-gallery-preview">{entry.preview}</div>
          <div className="mp-gallery-meta">
            <span className="mp-gallery-name">{entry.name}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
