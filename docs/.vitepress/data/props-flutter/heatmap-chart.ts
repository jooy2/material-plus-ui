import { axisRow, categoriesRow, chromeRows, seriesRow } from './chart-rows';
import { from, type PropRow } from './shared';

export default {
  MPHeatmapChart: [
    seriesRow('MPHeatmapChart'),
    categoriesRow('MPHeatmapChart'),
    axisRow('MPHeatmapChart', 'xAxis'),
    axisRow('MPHeatmapChart', 'yAxis'),
    from('MPHeatmapChart', 'min', { type: 'double?' }),
    from('MPHeatmapChart', 'max', { type: 'double?' }),
    from('MPHeatmapChart', 'valueLabels', { type: 'bool', default: 'false' }),
    ...chromeRows('MPHeatmapChart', { labelColor: false })
  ]
} satisfies Record<string, PropRow[]>;
