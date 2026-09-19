/**
 * `BarChart` — a value across categories, as `MPBarChart`.
 *
 * The two switches the schema exposes are the two that change what the chart is
 * for rather than how it looks: `stacked` makes the bars a composition instead of
 * a comparison, and `horizontal` is what a chart of long category names has to be.
 * Everything else — the palette, the axes' own ticks, the hover panel, the legend's
 * behaviour — is the component's, and an agent has no business deciding any of it.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { MPBarChart } from '../../components/bar-chart/MPBarChart';
import { BarChartApi } from './api';
import { toAxis, toCategories, toSeries } from './chart';
import { accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiBarChart = createComponentImplementation(BarChartApi, ({ props }) => (
  <MPBarChart
    series={toSeries(props.series)}
    categories={toCategories(props.categories)}
    label={props.label}
    xAxis={toAxis(props.xAxisLabel)}
    yAxis={toAxis(props.yAxisLabel)}
    height={props.height}
    legend={props.legend}
    stacked={props.stacked}
    horizontal={props.horizontal}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  />
));
