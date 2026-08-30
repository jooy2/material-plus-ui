import { ICONS, MPHeader, MPIcon, MPIconButton } from 'material-plus-ui';

/**
 * `align="center"` is MD3's own center-aligned top app bar.
 *
 * It is centred on the *bar* and not in the space left over: both ends are given
 * equal shares, so a brand one character longer does not move the headline. That
 * is the difference a reader notices between two pages of the same site.
 */
export default function HeaderAlign() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      {(['start', 'center'] as const).map((align) => (
        <div key={align} className="border-mp-outline-variant rounded-mp-md overflow-hidden border">
          <MPHeader
            position="static"
            size="sm"
            align={align}
            brand={<MPIconButton icon={<MPIcon icon={ICONS.more} />} label="Menu" size="xs" />}
            actions={
              <MPIconButton icon={<MPIcon icon={ICONS.search} />} label="Search" size="xs" />
            }
          >
            <span className="text-mp-title-medium">Inbox</span>
          </MPHeader>
        </div>
      ))}
    </div>
  );
}
