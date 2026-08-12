import { MPAccordion, MPAccordionItem } from 'material-plus-ui';

/**
 * Ruled or tiled, which is one prop and two different claims.
 *
 * With `dividers` the sections are parts of one thing and the rules reach the
 * sheet's edges, so the sheet gives up its padding. Without them each section is
 * a tile with a corner one step down from the sheet's own, and the sheet keeps a
 * hair of padding so a hovered header's state layer does not run into the edge.
 */
export default function AccordionDividers() {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 520 }}>
      <MPAccordion defaultValue={['a']}>
        <MPAccordionItem value="a" title="Ruled">
          The default. A hairline in `outline-variant` between the sections.
        </MPAccordionItem>
        <MPAccordionItem value="b" title="One thing, in parts">
          Nothing here is a card.
        </MPAccordionItem>
      </MPAccordion>

      <MPAccordion dividers={false} variant="filled" defaultValue={['a']}>
        <MPAccordionItem value="a" title="Tiled">
          Each section is its own rounded row.
        </MPAccordionItem>
        <MPAccordionItem value="b" title="Separate things, stacked">
          Hover the headers to see where each tile ends.
        </MPAccordionItem>
      </MPAccordion>
    </div>
  );
}
