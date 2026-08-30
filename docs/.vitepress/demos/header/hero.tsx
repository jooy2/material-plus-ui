import { ICONS, MPButton, MPHeader, MPIcon, MPIconButton, MPTextLink } from 'material-plus-ui';

/**
 * MD3's top app bar with a site's own three regions on it: the mark, the
 * navigation and the actions.
 *
 * The slots are props rather than compound sub-components because the
 * arrangement is fixed — and because the middle can only be centred on the bar's
 * own midline if the two ends are the component's to measure.
 */
export default function HeaderHero() {
  return (
    <div className="border-mp-outline-variant rounded-mp-md w-full overflow-hidden border">
      <MPHeader
        position="static"
        brand="Acme"
        actions={
          <>
            <MPIconButton icon={<MPIcon icon={ICONS.search} />} label="Search" size="sm" />
            <MPButton size="sm">Sign in</MPButton>
          </>
        }
      >
        <nav className="flex items-center gap-4">
          <MPTextLink href="#docs">Docs</MPTextLink>
          <MPTextLink href="#pricing">Pricing</MPTextLink>
          <MPTextLink href="#blog">Blog</MPTextLink>
        </nav>
      </MPHeader>

      <div className="text-mp-body-medium text-mp-on-surface-variant p-4">
        The bar is a real <code>&lt;header&gt;</code>, which at the top level of a document is the
        banner landmark.
      </div>
    </div>
  );
}
