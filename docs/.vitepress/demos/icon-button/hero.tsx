import { ICONS, MPIcon, MPIconButton } from 'material-plus-ui';

/**
 * A toolbar, which is where icon buttons actually live.
 *
 * Every one of them is required to have a `label`. That is the whole reason this
 * component exists on top of `MPButton`: a button whose entire label is a
 * drawing has no accessible name at all, and making the name a required prop is
 * the only fix that survives review.
 */
export default function IconButtonHero() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <MPIconButton icon={<MPIcon icon={ICONS.search} />} label="Search" />
      <MPIconButton icon={<MPIcon icon={ICONS.copy} />} label="Copy link" />
      <MPIconButton icon={<MPIcon icon={ICONS.upload} />} label="Upload a file" />
      <MPIconButton icon={<MPIcon icon={ICONS.more} />} label="More actions" />
    </div>
  );
}
