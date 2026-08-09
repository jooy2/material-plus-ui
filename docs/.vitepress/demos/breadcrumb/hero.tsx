import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';

export default function BreadcrumbHero() {
  return (
    <div style={{ display: 'grid', gap: 18, width: '100%' }}>
      <MPBreadcrumb>
        <MPBreadcrumbItem href="#">Home</MPBreadcrumbItem>
        <MPBreadcrumbItem href="#">Components</MPBreadcrumbItem>
        <MPBreadcrumbItem href="#">Navigation</MPBreadcrumbItem>
        <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
      </MPBreadcrumb>

      <MPBreadcrumb separator="slash" size="sm" maxItems={3}>
        <MPBreadcrumbItem href="#">jooy2</MPBreadcrumbItem>
        <MPBreadcrumbItem href="#">material-plus</MPBreadcrumbItem>
        <MPBreadcrumbItem href="#">src</MPBreadcrumbItem>
        <MPBreadcrumbItem href="#">components</MPBreadcrumbItem>
        <MPBreadcrumbItem>breadcrumb</MPBreadcrumbItem>
      </MPBreadcrumb>
    </div>
  );
}
