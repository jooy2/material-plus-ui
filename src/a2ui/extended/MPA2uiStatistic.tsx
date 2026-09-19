/**
 * `Statistic` — one figure, as `MPStatistic`.
 *
 * A number stays a number all the way through. `MPStatistic` formats what it is
 * given in the reader's locale, works out the change from `previousValue` and
 * colours it by `betterWhen`, and none of that happens to a string — so a value
 * that arrives as a number is passed as one, and a string is passed through
 * untouched for the figure that is not arithmetic (`4.8 / 5`, `A+`).
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { MPStatistic } from '../../components/statistic/MPStatistic';
import { StatisticApi } from './api';
import { accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiStatistic = createComponentImplementation(StatisticApi, ({ props }) => (
  <MPStatistic
    value={typeof props.value === 'number' ? props.value : String(props.value ?? '')}
    label={props.label}
    previousValue={props.previousValue}
    /* Only with something to compare against: a delta of a figure with no
       previous value is a change from nothing, which draws as a bare arrow. */
    delta={props.previousValue === undefined ? 'none' : props.delta}
    betterWhen={props.betterWhen}
    unit={props.unit}
    prefix={props.prefix}
    period={props.period}
    caption={props.caption}
    compact={props.compact}
    align={props.align}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  />
));
