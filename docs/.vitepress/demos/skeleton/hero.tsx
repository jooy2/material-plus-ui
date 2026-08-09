import { MPSkeleton } from 'material-plus-ui';

export default function SkeletonHero() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <MPSkeleton shape="circle" />
        <div style={{ display: 'grid', gap: 8, flex: 1 }}>
          <MPSkeleton width="55%" />
          <MPSkeleton size="sm" width="35%" />
        </div>
      </div>

      <MPSkeleton shape="rect" label="Loading the chart" />
      <MPSkeleton lines={3} />
    </div>
  );
}
