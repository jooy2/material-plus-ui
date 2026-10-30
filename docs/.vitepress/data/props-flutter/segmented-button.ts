import { focusRows, from, semanticLabelRow, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPSegmentedButton: [
    from('MPSegmentedButton', 'items', { type: 'List<MPSegment>', required: true }),
    from('MPSegmentedButton', 'value', {
      type: 'List<String>?',
      description: {
        ko: '고른 세그먼트들. 단일 선택에서도 많아야 하나를 담은 목록입니다. 넘기면 controlled입니다',
        en: 'Which segments are chosen, a list even in single-select. Given, the set is controlled'
      }
    }),
    {
      name: 'initialValue',
      type: 'List<String>',
      default: 'const []',
      description: {
        ko: '처음 고른 세그먼트들. 자기 값을 스스로 들고 있는 세트에 씁니다. React의 `defaultValue` 자리입니다',
        en: "Which segments start chosen, for a set that holds its own. React's `defaultValue`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<List<String>>?',
      description: {
        ko: '고른 값 전부를, 세그먼트가 그려진 순서대로 담아 호출됩니다. React의 `onValueChange` 자리입니다',
        en: "Called with every chosen value, in the order the segments are drawn. React's `onValueChange`"
      }
    },
    from('MPSegmentedButton', 'multiple', { type: 'bool', default: 'false' }),
    from('MPSegmentedButton', 'showCheck', { type: 'bool', default: 'true' }),
    sizeRow('MPSegmentedButton'),
    from('MPSegmentedButton', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPSegmentedButton', 'disabled', { type: 'bool', default: 'false' }),
    semanticLabelRow,
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '세트의 포커스 정지점. 화살표 키를 따라 세그먼트 사이를 옮겨 다닙니다',
        en: 'The focus stop, which the arrow keys move between the segments'
      }
    },
    focusRows[1]
  ],
  MPSegment: [
    {
      name: 'value',
      type: 'String',
      required: true,
      description: {
        ko: '세그먼트를 구분하는 값. `onChanged`가 알리는 값입니다',
        en: 'Identifies the segment. What `onChanged` reports'
      }
    },
    {
      name: 'label',
      type: `${WIDGET}?`,
      description: { ko: '세그먼트 안의 글', en: 'The words in the segment' }
    },
    {
      name: 'icon',
      type: `${WIDGET}?`,
      description: {
        ko: '라벨 앞 글리프. 고르면 체크 표시가 같은 자리를 차지하므로 세그먼트 너비가 바뀌지 않습니다',
        en: 'A glyph before the label, which the tick replaces while the segment is chosen, so the width does not change'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '쓸 수 없지만 세트에는 남아 있습니다',
        en: 'Unavailable, but still part of the set'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
