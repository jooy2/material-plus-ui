import { useState } from 'react';
import { MPDatePicker, MPSegmentedButton } from 'material-plus-ui';

/**
 * The same picker in four languages, with nothing translated by hand.
 *
 * Everything that moves here comes from `Intl`: the month names, the weekday
 * initials, which day the week starts on (Sunday in the US and Korea, Monday in
 * Germany), the order of the header's two buttons — `July 2026` against
 * `2026년 7월` — and how the trigger writes the date.
 *
 * The only strings this library supplies are the ones the platform has no
 * opinion about: "Previous month", "Today", "Clear". Those are translated for
 * eighteen languages and overridable with `labels`.
 */
const LOCALES = [
  { value: 'en-US', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'ar', label: 'العربية' }
];

export default function DatePickerLocale() {
  const [locale, setLocale] = useState('ko');
  const [value, setValue] = useState<Date | null>(new Date(2026, 6, 15));

  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 340 }}>
      <MPSegmentedButton
        items={LOCALES}
        value={[locale]}
        onValueChange={([next]) => setLocale(next ?? locale)}
        aria-label="Locale"
        size="sm"
        showCheck={false}
        fullWidth
      />
      <MPDatePicker
        key={locale}
        locale={locale}
        label="Date"
        value={value}
        onValueChange={setValue}
        defaultOpen
        fullWidth
      />
    </div>
  );
}
