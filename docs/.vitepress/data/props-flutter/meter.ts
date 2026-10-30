import { colorRow, from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPMeter: [
    from('MPMeter', 'value', { type: 'double', required: true }),
    from('MPMeter', 'min', { type: 'double', default: '0' }),
    from('MPMeter', 'max', { type: 'double', default: '100' }),
    from('MPMeter', 'label', { type: `${WIDGET}?` }),
    from('MPMeter', 'showValue', { type: 'bool', default: 'false' }),
    {
      name: 'formatValue',
      type: 'String Function(double value)?',
      description: {
        ko: '값을 쓰는 방법. 값을 그대로 받아 글을 돌려주며, 스크린 리더도 같은 문자열을 듣습니다. 미터에는 대개 진짜 단위가 있으므로 프로그레스 바보다 여기서 더 중요합니다. React의 `format` 자리입니다',
        en: "How the value is written, handed the value as it is. A screen reader hears the same string. It matters more here than on a progress bar, because a meter usually has real units. React's `format`"
      }
    },
    from('MPMeter', 'thresholds', { type: 'List<MPThreshold>?' }),
    sizeRow('MPMeter'),
    colorRow('MPMeter')
  ]
} satisfies Record<string, PropRow[]>;
