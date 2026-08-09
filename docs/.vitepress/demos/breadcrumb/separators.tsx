import { MPBreadcrumb, MPBreadcrumbItem } from 'material-plus-ui';
import type { MPBreadcrumbSeparator } from 'material-plus-ui';

const MARKS: MPBreadcrumbSeparator[] = ['chevron', 'arrow', 'slash', 'dot'];

export default function BreadcrumbSeparators() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {MARKS.map((mark) => (
        <MPBreadcrumb key={mark} separator={mark} size="sm">
          <MPBreadcrumbItem href="#">Home</MPBreadcrumbItem>
          <MPBreadcrumbItem href="#">Docs</MPBreadcrumbItem>
          <MPBreadcrumbItem>{mark}</MPBreadcrumbItem>
        </MPBreadcrumb>
      ))}
    </div>
  );
}
