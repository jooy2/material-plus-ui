import { useState } from 'react';
import {
  ICONS,
  MPBlockquote,
  MPButton,
  MPCard,
  MPCheckbox,
  MPChip,
  MPColorPicker,
  MPCombobox,
  MPDatePicker,
  MPDivider,
  MPFilePicker,
  MPIcon,
  MPList,
  MPListItem,
  MPNumberField,
  MPOtpField,
  MPProgressLinear,
  MPRadio,
  MPRadioGroup,
  MPSegmentedButton,
  MPSelect,
  MPSwitch,
  MPTextField,
  MPTextLink,
  MPTimeline,
  MPTimelineItem,
  MPTypography
} from 'material-plus-ui';
import type { MPComboboxValue, MPSelectValue } from 'material-plus-ui';

/**
 * Registration for Kestrel, in three steps.
 *
 * This is the library's fields with nothing else in the way — every kind of
 * answer a form can ask for, and the states around them. What is worth noticing
 * is how little the components differ from each other: `label`, `description`
 * and `errorMessage` are the same three slots on a text field, a select, a
 * number, a picker and a file drop, so a form of nine different controls reads
 * as one control repeated.
 *
 * The flow works. Fill a step in and Continue turns on.
 */

/* ---------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

const COUNTRIES = [
  { value: 'kr', label: 'South Korea' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'jp', label: 'Japan' },
  { value: 'us', label: 'United States' },
  { value: 'fr', label: 'France' }
];

const DISCIPLINES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'data', label: 'Data' },
  { value: 'ops', label: 'Platform' }
];

const STEPS = ['You', 'Workspace', 'Confirm'];

/** Four bands, and a colour per band — the only place a score becomes a hue. */
const STRENGTH = [
  { label: 'Too short', color: 'error' },
  { label: 'Weak', color: 'error' },
  { label: 'Fair', color: 'primary' },
  { label: 'Strong', color: 'tertiary' },
  { label: 'Excellent', color: 'tertiary' }
] as const;

/** Length, case, digit, symbol. Four checks, so `max={4}` on the bar. */
function strengthOf(password: string): number {
  return [
    password.length >= 10,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^\w\s]/.test(password)
  ].filter(Boolean).length;
}

const EMAIL = /^\S+@\S+\.\S+$/;

/* ---------------------------------------------------------------------------
 * The page
 * ------------------------------------------------------------------------- */

export default function SignupConcept() {
  const [step, setStep] = useState(0);

  // Step 1 — who is signing up.
  const [account, setAccount] = useState<string[]>(['team']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [born, setBorn] = useState<Date | null>(null);
  const [country, setCountry] = useState<MPSelectValue | null>(null);
  const [touched, setTouched] = useState(false);

  // Step 2 — what they are setting up.
  const [slug, setSlug] = useState('');
  const [seats, setSeats] = useState<number | null>(3);
  const [disciplines, setDisciplines] = useState<MPComboboxValue[]>(['frontend']);
  const [plan, setPlan] = useState('team');
  const [brand, setBrand] = useState('#00639b');
  const [logo, setLogo] = useState<File[]>([]);

  // Step 3 — the last two things anyone is asked.
  const [code, setCode] = useState('');
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [done, setDone] = useState(false);

  const score = strengthOf(password);
  const band = STRENGTH[score];

  const badEmail = touched && email.length > 0 && !EMAIL.test(email);

  // Each step is gated on its own fields alone, which is what keeps Continue
  // from being a button that says no without saying why.
  const stepValid = [
    name.trim().length > 1 && EMAIL.test(email) && score >= 2 && country !== null,
    slug.trim().length > 2 && (seats ?? 0) > 0,
    code.length === 6 && terms
  ][step];

  return (
    <div
      className="bg-mp-surface text-mp-on-surface border-mp-outline-variant rounded-mp-lg overflow-hidden border"
      style={{ width: '100%' }}
    >
      <header
        className="bg-mp-surface-container border-mp-outline-variant border-b"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px' }}
      >
        <MPIcon icon={ICONS.check} size={20} />
        <span className="text-mp-title-medium" style={{ marginInlineEnd: 'auto' }}>
          Kestrel
        </span>
        <span className="text-mp-body-small text-mp-on-surface-variant">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      <div
        style={{
          display: 'grid',
          gap: 18,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          padding: 14
        }}
      >
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <MPTypography level="h4" gutter={false}>
              {step === 2 ? 'Nearly there' : 'Create your account'}
            </MPTypography>
            <MPProgressLinear
              size="sm"
              min={0}
              max={STEPS.length}
              value={step + 1}
              label={STEPS[step]}
            />
          </div>

          {step === 0 ? (
            <div style={{ display: 'grid', gap: 14 }}>
              {/* One of a small, visible set — nothing to open. */}
              <MPSegmentedButton
                size="sm"
                items={[
                  { value: 'personal', label: 'Personal' },
                  { value: 'team', label: 'Team' }
                ]}
                value={account}
                onValueChange={setAccount}
                aria-label="Account type"
                fullWidth
              />

              <MPTextField
                size="sm"
                label="Full name"
                value={name}
                onChange={setName}
                autoComplete="name"
                required
                fullWidth
              />

              <MPTextField
                size="sm"
                type="email"
                label="Work email"
                value={email}
                onChange={(next) => {
                  setEmail(next);
                  setTouched(true);
                }}
                autoComplete="email"
                errorMessage={badEmail ? 'That address is missing something.' : undefined}
                required
                fullWidth
              />

              <div style={{ display: 'grid', gap: 8 }}>
                <MPTextField
                  size="sm"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  required
                  fullWidth
                />
                {/* `MPTextField` has no `description` slot — the field is the one
                    control whose supporting line is either an error or nothing —
                    so the rule is a caption of the form's own. */}
                <MPTypography level="caption" color="secondary">
                  Ten characters, mixed case, a digit and a symbol.
                </MPTypography>
                {/* Only once something has been typed: an empty field is not weak,
                    it is empty, and a red bar on arrival says the wrong thing. */}
                {password.length > 0 ? (
                  <MPProgressLinear
                    size="sm"
                    min={0}
                    max={4}
                    value={score}
                    color={band.color}
                    label={band.label}
                  />
                ) : null}
              </div>

              <MPDatePicker
                size="sm"
                label="Date of birth"
                value={born}
                onValueChange={setBorn}
                maxDate={new Date()}
                description="A future date is not selectable rather than wrong afterwards."
                clearable
                fullWidth
              />

              <MPSelect
                size="sm"
                label="Country"
                items={COUNTRIES}
                value={country}
                onValueChange={setCountry}
                placeholder="Choose one"
                required
                fullWidth
              />
            </div>
          ) : null}

          {step === 1 ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <MPTextField
                  size="sm"
                  label="Workspace URL"
                  value={slug}
                  onChange={(next) => setSlug(next.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                  startIcon={<MPIcon icon={ICONS.link} size={18} />}
                  required
                  fullWidth
                />
                <MPTypography level="caption" color="secondary">
                  kestrel.dev/{slug || 'your-team'} — letters, digits and hyphens.
                </MPTypography>
              </div>

              <MPNumberField
                size="sm"
                label="Seats"
                value={seats}
                onValueChange={setSeats}
                min={1}
                max={200}
                description="Change it any time; billing follows."
                fullWidth
              />

              {/* Anything not on the list is offered as the last row rather than
                  committed silently on blur. */}
              <MPCombobox
                size="sm"
                label="What the team does"
                items={DISCIPLINES}
                multiple
                value={disciplines}
                onValueChange={setDisciplines}
                customLabel={(query) => `Add “${query}”`}
                placeholder="Add a discipline"
                fullWidth
              />

              <MPRadioGroup size="sm" label="Plan" value={plan} onValueChange={setPlan}>
                <MPRadio
                  value="solo"
                  label="Solo — $9/month"
                  description="Three projects and 500 build minutes."
                />
                <MPRadio
                  value="team"
                  label="Team — $29/month"
                  description="Unlimited projects, preview URLs, audit log."
                />
              </MPRadioGroup>

              <MPDivider textAlign="start">Looks</MPDivider>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <MPColorPicker
                  size="sm"
                  label="Brand colour"
                  value={brand}
                  onValueChange={setBrand}
                />
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <MPFilePicker
                    size="sm"
                    label="Logo"
                    hint="SVG or PNG, up to 2 MB"
                    accept="image/svg+xml,image/png"
                    maxSize={2_000_000}
                    maxFiles={1}
                    value={logo}
                    onFilesChange={setLogo}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <MPOtpField
                label="Email code"
                description={`We sent six digits to ${email || 'your inbox'}.`}
                length={6}
                groupSize={3}
                value={code}
                onValueChange={setCode}
              />

              <MPCheckbox
                size="sm"
                label="I agree to the terms and the privacy notice"
                checked={terms}
                onCheckedChange={setTerms}
                required
              />

              {/* A checkbox is consent to submit with; a switch is a setting that
                  takes effect as it is flipped. */}
              <MPSwitch
                size="sm"
                label="Send me the monthly changelog"
                checked={newsletter}
                onCheckedChange={setNewsletter}
                fullWidth
              />

              {done ? (
                <MPTypography level="body" color="tertiary">
                  Welcome aboard. Your workspace is at kestrel.dev/{slug}.
                </MPTypography>
              ) : null}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            {step > 0 ? (
              <MPButton
                size="sm"
                variant="text"
                onClick={() => {
                  setStep((current) => current - 1);
                  setDone(false);
                }}
              >
                Back
              </MPButton>
            ) : null}

            <MPButton
              size="sm"
              disabled={!stepValid}
              onClick={() => (step === 2 ? setDone(true) : setStep((current) => current + 1))}
              style={{ marginInlineStart: 'auto' }}
            >
              {step === 2 ? 'Create workspace' : 'Continue'}
            </MPButton>
          </div>
        </div>

        {/* What the trial includes, what happens next, and one quote. Nothing
            here is interactive: it is the column that answers the question a
            form cannot, which is why anyone should fill it in. */}
        <aside style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <MPCard size="sm" variant="filled" title="Free for 14 days" subtitle="No card">
            <MPList size="sm" variant="text">
              {['Unlimited projects', 'Preview URL per branch', 'Roll back to any build'].map(
                (line) => (
                  <MPListItem key={line} startIcon={<MPIcon icon={ICONS.check} size={18} />}>
                    {line}
                  </MPListItem>
                )
              )}
            </MPList>
          </MPCard>

          <MPCard size="sm" variant="outlined" title="What happens next">
            <MPTimeline size="sm" active={step}>
              <MPTimelineItem title="Account" bullet="1">
                Name, email, a password.
              </MPTimelineItem>
              <MPTimelineItem title="Workspace" bullet="2">
                A URL, seats and a plan.
              </MPTimelineItem>
              <MPTimelineItem title="First deploy" bullet="3" connector="dashed">
                Connect a repository and push.
              </MPTimelineItem>
            </MPTimeline>
          </MPCard>

          <MPBlockquote
            size="sm"
            variant="tonal"
            icon={false}
            author="Grace Hopper"
            source="Northwind"
          >
            Signing up took less time than reading the pricing page.
          </MPBlockquote>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <MPChip size="xs" variant="outlined">
              SOC 2
            </MPChip>
            <MPChip size="xs" variant="outlined">
              GDPR
            </MPChip>
            <MPTextLink href="#" size="sm" color="secondary" underline="hover">
              Security
            </MPTextLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
