import { MPNavigationMenu, MPNavigationMenuItem, MPNavigationMenuLink } from 'material-plus-ui';

/**
 * Down the side of a page the panels open beside the rail rather than under it,
 * and the arrow keys follow.
 *
 * Nothing else changes: the rows are the same links and the same triggers, which
 * is what makes an [MPSidebar] full of navigation and a header full of it the
 * same component.
 */
export default function NavigationMenuVertical() {
  return (
    <div style={{ width: 200 }}>
      <MPNavigationMenu aria-label="Sections" orientation="vertical" size="sm">
        <MPNavigationMenuItem label="Overview" href="#overview" />
        <MPNavigationMenuItem value="reports" label="Reports">
          <MPNavigationMenuLink href="#weekly" title="Weekly" />
          <MPNavigationMenuLink href="#monthly" title="Monthly" />
        </MPNavigationMenuItem>
        <MPNavigationMenuItem label="Settings" href="#settings" />
      </MPNavigationMenu>
    </div>
  );
}
