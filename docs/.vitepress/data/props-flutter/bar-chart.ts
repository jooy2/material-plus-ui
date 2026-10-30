import { cartesianRows, stackedRow, valueLabelsRow } from './chart-rows';
import { from, type PropRow } from './shared';

export default {
  MPBarChart: [
    ...cartesianRows('MPBarChart'),
    stackedRow('MPBarChart'),
    from('MPBarChart', 'horizontal', { type: 'bool', default: 'false' }),
    valueLabelsRow('MPBarChart')
  ]
} satisfies Record<string, PropRow[]>;
