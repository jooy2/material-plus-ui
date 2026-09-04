import * as React from 'react';
import { ICONS, MPFlex, MPIcon, MPTreeItem, MPTreeView, MPTypography } from 'material-plus-ui';

const Folder = () => <MPIcon icon={ICONS['chevron-right']} size={16} />;

/** The same tree twice: the file-manager drawing, and the quiet sidebar one. */
export default function TreeViewHero() {
  const [selected, setSelected] = React.useState<(string | number)[]>(['button']);

  return (
    <MPFlex direction={{ compact: 'column', medium: 'row' }} gap={24} align="start">
      <MPFlex direction="column" gap={8} style={{ flex: 1, minWidth: 0 }}>
        <MPTypography level="caption">lines="folder"</MPTypography>
        <MPTreeView
          label="Files"
          lines="folder"
          defaultExpanded={['src', 'components']}
          selected={selected}
          onSelectedChange={setSelected}
        >
          <MPTreeItem value="src" label="src">
            <MPTreeItem value="components" label="components">
              <MPTreeItem value="button" label="Button.tsx" />
              <MPTreeItem value="card" label="Card.tsx" />
            </MPTreeItem>
            <MPTreeItem value="index" label="index.ts" />
          </MPTreeItem>
          <MPTreeItem value="docs" label="docs">
            <MPTreeItem value="guide" label="guide.md" />
          </MPTreeItem>
          <MPTreeItem value="readme" label="README.md" />
        </MPTreeView>
      </MPFlex>

      <MPFlex direction="column" gap={8} style={{ flex: 1, minWidth: 0 }}>
        <MPTypography level="caption">lines="none", variant="text"</MPTypography>
        <MPTreeView label="Sections" lines="none" variant="text" defaultExpanded={['design']}>
          <MPTreeItem value="guide" label="Guide" startIcon={<Folder />} />
          <MPTreeItem value="design" label="Design" startIcon={<Folder />}>
            <MPTreeItem value="colour" label="Colour" />
            <MPTreeItem value="motion" label="Motion" />
          </MPTreeItem>
          <MPTreeItem value="components" label="Components" startIcon={<Folder />} expandable />
        </MPTreeView>
      </MPFlex>
    </MPFlex>
  );
}
