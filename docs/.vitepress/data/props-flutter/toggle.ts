import {
  colorRow,
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  VARIANT,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPToggle: [
    renamed('MPToggle', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPToggle', 'pressed', {
      type: 'bool?',
      description: {
        ko: '켜짐 여부. 넘기면 controlled입니다',
        en: 'Whether it is on. Given, the toggle is controlled'
      }
    }),
    {
      name: 'initialPressed',
      type: 'bool',
      default: 'false',
      description: {
        ko: '처음 켜짐 여부. 자기 상태를 스스로 들고 있는 토글에 씁니다. React의 `defaultPressed` 자리입니다',
        en: "Whether it starts on, for one that holds its own state. React's `defaultPressed`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<bool>?',
      description: {
        ko: '새 상태로 호출됩니다. React의 `onPressedChange` 자리입니다',
        en: "Called with the new state. React's `onPressedChange`"
      }
    },
    from('MPToggle', 'value', { type: 'String?' }),
    from('MPToggle', 'variant', { type: `${VARIANT}?`, default: 'MPVariant.outlined' }),
    sizeRow('MPToggle'),
    colorRow('MPToggle'),
    from('MPToggle', 'startIcon', { type: `${WIDGET}?` }),
    from('MPToggle', 'endIcon', { type: `${WIDGET}?` }),
    from('MPToggle', 'fullWidth', { type: 'bool', default: 'false' }),
    from('MPToggle', 'disabled', { type: 'bool?' }),
    semanticLabelRow,
    {
      name: 'focusNode',
      type: 'FocusNode?',
      description: {
        ko: '포커스를 밖에서 다룰 때 넘기는 노드. 그룹 안에서는 그룹의 포커스 정지점이 대신합니다',
        en: "Drives the focus from outside. Inside a group the set's own focus stop takes its place"
      }
    },
    focusRows[1]
  ],
  MPToggleGroup: [
    from('MPToggleGroup', 'children', { type: `List<${WIDGET}>`, required: true }),
    from('MPToggleGroup', 'value', {
      type: 'List<String>?',
      description: {
        ko: '켜진 토글들의 `value`. 단일이든 여러 개든 목록입니다. 넘기면 controlled입니다',
        en: 'Which toggles are on, by their `value`, a list in both modes. Given, the set is controlled'
      }
    }),
    {
      name: 'initialValue',
      type: 'List<String>',
      default: 'const []',
      description: {
        ko: '처음 켜진 토글들. 자기 값을 스스로 들고 있는 세트에 씁니다. React의 `defaultValue` 자리입니다',
        en: "Which start on, for a set that holds its own value. React's `defaultValue`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<List<String>>?',
      description: {
        ko: '켜진 값이 바뀔 때마다 그 전부를 담아 호출됩니다. React의 `onValueChange` 자리입니다',
        en: "Called with every value that is on, whenever that changes. React's `onValueChange`"
      }
    },
    from('MPToggleGroup', 'multiple', { type: 'bool', default: 'false' }),
    from('MPToggleGroup', 'orientation', {
      type: 'MPOrientation',
      default: 'MPOrientation.horizontal'
    }),
    from('MPToggleGroup', 'variant', { type: `${VARIANT}?`, default: 'MPVariant.outlined' }),
    sizeRow('MPToggleGroup'),
    colorRow('MPToggleGroup'),
    from('MPToggleGroup', 'disabled', { type: 'bool?' }),
    from('MPToggleGroup', 'loopFocus', { type: 'bool', default: 'true' }),
    from('MPToggleGroup', 'fullWidth', { type: 'bool', default: 'false' }),
    {
      ...semanticLabelRow,
      description: {
        ko: '세트의 이름. “글자 모양”, “정렬”처럼 씁니다. React에서는 나머지 props로 넘기는 `aria-label`입니다',
        en: 'The set\'s name: "Text style", "Alignment". The `aria-label` React passes through the rest props'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
