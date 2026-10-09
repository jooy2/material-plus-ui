/**
 * `List` — children in a real list element.
 *
 * ## Why this is not `MPList`
 *
 * `MPList` is MD3's list: rows of a fixed rhythm, with a leading slot, a
 * supporting line and a 56px minimum height. A2UI's `List` is not that. Its
 * children are whatever the agent put in it — cards, rows, images — and giving
 * each one a list row's padding and minimum height would be this catalog
 * deciding that an agent's list of product cards is a settings menu.
 *
 * So it is `MPFlex` rendered as a `<ul>`, with each child in its own `<li>`. The
 * list is a list to a screen reader, which announces how many items it holds and
 * which one is being read, and it imposes nothing on the items. An agent that
 * wants MD3 rows composes them out of `Row` and `Text`, which is the same freedom
 * the protocol gives every other renderer.
 *
 * ## No markers
 *
 * The specification's `List` has no prop that asks for one, so a list is always
 * an unmarked `<ul>`. The SDK accepted a `listStyle` of its own up to 0.11 and
 * dropped it in 0.12 to match the specification; a payload that still sends it
 * no longer passes the schema.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ListApi } from '@a2ui/web_core/v0_9';
import { MPFlex } from '../../components/flex/MPFlex';
import { childNodes } from '../internal/children';
import { FLEX_ALIGN, accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiList = createComponentImplementation(ListApi, ({ props, buildChild }) => (
  <MPFlex
    render={<ul />}
    direction={props.direction === 'horizontal' ? 'row' : 'column'}
    align={FLEX_ALIGN[props.align ?? 'stretch'] ?? 'stretch'}
    gap={8}
    style={{
      // A `<ul>` arrives with a block margin, an indent and a marker on every
      // row, and this library ships no page reset to have taken them off.
      margin: 0,
      paddingInlineStart: 0,
      listStyleType: 'none',
      ...weightStyle(props.weight)
    }}
    {...accessibilityAttributes(props.accessibility)}
  >
    {childNodes(props.children, buildChild).map(({ key, node }) => (
      <li key={key} style={{ display: 'block', minWidth: 0 }}>
        {node}
      </li>
    ))}
  </MPFlex>
));
