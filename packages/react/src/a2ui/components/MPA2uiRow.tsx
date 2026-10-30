/**
 * `Row` — children across, as `MPFlex`.
 *
 * The gap is 8px and is not the agent's to set. A2UI gives `Row` no spacing prop
 * at all, which is the protocol being explicit that rhythm belongs to the
 * catalog: an agent composing a surface should not be able to make one row sit
 * tighter than the one above it. 8px is MD3's own step and the same figure the
 * protocol's reference renderer uses, so a surface written against that renderer
 * keeps its proportions here.
 */
import * as React from 'react';
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { RowApi } from '@a2ui/web_core/v0_9';
import { MPFlex } from '../../components/flex/MPFlex';
import { childNodes } from '../internal/children';
import { FLEX_ALIGN, FLEX_JUSTIFY, accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiRow = createComponentImplementation(RowApi, ({ props, buildChild }) => (
  <MPFlex
    direction="row"
    justify={FLEX_JUSTIFY[props.justify ?? 'start'] ?? 'start'}
    align={FLEX_ALIGN[props.align ?? 'stretch'] ?? 'stretch'}
    gap={8}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  >
    {childNodes(props.children, buildChild).map(({ key, node }) => (
      <React.Fragment key={key}>{node}</React.Fragment>
    ))}
  </MPFlex>
));
