import { MPIcon, ICONS } from 'material-plus-ui';

const SIZES = [14, 16, 20, 24, 32];

export default function IconSizes() {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{ display: 'grid', gap: 8, justifyItems: 'center' }}
          className="text-mp-on-surface"
        >
          <MPIcon icon={ICONS.info} size={size} label={`Info, ${size}px`} />
          <small className="text-mp-on-surface-variant">{size}</small>
        </div>
      ))}
    </div>
  );
}
