/**
 * `PieChart` — parts of one whole, as `MPPieChart`.
 *
 * One list of values and one of names, which is the whole of what a pie is. The
 * schema's own description is where the warning lives: past about six slices a
 * reader cannot compare angles, and a bar chart answers the same question better.
 * A catalog cannot stop an agent drawing a bad chart, but it can tell it which
 * chart is bad for what.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { MPPieChart } from '../../components/pie-chart/MPPieChart';
import { PieChartApi } from './api';
import { toCategories, toData } from './chart';
import { accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiPieChart = createComponentImplementation(PieChartApi, ({ props }) => (
  <MPPieChart
    data={toData(props.data)}
    categories={toCategories(props.categories)}
    label={props.label}
    shape={props.shape}
    height={props.height}
    legend={props.legend}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  />
));
