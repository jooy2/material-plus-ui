import { useState } from 'react';
import {
  ICONS,
  MPAlert,
  MPAvatar,
  MPBadge,
  MPBlockquote,
  MPBottomNavigation,
  MPBottomNavigationItem,
  MPBox,
  MPBreadcrumb,
  MPBreadcrumbItem,
  MPButton,
  MPButtonGroup,
  MPCard,
  MPCarousel,
  MPCheckbox,
  MPChip,
  MPDivider,
  MPGrid,
  MPGridItem,
  MPHighlight,
  MPIcon,
  MPIconButton,
  MPList,
  MPListItem,
  MPMenu,
  MPMenuItem,
  MPMenuSeparator,
  MPPagination,
  MPPill,
  MPProgressCircular,
  MPProgressLinear,
  MPRadio,
  MPRadioGroup,
  MPRating,
  MPSegmentedButton,
  MPSelect,
  MPShortcut,
  MPSlider,
  MPSnackbarProvider,
  MPSwitch,
  MPTab,
  MPTable,
  MPTabPanel,
  MPTabs,
  MPTextField,
  MPTextLink,
  MPTimeline,
  MPTimelineItem,
  MPTooltip,
  MPTypography,
  useMPSnackbar
} from 'material-plus-ui';
import type { MPSelectValue, MPTableColumn } from 'material-plus-ui';

/**
 * Everything the library ships, arranged as one product screen.
 *
 * `components/index.md` already lists the components as a grid of specimens, and
 * a specimen answers "what does this look like". It cannot answer the question
 * this page exists for, which is what they look like *together*: whether a
 * button, a field and a select at the same `size` come out the same height,
 * whether two sheets side by side agree about their corners, whether the ink on
 * a filled card is the same grey as the ink beside it.
 *
 * So the parts are laid out the way an application would lay them out — a bar,
 * a row of figures, a table, two columns of forms — rather than in a table of
 * one-per-cell. Nothing here is a screenshot. Every control is the real
 * component rendered from `src/`, in whichever scheme the frame's switch says.
 *
 * The text is English in every locale, the way every other demo is: it is a code
 * sample, and the sample is the point.
 */

/* ---------------------------------------------------------------------------
 * Data
 *
 * A fictional deploy dashboard for "Kestrel". Held at module scope so it is not
 * rebuilt on every keystroke in the search field.
 * ------------------------------------------------------------------------- */

interface Deploy {
  id: string;
  service: string;
  channel: 'production' | 'staging' | 'preview';
  status: 'live' | 'failed' | 'building';
  minutes: number;
}

const DEPLOYS: Deploy[] = [
  { id: '#4821', service: 'web', channel: 'production', status: 'live', minutes: 3 },
  { id: '#4820', service: 'api', channel: 'production', status: 'building', minutes: 1 },
  { id: '#4819', service: 'worker', channel: 'staging', status: 'failed', minutes: 12 },
  { id: '#4818', service: 'web', channel: 'preview', status: 'live', minutes: 26 },
  { id: '#4817', service: 'docs', channel: 'production', status: 'live', minutes: 41 }
];

/** One accent family per status, so colour is the reading rather than the mood. */
const STATUS_COLOR = { live: 'tertiary', failed: 'error', building: 'primary' } as const;

const COLUMNS: MPTableColumn<Deploy>[] = [
  { key: 'id', label: 'Build', width: 78 },
  { key: 'service', label: 'Service' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <MPChip size="xs" variant="tonal" color={STATUS_COLOR[row.status]}>
        {row.status}
      </MPChip>
    )
  },
  { key: 'minutes', label: 'Age', align: 'end', render: (row) => `${row.minutes}m` }
];

const CHANNELS = [
  { value: 'all', label: 'All channels' },
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'preview', label: 'Preview' }
];

const NEWS = [
  { title: 'Rating landed', tone: 'var(--_mp-color-primary-container)' },
  { title: 'Pagination landed', tone: 'var(--_mp-color-secondary-container)' },
  { title: 'Bottom navigation landed', tone: 'var(--_mp-color-tertiary-container)' }
];

const RELEASE_NOTE =
  'The 1.1 release adds a rating, a pagination and a bottom navigation bar. Every one of the three reads the same size ladder as the controls beside it, so a bar at size sm sits on the baseline a button at size sm sits on.';

/* ---------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------- */

/** A band with a label over it — the only structure this page invents. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <MPTypography level="overline" color="secondary">
        {title}
      </MPTypography>
      {children}
    </section>
  );
}

/**
 * A figure with the direction it moved.
 *
 * `better` is what decides the colour, and it is the whole reason a stat is a
 * component rather than a `<div>`: a failure rate that fell is good news, and a
 * tile that painted every fall red would be reading the sign instead of the
 * meaning.
 */
function Stat({
  label,
  value,
  delta,
  better = 'up'
}: {
  label: string;
  value: string;
  delta: number;
  better?: 'up' | 'down';
}) {
  const rose = delta > 0;
  const good = better === 'up' ? rose : !rose;

  return (
    <MPCard variant="filled" size="sm" style={{ height: '100%' }}>
      <div className="text-mp-label-medium text-mp-on-surface-variant">{label}</div>
      <div className="text-mp-headline-small text-mp-on-surface" style={{ margin: '2px 0 8px' }}>
        {value}
      </div>
      <MPChip
        size="xs"
        variant="tonal"
        color={good ? 'tertiary' : 'error'}
        startIcon={<MPIcon icon={rose ? ICONS['arrow-up'] : ICONS['arrow-down']} size={14} />}
      >
        {Math.abs(delta)}%
      </MPChip>
    </MPCard>
  );
}

/**
 * The bar across the top.
 *
 * There is no toolbar component to reach for — the bar is a `<header>` with the
 * library's own surface and ink tokens on it, which is the case the tokens are
 * documented for. What is a component is everything standing on it.
 */
function AppBar({
  query,
  onQueryChange
}: {
  query: string;
  onQueryChange: (next: string) => void;
}) {
  return (
    <header
      className="bg-mp-surface-container text-mp-on-surface border-mp-outline-variant border-b"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px'
      }}
    >
      <MPIcon icon={ICONS.check} size={22} />
      <span className="text-mp-title-medium" style={{ marginInlineEnd: 'auto' }}>
        Kestrel
      </span>

      <div style={{ width: 'min(100%, 220px)' }}>
        <MPTextField
          size="sm"
          value={query}
          onChange={onQueryChange}
          placeholder="Search"
          startIcon={<MPIcon icon={ICONS.search} size={18} />}
          fullWidth
        />
      </div>

      <MPTooltip content="Three builds waiting">
        <MPBadge content={3} color="error">
          <MPIconButton
            size="sm"
            variant="text"
            icon={<MPIcon icon={ICONS.clock} />}
            label="Queue"
          />
        </MPBadge>
      </MPTooltip>

      <MPMenu
        trigger={
          <MPIconButton
            size="sm"
            variant="text"
            icon={<MPAvatar size="xs" src="/samples/people/sam-arden.webp" name="Sam Arden" />}
            label="Account"
          />
        }
      >
        <MPMenuItem startIcon={<MPIcon icon={ICONS.info} size={20} />}>Profile</MPMenuItem>
        <MPMenuItem startIcon={<MPIcon icon={ICONS.copy} size={20} />} shortcut="Mod+K">
          Command palette
        </MPMenuItem>
        <MPMenuSeparator />
        <MPMenuItem color="error" startIcon={<MPIcon icon={ICONS.close} size={20} />}>
          Sign out
        </MPMenuItem>
      </MPMenu>
    </header>
  );
}

/** The controls row: four kinds of control that have to share one baseline. */
function Controls() {
  const [range, setRange] = useState<string[]>(['7d']);
  const [channel, setChannel] = useState<MPSelectValue | null>('all');
  const snackbar = useMPSnackbar();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: 10
      }}
    >
      <MPSegmentedButton
        size="sm"
        items={[
          { value: '24h', label: '24h' },
          { value: '7d', label: '7 days' },
          { value: '30d', label: '30 days' }
        ]}
        value={range}
        onValueChange={setRange}
        aria-label="Range"
      />

      <div style={{ width: 160 }}>
        <MPSelect
          size="sm"
          items={CHANNELS}
          value={channel}
          onValueChange={setChannel}
          aria-label="Channel"
          fullWidth
        />
      </div>

      <MPButtonGroup size="sm" variant="outlined">
        <MPButton startIcon={<MPIcon icon={ICONS.upload} size={18} />}>Deploy</MPButton>
        <MPButton onClick={() => snackbar.add({ message: 'Rolled back to #4818' })}>
          Roll back
        </MPButton>
      </MPButtonGroup>

      <MPButton size="sm" onClick={() => snackbar.add({ message: 'Build queued' })}>
        Run build
      </MPButton>
    </div>
  );
}

/** The table, its filter tabs and its pager — one block, three components. */
function Deploys() {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  const rows = tab === 'all' ? DEPLOYS : DEPLOYS.filter((row) => row.channel === tab);

  return (
    <MPTabs
      value={tab}
      onValueChange={(next) => {
        setTab(String(next));
        setPage(1);
      }}
      aria-label="Deploys"
      size="sm"
    >
      <MPTab value="all">All</MPTab>
      <MPTab value="production">Production</MPTab>
      <MPTab value="staging">Staging</MPTab>

      {['all', 'production', 'staging'].map((value) => (
        <MPTabPanel key={value} value={value}>
          <div style={{ display: 'grid', gap: 12, paddingTop: 12 }}>
            <MPTable
              headers={COLUMNS}
              items={rows}
              getRowKey={(row) => row.id}
              size="sm"
              hoverable
              striped
              empty="Nothing has gone out on this channel yet."
            />
            <MPPagination
              count={4}
              page={page}
              onPageChange={setPage}
              size="sm"
              style={{ justifyContent: 'center' }}
            />
          </div>
        </MPTabPanel>
      ))}
    </MPTabs>
  );
}

/** A form and a settings panel, which is the pair every application has. */
function Forms() {
  const [name, setName] = useState('Sam Arden');
  const [email, setEmail] = useState('sam@kestrel.dev');
  const [digest, setDigest] = useState(true);
  const [notify, setNotify] = useState(true);
  const [scheme, setScheme] = useState('system');
  const [density, setDensity] = useState(2);
  const snackbar = useMPSnackbar();

  // On blur it would be kinder; on change it is shorter, and this is a sample.
  const badEmail = email.length > 0 && !email.includes('@');

  return (
    <div
      style={{
        display: 'grid',
        gap: 14,
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))'
      }}
    >
      <MPCard
        title="Profile"
        subtitle="Shown on every build you start"
        footer={
          <>
            <MPButton size="sm" variant="text">
              Discard
            </MPButton>
            <MPButton size="sm" onClick={() => snackbar.add({ message: 'Profile saved' })}>
              Save
            </MPButton>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <MPTextField size="sm" label="Name" value={name} onChange={setName} fullWidth />
          <MPTextField
            size="sm"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            errorMessage={badEmail ? 'That address is missing an @.' : undefined}
            fullWidth
          />
          <MPDivider textAlign="start">Preferences</MPDivider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <MPChip size="xs" selected>
              Deploys
            </MPChip>
            <MPChip size="xs">Reviews</MPChip>
            <MPChip size="xs">Mentions</MPChip>
          </div>
          <MPCheckbox
            size="sm"
            label="Send me the weekly digest"
            checked={digest}
            onCheckedChange={setDigest}
          />
        </div>
      </MPCard>

      <MPCard title="Settings" subtitle="Applies to this workspace">
        <div style={{ display: 'grid', gap: 16 }}>
          <MPRadioGroup size="sm" label="Appearance" value={scheme} onValueChange={setScheme}>
            <MPRadio value="system" label="Match the system" />
            <MPRadio value="light" label="Always light" />
            <MPRadio value="dark" label="Always dark" />
          </MPRadioGroup>

          <MPSwitch
            size="sm"
            label="Notify on failure"
            description="One message per failed build, not per attempt"
            checked={notify}
            onCheckedChange={setNotify}
            fullWidth
          />

          <MPSlider
            size="sm"
            label="Rows per page"
            min={1}
            max={5}
            step={1}
            value={density}
            onValueChange={(next) => setDensity(Array.isArray(next) ? next[0] : next)}
            showValue
          />
        </div>
      </MPCard>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * The screen
 * ------------------------------------------------------------------------- */

function Screen() {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<string | number>('builds');

  return (
    <div
      className="bg-mp-surface text-mp-on-surface border-mp-outline-variant rounded-mp-lg overflow-hidden border"
      style={{ width: '100%' }}
    >
      <AppBar query={query} onQueryChange={setQuery} />

      <div style={{ display: 'grid', gap: 26, padding: '16px 14px 20px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <MPBreadcrumb size="sm">
            <MPBreadcrumbItem href="#">Kestrel</MPBreadcrumbItem>
            <MPBreadcrumbItem href="#">web</MPBreadcrumbItem>
            <MPBreadcrumbItem>Deploys</MPBreadcrumbItem>
          </MPBreadcrumb>

          <MPPill
            size="sm"
            variant="tonal"
            title="Building"
            description="#4820 · 1m"
            startIcon={<MPProgressCircular size="xs" />}
          />
        </div>

        <MPAlert
          size="sm"
          color="error"
          title="One build failed"
          action={
            <MPButton size="xs" variant="text" color="error">
              View log
            </MPButton>
          }
        >
          The worker build on staging stopped at the test step.
        </MPAlert>

        <Section title="This week">
          <MPGrid spacing={3}>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Stat label="Deploys" value="128" delta={12} />
            </MPGridItem>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Stat label="Median build" value="3m 12s" delta={-8} better="down" />
            </MPGridItem>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Stat label="Failure rate" value="4.1%" delta={-2} better="down" />
            </MPGridItem>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Stat label="Contributors" value="19" delta={5} />
            </MPGridItem>
          </MPGrid>
        </Section>

        <Section title="Controls">
          <Controls />
        </Section>

        <Section title="What's new">
          <MPCarousel size="sm" label="Recent additions">
            {NEWS.map((slide) => (
              <div
                key={slide.title}
                className="text-mp-title-small"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 96,
                  background: slide.tone,
                  color: 'var(--_mp-color-on-surface)'
                }}
              >
                {slide.title}
              </div>
            ))}
          </MPCarousel>
        </Section>

        <Section title="Deploys">
          <Deploys />
        </Section>

        <Section title="Forms">
          <Forms />
        </Section>

        <Section title="Release 1.1">
          <div
            style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))'
            }}
          >
            <div style={{ display: 'grid', gap: 14 }}>
              <MPTimeline size="sm" active={2}>
                <MPTimelineItem title="Tagged" meta="Mon" bullet="1">
                  1.1.0 cut from main.
                </MPTimelineItem>
                <MPTimelineItem title="Published" meta="Mon" bullet="2">
                  On npm four minutes later.
                </MPTimelineItem>
                <MPTimelineItem title="Documented" meta="Now" bullet="3" connector="dashed">
                  These pages.
                </MPTimelineItem>
              </MPTimeline>

              <MPBox size="sm" className="text-mp-body-small">
                {/* The search field at the top is the query. Type in it and the
                    marks appear here — the component *is* the search, not a
                    highlight someone applied by hand. */}
                <MPHighlight query={query}>{RELEASE_NOTE}</MPHighlight>
              </MPBox>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MPShortcut keys="Mod+K" size="sm" />
                <span className="text-mp-body-small text-mp-on-surface-variant">
                  opens the palette
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <MPBlockquote size="sm" variant="tonal" author="Release review">
                Four new components, and not one new word of vocabulary to learn.
              </MPBlockquote>

              <MPCard size="sm" variant="outlined" title="Coverage">
                <div style={{ display: 'grid', gap: 10 }}>
                  <MPProgressLinear label="Statements" value={94} showValue size="sm" />
                  <MPProgressLinear label="Branches" value={81} showValue size="sm" />
                </div>
              </MPCard>

              <MPList size="sm" variant="tonal" dividers>
                <MPListItem
                  description="Averaged over the last 40 releases"
                  action={<MPRating size="xs" value={4} readOnly />}
                >
                  Release confidence
                </MPListItem>
                <MPListItem
                  description="Read the whole log"
                  endIcon={<MPIcon icon={ICONS['chevron-right']} size={18} />}
                  onClick={() => {}}
                >
                  Changelog
                </MPListItem>
              </MPList>
            </div>
          </div>
        </Section>

        <MPDivider />

        <p className="text-mp-body-small text-mp-on-surface-variant" style={{ margin: 0 }}>
          Every control above is the real component — the source is one file,{' '}
          <MPTextLink href="#" size="sm">
            docs/.vitepress/demos/showcase/app.tsx
          </MPTextLink>
          .
        </p>
      </div>

      <MPBottomNavigation
        label="Sections"
        position="static"
        size="sm"
        value={destination}
        onValueChange={setDestination}
      >
        <MPBottomNavigationItem value="builds" icon={<MPIcon icon={ICONS.check} />}>
          Builds
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
          Search
        </MPBottomNavigationItem>
        <MPBottomNavigationItem value="alerts" icon={<MPIcon icon={ICONS.warning} />}>
          Alerts
        </MPBottomNavigationItem>
      </MPBottomNavigation>
    </div>
  );
}

export default function ShowcaseApp() {
  // The provider is around the whole screen rather than around the buttons that
  // post messages: the stack is one place on a page, and two providers would be
  // two stacks fighting for the same corner.
  return (
    <MPSnackbarProvider position="bottom-center">
      <Screen />
    </MPSnackbarProvider>
  );
}
