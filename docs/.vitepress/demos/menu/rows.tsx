import { useState } from 'react';
import {
  MPButton,
  MPMenu,
  MPMenuCheckboxItem,
  MPMenuGroup,
  MPMenuItem,
  MPMenuRadioGroup,
  MPMenuRadioItem,
  MPMenuSeparator,
  MPMenuSubmenu
} from 'material-plus-ui';

/**
 * Every shape a row takes. A tick says "and", a dot says "instead of" — the
 * same distinction `MPCheckbox` and `MPRadio` make everywhere else — and both
 * kinds keep the menu open, because a list you tick is a list you tick more
 * than one of.
 */
export default function MenuRows() {
  const [grid, setGrid] = useState(true);
  const [density, setDensity] = useState<string | number>('comfortable');

  return (
    <MPMenu trigger={<MPButton variant="outlined">View</MPButton>}>
      <MPMenuGroup label="Show">
        <MPMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
          Grid lines
        </MPMenuCheckboxItem>
        <MPMenuCheckboxItem defaultChecked>Rulers</MPMenuCheckboxItem>
      </MPMenuGroup>

      <MPMenuSeparator />

      <MPMenuGroup label="Density">
        <MPMenuRadioGroup value={density} onValueChange={setDensity}>
          <MPMenuRadioItem value="comfortable">Comfortable</MPMenuRadioItem>
          <MPMenuRadioItem value="compact">Compact</MPMenuRadioItem>
        </MPMenuRadioGroup>
      </MPMenuGroup>

      <MPMenuSeparator />

      <MPMenuSubmenu label="Open in">
        <MPMenuItem href="https://example.com" target="_blank">
          New tab
        </MPMenuItem>
        <MPMenuItem description="Side by side with this one">Split view</MPMenuItem>
      </MPMenuSubmenu>
    </MPMenu>
  );
}
