import { chromeRows } from './chart-rows';
import { from, WIDGET, type PropRow } from './shared';

export default {
  MPPieChart: [
    from('MPPieChart', 'data', {
      type: 'List<MPChartDatum>',
      description: {
        ko: '조각들. 각각 `num`, `null`, 또는 자기 이름과 색을 가진 `MPChartPoint`입니다. 계열의 목록이 아니라 하나입니다 — 파이에서는 조각이 곧 개체라서 각자 팔레트 슬롯을 갖고 범례가 조각을 나열합니다',
        en: 'The slices: each a `num`, a `null`, or an `MPChartPoint` carrying its own name and colour. One series and not a list of them, because the slices are the entities here, so each takes a palette slot of its own and the legend lists them'
      }
    }),
    from('MPPieChart', 'categories', { type: 'List<MPChartCategory>?' }),
    from('MPPieChart', 'shape', { type: 'MPPieChartShape', default: 'MPPieChartShape.pie' }),
    from('MPPieChart', 'startAngle', { type: 'double', default: '0' }),
    from('MPPieChart', 'hole', { type: 'double', default: '0.62' }),
    from('MPPieChart', 'gap', { type: 'double', default: '2' }),
    from('MPPieChart', 'center', { type: `${WIDGET}?` }),
    from('MPPieChart', 'valueLabels', {
      type: 'MPChartValueLabels',
      default: 'MPChartValueLabels.none',
      description: {
        ko: '각 조각에 그 **몫**을 씁니다. `MPChartValueLabels.all`만 무언가를 씁니다 — 조각에는 "마지막"도 "극값"도 없습니다. 들어가지 않는 레이블은 잘리는 대신 빠집니다',
        en: 'Writes each slice’s **share** on it. Only `MPChartValueLabels.all` writes anything: a slice has no “last” or “extreme”. A label that does not fit is dropped rather than clipped'
      }
    }),
    ...chromeRows('MPPieChart')
  ]
} satisfies Record<string, PropRow[]>;
