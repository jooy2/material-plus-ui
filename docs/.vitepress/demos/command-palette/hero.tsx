import {
  ICONS,
  MPButton,
  MPCommandPalette,
  MPIcon,
  MPShortcut,
  MPTypography
} from 'material-plus-ui';
import type { MPCommand } from 'material-plus-ui';
import { useState } from 'react';

/**
 * Everything an application can do, behind one field.
 *
 * `Mod+K` opens it — Command on a Mac and Control everywhere else — and the row
 * shortcuts are drawn in the same vocabulary. The palette does not bind those:
 * they are labels for bindings the application already has.
 */
export default function CommandPaletteHero() {
  const [open, setOpen] = useState(false);
  const [ran, setRan] = useState<string | null>(null);

  const commands: MPCommand[] = [
    {
      value: 'new',
      label: 'New document',
      group: 'File',
      shortcut: 'Mod+N',
      icon: <MPIcon icon={ICONS.add} size={18} />
    },
    {
      value: 'open',
      label: 'Open…',
      group: 'File',
      keywords: ['load', 'import'],
      icon: <MPIcon icon={ICONS.upload} size={18} />
    },
    {
      value: 'copy',
      label: 'Copy link',
      group: 'Share',
      description: 'Anyone with the link can read',
      shortcut: 'Mod+Shift+C',
      icon: <MPIcon icon={ICONS.copy} size={18} />
    },
    {
      value: 'publish',
      label: 'Publish',
      group: 'Share',
      description: 'Not while the draft is empty',
      disabled: true,
      icon: <MPIcon icon={ICONS.success} size={18} />
    }
  ];

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <MPButton variant="outlined" onClick={() => setOpen(true)}>
        Open the palette
      </MPButton>

      <MPTypography level="caption">
        Or press <MPShortcut size="xs" keys="Mod+K" />
      </MPTypography>

      {ran ? <MPTypography level="caption">Ran: {ran}</MPTypography> : null}

      <MPCommandPalette
        items={commands}
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => setRan(item.label)}
      />
    </div>
  );
}
