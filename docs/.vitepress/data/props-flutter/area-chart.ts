import {
  cartesianRows,
  curveRow,
  gapsRow,
  markersRow,
  stackedRow,
  valueLabelsRow
} from './chart-rows';
import type { PropRow } from './shared';

export default {
  MPAreaChart: [
    ...cartesianRows('MPAreaChart'),
    stackedRow('MPAreaChart'),
    curveRow('MPAreaChart'),
    markersRow('MPAreaChart'),
    gapsRow('MPAreaChart'),
    valueLabelsRow('MPAreaChart')
  ]
} satisfies Record<string, PropRow[]>;
