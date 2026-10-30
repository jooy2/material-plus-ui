import { colorRow, focusRows, from, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPRating: [
    from('MPRating', 'value', {
      type: 'double?',
      description: {
        ko: '점수. 넘기면 controlled입니다',
        en: 'The score. Given, the rating is controlled'
      }
    }),
    {
      name: 'initialValue',
      type: 'double',
      default: '0',
      description: {
        ko: '자기 점수를 스스로 들고 있는 별점이 시작하는 점수. React의 `defaultValue` 자리입니다',
        en: "Where a rating that holds its own score starts. React's `defaultValue`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<double>?',
      description: {
        ko: '새 점수로 호출됩니다. 지운 별점은 `0`을 알립니다. React의 `onValueChange` 자리입니다',
        en: "Called with the new score; `0` is what a cleared rating reports. React's `onValueChange`"
      }
    },
    from('MPRating', 'count', { type: 'int', default: '5' }),
    from('MPRating', 'precision', { type: 'double', default: '1' }),
    from('MPRating', 'icon', { type: `${WIDGET}?` }),
    from('MPRating', 'emptyIcon', { type: `${WIDGET}?` }),
    from('MPRating', 'clearable', { type: 'bool', default: 'true' }),
    from('MPRating', 'readOnly', { type: 'bool', default: 'false' }),
    from('MPRating', 'disabled', { type: 'bool', default: 'false' }),
    from('MPRating', 'required', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '점수를 골라야 한다고 화면 낭독기에 알립니다. 제출할 폼이 없으니 막는 일은 하지 않습니다',
        en: 'Tells a screen reader a score has to be chosen. There is no form to hold back, so nothing is enforced'
      }
    }),
    sizeRow('MPRating'),
    colorRow('MPRating'),
    from('MPRating', 'locale', { type: 'String?' }),
    from('MPRating', 'labels', {
      type: 'Map<String, String>?',
      description: {
        ko: '문구 자체를 덮어씁니다(`label`, `value`, `empty`). 번역보다 우선합니다',
        en: 'Overrides for the words themselves (`label`, `value`, `empty`). They win over the translation'
      }
    }),
    ...focusRows
  ]
} satisfies Record<string, PropRow[]>;
