import { formatRow, heightRow } from './chart-rows';
import { colorRow, from, semanticLabelRow, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPGaugeChart: [
    from('MPGaugeChart', 'value', { type: 'double' }),
    from('MPGaugeChart', 'min', { type: 'double', default: '0' }),
    from('MPGaugeChart', 'max', { type: 'double', default: '100' }),
    from('MPGaugeChart', 'sweep', { type: 'double', default: '240' }),
    from('MPGaugeChart', 'label', { type: `${WIDGET}?` }),
    from('MPGaugeChart', 'thresholds', { type: 'List<MPThreshold>?' }),
    from('MPGaugeChart', 'bands', { type: 'bool', default: 'false' }),
    colorRow('MPGaugeChart'),
    formatRow('MPGaugeChart'),
    from('MPGaugeChart', 'locale', {
      type: 'String?',
      description: {
        ko: '모든 차트가 같은 모양을 갖도록 받기만 합니다. 게이지의 유일한 글자는 숫자이고, 그것은 `format`이 씁니다',
        en: "Accepted for the shape every chart shares. The gauge's only words are the figure, which `format` writes"
      }
    }),
    heightRow('MPGaugeChart'),
    sizeRow('MPGaugeChart'),
    {
      ...semanticLabelRow,
      description: {
        ko: '`label`이 `Text`가 아닐 때 화면 낭독기가 읽는 게이지의 이름',
        en: 'The gauge’s name for a screen reader, where `label` is not a `Text`'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
