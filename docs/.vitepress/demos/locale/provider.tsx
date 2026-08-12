import { useState } from 'react';
import {
  MPAlert,
  MPDatePicker,
  MPLocaleProvider,
  MPSegmentedButton,
  MPTimePicker
} from 'material-plus-ui';

/**
 * One decision at the root, and every component under it follows.
 *
 * Two systems move together here and they degrade differently, which is the one
 * thing worth knowing before choosing a tag:
 *
 * - `Intl` formats the dates and names the months. It speaks every language the
 *   platform does, so a tag with no entry in this library's table still gets the
 *   right month names, weekday initials and date order.
 * - This library's table supplies the words `Intl` has no opinion about —
 *   "Today", "Hour", "Dismiss". Those fall back to English for a tag it does not
 *   carry, and a `labels` prop fills the gap.
 *
 * The last option below is Swedish, which is deliberately *not* in the table:
 * the calendar is still Swedish and the footer's word is English.
 */
const LOCALES = [
  { value: 'en-US', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'sv', label: 'Svenska' }
];

export default function LocaleProviderDemo() {
  const [locale, setLocale] = useState('ko');

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

      <MPLocaleProvider locale={locale}>
        <div style={{ display: 'grid', gap: 16 }}>
          <MPDatePicker key={`d-${locale}`} label="Date" defaultValue={new Date()} fullWidth />
          <MPTimePicker key={`t-${locale}`} label="Time" defaultValue={new Date()} fullWidth />
          <MPAlert onClose={() => {}}>The × below has a name in this language.</MPAlert>
        </div>
      </MPLocaleProvider>
    </div>
  );
}
