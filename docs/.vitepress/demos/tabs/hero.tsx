import { useState } from 'react';
import { ICONS, MPIcon, MPTab, MPTabPanel, MPTabs, MPTypography } from 'material-plus-ui';

/**
 * MD3's primary tabs: the top level of a screen.
 *
 * The glyph sits above the label, the indicator is a rounded 3dp bar under the
 * label rather than under the whole tab, and the chosen label takes the accent.
 * All three are what tell a primary tab bar from a secondary one.
 */
export default function TabsHero() {
  const [section, setSection] = useState<string | number | null>('flights');

  return (
    <MPTabs
      aria-label="Trip"
      value={section}
      onValueChange={setSection}
      style={{ width: '100%', maxWidth: 480 }}
    >
      <MPTab value="flights" icon={<MPIcon icon={ICONS['arrow-up']} size={24} />}>
        Flights
      </MPTab>
      <MPTab value="stays" icon={<MPIcon icon={ICONS.calendar} size={24} />}>
        Stays
      </MPTab>
      <MPTab value="cars" icon={<MPIcon icon={ICONS['arrow-right']} size={24} />}>
        Cars
      </MPTab>

      <MPTabPanel value="flights">
        <MPTypography level="body">Two seats, Seoul to Osaka, Friday.</MPTypography>
      </MPTabPanel>
      <MPTabPanel value="stays">
        <MPTypography level="body">Three nights near the station.</MPTypography>
      </MPTabPanel>
      <MPTabPanel value="cars">
        <MPTypography level="body">Nothing booked yet.</MPTypography>
      </MPTabPanel>
    </MPTabs>
  );
}
