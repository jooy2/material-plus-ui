import { axisRow, chromeRows } from './chart-rows';
import { from, type PropRow } from './shared';

export default {
  MPTimelineChart: [
    from('MPTimelineChart', 'series', { type: 'List<MPTimelineSeries>' }),
    axisRow('MPTimelineChart', 'yAxis'),
    axisRow('MPTimelineChart', 'xAxis'),
    from('MPTimelineChart', 'spanLabels', { type: 'bool', default: 'true' }),
    ...chromeRows('MPTimelineChart', { legend: false, labelColor: false })
  ]
} satisfies Record<string, PropRow[]>;
