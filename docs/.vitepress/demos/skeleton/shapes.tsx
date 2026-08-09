import { MPSkeleton } from 'material-plus-ui';

export default function SkeletonShapes() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 420 }}>
      <MPSkeleton lines={2} />
      <MPSkeleton shape="rect" height={80} />
      <MPSkeleton shape="circle" />
    </div>
  );
}
