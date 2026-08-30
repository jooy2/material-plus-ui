import {
  ICONS,
  MPIcon,
  MPNavigationMenu,
  MPNavigationMenuItem,
  MPNavigationMenuLink
} from 'material-plus-ui';

/**
 * A row of destinations, some of which open a panel of more of them.
 *
 * Every row here is a real `<a>` or a real trigger, which is the whole point:
 * a destination that is a `<div>` with a click handler is not in a screen
 * reader's link list, not on the status bar and not in a crawler's index.
 */
export default function NavigationMenuHero() {
  return (
    <MPNavigationMenu aria-label="Main">
      <MPNavigationMenuItem value="product" label="Product" columns={2}>
        <MPNavigationMenuLink
          href="#overview"
          title="Overview"
          description="What the thing is, in one screen"
          startIcon={<MPIcon icon={ICONS.info} size={18} />}
        />
        <MPNavigationMenuLink
          href="#pricing"
          title="Pricing"
          description="Per seat, per month"
          startIcon={<MPIcon icon={ICONS.check} size={18} />}
        />
        <MPNavigationMenuLink
          href="#changelog"
          title="Changelog"
          description="Everything that shipped"
          startIcon={<MPIcon icon={ICONS.clock} size={18} />}
        />
        <MPNavigationMenuLink
          href="#status"
          title="Status"
          description="Whether it is up"
          startIcon={<MPIcon icon={ICONS.success} size={18} />}
        />
      </MPNavigationMenuItem>

      <MPNavigationMenuItem value="developers" label="Developers">
        <MPNavigationMenuLink href="#docs" title="Documentation" />
        <MPNavigationMenuLink href="#api" title="API reference" />
        <MPNavigationMenuLink href="#sdk" title="SDKs" />
      </MPNavigationMenuItem>

      <MPNavigationMenuItem label="Pricing" href="#pricing" />
    </MPNavigationMenu>
  );
}
