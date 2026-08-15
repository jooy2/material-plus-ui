import { MPTab, MPTabPanel, MPTabs, MPTypography } from 'material-plus-ui';

/**
 * The two kinds of tab, one above the other.
 *
 * They are not two levels of emphasis, they are two depths: primary tabs are the
 * top level of a screen, and secondary tabs divide the content inside one of
 * them. Which is why the pair below is how they are meant to be used — the
 * secondary bar lives inside the primary bar's panel.
 */
export default function TabsVariants() {
  return (
    <MPTabs aria-label="Library" defaultValue="albums" style={{ width: '100%', maxWidth: 520 }}>
      <MPTab value="albums">Albums</MPTab>
      <MPTab value="artists">Artists</MPTab>

      <MPTabPanel value="albums">
        <MPTabs aria-label="Sort albums" variant="secondary" defaultValue="recent">
          <MPTab value="recent">Recently added</MPTab>
          <MPTab value="az">A–Z</MPTab>
          <MPTab value="year">By year</MPTab>

          <MPTabPanel value="recent">
            <MPTypography level="body">Four albums added this week.</MPTypography>
          </MPTabPanel>
          <MPTabPanel value="az">
            <MPTypography level="body">Everything, alphabetically.</MPTypography>
          </MPTabPanel>
          <MPTabPanel value="year">
            <MPTypography level="body">Oldest first.</MPTypography>
          </MPTabPanel>
        </MPTabs>
      </MPTabPanel>

      <MPTabPanel value="artists">
        <MPTypography level="body">Twelve artists.</MPTypography>
      </MPTabPanel>
    </MPTabs>
  );
}
