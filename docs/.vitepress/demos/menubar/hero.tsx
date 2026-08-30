import {
  MPMenubar,
  MPMenubarMenu,
  MPMenuCheckboxItem,
  MPMenuItem,
  MPMenuSeparator
} from 'material-plus-ui';
import { useState } from 'react';

/**
 * The strip of words at the top of an application, each of which opens a menu.
 *
 * What makes it a bar rather than a row of separate menus is what happens once
 * one is open: crossing the strip walks through the others instead of closing
 * the one you left, and the arrow keys move between the menus as well as inside
 * them.
 */
export default function MenubarHero() {
  const [rulers, setRulers] = useState(true);

  return (
    <div className="bg-mp-surface-container rounded-mp-sm px-2 py-1">
      <MPMenubar size="sm">
        <MPMenubarMenu label="File">
          <MPMenuItem shortcut="Mod+N" onClick={() => {}}>
            New
          </MPMenuItem>
          <MPMenuItem shortcut="Mod+O" onClick={() => {}}>
            Open…
          </MPMenuItem>
          <MPMenuSeparator />
          <MPMenuItem shortcut="Mod+S" onClick={() => {}}>
            Save
          </MPMenuItem>
        </MPMenubarMenu>

        <MPMenubarMenu label="Edit">
          <MPMenuItem shortcut="Mod+Z" onClick={() => {}}>
            Undo
          </MPMenuItem>
          <MPMenuItem shortcut="Mod+Shift+Z" disabled onClick={() => {}}>
            Redo
          </MPMenuItem>
        </MPMenubarMenu>

        <MPMenubarMenu label="View">
          <MPMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
            Rulers
          </MPMenuCheckboxItem>
          <MPMenuItem onClick={() => {}}>Zoom in</MPMenuItem>
        </MPMenubarMenu>
      </MPMenubar>
    </div>
  );
}
