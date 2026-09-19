/**
 * `Column` — children down, as `MPFlex`.
 *
 * `MPA2uiRow` turned, and the same fixed 8px gap for the same reason.
 */
import * as React from 'react';
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ColumnApi } from '@a2ui/web_core/v0_9';
import { MPFlex } from '../../components/flex/MPFlex';
import { childNodes } from '../internal/children';
import { FLEX_ALIGN, FLEX_JUSTIFY, accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiColumn = createComponentImplementation(ColumnApi, ({ props, buildChild }) => (
  <MPFlex
    direction="column"
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
