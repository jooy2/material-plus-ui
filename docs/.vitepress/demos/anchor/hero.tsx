import * as React from 'react';
import { MPAnchor, MPFlex, MPTypography } from 'material-plus-ui';

const SECTIONS = [
  { id: 'install', label: 'Install', depth: 0 },
  { id: 'peer-dependencies', label: 'Peer dependencies', depth: 1 },
  { id: 'usage', label: 'Usage', depth: 0 },
  { id: 'theming', label: 'Theming', depth: 0 },
  { id: 'colour-roles', label: 'Colour roles', depth: 1 },
  { id: 'density', label: 'Density', depth: 1 }
];

/**
 * A page in a box, with its own table of contents beside it.
 *
 * The box is what `container` is for: the thing that scrolls here is not the
 * document, so the list has to be told where to look.
 */
export default function AnchorHero() {
  const page = React.useRef<HTMLDivElement>(null);

  return (
    <MPFlex gap={24} align="start" style={{ width: '100%' }}>
      <div style={{ flex: '0 0 auto', position: 'sticky', top: 0 }}>
        <MPAnchor
          items={SECTIONS.map((section) => ({
            href: `#${section.id}`,
            label: section.label,
            depth: section.depth
          }))}
          container={page}
          size="sm"
        />
      </div>

      <div
        ref={page}
        style={{ flex: 1, height: 260, overflowY: 'auto', minWidth: 0 }}
        className="rounded-mp-md border-mp-outline-variant border px-4"
      >
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} style={{ paddingBottom: 120 }}>
            <MPTypography level="h4" gutter>
              {section.label}
            </MPTypography>
            <MPTypography>
              Scroll the panel and the row beside it lights up. The rail is a border on the row
              rather than a marker that travels between rows, so nothing moves under a reader who is
              already moving.
            </MPTypography>
          </section>
        ))}
      </div>
    </MPFlex>
  );
}
