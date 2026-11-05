import { useState } from 'react';
import {
  MPButton,
  MPCard,
  MPCheckbox,
  MPDatePicker,
  MPPagination,
  MPProgressLinear,
  MPRadio,
  MPRadioGroup,
  MPRating,
  MPSegmentedButton,
  MPSelect,
  MPSlider,
  MPSwitch,
  MPTab,
  MPTabs,
  MPTextField,
  useMPColorScheme,
  type MPColorScheme,
  type MPDensity
} from 'material-plus-ui';
import type { Preferences } from '../App';

const schemes = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

// Left to right whichever way the page runs, or a right-to-left page draws `-1` as `1-`.
const densities = ['0', '-1', '-2', '-3'].map((value) => ({
  value,
  label: <span dir="ltr">{value}</span>
}));

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh-hans', label: '简体中文' }
];

/** The choices the whole app reads, and a few components to see them on. */
export function Settings({
  preferences,
  onChange
}: {
  preferences: Preferences;
  onChange: (next: Partial<Preferences>) => void;
}) {
  const { scheme, setScheme } = useMPColorScheme();

  return (
    <div className="grid grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start gap-4">
      <MPCard title="Appearance">
        <div className="flex flex-col gap-5">
          <MPSegmentedButton
            aria-label="Theme"
            items={schemes}
            value={[scheme]}
            // A second press on the chosen segment would leave none chosen.
            onValueChange={([next]) => next && setScheme(next as MPColorScheme)}
          />
          <MPSwitch
            label="Right to left"
            checked={preferences.rtl}
            onCheckedChange={(rtl) => onChange({ rtl })}
          />
          <MPSegmentedButton
            aria-label="Density"
            items={densities}
            value={[String(preferences.density)]}
            onValueChange={([next]) => next && onChange({ density: Number(next) as MPDensity })}
          />
          <MPSelect
            fullWidth
            label="Language of the built-in labels"
            items={languages}
            value={preferences.locale}
            onValueChange={(locale) => onChange({ locale: String(locale) })}
          />
        </div>
      </MPCard>

      <Preview />
    </div>
  );
}

/** Controls that read the direction, the density and the language. */
function Preview() {
  const [name, setName] = useState('Aurora');
  const [volume, setVolume] = useState(40);
  const [page, setPage] = useState(3);
  const [plan, setPlan] = useState('team');
  const [date, setDate] = useState<Date | null>(new Date(2026, 10, 5));

  return (
    <MPCard title="Preview">
      <div className="flex flex-col gap-4">
        <MPTabs defaultValue="general" aria-label="Sections">
          <MPTab value="general">General</MPTab>
          <MPTab value="billing">Billing</MPTab>
          <MPTab value="members">Members</MPTab>
        </MPTabs>
        <MPTextField label="Project name" value={name} onChange={setName} />
        <MPDatePicker label="Due" value={date} onValueChange={setDate} />
        <MPSlider
          label="Volume"
          showValue
          value={volume}
          onValueChange={(next) => setVolume(next as number)}
        />
        <MPRadioGroup label="Plan" value={plan} onValueChange={setPlan} orientation="horizontal">
          <MPRadio value="solo" label="Solo" />
          <MPRadio value="team" label="Team" />
        </MPRadioGroup>
        <MPCheckbox label="Send a weekly summary" defaultChecked />
        <MPProgressLinear label="Storage" value={62} showValue />
        <MPRating defaultValue={4} />
        <MPPagination size="sm" count={12} page={page} onPageChange={setPage} />
        <div className="flex gap-2">
          <MPButton>Save</MPButton>
          <MPButton variant="outlined">Cancel</MPButton>
        </div>
      </div>
    </MPCard>
  );
}
