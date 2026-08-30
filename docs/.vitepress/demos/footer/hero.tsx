import { MPDivider, MPFooter, MPTextLink, MPTypography } from 'material-plus-ui';

const COLUMNS = [
  { title: 'Product', links: ['Overview', 'Pricing', 'Changelog'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
  { title: 'Legal', links: ['Terms', 'Privacy'] }
];

/**
 * A footer has slots for nothing and room for anything.
 *
 * A header's three regions are a fixed arrangement worth writing once; four
 * columns of links is one site's answer and a single line is the next one's, so
 * the component decides the sheet and leaves the arrangement to a grid the
 * caller puts inside it.
 */
export default function FooterHero() {
  return (
    <MPFooter maxWidth="md">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column.title} className="grid content-start gap-2">
            <MPTypography level="overline">{column.title}</MPTypography>
            {column.links.map((link) => (
              <MPTextLink key={link} href={`#${link.toLowerCase()}`}>
                {link}
              </MPTextLink>
            ))}
          </div>
        ))}
      </div>

      <MPDivider className="my-4" />

      <MPTypography level="caption">© 2026 Acme. All rights reserved.</MPTypography>
    </MPFooter>
  );
}
