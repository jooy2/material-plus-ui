/**
 * `LineChart` — a value over a sequence, as `MPLineChart`.
 *
 * `curve` is in the schema because it is a claim about the data rather than a
 * finish: a smooth line says the value moved continuously between the points, and
 * a step says it held and then jumped. Drawing a price as a smooth curve is
 * drawing prices that never existed, which is the agent's decision to get right.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { MPLineChart } from '../../components/line-chart/MPLineChart';
import { LineChartApi } from './api';
import { toAxis, toCategories, toSeries } from './chart';
import { accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiLineChart = createComponentImplementation(LineChartApi, ({ props }) => (
  <MPLineChart
    series={toSeries(props.series)}
    categories={toCategories(props.categories)}
    label={props.label}
    xAxis={toAxis(props.xAxisLabel)}
    yAxis={toAxis(props.yAxisLabel)}
    height={props.height}
    legend={props.legend}
    curve={props.curve}
    /* `'auto'` rather than `true`: the component drops the dots once the points
       are too many to draw one each, which is the answer an agent cannot give
       because it does not know how wide the chart will be drawn. */
    markers={props.markers === undefined ? 'auto' : props.markers}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  />
));
