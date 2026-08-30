import { MPHeader, MPList, MPListItem, MPPageLayout, MPSidebar } from 'material-plus-ui';
import { useState } from 'react';

const SECTIONS = ['Overview', 'Schedule', 'Reports', 'Settings'];

/**
 * The column, in a layout.
 *
 * It is a real `<aside>` — the `complementary` landmark — and it names itself,
 * because a page with two of them and no names is a page a screen reader offers
 * as two regions called "complementary".
 *
 * `collapseBelow="none"` here so the preview stays a column at the width of a
 * documentation page. In a real layout the class comes from the [PageLayout].
 */
export default function SidebarHero() {
  const [section, setSection] = useState('Overview');

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <MPPageLayout
        height={280}
        scroll="content"
        collapseBelow="none"
        className="rounded-mp-md border-mp-outline-variant overflow-hidden border"
        header={<MPHeader size="xs" brand="Acme" />}
        sidebar={
          <MPSidebar width={180} label="Sections" size="sm">
            <MPList variant="text" size="sm">
              {SECTIONS.map((name) => (
                <MPListItem key={name} selected={name === section} onClick={() => setSection(name)}>
                  {name}
                </MPListItem>
              ))}
            </MPList>
          </MPSidebar>
        }
      >
        <div className="text-mp-body-medium text-mp-on-surface-variant p-4">{section}</div>
      </MPPageLayout>
    </div>
  );
}
