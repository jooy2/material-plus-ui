import { from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPStatistic: [
    from('MPStatistic', 'value', {
      type: 'Object',
      required: true,
      description: {
        ko: '숫자. `num`은 `formatValue`로, 없으면 자릿수를 구분하고 압축해서 씁니다. `String`과 `Widget`은 받은 그대로 그립니다',
        en: 'The figure. A `num` is written by `formatValue`, or grouped and compacted when there is none; a `String` or a `Widget` is drawn as it is'
      }
    }),
    from('MPStatistic', 'label', { type: `${WIDGET}?` }),
    {
      name: 'formatValue',
      type: 'String Function(num value)?',
      description: {
        ko: '숫자 `value`를 쓰는 방법이고, 변화도 같은 함수로 씁니다. 주면 `compact`가 꺼집니다. 없으면 `Intl`이 영어로 쓰는 방식대로 세 자리마다 쉼표를 찍고 `K`, `M`, `B`, `T`로 압축합니다. React의 `format` 자리입니다',
        en: "How a numeric `value` is written, and the move with it. Giving one turns `compact` off. Without it the number is grouped in threes and compacted with `K`, `M`, `B` and `T`, as `Intl` writes it in English. React's `format`"
      }
    },
    from('MPStatistic', 'compact', { type: 'bool', default: 'true' }),
    from('MPStatistic', 'previousValue', { type: 'num?' }),
    from('MPStatistic', 'delta', {
      type: 'MPStatisticDeltaFormat',
      default: 'MPStatisticDeltaFormat.percent'
    }),
    from('MPStatistic', 'betterWhen', {
      type: 'MPStatisticBetterWhen',
      default: 'MPStatisticBetterWhen.up'
    }),
    from('MPStatistic', 'period', { type: `${WIDGET}?` }),
    from('MPStatistic', 'prefix', { type: `${WIDGET}?` }),
    from('MPStatistic', 'unit', { type: `${WIDGET}?` }),
    from('MPStatistic', 'caption', { type: `${WIDGET}?` }),
    from('MPStatistic', 'trend', { type: `${WIDGET}?` }),
    from('MPStatistic', 'align', { type: 'MPAlign', default: 'MPAlign.start' }),
    sizeRow('MPStatistic')
  ]
} satisfies Record<string, PropRow[]>;
