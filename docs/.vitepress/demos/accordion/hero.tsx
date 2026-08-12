import { MPAccordion, MPAccordionItem } from 'material-plus-ui';

/**
 * A stack of sections, one of which is open.
 *
 * Opening the second closes the first, which is the whole reason an accordion is
 * not just a stack of collapsibles: it is what keeps the page from growing under
 * the reader.
 */
export default function AccordionHero() {
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <MPAccordion defaultValue={['delivery']}>
        <MPAccordionItem value="delivery" title="Delivery" subtitle="Three to five working days">
          Standard delivery is included in the price. Express arrives the next working day and is
          charged at checkout.
        </MPAccordionItem>
        <MPAccordionItem value="returns" title="Returns" subtitle="Thirty days">
          Anything unopened can go back within thirty days. We pay the postage, and the refund lands
          on the card that paid.
        </MPAccordionItem>
        <MPAccordionItem value="warranty" title="Warranty" subtitle="Two years on parts">
          Parts and labour for the first year, parts only for the second. Wear items are not
          covered.
        </MPAccordionItem>
      </MPAccordion>
    </div>
  );
}
