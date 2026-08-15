import { ICONS, MPFloatingActionButton, MPIcon, MPTypography } from 'material-plus-ui';

/**
 * The specification's own default FAB — `tonal` on `primary`, which is
 * `primary-container` under `on-primary-container` — beside the extended one.
 *
 * `position="static"` here, because a `fixed` button in a documentation page
 * would float over the documentation. In an application it is the default and it
 * is the right one.
 */
export default function FloatingActionButtonHero() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <MPFloatingActionButton
        position="static"
        icon={<MPIcon icon={ICONS.add} />}
        label="Compose"
      />

      <MPFloatingActionButton
        position="static"
        extended
        icon={<MPIcon icon={ICONS.add} />}
        label="Compose"
      />

      <MPTypography level="caption">Both are 56dp tall — Material&rsquo;s own size.</MPTypography>
    </div>
  );
}
