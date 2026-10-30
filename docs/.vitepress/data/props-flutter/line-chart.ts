import { cartesianRows, curveRow, gapsRow, markersRow, valueLabelsRow } from './chart-rows';
import type { PropRow } from './shared';

export default {
  MPLineChart: [
    ...cartesianRows('MPLineChart'),
    curveRow('MPLineChart'),
    markersRow('MPLineChart'),
    gapsRow('MPLineChart'),
    valueLabelsRow('MPLineChart')
  ]
} satisfies Record<string, PropRow[]>;
