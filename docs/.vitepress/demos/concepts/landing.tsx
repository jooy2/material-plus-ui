import { useState } from 'react';
import {
  ICONS,
  MPAccordion,
  MPAccordionItem,
  MPAvatar,
  MPBlockquote,
  MPButton,
  MPCard,
  MPChip,
  MPDivider,
  MPGrid,
  MPGridItem,
  MPIcon,
  MPIconButton,
  MPList,
  MPListItem,
  MPPill,
  MPProgressLinear,
  MPSegmentedButton,
  MPTab,
  MPTable,
  MPTabPanel,
  MPTabs,
  MPTextField,
  MPTextLink,
  MPTooltip,
  MPTypography
} from 'material-plus-ui';
import type { MPTableColumn } from 'material-plus-ui';

/**
 * A marketing page for Kestrel, a deploy tool that does not exist.
 *
 * This is the screen a component library is least obviously for. A landing page
 * is mostly type, space and one call to action repeated — there is no form to
 * fill in and nothing to sort — which is exactly why it is worth building out of
 * the components: what it tests is whether the parts *compose* when almost
 * nothing about the page is a widget.
 *
 * Two things are load-bearing here and worth watching for:
 *
 * - **`MPTypography` sets the element as well as the scale**, so `level="h1"` is
 *   a real `<h1>` and the page has an outline a screen reader can walk.
 * - **Colour carries meaning, not emphasis.** The featured plan is the only
 *   `primary` card in the pricing row; the other two stay `secondary` and flat.
 */

/* ---------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: ICONS.upload,
    title: 'Ship on merge',
    body: 'A push to main is a deploy. No pipeline to describe and no YAML to keep in step with it.'
  },
  {
    icon: ICONS.clock,
    title: 'Roll back in a click',
    body: 'Every build stays addressable, so going back is choosing an older one rather than rebuilding.'
  },
  {
    icon: ICONS.check,
    title: 'Preview every branch',
    body: 'A URL per branch, torn down when the branch is. Reviewers see the change, not a description.'
  },
  {
    icon: ICONS.warning,
    title: 'Tell you first',
    body: 'One message per failure, to the place the team already reads, with the failing step in it.'
  }
];

interface Plan {
  feature: string;
  solo: string;
  team: string;
  scale: string;
}

const COMPARISON: MPTableColumn<Plan>[] = [
  { key: 'feature', label: '' },
  { key: 'solo', label: 'Solo', align: 'center' },
  { key: 'team', label: 'Team', align: 'center' },
  { key: 'scale', label: 'Scale', align: 'center' }
];

const PLAN_ROWS: Plan[] = [
  { feature: 'Projects', solo: '3', team: 'Unlimited', scale: 'Unlimited' },
  { feature: 'Build minutes', solo: '500', team: '5,000', scale: '50,000' },
  { feature: 'Preview URLs', solo: '—', team: 'Yes', scale: 'Yes' },
  { feature: 'Audit log', solo: '—', team: '30 days', scale: '2 years' }
];

/** Two prices per plan, because the billing toggle is what switches between them. */
const PLANS = [
  {
    name: 'Solo',
    price: { monthly: 9, yearly: 90 },
    note: 'For one person and three projects.',
    features: ['3 projects', '500 build minutes', 'Community support'],
    featured: false
  },
  {
    name: 'Team',
    price: { monthly: 29, yearly: 290 },
    note: 'For a team that deploys every day.',
    features: ['Unlimited projects', '5,000 build minutes', 'Preview URLs', 'Audit log'],
    featured: true
  },
  {
    name: 'Scale',
    price: { monthly: 89, yearly: 890 },
    note: 'For a company that cannot be down.',
    features: ['Everything in Team', '50,000 build minutes', 'SSO and SCIM', '99.99% SLA'],
    featured: false
  }
];

const FUNNEL = [
  { step: 'Merged', value: 100 },
  { step: 'Built', value: 96 },
  { step: 'Tested', value: 88 },
  { step: 'Deployed', value: 84 }
];

/* ---------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------- */

/** A band of the page, with the vertical rhythm decided in one place. */
function Band({ children }: { children: React.ReactNode }) {
  return <section style={{ display: 'grid', gap: 16 }}>{children}</section>;
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      <span className="text-mp-headline-small text-mp-on-surface">{value}</span>
      <span className="text-mp-label-medium text-mp-on-surface-variant">{label}</span>
    </div>
  );
}

function PricingCard({
  plan,
  cycle
}: {
  plan: (typeof PLANS)[number];
  cycle: 'monthly' | 'yearly';
}) {
  return (
    <MPCard
      variant={plan.featured ? 'elevated' : 'outlined'}
      title={plan.name}
      subtitle={plan.note}
      headerAction={
        plan.featured ? (
          <MPChip size="xs" variant="tonal">
            Popular
          </MPChip>
        ) : undefined
      }
      footer={
        <MPButton
          size="sm"
          variant={plan.featured ? 'filled' : 'outlined'}
          color={plan.featured ? 'primary' : 'secondary'}
          fullWidth
        >
          Start free
        </MPButton>
      }
      style={{ height: '100%' }}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="text-mp-headline-medium text-mp-on-surface">${plan.price[cycle]}</span>
          <span className="text-mp-body-small text-mp-on-surface-variant">
            /{cycle === 'monthly' ? 'month' : 'year'}
          </span>
        </div>

        <MPList size="sm" variant="text">
          {plan.features.map((feature) => (
            <MPListItem key={feature} startIcon={<MPIcon icon={ICONS.check} size={18} />}>
              {feature}
            </MPListItem>
          ))}
        </MPList>
      </div>
    </MPCard>
  );
}

/* ---------------------------------------------------------------------------
 * The page
 * ------------------------------------------------------------------------- */

export default function LandingConcept() {
  const [cycle, setCycle] = useState<string[]>(['monthly']);
  const [email, setEmail] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const billing = cycle[0] === 'yearly' ? 'yearly' : 'monthly';

  // Only once something has been typed, so an untouched form is never red.
  const badEmail = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);

  return (
    <div
      className="bg-mp-surface text-mp-on-surface border-mp-outline-variant rounded-mp-lg overflow-hidden border"
      style={{ width: '100%' }}
    >
      {/* A `MPPill` with `onClick` is a button, so the banner is reachable from
          the keyboard without any extra markup around it. */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 12px 0' }}>
        <MPPill
          size="sm"
          variant="tonal"
          color="tertiary"
          startIcon={<MPIcon icon={ICONS.info} />}
          title="1.1 is out"
          description="Rating, pagination and a bottom bar"
          onClick={() => {}}
        />
      </div>

      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px'
        }}
      >
        <MPIcon icon={ICONS.check} size={22} />
        <span className="text-mp-title-medium" style={{ marginInlineEnd: 'auto' }}>
          Kestrel
        </span>

        <MPButton size="sm" variant="text">
          Product
        </MPButton>
        <MPButton size="sm" variant="text">
          Pricing
        </MPButton>
        <MPTooltip content="Read the docs">
          <MPIconButton
            size="sm"
            variant="text"
            icon={<MPIcon icon={ICONS['external-link']} />}
            label="Docs"
          />
        </MPTooltip>
        <MPButton size="sm">Start free</MPButton>
      </header>

      <div style={{ display: 'grid', gap: 34, padding: '12px 14px 22px' }}>
        <Band>
          <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
            {/* `justifySelf` because the column is a grid: a chip is as wide as
                its label, and a grid track would otherwise stretch it to the
                measure of the paragraph under it. */}
            <MPChip
              size="xs"
              variant="tonal"
              startIcon={<MPIcon icon={ICONS.star} size={14} />}
              style={{ justifySelf: 'start' }}
            >
              Used by 4,000 teams
            </MPChip>

            <MPTypography level="h1">Deploy on merge. Roll back on regret.</MPTypography>

            <MPTypography level="lead" color="secondary">
              Kestrel builds every push, gives every branch a URL, and keeps every build around so
              going back is one click rather than one incident.
            </MPTypography>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <MPButton endIcon={<MPIcon icon={ICONS['arrow-right']} size={18} />}>
                Start free
              </MPButton>
              <MPButton variant="outlined" color="secondary">
                Book a demo
              </MPButton>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ display: 'flex' }}>
                {['Ada Lovelace', 'Grace Hopper', '홍길동'].map((name, index) => (
                  <MPAvatar
                    key={name}
                    size="xs"
                    name={name}
                    color={(['primary', 'secondary', 'tertiary'] as const)[index]}
                    style={{ marginInlineStart: index === 0 ? 0 : -8 }}
                  />
                ))}
              </div>
              <span className="text-mp-body-small text-mp-on-surface-variant">
                No card. Two minutes to your first deploy.
              </span>
            </div>
          </div>
        </Band>

        {/* A divider with children carries the section label, so the rule and
            the heading over it are one element rather than two. */}
        <MPDivider size="sm">Trusted by</MPDivider>

        <Band>
          <MPGrid spacing={3}>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Figure value="4,000+" label="Teams" />
            </MPGridItem>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Figure value="11M" label="Deploys a year" />
            </MPGridItem>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Figure value="42s" label="Median build" />
            </MPGridItem>
            <MPGridItem span={{ compact: 6, medium: 3 }}>
              <Figure value="99.99%" label="Uptime" />
            </MPGridItem>
          </MPGrid>
        </Band>

        <Band>
          <MPTypography level="h2">What it does</MPTypography>

          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))'
            }}
          >
            {FEATURES.map((feature) => (
              <MPCard
                key={feature.title}
                variant="filled"
                size="sm"
                title={feature.title}
                // In `headerAction` the glyph stays on the title's baseline at
                // every size, which a floated icon does not.
                headerAction={<MPIcon icon={feature.icon} size={20} />}
                style={{ height: '100%' }}
              >
                {feature.body}
              </MPCard>
            ))}
          </div>
        </Band>

        <Band>
          <MPTypography level="h2">A look inside</MPTypography>

          <MPTabs defaultValue="funnel" aria-label="Product tour" size="sm">
            <MPTab value="funnel">Pipeline</MPTab>
            <MPTab value="branches">Branches</MPTab>
            <MPTab value="alerts">Alerts</MPTab>

            <MPTabPanel value="funnel">
              <div style={{ display: 'grid', gap: 10, paddingTop: 14 }}>
                {FUNNEL.map((stage) => (
                  <MPProgressLinear
                    key={stage.step}
                    size="sm"
                    label={stage.step}
                    value={stage.value}
                    showValue
                  />
                ))}
              </div>
            </MPTabPanel>

            <MPTabPanel value="branches">
              <div style={{ paddingTop: 14 }}>
                <MPList size="sm" dividers>
                  <MPListItem
                    description="kestrel-feat-rating.preview.dev"
                    action={
                      <MPChip size="xs" variant="tonal" color="tertiary">
                        live
                      </MPChip>
                    }
                  >
                    feat/rating
                  </MPListItem>
                  <MPListItem
                    description="kestrel-fix-pager.preview.dev"
                    action={
                      <MPChip size="xs" variant="tonal">
                        building
                      </MPChip>
                    }
                  >
                    fix/pager
                  </MPListItem>
                  <MPListItem
                    description="Torn down when the branch was merged"
                    action={
                      <MPChip size="xs" variant="outlined">
                        gone
                      </MPChip>
                    }
                  >
                    feat/pill
                  </MPListItem>
                </MPList>
              </div>
            </MPTabPanel>

            <MPTabPanel value="alerts">
              <div style={{ paddingTop: 14, display: 'grid', gap: 10 }}>
                <MPTypography level="body" color="secondary">
                  One message per failure, with the step that failed in it — not one per attempt.
                </MPTypography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <MPChip size="xs" selected>
                    Slack
                  </MPChip>
                  <MPChip size="xs">Email</MPChip>
                  <MPChip size="xs">Webhook</MPChip>
                  <MPChip size="xs">PagerDuty</MPChip>
                </div>
              </div>
            </MPTabPanel>
          </MPTabs>
        </Band>

        <MPBlockquote variant="tonal" author="Mina Park" source="Head of Platform, Northwind">
          We deleted six hundred lines of pipeline config in an afternoon and nothing about our
          deploys changed except how long they take.
        </MPBlockquote>

        <Band>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}
          >
            <MPTypography level="h2" gutter={false}>
              Pricing
            </MPTypography>

            <MPSegmentedButton
              size="sm"
              items={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
              value={cycle}
              onValueChange={setCycle}
              aria-label="Billing period"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))'
            }}
          >
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} cycle={billing} />
            ))}
          </div>

          {/* Rendered from a column list, so the headings and the cells cannot
              drift apart the day a plan is renamed. */}
          <MPTable
            headers={COMPARISON}
            items={PLAN_ROWS}
            getRowKey={(row) => row.feature}
            size="sm"
            variant="outlined"
          />
        </Band>

        <Band>
          <MPTypography level="h2">Questions</MPTypography>

          <MPAccordion size="sm">
            <MPAccordionItem value="migrate" title="Can we move an existing pipeline over?">
              Point Kestrel at the repository and it reads the build command out of the package
              manifest. Anything it cannot infer stays a script you already have.
            </MPAccordionItem>
            <MPAccordionItem value="self-host" title="Is there a self-hosted option?">
              On the Scale plan, as a container that runs in your own cluster and reports back to
              the same dashboard.
            </MPAccordionItem>
            <MPAccordionItem value="limits" title="What happens when we run out of minutes?">
              Builds queue rather than fail, and the workspace owner gets one message about it.
            </MPAccordionItem>
          </MPAccordion>
        </Band>

        <MPCard
          variant="filled"
          title="Start with one project"
          subtitle="Free for as long as you like"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSignedUp(true);
            }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 10 }}
          >
            <div style={{ flex: '1 1 200px' }}>
              <MPTextField
                size="sm"
                type="email"
                label="Work email"
                value={email}
                onChange={(next) => {
                  setEmail(next);
                  setSignedUp(false);
                }}
                errorMessage={badEmail ? 'That address is missing something.' : undefined}
                fullWidth
              />
            </div>
            <MPButton size="sm" type="submit" disabled={email.length === 0 || badEmail}>
              Create account
            </MPButton>
          </form>

          {signedUp ? (
            <p className="text-mp-body-small text-mp-on-surface-variant" style={{ marginTop: 10 }}>
              Check {email} — the link lasts an hour.
            </p>
          ) : null}
        </MPCard>

        <MPDivider />

        <footer
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))'
          }}
        >
          {[
            { title: 'Product', links: ['Deploys', 'Previews', 'Alerts'] },
            { title: 'Company', links: ['About', 'Careers', 'Blog'] },
            { title: 'Legal', links: ['Terms', 'Privacy', 'Status'] }
          ].map((column) => (
            <div key={column.title} style={{ display: 'grid', gap: 6 }}>
              <span className="text-mp-label-large text-mp-on-surface">{column.title}</span>
              {column.links.map((link) => (
                <MPTextLink key={link} href="#" size="sm" color="secondary" underline="hover">
                  {link}
                </MPTextLink>
              ))}
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}
