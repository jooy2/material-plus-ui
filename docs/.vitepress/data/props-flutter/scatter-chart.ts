import { cartesianRows } from './chart-rows';
import { from, type PropRow } from './shared';

export default {
  MPScatterChart: [
    ...cartesianRows('MPScatterChart', { zoom: false }),
    from('MPScatterChart', 'bubble', { type: 'bool', default: 'false' }),
    from('MPScatterChart', 'maxRadius', { type: 'double', default: '22' }),
    from('MPScatterChart', 'shapes', { type: 'bool', default: 'true' })
  ]
} satisfies Record<string, PropRow[]>;
